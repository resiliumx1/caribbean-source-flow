import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CalendarCheck, CheckCircle2, ClipboardList, Clock, Leaf,
  Loader2, MapPin, Mountain, Repeat, ShieldCheck, Video, Wifi,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { dataLayerPush, pixelTrack } from "@/lib/tracking";
import {
  AuthorizeNetCardForm, type OpaqueData,
} from "@/components/payments/AuthorizeNetCardForm";
import { SlotPicker } from "@/components/consultation/SlotPicker";
import { ZoomJoinPanel } from "@/components/consultation/ZoomJoinPanel";
import { ServiceCard } from "@/components/consultations/ServiceCard";
import {
  useConsultationCatalog, useIntakeQuestions, useServiceAvailability,
  type ConsultationService,
} from "@/hooks/use-consultations";
import {
  captureAttribution, detectTimezone, durationLabel, fullMoment, moneyUsd,
  zoneLabel, type Slot,
} from "@/lib/consultation-utils";

type Mode = "in_person" | "online";

interface Hold {
  id: string;
  reference: string;
  starts_at: string;
  ends_at: string;
  amount_due_usd: number;
  discount_usd: number;
  price_usd: number;
  coupon_code: string | null;
  hold_expires_at: string;
}

interface PaidResult {
  reference: string;
  manage_token: string;
  starts_at: string;
  mode: Mode;
  zoom_join_url: string | null;
  zoom_pending: boolean;
  amount_paid_usd: number;
}

const S_SERVICE = 0, S_MODE = 1, S_TIME = 2, S_DETAILS = 3, S_REVIEW = 4, S_DONE = 5;

const STEP_LABELS: Record<number, string> = {
  [S_SERVICE]: "Session",
  [S_MODE]: "Format",
  [S_TIME]: "Time",
  [S_DETAILS]: "Details",
  [S_REVIEW]: "Payment",
  [S_DONE]: "Confirmed",
};

const CENTRE = "Mount Kailash Rejuvenation Centre, Saint Lucia";

const fade = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export function ConsultationWizard({ serviceSlug }: { serviceSlug?: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: catalog, isLoading: catalogLoading, isError: catalogError, refetch: refetchCatalog,
  } = useConsultationCatalog();

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("online");
  const [timezone, setTimezone] = useState(detectTimezone());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [packageEmail, setPackageEmail] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [couponInput, setCouponInput] = useState("");
  const [consent, setConsent] = useState(false);

  const [hold, setHold] = useState<Hold | null>(null);
  const [holding, setHolding] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState<PaidResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const attribution = useRef(captureAttribution());
  const topRef = useRef<HTMLDivElement>(null);

  const allServices = catalog ?? [];

  /** A deep link by slug jumps straight past the first step. */
  useEffect(() => {
    if (!serviceSlug || serviceId || !allServices.length) return;
    const found = allServices.find((s) => s.slug === serviceSlug);
    if (found) {
      setServiceId(found.id);
      setStep(found.mode === "both" ? S_MODE : S_TIME);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceSlug, allServices.length]);

  const {
    data: availability, isLoading: availLoading, isError: availError,
    error: availErrorObj, refetch: refetchAvailability,
  } = useServiceAvailability(serviceId ?? undefined);

  const catalogService = allServices.find((s) => s.id === serviceId);
  // The availability payload is the fresher record, but the catalogue row stays
  // the fallback for anything that payload does not carry.
  const service: ConsultationService | undefined =
    availability?.service
      ? { ...catalogService, ...availability.service } as ConsultationService
      : catalogService;
  const practitioner = availability?.practitioner;
  const { data: intakeQuestions = [] } = useIntakeQuestions(service?.id);

  const singleMode = service ? service.mode !== "both" : false;
  /** No card is taken for the follow-on package sessions. */
  const requiresPayment = service ? service.requires_payment !== false : true;

  /**
   * The steps that actually apply. The format step disappears while every
   * service is online only, and the payment step disappears for services that
   * take no payment. Both reappear on their own if the admin changes a service.
   */
  const flow = useMemo(() => {
    const showMode = service
      ? service.mode === "both"
      : allServices.some((s) => s.mode !== "online");
    return [
      S_SERVICE,
      ...(showMode ? [S_MODE] : []),
      S_TIME,
      S_DETAILS,
      ...(requiresPayment ? [S_REVIEW] : []),
      S_DONE,
    ];
  }, [service, allServices, requiresPayment]);

  const flowIndex = Math.max(0, flow.indexOf(step));

  useEffect(() => {
    if (service && service.mode !== "both") setMode(service.mode as Mode);
  }, [service]);

  /* ── hold countdown ── */
  useEffect(() => {
    if (!hold || paid) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [hold, paid]);

  const holdSecondsLeft = hold
    ? Math.max(0, Math.floor((new Date(hold.hold_expires_at).getTime() - now) / 1000))
    : 0;

  const goTo = useCallback((next: number) => {
    setFormError(null);
    setStep(next);
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  useEffect(() => {
    if (hold && !paid && holdSecondsLeft === 0) {
      setHold(null);
      setSlot(null);
      goTo(S_TIME);
      refetchAvailability();
      toast({
        title: "Your hold expired",
        description: "That time has just been released. Please choose another.",
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdSecondsLeft, hold, paid]);

  /** The previous step in the live flow, so skipped steps are never revisited. */
  const stepBack = (from: number) => {
    if (from === S_REVIEW) setHold(null);
    const i = flow.indexOf(from);
    return flow[Math.max(0, i - 1)];
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const packageEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(packageEmail.trim());
  const missingRequired = intakeQuestions.filter(
    (q) => q.is_required && !String(answers[q.id] ?? "").trim(),
  );
  const detailsReady =
    name.trim().length > 1 && emailValid && consent && missingRequired.length === 0 &&
    (requiresPayment || packageEmailValid);

  const createHold = async () => {
    if (!service || !slot) return;
    setHolding(true);
    setFormError(null);
    try {
      const { data: res, error: fnError } = await supabase.functions.invoke("consultation-book", {
        body: {
          service_id: service.id,
          start: slot.start,
          mode,
          customer_name: name.trim(),
          customer_email: email.trim(),
          customer_phone: phone.trim(),
          customer_timezone: timezone,
          notes: notes.trim(),
          intake_answers: answers,
          coupon_code: couponInput.trim() || undefined,
          package_email: requiresPayment ? undefined : packageEmail.trim(),
          attribution: attribution.current,
        },
      });
      if (fnError) throw new Error(fnError.message);
      if (res?.error) {
        if (res.code === "slot_unavailable" || res.code === "slot_taken") {
          setSlot(null);
          await refetchAvailability();
          goTo(S_TIME);
          toast({
            title: "That time has just been booked",
            description: "Please choose another.",
            variant: "destructive",
          });
          return;
        }
        setFormError(res.error);
        return;
      }
      // Services that take no payment come back already confirmed.
      if (res?.confirmed) {
        setPaid(res as PaidResult);
        queryClient.invalidateQueries({ queryKey: ["consultation-availability"] });
        queryClient.invalidateQueries({ queryKey: ["consultation-next-slot"] });
        goTo(S_DONE);
        return;
      }
      setHold(res.booking as Hold);
      setNow(Date.now());
      dataLayerPush("begin_checkout", {
        currency: "USD",
        value: res.booking.amount_due_usd,
        items: [{ item_name: service.name, item_category: "consultation", price: res.booking.amount_due_usd }],
      });
      pixelTrack("InitiateCheckout", { currency: "USD", value: res.booking.amount_due_usd });
      goTo(S_REVIEW);
    } catch (e: any) {
      setFormError(e?.message
        || "Something went wrong. Please try again, or contact us if it continues.");
    } finally {
      setHolding(false);
    }
  };

  const payNow = async ({ opaqueData, cardholderName }: { opaqueData: OpaqueData; cardholderName: string }) => {
    if (!hold) return;
    setPaying(true);
    setFormError(null);
    try {
      const { data: res, error: fnError } = await supabase.functions.invoke("consultation-pay", {
        body: { booking_id: hold.id, opaqueData, cardholder_name: cardholderName },
      });
      if (fnError) throw new Error(fnError.message);
      if (res?.error) throw new Error(res.error);
      const result = res as PaidResult;
      setPaid(result);
      dataLayerPush("purchase", {
        transaction_id: result.reference,
        currency: "USD",
        value: result.amount_paid_usd,
        items: [{ item_name: service?.name, item_category: "consultation", price: result.amount_paid_usd }],
      });
      pixelTrack("Purchase", { currency: "USD", value: result.amount_paid_usd });
      queryClient.invalidateQueries({ queryKey: ["consultation-availability"] });
      queryClient.invalidateQueries({ queryKey: ["consultation-next-slot"] });
      goTo(S_DONE);
    } catch (e: any) {
      setFormError(
        "Your payment didn't go through. Your time slot is held for a few more minutes — please try again.",
      );
      throw e;
    } finally {
      setPaying(false);
    }
  };

  const dueUsd = hold?.amount_due_usd ?? service?.price_usd ?? 0;
  const centreZone = practitioner?.timezone ?? "America/St_Lucia";

  if (catalogLoading) {
    return (
      <div className="consult">
        <div className="consult-panel p-6 sm:p-8 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-72" />
          <div className="grid sm:grid-cols-2 gap-3 pt-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (catalogError || !allServices.length) {
    return (
      <div className="consult">
        <div className="consult-panel p-6 sm:p-8 text-center">
          <p className="consult-h2">Booking is briefly unavailable</p>
          <p className="consult-body mt-3 mx-auto">
            Something went wrong. Please try again, or contact us if it continues.
          </p>
          <Button className="mt-5 min-h-[48px]" onClick={() => refetchCatalog()}>Try again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="consult" ref={topRef}>
      <p className="consult-step-compact mb-4">
        Step {flowIndex + 1} of {flow.length} · {STEP_LABELS[step]}
      </p>
      <nav className="consult-steps mb-6" aria-label="Booking steps">
        {flow.map((id, i) => (
          <span key={id} className="inline-flex items-center gap-2">
            <span className="consult-step" data-state={i === flowIndex ? "current" : i < flowIndex ? "done" : "todo"}>
              <span className="consult-step-dot">
                {i < flowIndex ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{STEP_LABELS[id]}</span>
            </span>
            {i < flow.length - 1 && <span className="consult-step-sep" aria-hidden />}
          </span>
        ))}
      </nav>

      <div className="consult-panel p-5 sm:p-8">
        <AnimatePresence mode="wait">
          {/* ─── 1. Session type ─── */}
          {step === S_SERVICE && (
            <motion.div key="s-svc" {...fade}>
              <p className="consult-eyebrow mb-2.5">Consultations</p>
              <h2 className="consult-h2">Choose a Consultation</h2>
              <p className="consult-intro mt-3.5">
                Select the session that best fits what you're seeking. Each is a one-to-one meeting
                with Priest Kailash.
              </p>

              <div className="mt-7 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
                {allServices.map((s, idx) => {
                  const free = s.requires_payment === false;
                  return (
                    <ServiceCard
                      key={s.id}
                      index={idx}
                      name={s.name}
                      description={s.description}
                      iconKey={s.icon}
                      selected={serviceId === s.id}
                      // The package is the higher commitment, marked quietly.
                      featuredLabel={s.icon === "package" || s.icon === "repeat" ? "Package" : null}
                      price={free ? "No payment required" : `${moneyUsd(s.price_usd)} USD`}
                      meta={[
                        durationLabel(s.duration_minutes, s.duration_display_label),
                        s.mode === "both" ? "Online or in person"
                          : s.mode === "online" ? "Online" : "In person",
                      ]}
                      onSelect={() => {
                        setServiceId(s.id);
                        setSlot(null);
                        setSelectedDate(null);
                        setHold(null);
                        if (s.mode !== "both") setMode(s.mode as Mode);
                        goTo(s.mode === "both" ? S_MODE : S_TIME);
                      }}
                    />
                  );
                })}
              </div>

              <p className="consult-fine mt-6" style={{ maxWidth: "62ch" }}>
                All sessions are held online. You'll receive joining details by email once your
                booking is confirmed.
              </p>
            </motion.div>
          )}

          {/* ─── 3. Format ─── */}
          {step === S_MODE && service && (
            <motion.div key="s-mode" {...fade}>
              <p className="consult-eyebrow mb-2.5">Format</p>
              <h2 className="consult-h2">Online or In Person</h2>
              <p className="consult-intro mt-3.5">
                Choose how you would like to meet.
              </p>

              <div className="mt-7 grid sm:grid-cols-2 gap-4">
                <button
                  type="button" className="consult-choice"
                  aria-pressed={mode === "online"} onClick={() => setMode("online")}
                >
                  <span className="consult-choice__title">
                    <Video className="w-4 h-4" style={{ color: "var(--c-gold-deep)" }} aria-hidden /> Online
                  </span>
                  <span className="consult-choice__note">
                    A private video link is emailed to you once your booking is confirmed. You will
                    need a stable internet connection and somewhere quiet to sit.
                  </span>
                </button>
                <button
                  type="button" className="consult-choice"
                  aria-pressed={mode === "in_person"} onClick={() => setMode("in_person")}
                >
                  <span className="consult-choice__title">
                    <MapPin className="w-4 h-4" style={{ color: "var(--c-gold-deep)" }} aria-hidden /> In person
                  </span>
                  <span className="consult-choice__note">
                    At the {CENTRE}. No video link is created. Directions are included in your
                    confirmation email.
                  </span>
                </button>
              </div>

              <div className="consult-summary mt-5">
                {mode === "in_person" ? (
                  <>
                    <p className="consult-eyebrow">Where to come</p>
                    <p className="consult-body mt-1.5">{CENTRE}</p>
                    <p className="consult-fine mt-2">
                      Bring any medication you are taking and a note of anything you have already
                      tried. Arrive a few minutes early. Full directions arrive with your
                      confirmation email.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="consult-eyebrow">How it reaches you</p>
                    <p className="consult-body mt-1.5">
                      <Wifi className="inline w-4 h-4 mr-1.5 -mt-0.5" aria-hidden />
                      A private video link is emailed on confirmation.
                    </p>
                    <p className="consult-fine mt-2">
                      A stable internet connection is needed. The link also sits on your booking
                      page, so you can open it from any device.
                    </p>
                  </>
                )}
              </div>

              <div className="mt-7 flex items-center justify-between gap-3">
                <Button variant="ghost" className="min-h-[44px]" onClick={() => goTo(S_SERVICE)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button className="min-h-[48px] px-6" onClick={() => goTo(S_TIME)}>
                  Choose a time <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── 4. Date and time ─── */}
          {step === S_TIME && (
            <motion.div key="s-time" {...fade}>
              {availLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-5 w-52" />
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
                    <Skeleton className="h-[320px] rounded-2xl" />
                    <div className="space-y-2.5">
                      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-full" />)}
                    </div>
                  </div>
                </div>
              ) : availError || !availability ? (
                <div className="text-center py-6">
                  <p className="consult-h2">The calendar did not load</p>
                  <p className="consult-body mt-3 mx-auto">
                    {(availErrorObj as Error)?.message
                      || "Something went wrong. Please try again, or contact us if it continues."}
                  </p>
                  <Button className="mt-5 min-h-[48px]" onClick={() => refetchAvailability()}>
                    Try again
                  </Button>
                </div>
              ) : (
                <>
                  <p className="consult-eyebrow mb-2.5">Date and time</p>
                  <h2 className="consult-h2">Choose a Date and Time</h2>
                  <p className="consult-intro mt-3.5 mb-6">
                    Consultations are held on Tuesdays and Thursdays. Select a date to see the times
                    available.
                  </p>
                  <SlotPicker
                  slots={availability.slots}
                  timezone={timezone}
                  onTimezoneChange={setTimezone}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  selected={slot}
                  onSelect={setSlot}
                  scheduleDates={availability.open_dates}
                  range={availability.range}
                  />
                </>
              )}

              <div className="mt-7 flex items-center justify-between gap-3">
                <Button variant="ghost" className="min-h-[44px]" onClick={() => goTo(stepBack(S_TIME))}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button className="min-h-[48px] px-6" disabled={!slot} onClick={() => goTo(S_DETAILS)}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── 5. Details ─── */}
          {step === S_DETAILS && (
            <motion.div key="s-details" {...fade}>
              <p className="consult-eyebrow mb-2.5">Your details</p>
              <h2 className="consult-h2">Your Details</h2>
              <p className="consult-intro mt-3.5">
                We'll use these to confirm your booking and send your joining details.
              </p>
              {slot && (
                <p className="consult-fine mt-3">
                  <Clock className="inline w-4 h-4 mr-1.5 -mt-0.5" aria-hidden />
                  {fullMoment(slot.start, timezone)}
                </p>
              )}

              <div className="consult-rule my-6" />

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <Label htmlFor="c-name" className="consult-label">Full name *</Label>
                  <Input id="c-name" className="consult-input mt-1.5" value={name}
                    placeholder="Your full name"
                    onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="c-email" className="consult-label">Email address *</Label>
                  <Input id="c-email" type="email" className="consult-input mt-1.5" value={email}
                    placeholder="you@example.com"
                    onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </div>
                <div className="flex flex-col sm:col-span-2">
                  <Label htmlFor="c-phone" className="consult-label">Phone or WhatsApp (optional)</Label>
                  <Input id="c-phone" className="consult-input mt-1.5" value={phone}
                    placeholder="Include your country code"
                    onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
                </div>
                {!requiresPayment && (
                  <div className="flex flex-col sm:col-span-2">
                    <Label htmlFor="c-pkg" className="consult-label">
                      Email used on your package purchase *
                    </Label>
                    <Input id="c-pkg" type="email" className="consult-input mt-1.5" value={packageEmail}
                      placeholder="you@example.com"
                      onChange={(e) => setPackageEmail(e.target.value)} />
                    <p className="consult-fine mt-1.5">
                      This lets us match your booking to the five-session package you already paid for.
                    </p>
                  </div>
                )}
              </div>

              {!requiresPayment && (
                <p className="consult-fine mt-4" style={{ maxWidth: "62ch" }}>
                  No payment is required — this session is part of your existing package.
                </p>
              )}

              {intakeQuestions.length > 0 && (
                <>
                  <div className="consult-rule my-6" />
                  <div className="space-y-4">
                    {intakeQuestions.map((q) => (
                      <div key={q.id} className="flex flex-col">
                        {q.type === "checkbox" ? (
                          <label className="flex items-start gap-3 min-h-[44px] cursor-pointer">
                            <Checkbox
                              checked={answers[q.id] === true}
                              onCheckedChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v === true }))}
                              className="mt-1"
                            />
                            <span className="consult-label" style={{ fontWeight: 400 }}>
                              {q.question}{q.is_required && " *"}
                            </span>
                          </label>
                        ) : (
                          <>
                            <Label htmlFor={`q-${q.id}`} className="consult-label">
                              {q.question}{q.is_required && " *"}
                            </Label>
                            {q.type === "textarea" ? (
                              <Textarea id={`q-${q.id}`} rows={4} className="consult-input mt-1.5"
                                value={String(answers[q.id] ?? "")}
                                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
                            ) : q.type === "select" ? (
                              <Select value={String(answers[q.id] ?? "")}
                                onValueChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}>
                                <SelectTrigger id={`q-${q.id}`} className="consult-input mt-1.5">
                                  <SelectValue placeholder="Please choose" />
                                </SelectTrigger>
                                <SelectContent>
                                  {q.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input id={`q-${q.id}`} className="consult-input mt-1.5"
                                value={String(answers[q.id] ?? "")}
                                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="consult-rule my-6" />

              <div className="flex flex-col">
                <Label htmlFor="c-notes" className="consult-label">
                  Anything you'd like Priest Kailash to know beforehand
                </Label>
                <Textarea id="c-notes" rows={4} className="consult-input mt-1.5" value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional." />
                <p className="consult-fine mt-1.5">Optional.</p>
              </div>

              {requiresPayment && (
                <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-3">
                  <div className="flex flex-col sm:w-[260px]">
                    <Label htmlFor="c-coupon" className="consult-label">Discount code</Label>
                    <Input id="c-coupon" className="consult-input mt-1.5 uppercase"
                      placeholder="Enter a code"
                      value={couponInput} onChange={(e) => setCouponInput(e.target.value)} />
                  </div>
                  <p className="consult-hold sm:pb-3">Applied when your time is held.</p>
                </div>
              )}

              <label className="mt-5 flex items-start gap-3 min-h-[44px] cursor-pointer">
                <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-1" />
                <span className="consult-fine">
                  I understand this consultation is traditional herbal guidance and is not a
                  substitute for diagnosis or treatment by a licensed medical practitioner.
                </span>
              </label>

              {formError && <p className="consult-error mt-4">{formError}</p>}

              <div className="mt-7 flex items-center justify-between gap-3">
                <Button variant="ghost" className="min-h-[44px]" onClick={() => goTo(S_TIME)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button className="min-h-[48px] px-6" disabled={!detailsReady || holding} onClick={createHold}>
                  {holding
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Holding your time…</>
                    : requiresPayment
                      ? <>Review and pay <ArrowRight className="w-4 h-4 ml-2" /></>
                      : <>Confirm this session <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── 6. Review and pay ─── */}
          {step === S_REVIEW && hold && service && (
            <motion.div key="s-review" {...fade}>
              <p className="consult-eyebrow mb-2.5">Review</p>
              <h2 className="consult-h2">Review Your Booking</h2>
              <p className="consult-intro mt-3.5">
                Please check the details below before continuing to payment.
              </p>

              <div className="consult-summary mt-6">
                <dl className="grid sm:grid-cols-2 gap-4">
                  <div><dt>Session</dt><dd>{service.name}</dd></div>
                  <div>
                    <dt>Format</dt>
                    <dd>{mode === "online" ? "Online, private video link" : `In person, ${CENTRE}`}</dd>
                  </div>
                  <div><dt>Your time</dt><dd>{fullMoment(hold.starts_at, timezone)}</dd></div>
                  <div><dt>Saint Lucia time</dt><dd>{fullMoment(hold.starts_at, centreZone)}</dd></div>
                  <div><dt>Length</dt><dd>{durationLabel(service.duration_minutes, service.duration_display_label)}</dd></div>
                  <div><dt>Reference</dt><dd>{hold.reference}</dd></div>
                  <div>
                    <dt>Total</dt>
                    <dd>
                      {hold.discount_usd > 0 && (
                        <span style={{ textDecoration: "line-through", color: "var(--c-ink-soft)", marginRight: 8 }}>
                          {moneyUsd(hold.price_usd)}
                        </span>
                      )}
                      {moneyUsd(dueUsd)} USD
                      {hold.coupon_code && (
                        <span style={{ fontSize: "14px", color: "var(--c-gold-deep)" }}>
                          {" "}· {hold.coupon_code} applied
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <p className="consult-hold mt-3">
                <Clock className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" aria-hidden />
                This time is held for you for{" "}
                <strong>
                  {Math.floor(holdSecondsLeft / 60)}:{String(holdSecondsLeft % 60).padStart(2, "0")}
                </strong>.
              </p>
              <p className="consult-hold mt-1.5">
                You'll be taken to secure checkout to complete your booking.
              </p>

              <div className="consult-rule my-6" />

              <AuthorizeNetCardForm
                amountUsd={dueUsd}
                buttonLabel={`Pay ${moneyUsd(dueUsd)} and confirm`}
                defaultCardholderName={name}
                processing={paying}
                onToken={payNow}
              />

              {formError && <p className="consult-error mt-4">{formError}</p>}

              <p className="mt-4 flex items-center gap-2 consult-hold">
                <ShieldCheck className="w-4 h-4" style={{ color: "var(--c-gold-deep)" }} aria-hidden />
                Card details go straight to our payment processor and never touch our servers.
              </p>

              <div className="mt-5">
                <Button variant="ghost" className="min-h-[44px]" onClick={() => goTo(stepBack(S_REVIEW))}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to your details
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── 7. Confirmed ─── */}
          {step === S_DONE && paid && (
            <motion.div key="s-done" {...fade} className="text-center">
              <CalendarCheck className="w-10 h-10 mx-auto" style={{ color: "var(--c-gold-deep)" }} aria-hidden />
              <h2 className="consult-h2 mt-4">Your Booking Is Confirmed</h2>
              <p className="consult-body mt-3.5 mx-auto">
                We've sent a confirmation to <strong>{email}</strong>, including your joining link
                and a calendar invitation.
              </p>
              <p className="consult-fine mt-2.5 mx-auto" style={{ maxWidth: "62ch" }}>
                Your booking reference is <strong>{paid.reference}</strong>. Keep this for your records.
              </p>

              <div className="consult-summary mt-6 text-left">
                <dl className="grid sm:grid-cols-2 gap-4">
                  <div><dt>Your time</dt><dd>{fullMoment(paid.starts_at, timezone)}</dd></div>
                  <div><dt>Saint Lucia time</dt><dd>{fullMoment(paid.starts_at, centreZone)}</dd></div>
                  <div>
                    <dt>Payment</dt>
                    <dd>
                      {paid.amount_paid_usd > 0
                        ? `${moneyUsd(paid.amount_paid_usd)} USD paid`
                        : "Covered by your package"}
                    </dd>
                  </div>
                  <div>
                    <dt>Where</dt>
                    <dd>{paid.mode === "in_person" ? CENTRE : "Online, by private video link"}</dd>
                  </div>
                </dl>
              </div>

              {paid.mode === "online" && (
                <ZoomJoinPanel joinUrl={paid.zoom_join_url} pending={paid.zoom_pending} />
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="min-h-[48px] px-6">
                  <a href={`/consultations/manage/${paid.manage_token}`}>Manage this booking</a>
                </Button>
                <Button asChild variant="outline" className="min-h-[48px] px-6">
                  <a href="/shop">Explore the herbs</a>
                </Button>
              </div>

              <p className="consult-fine mt-5 mx-auto" style={{ maxWidth: "62ch" }}>
                Need to change your booking? You can reschedule or cancel using the link in your
                confirmation email.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

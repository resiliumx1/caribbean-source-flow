import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CalendarCheck, CheckCircle2, Clock, Loader2, MapPin,
  ShieldCheck, Video,
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
import {
  useConsultationAvailability, useIntakeQuestions,
  type ConsultationPractitioner, type ConsultationService,
} from "@/hooks/use-consultations";
import {
  captureAttribution, detectTimezone, fullMoment, moneyUsd, zoneLabel, type Slot,
  durationLabel,
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

const STEP_LABELS = ["The session", "Your time", "Your details", "Payment"];

const fade = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export function ConsultationWizard({ serviceSlug }: { serviceSlug?: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useConsultationAvailability(serviceSlug);
  const service: ConsultationService | undefined = data?.service;
  const practitioner: ConsultationPractitioner | undefined = data?.practitioner;
  const { data: intakeQuestions = [] } = useIntakeQuestions(service?.id);

  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode>("online");
  const [timezone, setTimezone] = useState(detectTimezone());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
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

  useEffect(() => {
    if (service && service.mode !== "both") setMode(service.mode as Mode);
  }, [service]);

  // Hold countdown.
  useEffect(() => {
    if (!hold || paid) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [hold, paid]);

  const holdSecondsLeft = hold
    ? Math.max(0, Math.floor((new Date(hold.hold_expires_at).getTime() - now) / 1000))
    : 0;

  useEffect(() => {
    if (hold && !paid && holdSecondsLeft === 0) {
      setHold(null);
      setSlot(null);
      setStep(1);
      refetch();
      toast({
        title: "Your hold expired",
        description: "We released the time so someone else could take it. Please pick a new one.",
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdSecondsLeft, hold, paid]);

  const goTo = useCallback((next: number) => {
    setFormError(null);
    setStep(next);
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const missingRequired = intakeQuestions.filter(
    (q) => q.is_required && !String(answers[q.id] ?? "").trim(),
  );

  const detailsReady =
    name.trim().length > 1 && emailValid && consent && missingRequired.length === 0;

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
          attribution: attribution.current,
        },
      });
      if (fnError) throw new Error(fnError.message);
      if (res?.error) {
        if (res.code === "slot_unavailable" || res.code === "slot_taken") {
          setSlot(null);
          await refetch();
          goTo(1);
          toast({
            title: "That time just went",
            description: res.error,
            variant: "destructive",
          });
          return;
        }
        setFormError(res.error);
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
      goTo(3);
    } catch (e: any) {
      setFormError(e?.message || "We could not hold that time. Please try again.");
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
      goTo(4);
    } catch (e: any) {
      setFormError(e?.message || "The payment could not be completed.");
      throw e;
    } finally {
      setPaying(false);
    }
  };

  const dueUsd = hold?.amount_due_usd ?? service?.price_usd ?? 0;

  if (isLoading) {
    return (
      <div className="consult-panel p-6 sm:p-8 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-full" />)}
        </div>
      </div>
    );
  }

  if (isError || !service || !practitioner) {
    return (
      <div className="consult-panel p-6 sm:p-8 text-center">
        <p className="consult-serif" style={{ fontSize: "22px" }}>Booking is briefly unavailable</p>
        <p className="mt-2" style={{ fontSize: "15px", color: "var(--c-ink-soft)" }}>
          {(error as Error)?.message || "We could not load the calendar just now."}
        </p>
        <Button className="mt-5 min-h-[44px]" onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="consult" ref={topRef}>
      {/* Step rail */}
      {!paid && (
        <nav className="consult-steps mb-6" aria-label="Booking steps">
          {STEP_LABELS.map((label, i) => (
            <span key={label} className="inline-flex items-center gap-2">
              <span
                className="consult-step"
                data-state={step === i ? "current" : step > i ? "done" : "todo"}
              >
                <span className="consult-step-dot">
                  {step > i ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </span>
              {i < STEP_LABELS.length - 1 && <span className="consult-step-sep" aria-hidden />}
            </span>
          ))}
        </nav>
      )}

      <div className="consult-panel p-5 sm:p-8">
        <AnimatePresence mode="wait">
          {/* ─── Step 1: the session ─── */}
          {step === 0 && (
            <motion.div key="s0" {...fade}>
              <p className="consult-eyebrow mb-2">The session</p>
              <h2 className="consult-serif" style={{ fontSize: "clamp(1.6rem,3.4vw,2.2rem)", lineHeight: 1.15 }}>
                {service.name}
              </h2>
              <p className="mt-3" style={{ fontSize: "16px", lineHeight: 1.75, color: "var(--c-ink-soft)" }}>
                {service.long_description || service.description}
              </p>

              <div className="consult-rule my-6" />

              <dl className="grid sm:grid-cols-3 gap-4">
                <div>
                  <dt className="consult-eyebrow">Length</dt>
                  <dd style={{ fontSize: "16px" }}>{durationLabel(service.duration_minutes)}</dd>
                </div>
                <div>
                  <dt className="consult-eyebrow">Fee</dt>
                  <dd style={{ fontSize: "16px" }}>
                    {moneyUsd(service.price_usd)} USD
                    <span style={{ color: "var(--c-ink-soft)", fontSize: "14px" }}>
                      {" "}· {service.price_xcd.toFixed(2)} XCD
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="consult-eyebrow">Held by</dt>
                  <dd style={{ fontSize: "16px" }}>{practitioner.name}</dd>
                </div>
              </dl>

              {service.mode === "both" && (
                <>
                  <div className="consult-rule my-6" />
                  <p className="consult-eyebrow mb-3">How would you like to meet?</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button" className="consult-choice"
                      aria-pressed={mode === "online"} onClick={() => setMode("online")}
                    >
                      <span className="flex items-center gap-2" style={{ fontSize: "16px", fontWeight: 500 }}>
                        <Video className="w-4 h-4" style={{ color: "var(--c-gold-deep)" }} /> Online
                      </span>
                      <span className="block mt-1" style={{ fontSize: "14px", color: "var(--c-ink-soft)" }}>
                        A private video room, sent to you the moment you book.
                      </span>
                    </button>
                    <button
                      type="button" className="consult-choice"
                      aria-pressed={mode === "in_person"} onClick={() => setMode("in_person")}
                    >
                      <span className="flex items-center gap-2" style={{ fontSize: "16px", fontWeight: 500 }}>
                        <MapPin className="w-4 h-4" style={{ color: "var(--c-gold-deep)" }} /> In person
                      </span>
                      <span className="block mt-1" style={{ fontSize: "14px", color: "var(--c-ink-soft)" }}>
                        At the Rejuvenation Centre in Saint Lucia.
                      </span>
                    </button>
                  </div>
                </>
              )}

              <div className="mt-7 flex justify-end">
                <Button className="min-h-[48px] px-6" onClick={() => goTo(1)}>
                  Choose a time <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 2: time ─── */}
          {step === 1 && (
            <motion.div key="s1" {...fade}>
              <SlotPicker
                slots={data.slots}
                timezone={timezone}
                onTimezoneChange={setTimezone}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                selected={slot}
                onSelect={setSlot}
                practitionerTimezone={practitioner.timezone}
              />
              <div className="mt-7 flex items-center justify-between gap-3">
                <Button variant="ghost" className="min-h-[44px]" onClick={() => goTo(0)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button className="min-h-[48px] px-6" disabled={!slot} onClick={() => goTo(2)}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 3: details ─── */}
          {step === 2 && (
            <motion.div key="s2" {...fade}>
              <p className="consult-eyebrow mb-2">Your details</p>
              <h2 className="consult-serif" style={{ fontSize: "clamp(1.4rem,3vw,1.9rem)" }}>
                So Priest Kailash can prepare
              </h2>
              {slot && (
                <p className="mt-2" style={{ fontSize: "15px", color: "var(--c-ink-soft)" }}>
                  <Clock className="inline w-4 h-4 mr-1.5 -mt-0.5" />
                  {fullMoment(slot.start, timezone)} · {zoneLabel(timezone)}
                </p>
              )}

              <div className="consult-rule my-6" />

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <Label htmlFor="c-name" className="min-h-[24px] flex items-end">Full name *</Label>
                  <Input id="c-name" className="mt-1.5 bg-white/70 min-h-[44px]" value={name}
                    onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="c-email" className="min-h-[24px] flex items-end">Email address *</Label>
                  <Input id="c-email" type="email" className="mt-1.5 bg-white/70 min-h-[44px]" value={email}
                    onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </div>
                <div className="flex flex-col sm:col-span-2">
                  <Label htmlFor="c-phone" className="min-h-[24px] flex items-end">
                    Phone or WhatsApp <span style={{ color: "var(--c-ink-soft)" }}>(optional)</span>
                  </Label>
                  <Input id="c-phone" className="mt-1.5 bg-white/70 min-h-[44px]" value={phone}
                    onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
                </div>
              </div>

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
                            <span style={{ fontSize: "15px" }}>{q.question}{q.is_required && " *"}</span>
                          </label>
                        ) : (
                          <>
                            <Label htmlFor={`q-${q.id}`} className="min-h-[24px] flex items-end">
                              {q.question}{q.is_required && " *"}
                            </Label>
                            {q.type === "textarea" ? (
                              <Textarea id={`q-${q.id}`} rows={4} className="mt-1.5 bg-white/70"
                                value={String(answers[q.id] ?? "")}
                                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
                            ) : q.type === "select" ? (
                              <Select value={String(answers[q.id] ?? "")}
                                onValueChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}>
                                <SelectTrigger id={`q-${q.id}`} className="mt-1.5 bg-white/70 min-h-[44px]">
                                  <SelectValue placeholder="Please choose" />
                                </SelectTrigger>
                                <SelectContent>
                                  {q.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input id={`q-${q.id}`} className="mt-1.5 bg-white/70 min-h-[44px]"
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
                <Label htmlFor="c-notes" className="min-h-[24px] flex items-end">
                  Anything else you would like him to know
                </Label>
                <Textarea id="c-notes" rows={4} className="mt-1.5 bg-white/70" value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Your history, what you have tried, what you are hoping for." />
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex flex-col sm:w-[260px]">
                  <Label htmlFor="c-coupon" className="min-h-[24px] flex items-end">
                    Discount code <span style={{ color: "var(--c-ink-soft)" }}>(optional)</span>
                  </Label>
                  <Input id="c-coupon" className="mt-1.5 bg-white/70 min-h-[44px] uppercase"
                    value={couponInput} onChange={(e) => setCouponInput(e.target.value)} />
                </div>
                <p className="consult-hold sm:pb-3">Applied when your time is held.</p>
              </div>

              <label className="mt-5 flex items-start gap-3 min-h-[44px] cursor-pointer">
                <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-1" />
                <span style={{ fontSize: "14px", color: "var(--c-ink-soft)", lineHeight: 1.6 }}>
                  I understand this consultation is traditional herbal guidance and is not a
                  substitute for diagnosis or treatment by a licensed medical practitioner.
                </span>
              </label>

              {formError && (
                <p className="mt-4" style={{ fontSize: "14px", color: "#B4442B" }}>{formError}</p>
              )}

              <div className="mt-7 flex items-center justify-between gap-3">
                <Button variant="ghost" className="min-h-[44px]" onClick={() => goTo(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button className="min-h-[48px] px-6" disabled={!detailsReady || holding} onClick={createHold}>
                  {holding
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Holding your time…</>
                    : <>Hold this time <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 4: payment ─── */}
          {step === 3 && hold && (
            <motion.div key="s3" {...fade}>
              <p className="consult-eyebrow mb-2">Payment</p>
              <h2 className="consult-serif" style={{ fontSize: "clamp(1.4rem,3vw,1.9rem)" }}>
                Confirm your session
              </h2>

              <div className="consult-summary mt-5">
                <dl className="grid sm:grid-cols-2 gap-4">
                  <div><dt>Session</dt><dd>{service.name}</dd></div>
                  <div><dt>Format</dt><dd>{mode === "online" ? "Online video room" : "In person, Saint Lucia"}</dd></div>
                  <div><dt>Your time</dt><dd>{fullMoment(hold.starts_at, timezone)}</dd></div>
                  <div><dt>His time</dt><dd>{fullMoment(hold.starts_at, practitioner.timezone)}</dd></div>
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
                        <span style={{ fontSize: "13px", color: "var(--c-gold-deep)" }}>
                          {" "}· {hold.coupon_code} applied
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <p className="consult-hold mt-3">
                <Clock className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                This time is held for you for{" "}
                <strong>
                  {Math.floor(holdSecondsLeft / 60)}:{String(holdSecondsLeft % 60).padStart(2, "0")}
                </strong>.
              </p>

              <div className="consult-rule my-6" />

              <AuthorizeNetCardForm
                amountUsd={dueUsd}
                buttonLabel={`Pay ${moneyUsd(dueUsd)} and confirm`}
                defaultCardholderName={name}
                processing={paying}
                onToken={payNow}
              />

              {formError && (
                <p className="mt-4" style={{ fontSize: "14px", color: "#B4442B" }}>{formError}</p>
              )}

              <p className="mt-4 flex items-center gap-2 consult-hold">
                <ShieldCheck className="w-4 h-4" style={{ color: "var(--c-gold-deep)" }} />
                Card details go straight to our payment processor and never touch our servers.
              </p>
            </motion.div>
          )}

          {/* ─── Step 5: confirmed ─── */}
          {step === 4 && paid && (
            <motion.div key="s4" {...fade} className="text-center">
              <CalendarCheck className="w-10 h-10 mx-auto" style={{ color: "var(--c-gold-deep)" }} />
              <h2 className="consult-serif mt-4" style={{ fontSize: "clamp(1.7rem,3.6vw,2.3rem)" }}>
                Your session is confirmed
              </h2>
              <p className="mt-3" style={{ fontSize: "16px", color: "var(--c-ink-soft)", lineHeight: 1.75 }}>
                Reference <strong>{paid.reference}</strong>. A confirmation with a calendar
                invitation is on its way to {email}.
              </p>

              <div className="consult-summary mt-6 text-left">
                <dl className="grid sm:grid-cols-2 gap-4">
                  <div><dt>Your time</dt><dd>{fullMoment(paid.starts_at, timezone)}</dd></div>
                  <div><dt>His time</dt><dd>{fullMoment(paid.starts_at, practitioner.timezone)}</dd></div>
                  <div><dt>Paid</dt><dd>{moneyUsd(paid.amount_paid_usd)} USD</dd></div>
                  <div>
                    <dt>Where</dt>
                    <dd>
                      {paid.mode === "in_person"
                        ? "Mount Kailash Rejuvenation Centre, Saint Lucia"
                        : "Online, by Zoom"}
                    </dd>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

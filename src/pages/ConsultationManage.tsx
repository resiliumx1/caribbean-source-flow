import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarCheck, Loader2, Video, MapPin, XCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { SlotPicker } from "@/components/consultation/SlotPicker";
import {
  detectTimezone, fullMoment, moneyUsd, zoneLabel, type Slot,
} from "@/lib/consultation-utils";
import "@/styles/consultation.css";

interface ManageBooking {
  reference: string;
  status: string;
  starts_at: string;
  ends_at: string;
  mode: "online" | "in_person";
  customer_name: string;
  customer_email: string;
  customer_timezone: string | null;
  amount: number;
  currency: string;
  notes: string | null;
  zoom_join_url: string | null;
  zoom_pending: boolean;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  reschedule_count: number;
}

interface ManagePayload {
  booking: ManageBooking;
  service: { name: string; duration_minutes: number } | null;
  practitioner: { name: string; title: string | null; timezone: string } | null;
  policy: {
    min_reschedule_notice_hours: number;
    min_cancel_notice_hours: number;
    max_reschedules?: number;
  };
  can_reschedule: boolean;
  can_cancel: boolean;
}

async function callManage(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("consultation-manage", { body });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

export default function ConsultationManage() {
  const { token = "" } = useParams();
  const { toast } = useToast();

  const [payload, setPayload] = useState<ManagePayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [timezone, setTimezone] = useState(detectTimezone());
  const [rescheduling, setRescheduling] = useState(false);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [saving, setSaving] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await callManage({ token, action: "get" });
      setPayload(data as ManagePayload);
      if (data?.booking?.customer_timezone) setTimezone(data.booking.customer_timezone);
    } catch (e: any) {
      setLoadError(e?.message || "That booking link is not valid.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) load(); /* eslint-disable-next-line */ }, [token]);

  const practitionerTz = payload?.practitioner?.timezone ?? "America/St_Lucia";

  const openReschedule = async () => {
    setRescheduling(true);
    setSlotsLoading(true);
    try {
      const data = await callManage({ token, action: "slots", customer_timezone: timezone });
      setSlots((data.slots ?? []) as Slot[]);
    } catch (e: any) {
      toast({ title: "Could not load times", description: e?.message, variant: "destructive" });
      setRescheduling(false);
    } finally {
      setSlotsLoading(false);
    }
  };

  const confirmReschedule = async () => {
    if (!slot) return;
    setSaving(true);
    try {
      const data = await callManage({
        token, action: "reschedule", start: slot.start, customer_timezone: timezone,
      });
      toast({
        title: "Your session has moved",
        description: `Now ${fullMoment(data.booking.starts_at, timezone)}. A fresh calendar invitation is on its way.`,
      });
      setRescheduling(false);
      setSlot(null);
      setSlots(null);
      await load();
    } catch (e: any) {
      toast({ title: "Could not move that session", description: e?.message, variant: "destructive" });
      if (String(e?.message).includes("no longer") || String(e?.message).includes("just taken")) {
        openReschedule();
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmCancel = async () => {
    setSaving(true);
    try {
      await callManage({ token, action: "cancel", reason: cancelReason.trim() || undefined });
      toast({
        title: "Your session is cancelled",
        description: "We have emailed you a confirmation. Reach out any time you would like to rebook.",
      });
      setCancelOpen(false);
      await load();
    } catch (e: any) {
      toast({ title: "Could not cancel", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const b = payload?.booking;
  const isCancelled = b?.status === "cancelled";
  const isPast = useMemo(
    () => (b ? new Date(b.starts_at).getTime() < Date.now() : false),
    [b],
  );

  return (
    <main className="consult min-h-screen" style={{ background: "var(--c-bg)" }}>
      <SEOHead
        title="Manage your consultation | Mount Kailash"
        description="Reschedule or cancel your private consultation with Rt. Hon. Priest Kailash."
        path="/consultations/manage"
        noindex
      />

      <section className="px-4 pt-28 pb-16 sm:pt-32">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="consult-panel p-6 sm:p-8 space-y-4">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-full max-w-sm" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : loadError || !b ? (
            <div className="consult-panel p-6 sm:p-8 text-center">
              <XCircle className="w-9 h-9 mx-auto" style={{ color: "var(--c-gold-deep)" }} />
              <h1 className="consult-serif mt-4" style={{ fontSize: "clamp(1.6rem,3.4vw,2.2rem)" }}>
                This link is not valid
              </h1>
              <p className="mt-3" style={{ fontSize: "16px", color: "var(--c-ink-soft)" }}>
                {loadError}
              </p>
              <Button asChild className="mt-6 min-h-[48px] px-6">
                <a href="/consultations">Book a consultation</a>
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="consult-eyebrow mb-2">Your consultation</p>
              <h1 className="consult-serif" style={{ fontSize: "clamp(1.9rem,4.4vw,2.8rem)", lineHeight: 1.1 }}>
                {isCancelled ? "This session was cancelled" : payload?.service?.name ?? "Private consultation"}
              </h1>
              <p className="mt-2" style={{ fontSize: "15px", color: "var(--c-ink-soft)" }}>
                Reference {b.reference} · {b.customer_name}
              </p>

              <div className="consult-summary mt-6">
                <dl className="grid sm:grid-cols-2 gap-4">
                  <div><dt>Your time</dt><dd>{fullMoment(b.starts_at, timezone)}</dd></div>
                  <div><dt>His time</dt><dd>{fullMoment(b.starts_at, practitionerTz)}</dd></div>
                  <div><dt>Length</dt><dd>{payload?.service?.duration_minutes ?? 60} minutes</dd></div>
                  <div><dt>Paid</dt><dd>{moneyUsd(b.amount)} {b.currency}</dd></div>
                  <div className="sm:col-span-2">
                    <dt>Where</dt>
                    <dd className="flex items-center gap-2">
                      {b.mode === "in_person" ? (
                        <><MapPin className="w-4 h-4" style={{ color: "var(--c-gold-deep)" }} />
                          Mount Kailash Rejuvenation Centre, Saint Lucia</>
                      ) : b.zoom_join_url && !isCancelled ? (
                        <><Video className="w-4 h-4" style={{ color: "var(--c-gold-deep)" }} />
                          <a href={b.zoom_join_url} target="_blank" rel="noopener noreferrer"
                            style={{ color: "var(--c-gold-deep)", textDecoration: "underline" }}>
                            Join the video room
                          </a></>
                      ) : (
                        <><Video className="w-4 h-4" style={{ color: "var(--c-gold-deep)" }} />
                          {isCancelled ? "Online session" : "Your video link will arrive by email shortly"}</>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {isCancelled ? (
                <div className="mt-6">
                  <p style={{ fontSize: "15px", color: "var(--c-ink-soft)", lineHeight: 1.7 }}>
                    This session was cancelled
                    {b.cancellation_reason ? `: ${b.cancellation_reason}` : "."} You are welcome to
                    book another hour whenever you are ready.
                  </p>
                  <Button asChild className="mt-5 min-h-[48px] px-6">
                    <a href="/consultations">Book another session</a>
                  </Button>
                </div>
              ) : isPast ? (
                <p className="mt-6" style={{ fontSize: "15px", color: "var(--c-ink-soft)" }}>
                  This session has already taken place. Thank you for sitting with Priest Kailash.
                </p>
              ) : rescheduling ? (
                <div className="consult-panel mt-6 p-5 sm:p-7">
                  <p className="consult-eyebrow mb-4">Choose a new time</p>
                  {slotsLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 rounded-full" />
                      ))}
                    </div>
                  ) : (
                    <SlotPicker
                      slots={slots ?? []}
                      timezone={timezone}
                      onTimezoneChange={setTimezone}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      selected={slot}
                      onSelect={setSlot}
                      practitionerTimezone={practitionerTz}
                    />
                  )}
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <Button variant="ghost" className="min-h-[44px]"
                      onClick={() => { setRescheduling(false); setSlot(null); }}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Keep my current time
                    </Button>
                    <Button className="min-h-[48px] px-6" disabled={!slot || saving} onClick={confirmReschedule}>
                      {saving
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Moving…</>
                        : <><CalendarCheck className="w-4 h-4 mr-2" /> Confirm new time</>}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button className="min-h-[48px] px-6" disabled={!payload?.can_reschedule}
                      onClick={openReschedule}>
                      Reschedule this session
                    </Button>
                    <Button variant="outline" className="min-h-[48px] px-6"
                      disabled={!payload?.can_cancel} onClick={() => setCancelOpen(true)}>
                      Cancel this session
                    </Button>
                  </div>
                  {(!payload?.can_reschedule || !payload?.can_cancel) && (
                    <p className="mt-4" style={{ fontSize: "14px", color: "var(--c-ink-soft)", lineHeight: 1.7 }}>
                      Changes close {payload?.policy.min_reschedule_notice_hours} hours before the
                      session and cancellations {payload?.policy.min_cancel_notice_hours} hours
                      before. If you are inside that window, reach out directly and we will do what
                      we can.
                    </p>
                  )}
                  <p className="mt-4" style={{ fontSize: "14px", color: "var(--c-ink-soft)" }}>
                    Times shown in {zoneLabel(timezone)}.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </div>
      </section>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this consultation?</AlertDialogTitle>
            <AlertDialogDescription>
              The hour will be released for someone else. If you would rather move it, close this
              and choose Reschedule instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col">
            <Label htmlFor="cancel-reason" className="min-h-[24px] flex items-end">
              Reason (optional)
            </Label>
            <Textarea id="cancel-reason" rows={3} className="mt-1.5" value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Keep my session</AlertDialogCancel>
            <AlertDialogAction className="min-h-[44px]" disabled={saving}
              onClick={(e) => { e.preventDefault(); confirmCancel(); }}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Cancel session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

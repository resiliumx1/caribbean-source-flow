// Token-based self service: view, reschedule or cancel a consultation without
// signing in. The manage token never gives direct table access.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { DateTime } from "npm:luxon@3.5.0";
import { generateSlots, toBlockedRanges, formatInZone, isValidZone, type Service } from "../_shared/consultation.ts";
import { deleteZoomMeeting, updateZoomMeeting, zoomConfigured } from "../_shared/zoom.ts";
import { sendConsultationEmail } from "../_shared/consultation-email.ts";

const BodySchema = z.object({
  token: z.string().uuid(),
  action: z.enum(["get", "slots", "reschedule", "cancel"]),
  start: z.string().datetime({ offset: true }).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  reason: z.string().trim().max(500).optional(),
  customer_timezone: z.string().max(60).optional(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Simple per-instance rate limit: 20 requests per IP per 5 minutes.
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const window = now - 5 * 60_000;
  const list = (hits.get(ip) ?? []).filter((t) => t > window);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 20;
}

interface Policy {
  min_reschedule_notice_hours: number;
  min_cancel_notice_hours: number;
  policy_text: string;
}

const DEFAULT_POLICY: Policy = {
  min_reschedule_notice_hours: 24,
  min_cancel_notice_hours: 24,
  policy_text:
    "Consultations may be rescheduled or cancelled up to 24 hours before the session. Inside 24 hours, please contact us directly.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return json({ error: "Too many requests. Please wait a moment." }, 429);

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Invalid request." }, 400);
    const { token, action } = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: booking, error: loadErr } = await supabase
      .from("consultation_bookings")
      .select("*, consultation_services!service_id(*), consultation_practitioners!practitioner_id(*)")
      .eq("manage_token", token).maybeSingle();
    if (loadErr) throw loadErr;
    if (!booking) return json({ error: "That booking link is not valid." }, 404);

    const service = (booking as any).consultation_services;
    const practitioner = (booking as any).consultation_practitioners;
    const tz = practitioner?.timezone || "America/St_Lucia";

    const { data: policyRow } = await supabase
      .from("consultation_settings").select("value").eq("key", "consultation_policy").maybeSingle();
    const policy: Policy = { ...DEFAULT_POLICY, ...((policyRow?.value as any) ?? {}) };

    const startMs = new Date(booking.starts_at).getTime();
    const hoursAway = (startMs - Date.now()) / 3_600_000;
    const canReschedule = booking.status === "confirmed" && hoursAway >= policy.min_reschedule_notice_hours;
    const canCancel = booking.status === "confirmed" && hoursAway >= policy.min_cancel_notice_hours;

    const publicBooking = () => ({
      reference: booking.booking_reference,
      status: booking.status,
      starts_at: booking.starts_at,
      ends_at: booking.ends_at,
      mode: booking.mode,
      customer_name: booking.customer_name,
      customer_email: booking.customer_email,
      customer_timezone: booking.customer_timezone,
      amount: Number(booking.amount),
      currency: booking.currency,
      notes: booking.notes,
      // start_url is admin-only and deliberately never returned here.
      zoom_join_url: booking.zoom_join_url,
      zoom_pending: booking.mode === "online" && !booking.zoom_join_url,
      cancelled_at: booking.cancelled_at,
      cancellation_reason: booking.cancellation_reason,
      reschedule_count: booking.reschedule_count,
    });

    if (action === "get") {
      return json({
        booking: publicBooking(),
        service: service
          ? {
            id: service.id, name: service.name, duration_minutes: service.duration_minutes,
            price_usd: Number(service.price_usd), mode: service.mode,
          }
          : null,
        practitioner: practitioner
          ? { name: practitioner.name, title: practitioner.title, timezone: tz, photo_url: practitioner.photo_url }
          : null,
        policy,
        can_reschedule: canReschedule,
        can_cancel: canCancel,
        practitioner_local: formatInZone(booking.starts_at, tz),
      });
    }

    if (action === "slots") {
      if (!service) return json({ error: "This booking has no service attached." }, 409);
      const today = DateTime.now().setZone(tz).toFormat("yyyy-MM-dd");
      const from = parsed.data.from && parsed.data.from > today ? parsed.data.from : today;
      const to = parsed.data.to ??
        DateTime.now().setZone(tz).plus({ days: service.max_advance_days }).toFormat("yyyy-MM-dd");

      const [{ data: availability }, { data: overrides }, { data: existing }] = await Promise.all([
        supabase.from("consultation_availability")
          .select("day_of_week, start_time, end_time")
          .eq("practitioner_id", practitioner.id).eq("is_active", true),
        supabase.from("consultation_availability_overrides")
          .select("date, is_available, start_time, end_time")
          .eq("practitioner_id", practitioner.id).gte("date", from).lte("date", to),
        supabase.from("consultation_bookings")
          .select("starts_at, ends_at, consultation_services!service_id(buffer_before_minutes, buffer_after_minutes)")
          .eq("practitioner_id", practitioner.id)
          .in("status", ["pending_payment", "confirmed"])
          .neq("id", booking.id),
      ]);

      const slots = generateSlots({
        service: service as unknown as Service,
        timezone: tz,
        availability: availability ?? [],
        overrides: overrides ?? [],
        blocked: toBlockedRanges(existing ?? [], tz, service.buffer_before_minutes, service.buffer_after_minutes),
        from, to,
      });
      return json({ slots, practitioner_timezone: tz, range: { from, to } });
    }

    if (action === "reschedule") {
      if (!canReschedule) {
        return json({
          error: booking.status !== "confirmed"
            ? "Only confirmed consultations can be rescheduled."
            : `Consultations can only be moved at least ${policy.min_reschedule_notice_hours} hours ahead. Please contact us.`,
        }, 409);
      }
      if (!parsed.data.start) return json({ error: "A new time is required." }, 400);

      const newStart = new Date(parsed.data.start).toISOString();
      const localDate = DateTime.fromISO(newStart, { zone: tz }).toFormat("yyyy-MM-dd");

      const [{ data: availability }, { data: overrides }, { data: existing }] = await Promise.all([
        supabase.from("consultation_availability")
          .select("day_of_week, start_time, end_time")
          .eq("practitioner_id", practitioner.id).eq("is_active", true),
        supabase.from("consultation_availability_overrides")
          .select("date, is_available, start_time, end_time")
          .eq("practitioner_id", practitioner.id).eq("date", localDate),
        supabase.from("consultation_bookings")
          .select("starts_at, ends_at, consultation_services!service_id(buffer_before_minutes, buffer_after_minutes)")
          .eq("practitioner_id", practitioner.id)
          .in("status", ["pending_payment", "confirmed"])
          .neq("id", booking.id),
      ]);

      const slots = generateSlots({
        service: service as unknown as Service,
        timezone: tz,
        availability: availability ?? [],
        overrides: overrides ?? [],
        blocked: toBlockedRanges(existing ?? [], tz, service.buffer_before_minutes, service.buffer_after_minutes),
        from: localDate, to: localDate,
      });
      const match = slots.find((s) => s.start === newStart);
      if (!match) return json({ error: "That time is not available. Please choose another.", code: "slot_unavailable" }, 409);

      const zone = isValidZone(parsed.data.customer_timezone)
        ? parsed.data.customer_timezone!
        : booking.customer_timezone;

      const { data: updated, error: updErr } = await supabase
        .from("consultation_bookings")
        .update({
          starts_at: match.start,
          ends_at: match.end,
          customer_timezone: zone,
          reschedule_count: Number(booking.reschedule_count ?? 0) + 1,
          ics_sequence: Number(booking.ics_sequence ?? 0) + 1,
        })
        .eq("id", booking.id).select("*").single();
      if (updErr) {
        if ((updErr as any).code === "23P01") {
          return json({ error: "That time was just taken. Please choose another.", code: "slot_taken" }, 409);
        }
        throw updErr;
      }

      let record: any = updated;
      if (record.zoom_meeting_id && zoomConfigured()) {
        try {
          await updateZoomMeeting({
            meetingId: record.zoom_meeting_id,
            startAtIso: record.starts_at,
            durationMinutes: service?.duration_minutes ?? 60,
            timezone: tz,
          });
        } catch (e: any) {
          console.error("Zoom reschedule failed:", e?.message || e);
          await supabase.from("consultation_bookings")
            .update({ zoom_error: `Reschedule not applied in Zoom: ${String(e?.message || e).slice(0, 400)}` })
            .eq("id", record.id);
        }
      }

      await sendConsultationEmail("reschedule", { booking: record, service, practitioner })
        .catch((e) => console.error("reschedule email failed:", e));

      return json({
        success: true,
        booking: { ...publicBooking(), starts_at: record.starts_at, ends_at: record.ends_at, status: record.status },
        practitioner_local: formatInZone(record.starts_at, tz),
      });
    }

    if (action === "cancel") {
      if (!canCancel) {
        return json({
          error: booking.status !== "confirmed"
            ? "This consultation cannot be cancelled."
            : `Consultations can only be cancelled at least ${policy.min_cancel_notice_hours} hours ahead. Please contact us.`,
        }, 409);
      }

      const { data: cancelled, error: cancelErr } = await supabase
        .from("consultation_bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: parsed.data.reason || "Cancelled by the client",
          ics_sequence: Number(booking.ics_sequence ?? 0) + 1,
        })
        .eq("id", booking.id).select("*").single();
      if (cancelErr) throw cancelErr;

      if (cancelled.zoom_meeting_id && zoomConfigured()) {
        try {
          await deleteZoomMeeting(cancelled.zoom_meeting_id);
        } catch (e: any) {
          console.error("Zoom cancellation failed:", e?.message || e);
        }
      }

      await sendConsultationEmail("cancellation", { booking: cancelled, service, practitioner })
        .catch((e) => console.error("cancellation email failed:", e));

      return json({ success: true, booking: { ...publicBooking(), status: "cancelled" } });
    }

    return json({ error: "Unknown action." }, 400);
  } catch (err: any) {
    console.error("consultation-manage error:", err?.message || err);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});

// Admin actions on consultations: manual booking, reschedule, cancel, status
// changes and resending email. Full admins only.
// deno-lint-ignore-file no-explicit-any
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { DateTime } from "npm:luxon@3.5.0";
import { requireAdmin, serviceClient } from "../_shared/admin-auth.ts";
import { createZoomMeeting, deleteZoomMeeting, updateZoomMeeting, zoomConfigured } from "../_shared/zoom.ts";
import { sendConsultationEmail } from "../_shared/consultation-email.ts";
import { isValidZone } from "../_shared/consultation.ts";

const BodySchema = z.object({
  action: z.enum([
    "create", "reschedule", "cancel", "set_status", "resend_email", "update_notes",
    "zoom_status",
  ]),
  booking_id: z.string().uuid().optional(),
  service_id: z.string().uuid().optional(),
  start: z.string().datetime({ offset: true }).optional(),
  mode: z.enum(["in_person", "online"]).optional(),
  customer_name: z.string().trim().min(1).max(120).optional(),
  customer_email: z.string().trim().email().max(255).optional(),
  customer_phone: z.string().trim().max(40).optional(),
  customer_timezone: z.string().max(60).optional(),
  notes: z.string().trim().max(2000).optional(),
  internal_notes: z.string().trim().max(4000).optional(),
  skip_payment: z.boolean().optional(),
  amount: z.number().min(0).max(100000).optional(),
  status: z.enum(["confirmed", "completed", "cancelled", "no_show"]).optional(),
  reason: z.string().trim().max(500).optional(),
  email_type: z.enum([
    "confirmation", "reschedule", "cancellation", "reminder_24h", "reminder_1h", "join_link",
  ]).optional(),
  send_email: z.boolean().optional(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SELECT =
  "*, consultation_services!service_id(*), consultation_practitioners!practitioner_id(*)";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    await requireAdmin(req);
  } catch (e: any) {
    return json({ error: e?.message || "Not authorised." }, 401);
  }

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, 400);
    }
    const b = parsed.data;
    const supabase = serviceClient();

    // ---- manual creation (phone enquiries) --------------------------------
    if (b.action === "create") {
      if (!b.service_id || !b.start || !b.customer_name || !b.customer_email) {
        return json({ error: "Service, time, name and email are required." }, 400);
      }
      const { data: service, error: svcErr } = await supabase
        .from("consultation_services")
        .select("*, consultation_practitioners!practitioner_id(*)")
        .eq("id", b.service_id).maybeSingle();
      if (svcErr) throw svcErr;
      if (!service) return json({ error: "Service not found." }, 404);

      const practitioner = (service as any).consultation_practitioners;
      const tz = practitioner?.timezone || "America/St_Lucia";
      const startIso = new Date(b.start).toISOString();
      const endIso = DateTime.fromISO(startIso)
        .plus({ minutes: service.duration_minutes }).toUTC().toISO()!;
      const mode = b.mode ?? (service.mode === "in_person" ? "in_person" : "online");
      const amount = b.skip_payment ? 0 : (b.amount ?? Number(service.price_usd));

      // Admins may book outside published availability, but never over an
      // existing appointment — the exclusion constraint still applies.
      const { data: created, error: insErr } = await supabase
        .from("consultation_bookings")
        .insert({
          service_id: service.id,
          practitioner_id: practitioner?.id ?? null,
          starts_at: startIso,
          ends_at: endIso,
          customer_name: b.customer_name,
          customer_email: b.customer_email.toLowerCase(),
          customer_phone: b.customer_phone || null,
          customer_timezone: isValidZone(b.customer_timezone) ? b.customer_timezone : tz,
          notes: b.notes || null,
          internal_notes: b.internal_notes || null,
          mode,
          status: "confirmed",
          amount,
          currency: "USD",
          payment_method: b.skip_payment ? "manual_no_charge" : "manual",
        })
        .select(SELECT).single();
      if (insErr) {
        if ((insErr as any).code === "23P01") {
          return json({ error: "That time overlaps an existing consultation." }, 409);
        }
        throw insErr;
      }

      let record: any = created;
      if (mode === "online" && zoomConfigured() && practitioner?.zoom_user_email) {
        try {
          const meeting = await createZoomMeeting({
            hostEmail: practitioner.zoom_user_email,
            topic: `${service.name} — ${record.customer_name}`,
            agenda: `Reference ${record.booking_reference}`,
            startAtIso: record.starts_at,
            durationMinutes: service.duration_minutes,
            timezone: tz,
          });
          const { data: withZoom } = await supabase.from("consultation_bookings")
            .update({
              zoom_meeting_id: meeting.meetingId,
              zoom_join_url: meeting.joinUrl,
              zoom_start_url: meeting.startUrl,
            })
            .eq("id", record.id).select(SELECT).single();
          if (withZoom) record = withZoom;
        } catch (e: any) {
          await supabase.from("consultation_bookings")
            .update({ zoom_error: String(e?.message || e).slice(0, 500) }).eq("id", record.id);
        }
      }

      if (b.send_email !== false) {
        await sendConsultationEmail("confirmation", {
          booking: record,
          service: (record as any).consultation_services,
          practitioner: (record as any).consultation_practitioners,
        }).catch((e) => console.error("manual booking email failed:", e));
      }
      return json({ success: true, booking: record });
    }

    if (!b.booking_id) return json({ error: "booking_id is required." }, 400);

    const { data: booking, error: loadErr } = await supabase
      .from("consultation_bookings").select(SELECT).eq("id", b.booking_id).maybeSingle();
    if (loadErr) throw loadErr;
    if (!booking) return json({ error: "Booking not found." }, 404);

    const service = (booking as any).consultation_services;
    const practitioner = (booking as any).consultation_practitioners;
    const tz = practitioner?.timezone || "America/St_Lucia";

    // ---- reschedule -------------------------------------------------------
    if (b.action === "reschedule") {
      if (!b.start) return json({ error: "A new time is required." }, 400);
      const startIso = new Date(b.start).toISOString();
      const endIso = DateTime.fromISO(startIso)
        .plus({ minutes: service?.duration_minutes ?? 60 }).toUTC().toISO()!;

      const { data: updated, error: updErr } = await supabase
        .from("consultation_bookings")
        .update({
          starts_at: startIso,
          ends_at: endIso,
          status: "confirmed",
          reschedule_count: Number(booking.reschedule_count ?? 0) + 1,
          ics_sequence: Number(booking.ics_sequence ?? 0) + 1,
        })
        .eq("id", booking.id).select(SELECT).single();
      if (updErr) {
        if ((updErr as any).code === "23P01") {
          return json({ error: "That time overlaps an existing consultation." }, 409);
        }
        throw updErr;
      }

      if (updated.zoom_meeting_id && zoomConfigured()) {
        try {
          await updateZoomMeeting({
            meetingId: updated.zoom_meeting_id,
            startAtIso: updated.starts_at,
            durationMinutes: service?.duration_minutes ?? 60,
            timezone: tz,
          });
        } catch (e: any) {
          console.error("Zoom reschedule failed:", e?.message || e);
        }
      }
      if (b.send_email !== false) {
        await sendConsultationEmail("reschedule", { booking: updated, service, practitioner })
          .catch((e) => console.error("reschedule email failed:", e));
      }
      return json({ success: true, booking: updated });
    }

    // ---- cancel -----------------------------------------------------------
    if (b.action === "cancel") {
      const { data: cancelled, error: cancelErr } = await supabase
        .from("consultation_bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: b.reason || "Cancelled by Mount Kailash",
          ics_sequence: Number(booking.ics_sequence ?? 0) + 1,
        })
        .eq("id", booking.id).select(SELECT).single();
      if (cancelErr) throw cancelErr;

      if (cancelled.zoom_meeting_id && zoomConfigured()) {
        try { await deleteZoomMeeting(cancelled.zoom_meeting_id); } catch (e) {
          console.error("Zoom delete failed:", e);
        }
      }
      if (b.send_email !== false) {
        await sendConsultationEmail("cancellation", { booking: cancelled, service, practitioner })
          .catch((e) => console.error("cancellation email failed:", e));
      }
      return json({ success: true, booking: cancelled });
    }

    // ---- status / notes ---------------------------------------------------
    if (b.action === "set_status") {
      if (!b.status) return json({ error: "A status is required." }, 400);
      const patch: Record<string, unknown> = { status: b.status };
      if (b.status === "cancelled") {
        patch.cancelled_at = new Date().toISOString();
        patch.cancellation_reason = b.reason || "Cancelled by Mount Kailash";
      }
      const { data: updated, error } = await supabase
        .from("consultation_bookings").update(patch).eq("id", booking.id).select(SELECT).single();
      if (error) throw error;
      return json({ success: true, booking: updated });
    }

    if (b.action === "update_notes") {
      const { data: updated, error } = await supabase
        .from("consultation_bookings")
        .update({ internal_notes: b.internal_notes ?? null })
        .eq("id", booking.id).select("id, internal_notes").single();
      if (error) throw error;
      return json({ success: true, booking: updated });
    }

    if (b.action === "resend_email") {
      const result = await sendConsultationEmail(b.email_type ?? "confirmation", {
        booking, service, practitioner,
      });
      if (!result.sent) return json({ error: result.error || "Email could not be sent." }, 500);
      return json({ success: true });
    }

    return json({ error: "Unknown action." }, 400);
  } catch (err: any) {
    console.error("consultation-admin error:", err?.message || err);
    return json({ error: err?.message || "Action failed." }, 500);
  }
});

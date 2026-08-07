// Admin-only: create or attach the Zoom meeting for a consultation that has none
// (used by the "needs a link" action in the admin).
// deno-lint-ignore-file no-explicit-any
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { requireAdmin, serviceClient } from "../_shared/admin-auth.ts";
import { createZoomMeeting, zoomConfigured } from "../_shared/zoom.ts";

const BodySchema = z.object({
  booking_id: z.string().uuid(),
  /** Attach an existing meeting instead of creating one. */
  join_url: z.string().url().max(600).optional(),
  meeting_id: z.string().max(80).optional(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

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
    if (!parsed.success) return json({ error: "Invalid input." }, 400);
    const { booking_id, join_url, meeting_id } = parsed.data;

    const supabase = serviceClient();
    const { data: booking, error } = await supabase
      .from("consultation_bookings")
      .select("*, consultation_services!service_id(name, duration_minutes), consultation_practitioners!practitioner_id(timezone, zoom_user_email)")
      .eq("id", booking_id).maybeSingle();
    if (error) throw error;
    if (!booking) return json({ error: "Booking not found." }, 404);

    // Manual attach path.
    if (join_url) {
      const { data: updated, error: updErr } = await supabase
        .from("consultation_bookings")
        .update({ zoom_join_url: join_url, zoom_meeting_id: meeting_id ?? null, zoom_error: null })
        .eq("id", booking_id).select("id, zoom_join_url, zoom_meeting_id").single();
      if (updErr) throw updErr;
      return json({ success: true, attached: true, booking: updated });
    }

    if (!zoomConfigured()) {
      return json({
        error: "Zoom is not configured. Add ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET, or paste a meeting link to attach it manually.",
      }, 400);
    }

    const practitioner = (booking as any).consultation_practitioners;
    const service = (booking as any).consultation_services;
    if (!practitioner?.zoom_user_email) {
      return json({ error: "This practitioner has no Zoom account email set." }, 400);
    }

    const meeting = await createZoomMeeting({
      hostEmail: practitioner.zoom_user_email,
      topic: `${service?.name ?? "Consultation"} — ${booking.customer_name}`,
      agenda: `Reference ${booking.booking_reference}. ${booking.notes ?? ""}`.trim(),
      startAtIso: booking.starts_at,
      durationMinutes: service?.duration_minutes ?? 45,
      timezone: practitioner.timezone || "America/St_Lucia",
    });

    const { data: updated, error: updErr } = await supabase
      .from("consultation_bookings")
      .update({
        zoom_meeting_id: meeting.meetingId,
        zoom_join_url: meeting.joinUrl,
        zoom_start_url: meeting.startUrl,
        zoom_error: null,
      })
      .eq("id", booking_id)
      .select("id, zoom_join_url, zoom_start_url, zoom_meeting_id").single();
    if (updErr) throw updErr;

    return json({ success: true, created: true, booking: updated });
  } catch (err: any) {
    console.error("zoom-create-meeting error:", err?.message || err);
    return json({ error: err?.message || "Could not create the Zoom meeting." }, 500);
  }
});

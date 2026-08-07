// Everything that happens once a consultation is settled: video room, coupon
// redemption and the confirmation email. Shared by the paid and the no-charge
// paths so both behave identically.
// deno-lint-ignore-file no-explicit-any
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { createZoomMeeting, zoomConfigured } from "./zoom.ts";
import { sendConsultationEmail } from "./consultation-email.ts";

export async function finalizeBooking(
  supabase: SupabaseClient,
  booking: any,
  service: any,
  practitioner: any,
): Promise<{ record: any; emailSent: boolean }> {
  let record = booking;

  // Zoom is a side effect: failure is flagged for admin, never fatal.
  if (record.mode === "online") {
    if (zoomConfigured() && practitioner?.zoom_user_email) {
      try {
        const meeting = await createZoomMeeting({
          hostEmail: practitioner.zoom_user_email,
          topic: `${service?.name ?? "Consultation"} — ${record.customer_name}`,
          agenda: `Reference ${record.booking_reference}. ${record.notes ?? ""}`.trim(),
          startAtIso: record.starts_at,
          durationMinutes: service?.duration_minutes ?? 60,
          timezone: practitioner.timezone || "America/St_Lucia",
        });
        const { data: withZoom } = await supabase
          .from("consultation_bookings")
          .update({
            zoom_meeting_id: meeting.meetingId,
            zoom_join_url: meeting.joinUrl,
            zoom_start_url: meeting.startUrl,
            zoom_error: null,
          })
          .eq("id", record.id).select("*").single();
        if (withZoom) record = withZoom;
      } catch (e: any) {
        console.error("Zoom meeting creation failed:", e?.message || e);
        await supabase.from("consultation_bookings")
          .update({ zoom_error: String(e?.message || e).slice(0, 500) })
          .eq("id", record.id);
        record.zoom_error = String(e?.message || e);
      }
    } else {
      const reason = zoomConfigured()
        ? "Practitioner has no Zoom account email configured"
        : "Zoom credentials are not configured";
      await supabase.from("consultation_bookings")
        .update({ zoom_error: reason }).eq("id", record.id);
    }
  }

  // Coupon redemption (non-fatal).
  if (record.coupon_code) {
    try {
      const { data: coupon } = await supabase
        .from("coupons").select("id, used_count").ilike("code", record.coupon_code).maybeSingle();
      if (coupon) {
        await supabase.from("coupon_redemptions").insert({
          coupon_id: coupon.id,
          email: record.customer_email,
          discount_usd: Number(record.discount_usd),
        });
        await supabase.from("coupons")
          .update({ used_count: Number(coupon.used_count) + 1 }).eq("id", coupon.id);
      }
    } catch (e) {
      console.error("consultation coupon redemption failed:", e);
    }
  }

  const emailResult = await sendConsultationEmail("confirmation", {
    booking: record, service, practitioner,
  }).catch((e) => ({ sent: false, error: String(e) }));
  if (!emailResult.sent) console.error("consultation confirmation email failed:", emailResult.error);

  return { record, emailSent: emailResult.sent };
}

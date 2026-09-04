// Takes payment for a held consultation and confirms it. The booking already
// exists as pending_payment, so a successful charge can never lose the slot.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { chargeCard, splitName, sanitizeThreeDS } from "../_shared/authnet.ts";
import { createZoomMeeting, zoomConfigured } from "../_shared/zoom.ts";
import { sendConsultationEmail } from "../_shared/consultation-email.ts";

const BodySchema = z.object({
  booking_id: z.string().uuid(),
  opaqueData: z.object({
    dataDescriptor: z.string().max(255),
    dataValue: z.string().max(20000),
  }).optional(),
  threeDS: z.unknown().optional(),
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
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, 400);
    }
    const { booking_id, opaqueData, threeDS } = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: booking, error: loadErr } = await supabase
      .from("consultation_bookings")
      .select("*, consultation_services!service_id(*), consultation_practitioners!practitioner_id(*)")
      .eq("id", booking_id).maybeSingle();
    if (loadErr) throw loadErr;
    if (!booking) return json({ error: "That booking could not be found." }, 404);

    if (booking.status === "confirmed") {
      return json({
        success: true,
        already_confirmed: true,
        reference: booking.booking_reference,
        manage_token: booking.manage_token,
        zoom_join_url: booking.zoom_join_url,
      });
    }
    if (booking.status !== "pending_payment") {
      return json({ error: "That booking is no longer awaiting payment.", code: "hold_expired" }, 409);
    }
    if (new Date(booking.created_at).getTime() < Date.now() - 20 * 60_000) {
      return json({
        error: "Your held time has expired. Please choose a time again.",
        code: "hold_expired",
      }, 409);
    }

    const service = (booking as any).consultation_services;
    const practitioner = (booking as any).consultation_practitioners;
    // Amount is the server-computed figure stored at hold time — never client input.
    const amountDue = Number(booking.amount);

    let transId: string | null = null;
    if (amountDue > 0) {
      if (!opaqueData) return json({ error: "Payment details are required." }, 400);
      const { firstName, lastName } = splitName(booking.customer_name);
      const charge = await chargeCard({
        amount: amountDue,
        opaqueData,
        description: service?.name || "Private Consultation",
        invoiceNumber: booking.booking_reference.slice(0, 20),
        billTo: {
          firstName,
          lastName,
          phoneNumber: booking.customer_phone
            ? booking.customer_phone.replace(/[^\d+\-() ]/g, "").slice(0, 25) || undefined
            : undefined,
        },
        customerEmail: booking.customer_email,
        authentication: sanitizeThreeDS(threeDS),
      });
      transId = charge.transId;
    }

    // Confirm first: from here on nothing may cost the client their appointment.
    const { data: confirmed, error: confirmErr } = await supabase
      .from("consultation_bookings")
      .update({
        status: "confirmed",
        payment_method: amountDue > 0 ? "authorize.net" : "no_charge",
        payment_transaction_id: transId,
      })
      .eq("id", booking.id)
      .select("*")
      .single();
    if (confirmErr) {
      console.error("CRITICAL: consultation charge succeeded but confirm failed", {
        booking_id: booking.id, transId, error: confirmErr,
      });
      return json({
        error: "Your payment went through but we could not finish confirming. Please contact us and quote " +
          booking.booking_reference + ".",
      }, 500);
    }

    let record: any = confirmed;

    // Zoom is a side effect: failure is flagged for admin, never fatal.
    if (record.mode === "online") {
      if (zoomConfigured() && practitioner?.zoom_user_email) {
        try {
          const meeting = await createZoomMeeting({
            hostEmail: practitioner.zoom_user_email,
            topic: `${service?.name ?? "Consultation"} — ${record.customer_name}`,
            agenda: `Reference ${record.booking_reference}. ${record.notes ?? ""}`.trim(),
            startAtIso: record.starts_at,
            durationMinutes: service?.duration_minutes ?? 45,
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

    return json({
      success: true,
      reference: record.booking_reference,
      manage_token: record.manage_token,
      starts_at: record.starts_at,
      ends_at: record.ends_at,
      mode: record.mode,
      zoom_join_url: record.zoom_join_url ?? null,
      zoom_pending: record.mode === "online" && !record.zoom_join_url,
      amount_paid_usd: amountDue,
      email_sent: emailResult.sent,
    });
  } catch (err: any) {
    console.error("consultation-pay error:", err?.message || err);
    const message = err?.name === "AuthnetChargeError"
      ? err.message
      : "Could not complete the payment. Please try again.";
    return json({ error: message }, 400);
  }
});

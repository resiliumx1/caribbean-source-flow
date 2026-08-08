import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyPaypalCapture } from "../_shared/paypal-verify.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Payload {
  retreat_type_id: string;
  retreat_date_id?: string | null;
  start_date: string;
  end_date: string;
  guest_count: number;
  payment_option: "full" | "deposit";
  paypal_order_id: string;
  paypal_capture_id: string;
  paypal_capture_amount_usd: number;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  special_requests?: string;
}

function diffNights(start: string, end: string) {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = (await req.json()) as Payload;

    if (!payload?.retreat_type_id) throw new Error("retreat_type_id is required");
    if (!payload?.paypal_capture_id) throw new Error("Missing PayPal capture id.");
    if (!payload?.contact_email) throw new Error("Email is required.");
    if (!payload?.contact_name) throw new Error("Name is required.");
    if (!payload?.start_date || !payload?.end_date) throw new Error("Dates are required.");
    if (!["full", "deposit"].includes(payload.payment_option)) {
      throw new Error("Invalid payment_option.");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve user (optional)
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (authHeader?.toLowerCase().startsWith("bearer ")) {
      const token = authHeader.slice(7).trim();
      if (token && token.split(".").length === 3) {
        const { data } = await supabase.auth.getUser(token);
        if (data?.user?.id) userId = data.user.id;
      }
    }

    // Load retreat type
    const { data: rType, error: typeErr } = await supabase
      .from("retreat_types")
      .select("*")
      .eq("id", payload.retreat_type_id)
      .single();
    if (typeErr || !rType) throw new Error("Retreat not found.");
    // Withdrawn retreats are application-only or discontinued: never payable here,
    // even if a stale link or a crafted request reaches this endpoint.
    if (rType.is_active === false) {
      throw new Error("This retreat is not open for direct booking. Please contact us to apply.");
    }

    const guests = Math.max(1, Math.floor(payload.guest_count || 1));
    let total_usd = 0;

    if (rType.type === "group") {
      if (!payload.retreat_date_id) throw new Error("retreat_date_id required for group retreats.");
      const { data: rd, error: rdErr } = await supabase
        .from("retreat_dates")
        .select("*")
        .eq("id", payload.retreat_date_id)
        .single();
      if (rdErr || !rd) throw new Error("Retreat date not found.");
      if (rd.is_published === false) throw new Error("This retreat date is not open for booking.");
      if (rd.retreat_type_id !== rType.id) throw new Error("Retreat date does not belong to this retreat.");
      const spotsLeft = rd.spots_total - rd.spots_booked;
      if (spotsLeft < guests) throw new Error("Not enough spots available.");
      const perPerson = Number(rd.price_override_usd ?? rType.base_price_usd);
      total_usd = perPerson * guests;
    } else {
      const nights = diffNights(payload.start_date, payload.end_date);
      const { data: tiers } = await supabase
        .from("solo_pricing_tiers")
        .select("*")
        .order("min_nights", { ascending: true });
      const tier =
        (tiers ?? []).find((t: any) => nights >= t.min_nights && nights <= t.max_nights) ||
        (tiers ?? [])[tiers!.length - 1];
      if (!tier) throw new Error("Pricing not configured.");
      total_usd = Number(tier.nightly_rate_usd) * nights * guests;
    }

    const amount_paid_usd =
      payload.payment_option === "deposit"
        ? +(total_usd / 2).toFixed(2)
        : +total_usd.toFixed(2);
    const balance_due_usd = +(total_usd - amount_paid_usd).toFixed(2);

    // Server-side PayPal verification: confirm the capture actually completed
    // for the amount we just computed. Replaces the previous client-trust check.
    await verifyPaypalCapture({
      paypal_order_id: payload.paypal_order_id,
      paypal_capture_id: payload.paypal_capture_id,
      expected_usd: amount_paid_usd,
    });

    const { data: booking, error: bookErr } = await supabase
      .from("retreat_bookings")
      .insert({
        user_id: userId,
        retreat_type_id: rType.id,
        retreat_date_id: payload.retreat_date_id ?? null,
        start_date: payload.start_date,
        end_date: payload.end_date,
        guest_count: guests,
        total_usd,
        deposit_usd: +(total_usd / 2).toFixed(2),
        amount_paid_usd,
        balance_due_usd,
        payment_option: payload.payment_option,
        payment_status:
          payload.payment_option === "full" ? "paid" : "deposit_paid",
        status: "confirmed",
        contact_name: payload.contact_name,
        contact_email: payload.contact_email.toLowerCase().trim(),
        contact_phone: payload.contact_phone ?? null,
        special_requests: payload.special_requests ?? null,
        paypal_order_id: payload.paypal_order_id,
        paypal_capture_id: payload.paypal_capture_id,
      })
      .select("id")
      .single();
    if (bookErr) throw bookErr;

    // Increment spots_booked for group retreats
    if (rType.type === "group" && payload.retreat_date_id) {
      const { data: rd } = await supabase
        .from("retreat_dates")
        .select("spots_booked")
        .eq("id", payload.retreat_date_id)
        .single();
      if (rd) {
        await supabase
          .from("retreat_dates")
          .update({ spots_booked: rd.spots_booked + guests })
          .eq("id", payload.retreat_date_id);
      }
    }

    // Best-effort confirmation email via Resend
    try {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY) {
        const subject = `Retreat booking confirmed — ${rType.name}`;
        const body = `
          <div style="font-family: 'DM Sans', Arial, sans-serif; max-width:560px; margin:auto; padding:24px; color:#2b2b2b;">
            <h2 style="font-family: 'Cormorant Garamond', serif; color:#1a3a2e;">Your retreat is booked</h2>
            <p>Dear ${payload.contact_name},</p>
            <p>Thank you for booking <strong>${rType.name}</strong> at Mount Kailash Rejuvenation Centre.</p>
            <p><strong>Dates:</strong> ${payload.start_date} → ${payload.end_date}<br/>
            <strong>Guests:</strong> ${guests}<br/>
            <strong>Total:</strong> $${total_usd.toFixed(2)} USD<br/>
            <strong>Paid now:</strong> $${amount_paid_usd.toFixed(2)} USD<br/>
            ${balance_due_usd > 0 ? `<strong>Balance due before arrival:</strong> $${balance_due_usd.toFixed(2)} USD<br/>` : ""}
            </p>
            <p>Rt Hon Priest Kailash K Leonce and the Mount Kailash team will reach out shortly with your pre-arrival protocol.</p>
            <p>With light,<br/>Mount Kailash Rejuvenation Centre</p>
          </div>`;
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Mount Kailash <orders@mountkailashslu.com>",
            to: [payload.contact_email],
            bcc: ["info@mountkailashslu.com"],
            subject,
            html: body,
          }),
        });
      }
    } catch (e) {
      console.error("retreat email send failed:", e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        booking_id: booking.id,
        total_usd,
        amount_paid_usd,
        balance_due_usd,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("retreat-checkout error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Booking failed." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
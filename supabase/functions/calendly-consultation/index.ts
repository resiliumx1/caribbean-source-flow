import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { chargeCard, splitName, type OpaqueData } from "../_shared/authnet.ts";
import { sanitizeAttribution } from "../_shared/attribution.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const BodySchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(255),
  phone: z.string().max(30).optional().default(""),
  opaqueData: z.object({
    dataDescriptor: z.string(),
    dataValue: z.string(),
  }),
  attribution: z.record(z.unknown()).optional(),
});

interface ConsultationSettings {
  fee_usd: number;
  calendly_username: string;
  calendly_event_slug: string;
  duration_minutes: number;
  notice_hours: number;
  title: string;
}

function buildCalendlyUrl(
  username: string,
  slug: string,
  params: { name: string; email: string; phone?: string },
): string {
  const url = new URL(`https://calendly.com/${username}/${slug}`);
  url.searchParams.set("name", params.name);
  url.searchParams.set("email", params.email);
  if (params.phone) url.searchParams.set("a1", params.phone);
  return url.toString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { name, email, phone, opaqueData, attribution: rawAttribution } = parsed.data;
    const attribution = sanitizeAttribution(rawAttribution);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Load authoritative settings from the database.
    const { data: settingsRow, error: settingsErr } = await supabase
      .from("consultation_settings")
      .select("value")
      .eq("key", "consultation")
      .single();

    if (settingsErr || !settingsRow) {
      console.error("consultation_settings fetch failed:", settingsErr);
      throw new Error("Consultation settings are not configured.");
    }

    const settings = settingsRow.value as ConsultationSettings;
    const feeUsd = Number(settings.fee_usd);
    if (!Number.isFinite(feeUsd) || feeUsd <= 0) {
      throw new Error("Consultation fee is not configured correctly.");
    }

    // Charge card via Authorize.net.
    const { firstName, lastName } = splitName(name);
    const charge = await chargeCard({
      amount: feeUsd,
      opaqueData,
      description: settings.title || "Private Healing Consultation",
      invoiceNumber: `CONS-${Date.now().toString(36).toUpperCase()}`,
      billTo: {
        firstName,
        lastName,
        phoneNumber: phone ? phone.replace(/[^\d+\-() ]/g, "").slice(0, 25) || undefined : undefined,
      },
      customerEmail: email.toLowerCase().trim(),
    });

    // Record the paid booking.
    const { data: booking, error: bookingErr } = await supabase
      .from("consultation_bookings")
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        amount_paid_usd: feeUsd,
        payment_transaction_id: charge.transId,
        payment_method: "authorize.net",
        status: "paid",
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        utm_content: attribution.utm_content,
        utm_term: attribution.utm_term,
        referral_code: attribution.referral_code,
        landing_path: attribution.landing_path,
        user_agent: req.headers.get("user-agent") || null,
        ip_address: req.headers.get("x-forwarded-for") || null,
      })
      .select("id")
      .single();

    if (bookingErr) {
      console.error("consultation_bookings insert failed:", bookingErr);
      throw new Error("Payment succeeded but we could not record the booking. Please contact support.");
    }

    const calendlyUrl = buildCalendlyUrl(
      settings.calendly_username,
      settings.calendly_event_slug,
      { name: name.trim(), email: email.toLowerCase().trim(), phone: phone?.trim() },
    );

    return new Response(
      JSON.stringify({
        success: true,
        booking_id: booking.id,
        calendly_url: calendlyUrl,
        amount_paid_usd: feeUsd,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("calendly-consultation error:", err?.message || err);
    const message = err?.name === "AuthnetChargeError"
      ? err.message
      : err?.message || "Could not complete the booking. Please try again.";

    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

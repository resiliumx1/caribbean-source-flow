// Creates the appointment hold. Every booking in the system is created here so
// the overlap constraint has a single choke point.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { DateTime } from "npm:luxon@3.5.0";
import { sanitizeAttribution } from "../_shared/attribution.ts";
import { finalizeBooking } from "../_shared/consultation-confirm.ts";
import {
  generateSlots, toBlockedRanges, resolveCoupon, isValidZone, type Service,
} from "../_shared/consultation.ts";

const BodySchema = z.object({
  service_id: z.string().uuid(),
  start: z.string().datetime({ offset: true }),
  mode: z.enum(["in_person", "online"]),
  customer_name: z.string().trim().min(1).max(120),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().max(40).optional().default(""),
  customer_timezone: z.string().max(60).optional(),
  notes: z.string().trim().max(2000).optional().default(""),
  intake_answers: z.record(z.union([z.string(), z.boolean()])).optional().default({}),
  coupon_code: z.string().trim().max(60).optional(),
  package_email: z.string().trim().email().max(255).optional(),
  attribution: z.record(z.unknown()).optional(),
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
    const b = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: service, error: svcErr } = await supabase
      .from("consultation_services")
      .select("*, consultation_practitioners!practitioner_id(*)")
      .eq("id", b.service_id).eq("is_active", true).maybeSingle();
    if (svcErr) throw svcErr;
    if (!service) return json({ error: "That consultation is no longer available." }, 404);

    const practitioner = (service as any).consultation_practitioners;
    if (!practitioner?.is_active) return json({ error: "No practitioner is available." }, 409);
    const tz = practitioner.timezone || "America/St_Lucia";

    if (service.mode !== "both" && service.mode !== b.mode) {
      return json({ error: "That format is not offered for this consultation." }, 400);
    }

    const startIso = new Date(b.start).toISOString();
    const localDate = DateTime.fromISO(startIso, { zone: tz }).toFormat("yyyy-MM-dd");

    // Re-derive the slot server-side: a client may never assert its own times.
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
        .gte("starts_at", DateTime.fromISO(localDate, { zone: tz }).minus({ days: 1 }).toUTC().toISO()!)
        .lte("starts_at", DateTime.fromISO(localDate, { zone: tz }).plus({ days: 2 }).toUTC().toISO()!),
    ]);

    const slots = generateSlots({
      service: service as unknown as Service,
      timezone: tz,
      availability: availability ?? [],
      overrides: overrides ?? [],
      blocked: toBlockedRanges(existing ?? [], tz, service.buffer_before_minutes, service.buffer_after_minutes),
      from: localDate,
      to: localDate,
    });

    const match = slots.find((s) => s.start === startIso);
    if (!match) {
      return json({
        error: "That time is no longer available. Please choose another.",
        code: "slot_unavailable",
      }, 409);
    }

    const amountUsd = Number(service.price_usd);
    // Follow-on package sessions take no card; entitlement is checked by hand.
    const requiresPayment = service.requires_payment !== false;
    if (!requiresPayment && !b.package_email) {
      return json({
        error: "Please give the email address used on your package purchase.",
        code: "package_email_required",
      }, 400);
    }
    const { coupon, discountUsd, reason } = await resolveCoupon(supabase, b.coupon_code, amountUsd);
    if (b.coupon_code && !coupon) {
      return json({ error: reason || "That code could not be applied.", code: "coupon_invalid" }, 400);
    }
    const dueUsd = +(amountUsd - discountUsd).toFixed(2);

    const attribution = sanitizeAttribution(b.attribution);
    const customerZone = isValidZone(b.customer_timezone) ? b.customer_timezone! : tz;

    const { data: booking, error: insertErr } = await supabase
      .from("consultation_bookings")
      .insert({
        service_id: service.id,
        practitioner_id: practitioner.id,
        starts_at: match.start,
        ends_at: match.end,
        customer_name: b.customer_name,
        customer_email: b.customer_email.toLowerCase(),
        customer_phone: b.customer_phone || null,
        customer_timezone: customerZone,
        notes: b.notes || null,
        intake_answers: b.intake_answers ?? {},
        mode: b.mode,
        status: requiresPayment ? "pending_payment" : "confirmed",
        amount: requiresPayment ? dueUsd : 0,
        payment_method: requiresPayment ? null : "no_charge",
        package_purchase_email: b.package_email?.toLowerCase() ?? null,
        needs_verification: !requiresPayment,
        currency: "USD",
        discount_usd: discountUsd,
        coupon_code: coupon?.code ?? null,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        utm_content: attribution.utm_content,
        utm_term: attribution.utm_term,
        referral_code: attribution.referral_code,
        landing_path: attribution.landing_path,
        user_agent: req.headers.get("user-agent")?.slice(0, 400) || null,
        ip_address: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      })
      .select("*")
      .single();

    if (insertErr) {
      // 23P01 = exclusion constraint violation: somebody took the slot first.
      if ((insertErr as any).code === "23P01") {
        return json({
          error: "That time was just taken. Please choose another.",
          code: "slot_taken",
        }, 409);
      }
      console.error("consultation booking insert failed:", insertErr);
      throw insertErr;
    }

    // No payment to take: confirm, create the video room and email straight away.
    if (!requiresPayment) {
      const { record } = await finalizeBooking(supabase, booking, service, practitioner);
      return json({
        success: true,
        confirmed: true,
        reference: record.booking_reference,
        manage_token: record.manage_token,
        starts_at: record.starts_at,
        mode: record.mode,
        zoom_join_url: record.zoom_join_url ?? null,
        zoom_pending: record.mode === "online" && !record.zoom_join_url,
        amount_paid_usd: 0,
        practitioner_timezone: tz,
      });
    }

    return json({
      success: true,
      booking: {
        id: booking.id,
        reference: booking.booking_reference,
        starts_at: booking.starts_at,
        ends_at: booking.ends_at,
        amount_due_usd: Number(booking.amount),
        discount_usd: Number(booking.discount_usd),
        price_usd: amountUsd,
        coupon_code: coupon?.code ?? null,
        // Holds are released automatically after 20 minutes.
        hold_expires_at: new Date(new Date(booking.created_at).getTime() + 20 * 60_000).toISOString(),
      },
      practitioner_timezone: tz,
    });
  } catch (err: any) {
    console.error("consultation-book error:", err?.message || err);
    return json({ error: "Could not hold that time. Please try again." }, 500);
  }
});

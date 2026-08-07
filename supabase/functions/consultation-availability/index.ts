// Public availability engine: expands recurring windows and date overrides into
// bookable UTC slots for a service and date range.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { DateTime } from "npm:luxon@3.5.0";
import { generateSlots, toBlockedRanges, type Service } from "../_shared/consultation.ts";

const BodySchema = z.object({
  service_id: z.string().uuid().optional(),
  service_slug: z.string().max(120).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  /** When true, only the first bookable slot is returned (homepage signal). */
  next_only: z.boolean().optional(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const raw = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, 400);
    }
    const { service_id, service_slug, next_only } = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let query = supabase
      .from("consultation_services")
      .select("*, consultation_practitioners!practitioner_id(*)")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(1);
    if (service_id) query = query.eq("id", service_id);
    else if (service_slug) query = query.eq("slug", service_slug);

    const { data: services, error: svcErr } = await query;
    if (svcErr) throw svcErr;
    const service = services?.[0];
    if (!service) return json({ error: "No active consultation service found." }, 404);

    const practitioner = (service as any).consultation_practitioners;
    if (!practitioner || !practitioner.is_active) {
      return json({ error: "No active practitioner is configured." }, 404);
    }
    const tz = practitioner.timezone || "America/St_Lucia";

    // Default range: from today (practitioner time) to the service's advance window.
    const today = DateTime.now().setZone(tz).toFormat("yyyy-MM-dd");
    const from = parsed.data.from && parsed.data.from >= today ? parsed.data.from : today;
    const maxTo = DateTime.now().setZone(tz)
      .plus({ days: service.max_advance_days }).toFormat("yyyy-MM-dd");
    let to = parsed.data.to ?? maxTo;
    if (to > maxTo) to = maxTo;
    if (to < from) to = from;

    const [{ data: availability }, { data: overrides }, { data: bookings }] = await Promise.all([
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
        .gte("starts_at", DateTime.fromISO(from, { zone: tz }).minus({ days: 1 }).toUTC().toISO()!)
        .lte("starts_at", DateTime.fromISO(to, { zone: tz }).plus({ days: 2 }).toUTC().toISO()!),
    ]);

    const slots = generateSlots({
      service: service as unknown as Service,
      timezone: tz,
      availability: availability ?? [],
      overrides: overrides ?? [],
      blocked: toBlockedRanges(
        bookings ?? [], tz,
        service.buffer_before_minutes, service.buffer_after_minutes,
      ),
      from,
      to,
    });

    return json({
      service: {
        id: service.id,
        name: service.name,
        slug: service.slug,
        description: service.description,
        long_description: service.long_description,
        duration_minutes: service.duration_minutes,
        price_usd: Number(service.price_usd),
        price_xcd: Number(service.price_xcd),
        mode: service.mode,
        image_url: service.image_url,
        min_notice_hours: service.min_notice_hours,
        max_advance_days: service.max_advance_days,
      },
      practitioner: {
        id: practitioner.id,
        name: practitioner.name,
        title: practitioner.title,
        bio: practitioner.bio,
        photo_url: practitioner.photo_url,
        timezone: tz,
      },
      range: { from, to },
      slots: next_only ? slots.slice(0, 1) : slots,
    });
  } catch (err: any) {
    console.error("consultation-availability error:", err?.message || err);
    return json({ error: "Could not load availability." }, 500);
  }
});

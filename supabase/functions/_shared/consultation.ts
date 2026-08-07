// Shared consultation booking domain logic: slot generation, coupon handling and
// timezone-correct arithmetic. All instants are handled in UTC; availability
// windows are wall-clock times interpreted in the practitioner's IANA zone.
// deno-lint-ignore-file no-explicit-any
import { DateTime } from "npm:luxon@3.5.0";

export interface Practitioner {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  timezone: string;
  zoom_user_email: string | null;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  duration_minutes: number;
  duration_display_label: string | null;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  price_usd: number;
  price_xcd: number;
  mode: "in_person" | "online" | "both";
  practitioner_id: string | null;
  min_notice_hours: number;
  max_advance_days: number;
  max_per_day: number | null;
  image_url: string | null;
}

export interface AvailabilityRow {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface OverrideRow {
  date: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
}

/** An existing booking that blocks the calendar, already buffer-expanded. */
export interface BlockedRange {
  startMs: number;
  endMs: number;
  /** Local date (practitioner zone) used for max_per_day counting. */
  localDate: string;
}

export interface Slot {
  /** UTC ISO instant the session starts. */
  start: string;
  /** UTC ISO instant the session ends. */
  end: string;
}

const MINUTE = 60_000;

function parseTime(t: string): { hour: number; minute: number } {
  const [h, m] = t.split(":");
  return { hour: Number(h), minute: Number(m ?? 0) };
}

/**
 * Expand recurring weekly windows and date overrides into bookable slots.
 * Overrides always take precedence over the recurring pattern for their date.
 */
export function generateSlots(params: {
  service: Service;
  timezone: string;
  availability: AvailabilityRow[];
  overrides: OverrideRow[];
  blocked: BlockedRange[];
  from: string; // YYYY-MM-DD in practitioner zone
  to: string; // YYYY-MM-DD inclusive
  now?: Date;
}): Slot[] {
  const { service, timezone, availability, overrides, blocked, from, to } = params;
  const nowMs = (params.now ?? new Date()).getTime();
  const earliestMs = nowMs + service.min_notice_hours * 60 * MINUTE;
  const latestMs = nowMs + service.max_advance_days * 24 * 60 * MINUTE;

  const step = service.duration_minutes +
    service.buffer_before_minutes + service.buffer_after_minutes;
  if (step <= 0) return [];

  const overridesByDate = new Map<string, OverrideRow[]>();
  for (const o of overrides) {
    const list = overridesByDate.get(o.date) ?? [];
    list.push(o);
    overridesByDate.set(o.date, list);
  }

  const bookedPerDate = new Map<string, number>();
  for (const b of blocked) {
    bookedPerDate.set(b.localDate, (bookedPerDate.get(b.localDate) ?? 0) + 1);
  }

  const slots: Slot[] = [];
  let cursorDate = DateTime.fromISO(from, { zone: timezone }).startOf("day");
  const lastDate = DateTime.fromISO(to, { zone: timezone }).startOf("day");
  if (!cursorDate.isValid || !lastDate.isValid) return [];

  // Hard cap the loop so a bad range can never spin.
  for (let guard = 0; guard < 400 && cursorDate <= lastDate; guard++, cursorDate = cursorDate.plus({ days: 1 })) {
    const dateKey = cursorDate.toFormat("yyyy-MM-dd");
    const dayOverrides = overridesByDate.get(dateKey);

    let windows: { start_time: string; end_time: string }[];
    if (dayOverrides && dayOverrides.length) {
      const closed = dayOverrides.some((o) => !o.is_available);
      if (closed) continue; // holiday / blocked day
      windows = dayOverrides
        .filter((o) => o.start_time && o.end_time)
        .map((o) => ({ start_time: o.start_time!, end_time: o.end_time! }));
    } else {
      // Luxon weekday: 1 = Monday .. 7 = Sunday. Our day_of_week: 0 = Sunday.
      const dow = cursorDate.weekday === 7 ? 0 : cursorDate.weekday;
      windows = availability.filter((a) => a.day_of_week === dow);
    }
    if (!windows.length) continue;

    if (service.max_per_day != null && (bookedPerDate.get(dateKey) ?? 0) >= service.max_per_day) {
      continue;
    }
    let takenToday = bookedPerDate.get(dateKey) ?? 0;

    for (const w of windows) {
      const s = parseTime(w.start_time);
      const e = parseTime(w.end_time);
      let slotStart = cursorDate.set({ hour: s.hour, minute: s.minute, second: 0, millisecond: 0 });
      const windowEnd = cursorDate.set({ hour: e.hour, minute: e.minute, second: 0, millisecond: 0 });

      while (slotStart.plus({ minutes: service.duration_minutes }) <= windowEnd) {
        const slotEnd = slotStart.plus({ minutes: service.duration_minutes });
        const startMs = slotStart.toUTC().toMillis();
        const endMs = slotEnd.toUTC().toMillis();
        const blockStart = startMs - service.buffer_before_minutes * MINUTE;
        const blockEnd = endMs + service.buffer_after_minutes * MINUTE;

        const withinNotice = startMs >= earliestMs && startMs <= latestMs;
        const overlaps = blocked.some((b) => b.startMs < blockEnd && b.endMs > blockStart);
        const dayFull = service.max_per_day != null && takenToday >= service.max_per_day;

        if (withinNotice && !overlaps && !dayFull) {
          slots.push({
            start: new Date(startMs).toISOString(),
            end: new Date(endMs).toISOString(),
          });
        }
        slotStart = slotStart.plus({ minutes: step });
      }
    }
    takenToday = takenToday; // per-day counts only reflect existing bookings
  }

  return slots.sort((a, b) => a.start.localeCompare(b.start));
}

/** Expand stored bookings into buffer-inclusive blocked ranges. */
export function scheduleOpenDates(params: {
  timezone: string;
  availability: AvailabilityRow[];
  overrides: OverrideRow[];
  from: string;
  to: string;
}): string[] {
  const { timezone, availability, overrides, from, to } = params;
  const overridesByDate = new Map<string, OverrideRow[]>();
  for (const o of overrides) {
    const list = overridesByDate.get(o.date) ?? [];
    list.push(o);
    overridesByDate.set(o.date, list);
  }

  const out: string[] = [];
  let cursor = DateTime.fromISO(from, { zone: timezone }).startOf("day");
  const last = DateTime.fromISO(to, { zone: timezone }).startOf("day");
  if (!cursor.isValid || !last.isValid) return out;

  for (let guard = 0; guard < 400 && cursor <= last; guard++, cursor = cursor.plus({ days: 1 })) {
    const key = cursor.toFormat("yyyy-MM-dd");
    const dayOverrides = overridesByDate.get(key);
    if (dayOverrides && dayOverrides.length) {
      if (dayOverrides.some((o) => !o.is_available)) continue;
      if (dayOverrides.some((o) => o.start_time && o.end_time)) out.push(key);
      continue;
    }
    const dow = cursor.weekday === 7 ? 0 : cursor.weekday;
    if (availability.some((a) => a.day_of_week === dow)) out.push(key);
  }
  return out;
}

export function toBlockedRanges(
  bookings: any[],
  timezone: string,
  fallbackBufferBefore = 0,
  fallbackBufferAfter = 0,
): BlockedRange[] {
  return bookings.map((b) => {
    const before = Number(b?.consultation_services?.buffer_before_minutes ?? fallbackBufferBefore) || 0;
    const after = Number(b?.consultation_services?.buffer_after_minutes ?? fallbackBufferAfter) || 0;
    const startMs = new Date(b.starts_at).getTime();
    const endMs = new Date(b.ends_at).getTime();
    return {
      startMs: startMs - before * MINUTE,
      endMs: endMs + after * MINUTE,
      localDate: DateTime.fromISO(b.starts_at, { zone: timezone }).toFormat("yyyy-MM-dd"),
    };
  });
}

/** Format an instant in a given zone, e.g. "Tuesday, 14 October 2026 at 2:00 PM AST". */
export function formatInZone(iso: string, zone: string): string {
  const dt = DateTime.fromISO(iso, { zone });
  if (!dt.isValid) return iso;
  return `${dt.toFormat("cccc, d LLLL yyyy 'at' h:mm a")} (${dt.toFormat("ZZZZ")})`;
}

export function isValidZone(zone: unknown): boolean {
  if (typeof zone !== "string" || !zone) return false;
  return DateTime.local().setZone(zone).isValid;
}

/**
 * Validate a coupon against the existing coupons table and return the discount.
 * Mirrors the checkout rules; consultation services are not product-scoped, so
 * a coupon restricted to specific products or categories is not applicable.
 */
export async function resolveCoupon(
  supabase: any,
  rawCode: string | null | undefined,
  amountUsd: number,
): Promise<{ coupon: any | null; discountUsd: number; reason?: string }> {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) return { coupon: null, discountUsd: 0 };

  const { data: coupon } = await supabase
    .from("coupons").select("*").ilike("code", code).maybeSingle();
  if (!coupon) return { coupon: null, discountUsd: 0, reason: "That code is not recognised." };

  const now = Date.now();
  if (!coupon.is_active) return { coupon: null, discountUsd: 0, reason: "That code is no longer active." };
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    return { coupon: null, discountUsd: 0, reason: "That code is not active yet." };
  }
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) {
    return { coupon: null, discountUsd: 0, reason: "That code has expired." };
  }
  if (coupon.max_uses && Number(coupon.used_count) >= Number(coupon.max_uses)) {
    return { coupon: null, discountUsd: 0, reason: "That code has reached its usage limit." };
  }
  if (amountUsd < Number(coupon.min_order_usd ?? 0)) {
    return {
      coupon: null,
      discountUsd: 0,
      reason: `That code requires a minimum of $${Number(coupon.min_order_usd).toFixed(2)}.`,
    };
  }
  if ((coupon.product_ids ?? []).length || (coupon.category_ids ?? []).length) {
    return { coupon: null, discountUsd: 0, reason: "That code does not apply to consultations." };
  }

  const discountUsd = coupon.discount_type === "percent"
    ? +(amountUsd * (Number(coupon.discount_value) / 100)).toFixed(2)
    : Math.min(Number(coupon.discount_value), amountUsd);

  return { coupon, discountUsd: Math.max(0, Math.min(discountUsd, amountUsd)) };
}

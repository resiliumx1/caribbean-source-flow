/**
 * Display helpers for the consultation booking flow.
 * Every instant arrives from the server as a UTC ISO string; conversion to a
 * human timezone happens here and nowhere else.
 */

export interface Slot {
  start: string;
  end: string;
}

export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function timezoneList(): string[] {
  try {
    // @ts-expect-error supportedValuesOf is not in older TS lib definitions
    const values: string[] | undefined = Intl.supportedValuesOf?.("timeZone");
    if (values?.length) return values;
  } catch { /* fall through */ }
  return [
    "America/St_Lucia", "America/New_York", "America/Chicago", "America/Denver",
    "America/Los_Angeles", "America/Toronto", "America/Barbados", "America/Port_of_Spain",
    "America/Jamaica", "Europe/London", "Europe/Paris", "Europe/Berlin",
    "Africa/Lagos", "Africa/Accra", "Africa/Nairobi", "Africa/Johannesburg",
    "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo",
    "Australia/Sydney", "UTC",
  ];
}

export function zoneLabel(zone: string): string {
  return zone.replace(/_/g, " ");
}

function fmt(iso: string, zone: string, options: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { ...options, timeZone: zone }).format(new Date(iso));
  } catch {
    return new Intl.DateTimeFormat("en-GB", options).format(new Date(iso));
  }
}

/** "2:00 pm" */
export function slotTime(iso: string, zone: string): string {
  return fmt(iso, zone, { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
}

/** "Tuesday 14 October 2026" */
export function longDate(iso: string, zone: string): string {
  return fmt(iso, zone, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/** "Tuesday 14 October, 2:00 pm AST" */
export function fullMoment(iso: string, zone: string): string {
  const date = fmt(iso, zone, { weekday: "long", day: "numeric", month: "long" });
  const time = slotTime(iso, zone);
  const abbr = fmt(iso, zone, { timeZoneName: "short" }).split(" ").pop() ?? "";
  return `${date}, ${time} ${abbr}`;
}

export function shortMoment(iso: string, zone: string): string {
  return `${fmt(iso, zone, { day: "numeric", month: "short" })}, ${slotTime(iso, zone)}`;
}

/** YYYY-MM-DD for an instant as observed in a given zone. */
export function zonedDateKey(iso: string, zone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date(iso));
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    return `${get("year")}-${get("month")}-${get("day")}`;
  } catch {
    return new Date(iso).toISOString().slice(0, 10);
  }
}

/** Group slots by their calendar date in the viewer's timezone. */
export function groupSlotsByDate(slots: Slot[], zone: string): Map<string, Slot[]> {
  const map = new Map<string, Slot[]>();
  for (const s of slots) {
    const key = zonedDateKey(s.start, zone);
    const list = map.get(key) ?? [];
    list.push(s);
    map.set(key, list);
  }
  return map;
}

export function moneyUsd(amount: number): string {
  return `$${Number(amount).toFixed(2)}`;
}

/** Capture UTM parameters and any ?ref= code on entry to the flow. */
export function captureAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = params.get(key);
    if (v) out[key] = v.slice(0, 255);
  }
  const ref = params.get("ref") || params.get("referral");
  if (ref) out.referral_code = ref.slice(0, 255);
  out.landing_path = window.location.pathname + window.location.search;
  return out;
}

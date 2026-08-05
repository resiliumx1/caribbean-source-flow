// Shared marketing-attribution sanitiser used by the order-creating functions.
// Attribution is recorded for reporting only — it never influences pricing.
// deno-lint-ignore-file no-explicit-any

export type OrderAttribution = {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  referral_code?: string | null;
  landing_path?: string | null;
};

const FIELDS: (keyof OrderAttribution)[] = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content",
  "utm_term", "referral_code", "landing_path",
];

/** Trims / length-caps the client-supplied attribution object. */
export function sanitizeAttribution(input: unknown): OrderAttribution {
  const out: OrderAttribution = {};
  if (!input || typeof input !== "object") return out;
  for (const f of FIELDS) {
    const v = (input as any)[f];
    if (typeof v === "string" && v.trim()) out[f] = v.trim().slice(0, 255);
  }
  return out;
}
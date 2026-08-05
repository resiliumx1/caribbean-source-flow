// Shared WCE attribution / referral helpers used by the order-creating functions.
// deno-lint-ignore-file no-explicit-any

export type WceAttribution = {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  referral_code?: string | null;
  landing_path?: string | null;
};

const FIELDS: (keyof WceAttribution)[] = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content",
  "utm_term", "referral_code", "landing_path",
];

/** Trims / length-caps the client-supplied attribution object. */
export function sanitizeAttribution(input: unknown): WceAttribution {
  const out: WceAttribution = {};
  if (!input || typeof input !== "object") return out;
  for (const f of FIELDS) {
    const v = (input as any)[f];
    if (typeof v === "string" && v.trim()) out[f] = v.trim().slice(0, 255);
  }
  return out;
}

/** WooCommerce order meta_data entries — Woo surfaces these in the order admin. */
export function attributionMetaData(attr: WceAttribution, pathwayKey?: string | null) {
  const meta = FIELDS
    .filter((f) => attr[f])
    .map((f) => ({ key: `_${f}`, value: attr[f] as string }));
  if (pathwayKey) meta.push({ key: "_pathway_key", value: pathwayKey });
  return meta;
}

/** True when a coupon with this code exists in WooCommerce. */
export async function wooCouponExists(
  normalizedUrl: string,
  wooKey: string,
  wooSecret: string,
  code: string,
): Promise<boolean> {
  try {
    const url =
      `${normalizedUrl}/wp-json/wc/v3/coupons?code=${encodeURIComponent(code.toLowerCase())}` +
      `&consumer_key=${encodeURIComponent(wooKey)}&consumer_secret=${encodeURIComponent(wooSecret)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      console.error("Woo coupon lookup failed", res.status, await res.text());
      return false;
    }
    const list = await res.json();
    return Array.isArray(list) && list.length > 0;
  } catch (e) {
    console.error("Woo coupon lookup error", e);
    return false;
  }
}

/** Validates a referral code against wce_referral_codes (active only). */
export async function findActiveReferralCode(admin: any, code: string) {
  const { data, error } = await admin
    .from("wce_referral_codes")
    .select("id, code, discount_percent, use_count, is_active")
    .ilike("code", code)
    .maybeSingle();
  if (error) {
    console.error("referral lookup failed", error.message);
    return null;
  }
  return data?.is_active ? data : null;
}

/** Increments use_count and records whether a Woo coupon matched on this use. */
export async function markReferralUsed(admin: any, row: any, wooCouponFound: boolean) {
  const { error } = await admin
    .from("wce_referral_codes")
    .update({
      use_count: Number(row.use_count ?? 0) + 1,
      last_woo_coupon_found: wooCouponFound,
      last_used_at: new Date().toISOString(),
    })
    .eq("id", row.id);
  if (error) console.error("referral increment failed", error.message);
}

/** Inserts the revenue row that powers the /admin/wce orders view. */
export async function recordWceOrder(admin: any, row: {
  woo_order_id?: number | null;
  order_number?: string | null;
  email?: string | null;
  pathway_key?: string | null;
  amount?: number | null;
  currency?: string | null;
  referral_code?: string | null;
  status?: string | null;
  attribution: WceAttribution;
}) {
  const { attribution, ...rest } = row;
  const { error } = await admin.from("wce_orders").insert({
    ...rest,
    amount: Number(rest.amount ?? 0),
    currency: rest.currency || "USD",
    status: rest.status || "pending",
    utm_source: attribution.utm_source ?? null,
    utm_medium: attribution.utm_medium ?? null,
    utm_campaign: attribution.utm_campaign ?? null,
    utm_content: attribution.utm_content ?? null,
    utm_term: attribution.utm_term ?? null,
    referral_code: rest.referral_code ?? attribution.referral_code ?? null,
  });
  if (error) console.error("wce_orders insert failed", error.message);
}

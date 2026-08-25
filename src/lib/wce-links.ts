/** Direct campaign links for the WCE pathways.
 *
 *  /wce-2026/go/<slug>  (and the shorter /wce/go/<slug> alias) send paid-social
 *  traffic straight to the right action:
 *    in-person / online → product added to the existing cart, then /checkout
 *    retreat            → the focused application view. NEVER checkout: the
 *                         retreat is application-only (apply → review →
 *                         approval → private checkout link → payment).
 *
 *  Every query parameter is carried through the redirect so a boosted post's
 *  attribution survives all the way to the order or lead.
 */
import { SITE_URL } from "@/lib/site-config";

export const WCE_GO_PATH = "/wce-2026/go";
export const WCE_GO_ALIAS = "/wce/go";

/** Slug for a pathway — the admin-configurable value, or the key as a fallback. */
export function pathwayLinkSlug(p: { key: string; link_slug?: string | null }): string {
  return (p.link_slug || "").trim() || p.key.replace(/_/g, "-");
}

/** Params we preserve through the redirect, in a stable order. */
export const CAMPAIGN_PARAMS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref",
] as const;

export type CampaignParams = Partial<Record<(typeof CAMPAIGN_PARAMS)[number] | "cl", string>>;

/** Absolute, ready-to-paste campaign URL. */
export function buildCampaignUrl(
  slug: string,
  params: CampaignParams = {},
  opts: { alias?: boolean; origin?: string } = {},
): string {
  const base = `${opts.origin ?? SITE_URL}${opts.alias ? WCE_GO_ALIAS : WCE_GO_PATH}/${slug}`;
  const qs = new URLSearchParams();
  for (const k of CAMPAIGN_PARAMS) {
    const v = params[k]?.trim();
    if (v) qs.set(k, v);
  }
  if (params.cl?.trim()) qs.set("cl", params.cl.trim());
  const q = qs.toString();
  return q ? `${base}?${q}` : base;
}

/** Shared UTM / referral attribution capture.
 *  Captured once on landing, persisted in sessionStorage so the WCE page
 *  and the checkout both read the same values. */

export type WceAttribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referral_code: string | null;
  landing_path: string | null;
  referrer: string | null;
  user_agent: string | null;
};

export const WCE_ATTRIBUTION_KEY = "wce-attribution";

export const EMPTY_ATTRIBUTION: WceAttribution = {
  utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null,
  utm_term: null, referral_code: null, landing_path: null, referrer: null, user_agent: null,
};

/** Reads the stored attribution, or null when nothing has been captured yet. */
export function readAttribution(): WceAttribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(WCE_ATTRIBUTION_KEY);
    return raw ? { ...EMPTY_ATTRIBUTION, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

/** Captures UTM + `ref` params from the current URL, merging with anything stored. */
export function captureAttribution(): WceAttribution {
  if (typeof window === "undefined") return EMPTY_ATTRIBUTION;
  const stored = readAttribution();
  const params = new URLSearchParams(window.location.search);
  const pick = (k: string) => params.get(k) || null;

  const fresh: WceAttribution = {
    utm_source: pick("utm_source") ?? stored?.utm_source ?? null,
    utm_medium: pick("utm_medium") ?? stored?.utm_medium ?? null,
    utm_campaign: pick("utm_campaign") ?? stored?.utm_campaign ?? null,
    utm_content: pick("utm_content") ?? stored?.utm_content ?? null,
    utm_term: pick("utm_term") ?? stored?.utm_term ?? null,
    referral_code: pick("ref") ?? stored?.referral_code ?? null,
    landing_path: stored?.landing_path ?? window.location.pathname,
    referrer: stored?.referrer ?? (document.referrer || null),
    user_agent: navigator.userAgent,
  };

  try { sessionStorage.setItem(WCE_ATTRIBUTION_KEY, JSON.stringify(fresh)); } catch { /* ignore */ }
  return fresh;
}

/** The pathway a shopper picked on the WCE page, remembered for checkout. */
const PATHWAY_KEY = "wce-pathway";

export function rememberPathway(key: string) {
  try { sessionStorage.setItem(PATHWAY_KEY, key); } catch { /* ignore */ }
}

export function readPathway(): string | null {
  if (typeof window === "undefined") return null;
  try { return sessionStorage.getItem(PATHWAY_KEY); } catch { return null; }
}

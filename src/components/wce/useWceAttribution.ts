import { useEffect, useState } from "react";

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

const KEY = "wce-attribution";
const EMPTY: WceAttribution = {
  utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null,
  utm_term: null, referral_code: null, landing_path: null, referrer: null, user_agent: null,
};

function read(): WceAttribution | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

/** Captures UTM + referral params on first load and persists them for the session. */
export function useWceAttribution(): WceAttribution {
  const [attr, setAttr] = useState<WceAttribution>(EMPTY);

  useEffect(() => {
    const stored = read();
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

    try { sessionStorage.setItem(KEY, JSON.stringify(fresh)); } catch { /* ignore */ }
    setAttr(fresh);
  }, []);

  return attr;
}

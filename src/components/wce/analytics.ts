/** First-party analytics for the /wce-2026 page.
 *
 *  Privacy: the session id is a random value in sessionStorage, never linked to
 *  a lead or an identity. No IP address is ever sent. Recording is skipped when
 *  Do Not Track is on. Measurement is first-party and anonymous, so it runs
 *  without waiting for the cookie banner.
 *  Events are queued and flushed in batches so scrolling never fires requests.
 */
import { supabase } from "@/integrations/supabase/client";
import { readAttribution } from "@/lib/wce-attribution";


export type WceEventType =
  | "page_view"
  | "section_view"
  | "cta_click"
  | "speaker_open"
  | "flyer_share"
  | "faq_open"
  | "retreat_card_expand"
  | "form_start"
  | "form_submit"
  /** Fired by the /go/ campaign routes with the pathway and traffic source. */
  | "campaign_link_click";


const SESSION_KEY = "wce-analytics-session";
const SEEN_KEY = "wce-analytics-seen";

const FLUSH_MS = 2500;
const MAX_QUEUE = 30;

type Payload = {
  event_type: WceEventType;
  event_target?: string | null;
  path?: string | null;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  referral_code?: string | null;
  device_type?: string | null;
  meta?: Record<string, unknown> | null;
};

let queue: Payload[] = [];
let timer: number | null = null;

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

/** Random, per-tab identifier. Not tied to any person or lead. */
export function wceSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = randomId();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "unavailable";
  }
}

function doNotTrack(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { msDoNotTrack?: string };
  const win = window as Window & { doNotTrack?: string };
  const flag = nav.doNotTrack ?? win.doNotTrack ?? nav.msDoNotTrack;
  return flag === "1" || flag === "yes";
}

export function analyticsEnabled(): boolean {
  // Anonymous, first-party measurement: no cookie consent gate, Do Not Track honoured.
  return typeof window !== "undefined" && !doNotTrack();

}

function deviceType(): string {
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

/** Coarse, non-identifying context attached to every event.
 *  The time zone lets the server report a country when the network edge does
 *  not supply one. No IP address, no fingerprinting. */
function context(): Record<string, unknown> {
  let tz: string | null = null;
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? null; } catch { tz = null; }
  return {
    tz,
    lang: typeof navigator !== "undefined" ? navigator.language ?? null : null,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  };
}


/** Session-scoped dedupe keys, so section_view records once per session. */
function seen(key: string): boolean {
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    const set = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
    if (set.has(key)) return true;
    set.add(key);
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...set]));
    return false;
  } catch {
    return false;
  }
}

function flush(immediate = false) {
  if (timer) { window.clearTimeout(timer); timer = null; }
  if (!queue.length) return;
  const events = queue;
  queue = [];
  const body = { session_id: wceSessionId(), events };

  if (immediate && typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wce-track`;
      const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    } catch { /* fall through to invoke */ }
  }

  void supabase.functions.invoke("wce-track", { body }).catch(() => {
    /* measurement must never affect the visitor's journey */
  });
}

let listenersBound = false;
function bindFlushListeners() {
  if (listenersBound || typeof window === "undefined") return;
  listenersBound = true;
  const onHide = () => flush(true);
  window.addEventListener("pagehide", onHide);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") onHide();
  });
}

/**
 * Queue one event. `once` supplies a dedupe key scoped to the session.
 */
export function trackWceEvent(
  event_type: WceEventType,
  event_target?: string | null,
  meta?: Record<string, unknown> | null,
  options: { once?: string } = {},
) {
  if (!analyticsEnabled()) return;
  if (options.once && seen(options.once)) return;

  const attr = readAttribution();
  queue.push({
    event_type,
    event_target: event_target ?? null,
    path: window.location.pathname,
    referrer: attr?.referrer ?? (document.referrer || null),
    utm_source: attr?.utm_source ?? null,
    utm_medium: attr?.utm_medium ?? null,
    utm_campaign: attr?.utm_campaign ?? null,
    referral_code: attr?.referral_code ?? null,
    device_type: deviceType(),
    meta: { ...context(), ...(meta ?? {}) },
  });


  bindFlushListeners();
  if (queue.length >= MAX_QUEUE) { flush(); return; }
  if (!timer) timer = window.setTimeout(() => flush(), FLUSH_MS);
}

/** Major sections of the WCE page, in page order. Used for section reach. */
export const WCE_SECTIONS: { id: string; label: string }[] = [
  { id: "pathways", label: "Pathways" },
  { id: "speakers", label: "Speakers" },
  { id: "activities", label: "Activities" },
  { id: "itinerary", label: "Itinerary" },
  { id: "lifecraft", label: "LifeCraft" },
  { id: "retreat-detail", label: "Retreat Detail" },
  { id: "ceremony", label: "Ceremony" },
  { id: "apply", label: "Retreat Application" },
  { id: "faq", label: "FAQ" },
];

/**
 * Observes the page's major sections and records the first time each becomes
 * visible in this session. Throttled by IntersectionObserver, not scroll.
 */
export function observeWceSections(): () => void {
  if (typeof IntersectionObserver === "undefined" || !analyticsEnabled()) return () => {};
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        const section = WCE_SECTIONS.find((s) => s.id === id);
        if (!section) return;
        trackWceEvent("section_view", section.id, { section_label: section.label }, {
          once: `section:${section.id}`,
        });
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.25 },
  );
  WCE_SECTIONS.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) io.observe(el);
  });
  return () => io.disconnect();
}
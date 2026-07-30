/* =========================================================================
 *  ANALYTICS IDS — drop your own container / pixel IDs in here.
 *  Leave a value as an empty string to keep that tag disabled.
 * ========================================================================= */
export const GTM_CONTAINER_ID = ""; // e.g. "GTM-XXXXXXX"
export const META_PIXEL_ID = "";    // e.g. "1234567890123456"
/* ========================================================================= */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; callMethod?: (...a: unknown[]) => void };
    _fbq?: unknown;
  }
}

let initialised = false;

/** Injects the GTM container + Meta Pixel base code once, if IDs are configured. */
export function initTracking() {
  if (initialised || typeof window === "undefined") return;
  initialised = true;

  window.dataLayer = window.dataLayer || [];

  if (GTM_CONTAINER_ID) {
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`;
    document.head.appendChild(s);

    const noscript = document.createElement("noscript");
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`;
    iframe.height = "0";
    iframe.width = "0";
    iframe.style.display = "none";
    iframe.style.visibility = "hidden";
    noscript.appendChild(iframe);
    document.body.prepend(noscript);
  }

  if (META_PIXEL_ID) {
    /* eslint-disable */
    (function (f: any, b: Document, e: string, v: string) {
      if (f.fbq) return;
      const n: any = (f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true; t.src = v;
      b.head.appendChild(t);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq?.("init", META_PIXEL_ID);
    window.fbq?.("track", "PageView");
  }
}

/** Push an event to the GTM dataLayer (safe no-op before GTM loads). */
export function dataLayerPush(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}

/** Meta Pixel standard event. */
export function pixelTrack(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, payload);
}

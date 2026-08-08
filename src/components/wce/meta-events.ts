/* =========================================================================
 *  META MEASUREMENT — WCE 2026
 *  Drop the two values below in and the whole event map activates. Leave them
 *  as empty strings and every call is a silent no-op (no console noise, no
 *  network requests).
 *
 *    WCE_META_PIXEL_ID   — browser Pixel ID (Events Manager → Data sources)
 *    WCE_META_CAPI_TOKEN — Conversions API access token. Store it as the
 *                          Supabase secret WCE_META_CAPI_TOKEN instead of
 *                          pasting it here; this constant exists only so the
 *                          client knows whether server-side dedupe is live.
 * ========================================================================= */
export const WCE_META_PIXEL_ID = "";
export const WCE_META_CAPI_TOKEN_CONFIGURED = false;
/* ========================================================================= */

import { supabase } from "@/integrations/supabase/client";
import { dataLayerPush, pixelTrack } from "@/lib/tracking";

/** The full approved event map. Purchase is reserved for completed payment. */
export const WCE_META_EVENTS = {
  /** Symposium funnel */
  pageView: "PageView",
  symposiumView: "ViewContent",
  lead: "Lead",
  initiateCheckout: "InitiateCheckout",
  purchase: "Purchase",
  /** Retreat funnel — application NEVER fires Purchase. */
  retreatView: "ViewContent",
  retreatLead: "Lead",
  retreatApproved: "RetreatApproved", // custom event
  retreatInitiateCheckout: "InitiateCheckout",
  retreatPurchase: "Purchase",
} as const;

/** Shared Event ID so the browser event and the server (CAPI) event dedupe. */
export function newEventId(prefix = "wce"): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}_${Date.now().toString(36)}_${rnd}`;
}

export interface WceMetaOptions {
  /** Reuse an existing shared Event ID (e.g. one already stored on a lead). */
  eventId?: string;
  /** Extra dataLayer-only context. */
  dataLayer?: Record<string, unknown>;
}

/**
 * Fire one funnel event to the browser Pixel and, when a CAPI token is
 * configured, to the server with the SAME eventID so Meta deduplicates.
 * Returns the shared Event ID so callers can persist it alongside the record.
 */
export function wceMetaTrack(
  event: string,
  payload: Record<string, unknown> = {},
  options: WceMetaOptions = {},
): string {
  const eventId = options.eventId ?? newEventId();

  // GTM always gets the event; it is useful even before the Pixel is live.
  dataLayerPush(`wce_${event.toLowerCase()}`, { ...payload, event_id: eventId, ...options.dataLayer });

  // Browser Pixel (no-op until an ID is configured in tracking.ts / above).
  if (WCE_META_PIXEL_ID || typeof window !== "undefined") {
    pixelTrack(event, { ...payload, eventID: eventId });
  }

  // Server-side twin. Dormant until the CAPI token secret is supplied; the
  // edge function itself also skips cleanly when the secret is absent.
  if (WCE_META_CAPI_TOKEN_CONFIGURED) {
    void supabase.functions
      .invoke("wce-meta-capi", {
        body: {
          event_name: event,
          event_id: eventId,
          event_source_url: typeof window !== "undefined" ? window.location.href : null,
          custom_data: payload,
        },
      })
      .catch(() => {
        /* measurement must never break the user's journey */
      });
  }

  return eventId;
}

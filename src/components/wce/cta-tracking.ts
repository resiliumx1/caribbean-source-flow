/** One place for every WCE call-to-action click, so the dataLayer event name and
 *  payload shape stay identical wherever a CTA lives. Pathway purchase intent is
 *  tracked separately in PathwayCard (pathway_click / begin_checkout). */
import { dataLayerPush } from "@/lib/tracking";
import { trackWceEvent } from "./analytics";

export type WceCtaLocation =
  | "hero"
  | "speakers"
  | "speaker_flyer"
  | "retreat_section"
  | "investment_section"
  | "fortified_banner"
  | "final_band"
  | "sticky_bar";

/** Coarse intent bucket, so funnels can group CTAs across sections. */
export type WceCtaIntent = "reserve" | "apply" | "online" | "explore";

export function trackWceCta(
  intent: WceCtaIntent,
  location: WceCtaLocation,
  label: string,
  extra: Record<string, unknown> = {},
) {
  dataLayerPush("cta_click", {
    cta_intent: intent,
    cta_location: location,
    cta_label: label,
    ...extra,
  });
  // First-party record for the organiser analytics dashboard.
  trackWceEvent("cta_click", label, { cta_intent: intent, cta_location: location, ...extra });
}
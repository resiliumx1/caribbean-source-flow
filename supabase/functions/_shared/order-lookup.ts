import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  carrierTrackingUrl,
  computeEta,
  HANDLING_DAYS,
  resolveRegion,
} from "./delivery-windows.ts";

const QUERY_RE = /^[A-Za-z0-9\-]{4,40}$/;

export interface TrackingLookupResult {
  found: boolean;
  orderNumber?: string;
  status?: string | null;
  fulfillmentStatus?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  carrierTrackingUrl?: string | null;
  dispatchedAt?: string | null;
  destinationRegion?: string;
  etaWindow?: { earliest: string; latest: string; earliestLabel: string; latestLabel: string };
  message: string;
}

export async function lookupOrder(rawQuery: string): Promise<TrackingLookupResult> {
  const q = (rawQuery || "").trim();
  if (!QUERY_RE.test(q)) {
    return {
      found: false,
      message:
        "That doesn't look like a valid tracking or order number. Order numbers look like **MK-20260615-0420**. Try pasting it again — or tap 💬 CONNECT_WITH_TEAM and we'll look it up for you.",
    };
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data, error } = await supabase
    .from("orders")
    .select(
      "order_number, tracking_number, tracking_carrier, status, fulfillment_status, country, delivery_type, created_at, updated_at",
    )
    .or(`tracking_number.eq.${q},order_number.eq.${q}`)
    .maybeSingle();

  if (error) {
    console.error("Order lookup error:", error);
    return {
      found: false,
      message:
        "I couldn't reach the orders system just now. Please try again in a moment, or tap 💬 CONNECT_WITH_TEAM.",
    };
  }

  if (!data) {
    return {
      found: false,
      message:
        `I couldn't find an order matching **${q}**. Double-check the number (order numbers look like **MK-20260615-0420**), or tap 💬 CONNECT_WITH_TEAM so a human can locate it.`,
    };
  }

  const region = resolveRegion(data.country);
  const createdAt = new Date(data.created_at);
  const dispatched = data.updated_at && (
    data.status === "shipped" ||
    data.fulfillment_status === "shipped" ||
    data.fulfillment_status === "fulfilled" ||
    data.fulfillment_status === "in_transit"
  )
    ? new Date(data.updated_at)
    : null;

  const eta = computeEta(dispatched, createdAt, region);
  const trackUrl = carrierTrackingUrl(data.tracking_carrier, data.tracking_number);

  const statusLabel = (() => {
    if (data.fulfillment_status) return data.fulfillment_status.replace(/_/g, " ");
    if (data.status) return data.status.replace(/_/g, " ");
    return "processing";
  })();

  let message: string;
  if (dispatched && data.tracking_number) {
    message =
      `📦 Order **${data.order_number}** — ${statusLabel}.\n\n` +
      `Shipped via **${data.tracking_carrier || "carrier"}** on ${dispatched.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}.\n` +
      `Tracking number: **${data.tracking_number}**` +
      (trackUrl ? ` — [track on carrier site](${trackUrl})` : "") +
      `\n\nExpected delivery to ${region.label}: **${eta.earliestLabel} – ${eta.latestLabel}**.\n\n` +
      `(Window is an estimate; the carrier's site shows the precise date.)`;
  } else if (data.tracking_number) {
    message =
      `📦 Order **${data.order_number}** — ${statusLabel}.\n\n` +
      `Tracking number: **${data.tracking_number}**` +
      (trackUrl ? ` — [track on carrier site](${trackUrl})` : "") +
      `\n\nEstimated delivery to ${region.label}: **${eta.earliestLabel} – ${eta.latestLabel}**.`;
  } else {
    message =
      `📦 Order **${data.order_number}** — ${statusLabel}.\n\n` +
      `Our team is preparing your parcel (handling: ${HANDLING_DAYS.min}–${HANDLING_DAYS.max} business days). ` +
      `You'll receive a tracking number by email as soon as it ships.\n\n` +
      `Estimated delivery to ${region.label} once shipped: **${eta.earliestLabel} – ${eta.latestLabel}**.`;
  }

  return {
    found: true,
    orderNumber: data.order_number,
    status: data.status,
    fulfillmentStatus: data.fulfillment_status,
    trackingNumber: data.tracking_number,
    carrier: data.tracking_carrier,
    carrierTrackingUrl: trackUrl,
    dispatchedAt: dispatched?.toISOString() ?? null,
    destinationRegion: region.label,
    etaWindow: {
      earliest: eta.earliest,
      latest: eta.latest,
      earliestLabel: eta.earliestLabel,
      latestLabel: eta.latestLabel,
    },
    message,
  };
}
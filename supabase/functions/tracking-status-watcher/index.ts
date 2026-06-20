import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  admin,
  sendStatusUpdateEmail,
  statusLabel,
  unsubLink,
} from "../_shared/tracking-notify.ts";
import { carrierTrackingUrl } from "../_shared/delivery-windows.ts";

function changed(a: unknown, b: unknown): boolean {
  return (a ?? null) !== (b ?? null);
}

serve(async (_req) => {
  const sb = admin();
  const { data: subs, error } = await sb
    .from("tracking_subscriptions")
    .select(
      "id, order_id, channel, contact, last_known_status, last_known_fulfillment, last_known_tracking, unsubscribe_token",
    )
    .eq("active", true)
    .eq("verified", true)
    .eq("channel", "email")
    .limit(500);

  if (error) {
    console.error("watcher fetch subs error", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  }

  const sent: string[] = [];
  const errors: string[] = [];

  for (const sub of subs || []) {
    const { data: order } = await sb
      .from("orders")
      .select("order_number, status, fulfillment_status, tracking_number, tracking_carrier")
      .eq("id", sub.order_id)
      .maybeSingle();
    if (!order) continue;

    const statusChanged = changed(order.status, sub.last_known_status);
    const fulfillmentChanged = changed(order.fulfillment_status, sub.last_known_fulfillment);
    const trackingChanged = changed(order.tracking_number, sub.last_known_tracking);
    if (!statusChanged && !fulfillmentChanged && !trackingChanged) continue;

    const label = statusLabel(order.status, order.fulfillment_status);
    const parts: string[] = [];
    if (trackingChanged && order.tracking_number) {
      parts.push(
        `Tracking number: <strong>${order.tracking_number}</strong>${
          order.tracking_carrier ? ` (${order.tracking_carrier})` : ""
        }.`,
      );
    }
    if (fulfillmentChanged && order.fulfillment_status) {
      parts.push(`Fulfilment: <strong>${order.fulfillment_status}</strong>.`);
    }
    if (statusChanged && order.status) {
      parts.push(`Order status: <strong>${order.status}</strong>.`);
    }
    const details = parts.join(" ") || "Your order moved to a new step.";
    const trackUrl = carrierTrackingUrl(order.tracking_carrier, order.tracking_number);

    const ok = await sendStatusUpdateEmail({
      to: sub.contact,
      orderNumber: order.order_number,
      statusLabel: label,
      details,
      trackingUrl: trackUrl,
      unsubscribeUrl: unsubLink(sub.unsubscribe_token),
    });

    if (ok) {
      sent.push(sub.id);
      const deliveredish = ["delivered", "completed"].includes(
        String(order.fulfillment_status || order.status || "").toLowerCase(),
      );
      await sb
        .from("tracking_subscriptions")
        .update({
          last_known_status: order.status,
          last_known_fulfillment: order.fulfillment_status,
          last_known_tracking: order.tracking_number,
          last_notified_at: new Date().toISOString(),
          active: deliveredish ? false : true,
        })
        .eq("id", sub.id);
    } else {
      errors.push(sub.id);
    }
  }

  return new Response(
    JSON.stringify({ ok: true, checked: subs?.length ?? 0, notified: sent.length, errors: errors.length }),
    { headers: { "Content-Type": "application/json" } },
  );
});
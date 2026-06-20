import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { lookupOrder } from "../_shared/order-lookup.ts";
import {
  admin,
  EMAIL_RE,
  PHONE_RE,
  sendVerifyEmail,
  unsubLink,
  verifyLink,
} from "../_shared/tracking-notify.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 5;
const rate = new Map<string, { count: number; start: number }>();
function checkRate(key: string): boolean {
  const now = Date.now();
  const e = rate.get(key);
  if (!e || now - e.start > RATE_WINDOW_MS) {
    rate.set(key, { count: 1, start: now });
    return true;
  }
  if (e.count >= RATE_MAX) return false;
  e.count++;
  return true;
}

function jsonRes(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRate(ip)) {
      return jsonRes(429, { ok: false, message: "Too many requests — try again shortly." });
    }

    const body = await req.json().catch(() => null);
    const orderQuery = String(body?.orderQuery || "").trim();
    const channel = String(body?.channel || "email").toLowerCase();
    const contact = String(body?.contact || "").trim();

    if (!orderQuery) return jsonRes(400, { ok: false, message: "Missing order or tracking number." });
    if (channel !== "email" && channel !== "sms") {
      return jsonRes(400, { ok: false, message: "Channel must be email or sms." });
    }
    if (channel === "email" && !EMAIL_RE.test(contact)) {
      return jsonRes(400, { ok: false, message: "Please provide a valid email address." });
    }
    if (channel === "sms" && !PHONE_RE.test(contact)) {
      return jsonRes(400, { ok: false, message: "Phone must be in international format like +17585551234." });
    }
    if (channel === "sms") {
      return jsonRes(200, {
        ok: false,
        sms_unavailable: true,
        message:
          "SMS updates are coming soon. Reply with an email address and we'll notify you that way instead.",
      });
    }

    // Resolve order via shared lookup so we never expose addresses/PII.
    const result = await lookupOrder(orderQuery);
    if (!result.found || !result.orderNumber) {
      return jsonRes(404, { ok: false, message: result.message });
    }

    const sb = admin();
    // Get the real order_id (lookupOrder doesn't return UUID for safety).
    const { data: orderRow, error: orderErr } = await sb
      .from("orders")
      .select("id, order_number, status, fulfillment_status, tracking_number")
      .eq("order_number", result.orderNumber)
      .maybeSingle();
    if (orderErr || !orderRow) {
      return jsonRes(404, { ok: false, message: "Order not found." });
    }

    // Upsert subscription (on conflict, re-issue verify token if not yet verified).
    const { data: existing } = await sb
      .from("tracking_subscriptions")
      .select("id, verified, verify_token, unsubscribe_token, active")
      .eq("order_id", orderRow.id)
      .eq("channel", channel)
      .ilike("contact", contact)
      .maybeSingle();

    let subId: string;
    let verifyToken: string;
    let unsubToken: string;
    let alreadyVerified = false;

    if (existing) {
      subId = existing.id;
      verifyToken = existing.verify_token;
      unsubToken = existing.unsubscribe_token;
      alreadyVerified = existing.verified && existing.active;
      if (!existing.active) {
        await sb.from("tracking_subscriptions").update({ active: true }).eq("id", existing.id);
      }
    } else {
      const { data: ins, error: insErr } = await sb
        .from("tracking_subscriptions")
        .insert({
          order_id: orderRow.id,
          channel,
          contact,
          last_known_status: orderRow.status,
          last_known_fulfillment: orderRow.fulfillment_status,
          last_known_tracking: orderRow.tracking_number,
        })
        .select("id, verify_token, unsubscribe_token")
        .single();
      if (insErr || !ins) {
        console.error("subscribe insert error:", insErr);
        return jsonRes(500, { ok: false, message: "Couldn't save your subscription. Try again shortly." });
      }
      subId = ins.id;
      verifyToken = ins.verify_token;
      unsubToken = ins.unsubscribe_token;
    }

    if (alreadyVerified) {
      return jsonRes(200, {
        ok: true,
        already_verified: true,
        message: `You're already set up to receive updates on **${result.orderNumber}** at ${contact}.`,
      });
    }

    const sent = await sendVerifyEmail({
      to: contact,
      orderNumber: result.orderNumber,
      verifyUrl: verifyLink(verifyToken),
      unsubscribeUrl: unsubLink(unsubToken),
    });
    if (!sent) {
      return jsonRes(500, {
        ok: false,
        message: "We saved your request but couldn't send the confirmation email. Please try again or contact us.",
      });
    }

    return jsonRes(200, {
      ok: true,
      message: `Check **${contact}** — we just sent a one-click confirmation. After you tap it, we'll email you every time **${result.orderNumber}** changes status.`,
    });
  } catch (err) {
    console.error("tracking-subscribe error:", err);
    return jsonRes(500, { ok: false, message: "Something went wrong. Please try again." });
  }
});
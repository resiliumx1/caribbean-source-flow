import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

type SmsType =
  | "order_placed"
  | "order_paid"
  | "order_shipped"
  | "order_cancelled"
  | "admin_new_order";

interface RequestBody {
  orderId: string;
  smsType: SmsType;
  force?: boolean;
}

// Normalize a phone number to E.164. Returns null if it can't be coerced.
function toE164(raw: string | null | undefined, defaultCountry = "1"): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    return digits.length >= 8 ? `+${digits}` : null;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  // US/Canada 10-digit fallback
  if (digits.length === 10) return `+${defaultCountry}${digits}`;
  if (digits.length >= 11) return `+${digits}`;
  return null;
}

function fmtMoney(n: number | null | undefined): string {
  const v = typeof n === "number" ? n : 0;
  return v.toFixed(2);
}

async function sendTwilio(to: string, from: string, body: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
  if (!TWILIO_API_KEY) throw new Error("TWILIO_API_KEY missing");

  const res = await fetch(`${GATEWAY_URL}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TWILIO_API_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Twilio ${res.status}: ${(data && (data.message || data.error_message)) || JSON.stringify(data)}`,
    );
  }
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Auth: allow service-role (invoked from other edge functions) OR an admin user.
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization") || "";
    const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    let authorized = false;
    if (token && token === serviceRoleKey) {
      authorized = true;
    } else if (token && token.split(".").length === 3) {
      const authClient = createClient(SUPABASE_URL, serviceRoleKey);
      const { data: userData } = await authClient.auth.getUser(token);
      const uid = userData?.user?.id;
      if (uid) {
        const { data: profile } = await authClient
          .from("profiles").select("is_admin").eq("id", uid).maybeSingle();
        if (profile?.is_admin) authorized = true;
      }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { orderId, smsType, force } = (await req.json()) as RequestBody;
    if (!orderId || !smsType) {
      return new Response(JSON.stringify({ error: "orderId and smsType required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FROM = Deno.env.get("TWILIO_FROM_NUMBER");
    if (!FROM) {
      return new Response(JSON.stringify({ error: "TWILIO_FROM_NUMBER not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, serviceRoleKey);

    // Load order
    const { data: order, error: oErr } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, phone, total_usd, tracking_number, tracking_carrier, status")
      .eq("id", orderId)
      .maybeSingle();
    if (oErr) throw oErr;
    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check store-settings toggle for this sms type (unless force=true)
    if (!force) {
      const settingKey = `sms_notify_${smsType.replace("order_", "")}`; // e.g. sms_notify_placed
      const { data: setting } = await supabase
        .from("store_settings").select("value").eq("key", settingKey).maybeSingle();
      // default ON if missing
      const enabled = setting?.value === undefined || setting?.value === null
        ? true
        : setting.value === true || (setting.value as any)?.enabled === true;
      if (!enabled) {
        return new Response(JSON.stringify({ skipped: true, reason: "disabled" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const firstName = (order.customer_name || "").trim().split(/\s+/)[0] || "there";
    const orderNum = order.order_number || "";
    const total = fmtMoney(order.total_usd as number);

    let to: string | null = null;
    let body = "";

    if (smsType === "admin_new_order") {
      to = toE164(Deno.env.get("TWILIO_ADMIN_NUMBER"));
      body = `New MKRC order ${orderNum} — ${order.customer_name || "Customer"} — $${total}`;
    } else {
      to = toE164(order.phone);
      if (smsType === "order_placed") {
        body = `Hi ${firstName}, Mount Kailash here — we received your order ${orderNum} ($${total}). We'll text again when it ships. Reply STOP to opt out.`;
      } else if (smsType === "order_paid") {
        body = `Mount Kailash: payment confirmed for order ${orderNum}. Thank you, ${firstName}.`;
      } else if (smsType === "order_shipped") {
        const tracking = order.tracking_number
          ? ` Tracking: ${order.tracking_carrier || ""} ${order.tracking_number}`.trim()
          : "";
        body = `Mount Kailash: your order ${orderNum} has shipped.${tracking}`.trim();
      } else if (smsType === "order_cancelled") {
        body = `Mount Kailash: order ${orderNum} was cancelled. Reach us at info@mountkailashslu.com if you have questions.`;
      }
    }

    if (!to) {
      return new Response(JSON.stringify({ skipped: true, reason: "no phone" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!body) {
      return new Response(JSON.stringify({ error: "Unknown smsType" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await sendTwilio(to, FROM, body);
    return new Response(JSON.stringify({ success: true, sid: result?.sid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-sms error:", err);
    return new Response(JSON.stringify({ error: err?.message || "SMS failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
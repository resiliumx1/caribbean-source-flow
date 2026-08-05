import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BRAND_DARK = "#1a3a2e";
const BRAND_GOLD = "#b8893d";
const BRAND_CREAM = "#faf6ef";
const BRAND_TEXT = "#2b2b2b";
const BRAND_MUTED = "#6b6b6b";
const SITE_URL = "https://mountkailashslu.com";
const SUPPORT_EMAIL = "info@mountkailashslu.com";
const SUPPORT_PHONE = "+1 (758) 285-5195";

const FROM_CUSTOMER = "Mount Kailash <orders@mountkailashslu.com>";
const FROM_ADMIN = "MKRC Orders <orders@mountkailashslu.com>";
const FROM_FALLBACK = "Mount Kailash <onboarding@resend.dev>";
const ADMIN_TO = "info@mountkailashslu.com";
const ADMIN_CC = "blessedlove@mountkailashslu.com";

interface RequestBody {
  orderId: string;
  emailType: "order_placed" | "order_shipped" | "order_delivered" | "order_cancelled";
  fromFallback?: boolean;
  force?: boolean;
  cancellationReason?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let parsedBody: RequestBody | null = null;
  try {
    // --- Auth gate ----------------------------------------------------------
    // This function can be invoked in two legitimate ways:
    //   1. From another edge function via supabase.functions.invoke(...) — the
    //      caller is created with SUPABASE_SERVICE_ROLE_KEY, so the bearer
    //      token equals the service role key.
    //   2. From an authenticated admin in the dashboard (AdminOrders).
    // Anything else is rejected to stop spoofed "shipped/cancelled" emails.
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization") || "";
    const token = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    let authorized = false;
    if (token && serviceRoleKey && token === serviceRoleKey) {
      authorized = true;
    } else if (token && token.split(".").length === 3) {
      const authClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        serviceRoleKey
      );
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

    parsedBody = (await req.json()) as RequestBody;
    const { orderId, emailType, fromFallback, force, cancellationReason } = parsedBody;
    if (!orderId) throw new Error("orderId is required");
    if (!emailType) throw new Error("emailType is required");

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order, error: orderErr } = await supabase
      .from("orders").select("*").eq("id", orderId).single();
    if (orderErr || !order) throw new Error(orderErr?.message || "Order not found");

    // Skip test orders unless explicitly forced (e.g. admin "Resend confirmation").
    if (order.is_test && !force) {
      console.log(`Skipping email for test order ${order.order_number} (${orderId})`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "is_test" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: items, error: itemsErr } = await supabase
      .from("order_items").select("*").eq("order_id", orderId);
    if (itemsErr) throw itemsErr;

    const sendEmail = async (payload: Record<string, unknown>) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) {
        console.error("Resend API error:", res.status, text);
        throw new Error(`Resend ${res.status}: ${text}`);
      }
      return JSON.parse(text);
    };

    const customerFrom = fromFallback ? FROM_FALLBACK : FROM_CUSTOMER;
    const adminFrom = fromFallback ? FROM_FALLBACK : FROM_ADMIN;

    if (emailType === "order_placed") {
      // Digital-only orders (e.g. event tickets) have nothing to ship.
      let digitalOnly = false;
      try {
        const ids = [...new Set((items ?? []).map((i: any) => i.product_id))];
        if (ids.length) {
          const { data: prods } = await supabase
            .from("products").select("id, is_digital").in("id", ids);
          digitalOnly = !!prods?.length && prods.every((p: any) => p.is_digital);
        }
      } catch (e) {
        console.error("digital-only check failed:", e);
      }
      const customerResult = await sendEmail({
        from: customerFrom,
        to: [order.email],
        reply_to: SUPPORT_EMAIL,
        subject: `Order Confirmed - ${order.order_number} | Mount Kailash`,
        html: customerOrderPlacedHtml(order, items || [], digitalOnly),
      });

      let adminResult: any = null;
      try {
        adminResult = await sendEmail({
          from: adminFrom,
          to: [ADMIN_TO],
          cc: [ADMIN_CC],
          reply_to: order.email,
          subject: `🛒 New Order ${order.order_number} - $${Number(order.total_usd).toFixed(2)} - ${order.customer_name}`,
          html: adminOrderPlacedHtml(order, items || []),
        });
      } catch (e) {
        console.error("Admin email failed (customer email succeeded):", e);
      }

      return new Response(
        JSON.stringify({ success: true, customer: customerResult, admin: adminResult }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (emailType === "order_shipped") {
      const result = await sendEmail({
        from: customerFrom,
        to: [order.email],
        reply_to: SUPPORT_EMAIL,
        subject: `Your order is on the way! - ${order.order_number}`,
        html: customerOrderShippedHtml(order, items || []),
      });
      return new Response(
        JSON.stringify({ success: true, customer: result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (emailType === "order_delivered") {
      const result = await sendEmail({
        from: customerFrom,
        to: [order.email],
        reply_to: SUPPORT_EMAIL,
        subject: `Your order has been delivered - ${order.order_number}`,
        html: customerOrderDeliveredHtml(order, items || []),
      });
      return new Response(
        JSON.stringify({ success: true, customer: result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (emailType === "order_cancelled") {
      const reason = (cancellationReason || "").trim();
      const result = await sendEmail({
        from: customerFrom,
        to: [order.email],
        reply_to: SUPPORT_EMAIL,
        subject: `Your order has been cancelled - ${order.order_number}`,
        html: customerOrderCancelledHtml(order, items || [], reason),
      });
      // Notify admin too
      try {
        await sendEmail({
          from: adminFrom,
          to: [ADMIN_TO],
          cc: [ADMIN_CC],
          reply_to: order.email,
          subject: `❌ Order ${order.order_number} cancelled - ${order.customer_name}`,
          html: `<p>Order <strong>${esc(order.order_number)}</strong> was cancelled.</p><p><strong>Reason:</strong> ${esc(reason || "(no reason provided)")}</p>`,
        });
      } catch (e) {
        console.error("Admin cancel email failed:", e);
      }
      return new Response(
        JSON.stringify({ success: true, customer: result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown emailType: ${emailType}`);
  } catch (err: any) {
    console.error("send-order-emails error:", err);
    // Best-effort failure log so silent failures are visible to admins.
    try {
      const supabaseLog = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await supabaseLog.from("email_send_failures").insert({
        order_id: parsedBody?.orderId ?? null,
        email_type: parsedBody?.emailType ?? "unknown",
        recipient: null,
        error_message: String(err?.message || err),
      });
    } catch (logErr) {
      console.error("Failed to log email failure:", logErr);
    }
    return new Response(
      JSON.stringify({ error: err?.message || "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ---------- Template helpers ----------

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function fmtMoney(n: number): string {
  return `$${Number(n || 0).toFixed(2)}`;
}

function fmtDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
  } catch { return d; }
}

function addressBlock(o: any): string {
  const lines = [
    o.customer_name,
    o.address_line1,
    o.address_line2,
    [o.city, o.state_province, o.postal_code].filter(Boolean).join(", "),
    o.country,
    o.phone,
  ].filter(Boolean).map(esc);
  return lines.join("<br>");
}

function shell(inner: string, preheader = ""): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mount Kailash</title></head>
<body style="margin:0;padding:0;background:${BRAND_CREAM};font-family:Arial,Helvetica,sans-serif;color:${BRAND_TEXT};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND_CREAM};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #ece4d4;">
      <tr><td style="background:${BRAND_DARK};padding:28px 24px;text-align:center;">
        <div style="font-family:Georgia,'Times New Roman',serif;color:${BRAND_GOLD};font-size:13px;letter-spacing:3px;text-transform:uppercase;">Mount Kailash</div>
        <div style="font-family:Georgia,'Times New Roman',serif;color:#ffffff;font-size:22px;margin-top:6px;letter-spacing:1px;">Rejuvenation Centre</div>
      </td></tr>
      ${inner}
      <tr><td style="background:${BRAND_DARK};padding:22px 24px;color:#e6dec7;font-size:12px;line-height:1.6;text-align:center;">
        <div style="color:#ffffff;font-weight:bold;margin-bottom:6px;">Mount Kailash Rejuvenation Centre</div>
        <div>Marc, Bexon, Castries, Saint Lucia</div>
        <div style="margin-top:6px;">
          <a href="${SITE_URL}" style="color:${BRAND_GOLD};text-decoration:none;">mountkailashslu.com</a>
          &nbsp;·&nbsp; ${esc(SUPPORT_PHONE)}
          &nbsp;·&nbsp; <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_GOLD};text-decoration:none;">${SUPPORT_EMAIL}</a>
        </div>
        <div style="margin-top:12px;color:#a8a08e;font-size:11px;">Questions? Just reply to this email.</div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function itemsTable(items: any[]): string {
  const rows = items.map(i => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;">${esc(i.product_name)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;text-align:center;">${esc(i.quantity)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;text-align:right;">${fmtMoney(i.price_usd)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;text-align:right;">${fmtMoney(Number(i.price_usd) * Number(i.quantity))}</td>
    </tr>`).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
    <thead><tr style="background:${BRAND_CREAM};">
      <th align="left" style="padding:10px 8px;font-size:12px;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:1px;">Item</th>
      <th align="center" style="padding:10px 8px;font-size:12px;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:1px;">Qty</th>
      <th align="right" style="padding:10px 8px;font-size:12px;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:1px;">Price</th>
      <th align="right" style="padding:10px 8px;font-size:12px;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:1px;">Total</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function customerOrderPlacedHtml(order: any, items: any[]): string {
  const subtotal = items.reduce((s, i) => s + Number(i.price_usd) * Number(i.quantity), 0);
  const inner = `
    <tr><td style="padding:32px 28px 8px 28px;">
      <h1 style="margin:0 0 12px 0;font-family:Georgia,'Times New Roman',serif;color:${BRAND_DARK};font-size:26px;line-height:1.2;">
        Thank you, ${esc(order.customer_name)}!
      </h1>
      <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:${BRAND_TEXT};">
        Your order has been received and is being prepared with care.
      </p>
    </td></tr>
    <tr><td style="padding:16px 28px;">
      <div style="border:1px solid #ece4d4;border-radius:10px;padding:18px;background:#fffdf8;">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;margin-bottom:12px;">
          <div>
            <div style="font-size:11px;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:1.5px;">Order Number</div>
            <div style="font-size:18px;font-weight:bold;color:${BRAND_DARK};font-family:Georgia,serif;">${esc(order.order_number)}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11px;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:1.5px;">Order Date</div>
            <div style="font-size:14px;color:${BRAND_TEXT};">${esc(fmtDate(order.created_at))}</div>
          </div>
        </div>
        ${itemsTable(items)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
          <tr><td style="font-size:14px;color:${BRAND_MUTED};padding:4px 8px;">Subtotal</td><td align="right" style="font-size:14px;padding:4px 8px;">${fmtMoney(subtotal)}</td></tr>
          <tr><td style="font-size:14px;color:${BRAND_MUTED};padding:4px 8px;">Shipping</td><td align="right" style="font-size:14px;padding:4px 8px;color:${BRAND_DARK};font-weight:bold;">FREE</td></tr>
          <tr><td style="font-size:16px;font-weight:bold;color:${BRAND_DARK};padding:8px;border-top:2px solid ${BRAND_GOLD};">Total (USD)</td><td align="right" style="font-size:18px;font-weight:bold;color:${BRAND_DARK};padding:8px;border-top:2px solid ${BRAND_GOLD};">${fmtMoney(order.total_usd)}</td></tr>
        </table>
      </div>
    </td></tr>
    <tr><td style="padding:8px 28px;">
      <div style="font-size:11px;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Shipping To</div>
      <div style="font-size:14px;line-height:1.6;color:${BRAND_TEXT};">${addressBlock(order)}</div>
    </td></tr>
    <tr><td style="padding:20px 28px;">
      <div style="background:${BRAND_CREAM};border-left:3px solid ${BRAND_GOLD};padding:14px 16px;border-radius:4px;">
        <div style="font-weight:bold;color:${BRAND_DARK};margin-bottom:6px;font-family:Georgia,serif;">What's next?</div>
        <div style="font-size:14px;line-height:1.6;color:${BRAND_TEXT};">
          We'll send another email when your order ships with tracking details.<br>
          Expected delivery: <strong>3–5 business days</strong> for US, <strong>5–10 days</strong> international.
        </div>
      </div>
    </td></tr>
    <tr><td style="padding:0 28px 28px 28px;font-size:13px;color:${BRAND_MUTED};line-height:1.6;">
      Questions? Reply to this email or contact <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_DARK};">${SUPPORT_EMAIL}</a>.
    </td></tr>`;
  return shell(inner, `Your order ${order.order_number} is confirmed — thank you!`);
}

function adminOrderPlacedHtml(order: any, items: any[]): string {
  const itemsList = items.map(i =>
    `<li style="margin:4px 0;">${esc(i.product_name)} × ${esc(i.quantity)} — ${fmtMoney(Number(i.price_usd) * Number(i.quantity))}</li>`
  ).join("");
  const adminUrl = `${SITE_URL}/admin/orders`;
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;color:#222;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:8px;padding:24px;border:1px solid #ddd;">
    <h2 style="margin:0 0 16px 0;color:${BRAND_DARK};">🛒 New order received</h2>
    <table cellpadding="6" cellspacing="0" style="width:100%;font-size:14px;border-collapse:collapse;">
      <tr><td style="color:#666;width:140px;">Order</td><td><strong>${esc(order.order_number)}</strong></td></tr>
      <tr><td style="color:#666;">Date</td><td>${esc(fmtDate(order.created_at))}</td></tr>
      <tr><td style="color:#666;">Total</td><td><strong>${fmtMoney(order.total_usd)} USD</strong> (${esc(order.currency_used)})</td></tr>
      <tr><td style="color:#666;">Customer</td><td>${esc(order.customer_name)}</td></tr>
      <tr><td style="color:#666;">Email</td><td><a href="mailto:${esc(order.email)}">${esc(order.email)}</a></td></tr>
      <tr><td style="color:#666;">Phone</td><td>${esc(order.phone || "—")}</td></tr>
      <tr><td style="color:#666;vertical-align:top;">Ship to</td><td>${addressBlock(order)}</td></tr>
      <tr><td style="color:#666;">Delivery</td><td>${esc(order.delivery_type)}</td></tr>
      <tr><td style="color:#666;">PayPal Txn</td><td style="font-family:monospace;font-size:12px;">${esc(order.payment_transaction_id || "—")}</td></tr>
      <tr><td style="color:#666;">Payment</td><td>${esc(order.payment_method)} — ${esc(order.payment_status)}</td></tr>
    </table>
    <h3 style="margin:20px 0 8px 0;color:${BRAND_DARK};">Items</h3>
    <ul style="margin:0 0 16px 20px;padding:0;font-size:14px;">${itemsList}</ul>
    ${order.customer_notes ? `<h3 style="margin:20px 0 8px 0;color:${BRAND_DARK};">Customer notes</h3><div style="background:#fffbe6;border-left:3px solid ${BRAND_GOLD};padding:10px 14px;font-size:14px;">${esc(order.customer_notes)}</div>` : ""}
    <p style="margin-top:24px;"><a href="${adminUrl}" style="display:inline-block;background:${BRAND_DARK};color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:14px;">Open in admin →</a></p>
  </div></body></html>`;
}

function customerOrderShippedHtml(order: any, items: any[]): string {
  const carrier = (order.tracking_carrier || "").toUpperCase();
  const tracking = order.tracking_number;
  const trackingUrl = buildTrackingUrl(order.tracking_carrier, tracking);
  const itemsList = items.map(i =>
    `<li style="margin:6px 0;font-size:14px;">${esc(i.product_name)} × ${esc(i.quantity)}</li>`
  ).join("");
  const inner = `
    <tr><td style="padding:32px 28px 8px 28px;">
      <h1 style="margin:0 0 12px 0;font-family:Georgia,serif;color:${BRAND_DARK};font-size:26px;">
        Your order is on the way! 📦
      </h1>
      <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;">
        Good news, ${esc(order.customer_name)} — order <strong>${esc(order.order_number)}</strong> has shipped.
      </p>
    </td></tr>
    <tr><td style="padding:8px 28px 20px 28px;">
      <div style="border:1px solid #ece4d4;border-radius:10px;padding:18px;background:#fffdf8;">
        <div style="font-size:11px;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:1.5px;">Tracking</div>
        <div style="font-size:18px;font-weight:bold;color:${BRAND_DARK};font-family:Georgia,serif;margin:4px 0 2px 0;">${esc(tracking || "Pending")}</div>
        ${carrier ? `<div style="font-size:13px;color:${BRAND_MUTED};margin-bottom:14px;">Carrier: ${esc(carrier)}</div>` : ""}
        ${trackingUrl ? `<a href="${trackingUrl}" style="display:inline-block;background:${BRAND_DARK};color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:bold;">Track your package →</a>` : ""}
        <div style="margin-top:14px;font-size:13px;color:${BRAND_TEXT};">Expected delivery: <strong>3–5 business days</strong> (US) / <strong>5–10 days</strong> (international).</div>
      </div>
    </td></tr>
    <tr><td style="padding:0 28px 8px 28px;">
      <div style="font-size:11px;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Shipping To</div>
      <div style="font-size:14px;line-height:1.6;">${addressBlock(order)}</div>
    </td></tr>
    <tr><td style="padding:16px 28px 28px 28px;">
      <div style="font-size:11px;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">In this shipment</div>
      <ul style="margin:0;padding-left:20px;">${itemsList}</ul>
    </td></tr>`;
  return shell(inner, `Order ${order.order_number} has shipped`);
}

function buildTrackingUrl(carrier: string | null, tracking: string | null): string {
  if (!tracking) return "";
  const c = (carrier || "").toLowerCase();
  if (c === "usps") return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(tracking)}`;
  if (c === "ups") return `https://www.ups.com/track?tracknum=${encodeURIComponent(tracking)}`;
  if (c === "fedex") return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(tracking)}`;
  if (c === "dhl") return `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(tracking)}`;
  return "";
}

function customerOrderDeliveredHtml(order: any, items: any[]): string {
  const itemsList = items.map(i =>
    `<li style="margin:6px 0;font-size:14px;">${esc(i.product_name)} × ${esc(i.quantity)}</li>`
  ).join("");
  const inner = `
    <tr><td style="padding:32px 28px 8px 28px;">
      <h1 style="margin:0 0 12px 0;font-family:Georgia,serif;color:${BRAND_DARK};font-size:26px;">
        Your order has arrived 🌿
      </h1>
      <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;">
        Hello ${esc(order.customer_name)}, order <strong>${esc(order.order_number)}</strong> has been marked as delivered.
        We hope every item arrived in perfect condition.
      </p>
    </td></tr>
    <tr><td style="padding:8px 28px 20px 28px;">
      <div style="border:1px solid #ece4d4;border-radius:10px;padding:18px;background:#fffdf8;">
        <div style="font-size:11px;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">In this delivery</div>
        <ul style="margin:0;padding-left:20px;">${itemsList}</ul>
      </div>
    </td></tr>
    <tr><td style="padding:0 28px 24px 28px;">
      <div style="background:${BRAND_CREAM};border-left:3px solid ${BRAND_GOLD};padding:14px 16px;border-radius:4px;">
        <div style="font-weight:bold;color:${BRAND_DARK};margin-bottom:6px;font-family:Georgia,serif;">A small favour</div>
        <div style="font-size:14px;line-height:1.6;color:${BRAND_TEXT};">
          We'd love to hear how the feast is treating you. Reply to this email with a few words —
          your feedback helps other guests on the path to rejuvenation.
        </div>
      </div>
    </td></tr>
    <tr><td style="padding:0 28px 28px 28px;font-size:13px;color:${BRAND_MUTED};line-height:1.6;">
      Anything missing or damaged? Reply right away and we'll make it right.
    </td></tr>`;
  return shell(inner, `Order ${order.order_number} delivered`);
}

function customerOrderCancelledHtml(order: any, items: any[], reason: string): string {
  const itemsList = items.map(i =>
    `<li style="margin:6px 0;font-size:14px;">${esc(i.product_name)} × ${esc(i.quantity)}</li>`
  ).join("");
  const inner = `
    <tr><td style="padding:32px 28px 8px 28px;">
      <h1 style="margin:0 0 12px 0;font-family:Georgia,serif;color:${BRAND_DARK};font-size:26px;">
        Your order has been cancelled
      </h1>
      <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;">
        Hello ${esc(order.customer_name)}, we're writing to confirm that order
        <strong>${esc(order.order_number)}</strong> has been cancelled.
      </p>
    </td></tr>
    ${reason ? `
    <tr><td style="padding:8px 28px 4px 28px;">
      <div style="background:#fff4ec;border-left:3px solid #c8542b;padding:14px 16px;border-radius:4px;">
        <div style="font-weight:bold;color:#7a2f12;margin-bottom:6px;font-family:Georgia,serif;">Reason for cancellation</div>
        <div style="font-size:14px;line-height:1.6;color:${BRAND_TEXT};white-space:pre-wrap;">${esc(reason)}</div>
      </div>
    </td></tr>` : ""}
    <tr><td style="padding:16px 28px 8px 28px;">
      <div style="border:1px solid #ece4d4;border-radius:10px;padding:18px;background:#fffdf8;">
        <div style="font-size:11px;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Items in this order</div>
        <ul style="margin:0;padding-left:20px;">${itemsList}</ul>
      </div>
    </td></tr>
    <tr><td style="padding:16px 28px 4px 28px;">
      <div style="font-size:14px;line-height:1.6;color:${BRAND_TEXT};">
        If you were charged, any refund will be processed to your original payment method within
        5–10 business days. If you have questions, simply reply to this email or contact us at
        <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_DARK};">${SUPPORT_EMAIL}</a>.
      </div>
    </td></tr>
    <tr><td style="padding:0 28px 28px 28px;font-size:13px;color:${BRAND_MUTED};line-height:1.6;">
      We hope to serve you again soon.
    </td></tr>`;
  return shell(inner, `Order ${order.order_number} cancelled`);
}
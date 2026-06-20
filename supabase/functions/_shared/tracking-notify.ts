import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://mountkailashslu.com";
const SUPPORT_EMAIL = "info@mountkailashslu.com";
const FROM = "Mount Kailash <orders@mountkailashslu.com>";
const FROM_FALLBACK = "Mount Kailash <onboarding@resend.dev>";
const BRAND_DARK = "#1a3a2e";
const BRAND_GOLD = "#b8893d";
const BRAND_CREAM = "#faf6ef";

export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[a-zA-Z]{2,}$/;
export const PHONE_RE = /^\+[1-9]\d{6,14}$/;

export function projectRef(): string {
  const url = Deno.env.get("SUPABASE_URL") || "";
  const m = url.match(/^https:\/\/([^.]+)\.supabase\.co/);
  return m?.[1] ?? "";
}

export function verifyLink(token: string): string {
  const ref = projectRef();
  return `https://${ref}.supabase.co/functions/v1/tracking-verify?token=${token}`;
}
export function unsubLink(token: string): string {
  const ref = projectRef();
  return `https://${ref}.supabase.co/functions/v1/tracking-unsubscribe?token=${token}`;
}

export function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

async function sendResend(to: string, subject: string, html: string): Promise<boolean> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    console.warn("RESEND_API_KEY missing; skipping email send");
    return false;
  }
  for (const from of [FROM, FROM_FALLBACK]) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (res.ok) return true;
    console.error("Resend send failed", from, res.status, await res.text().catch(() => ""));
  }
  return false;
}

function shell(title: string, inner: string, unsubscribeUrl?: string): string {
  const unsub = unsubscribeUrl
    ? `<p style="font-size:12px;color:#777;margin-top:24px">Don't want these updates? <a href="${unsubscribeUrl}" style="color:${BRAND_GOLD}">Unsubscribe in one click</a>.</p>`
    : "";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#ffffff;font-family:Helvetica,Arial,sans-serif;color:#2b2b2b">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px">
      <div style="background:${BRAND_DARK};color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
        <div style="font-size:13px;letter-spacing:2px;color:${BRAND_GOLD};text-transform:uppercase">Mount Kailash</div>
        <h1 style="margin:6px 0 0;font-size:20px;font-weight:600">${title}</h1>
      </div>
      <div style="background:${BRAND_CREAM};padding:24px;border-radius:0 0 8px 8px;line-height:1.55;font-size:15px">
        ${inner}
        ${unsub}
        <p style="font-size:12px;color:#888;margin-top:20px">Questions? Email <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_GOLD}">${SUPPORT_EMAIL}</a> or visit <a href="${SITE_URL}" style="color:${BRAND_GOLD}">mountkailashslu.com</a>.</p>
      </div>
    </div>
  </body></html>`;
}

export async function sendVerifyEmail(opts: {
  to: string;
  orderNumber: string;
  verifyUrl: string;
  unsubscribeUrl: string;
}): Promise<boolean> {
  const html = shell(
    "Confirm your shipping updates",
    `<p>You asked us to email you whenever order <strong>${opts.orderNumber}</strong> changes status.</p>
     <p>Tap the button below to confirm — we won't send any updates until you do.</p>
     <p style="text-align:center;margin:28px 0">
       <a href="${opts.verifyUrl}" style="background:${BRAND_GOLD};color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;display:inline-block">Confirm my updates</a>
     </p>
     <p style="font-size:13px;color:#666">If you didn't request this, ignore this email or unsubscribe below.</p>`,
    opts.unsubscribeUrl,
  );
  return sendResend(opts.to, `Confirm shipping updates for order ${opts.orderNumber}`, html);
}

export async function sendStatusUpdateEmail(opts: {
  to: string;
  orderNumber: string;
  statusLabel: string;
  details: string;
  trackingUrl?: string | null;
  unsubscribeUrl: string;
}): Promise<boolean> {
  const cta = opts.trackingUrl
    ? `<p style="text-align:center;margin:24px 0">
         <a href="${opts.trackingUrl}" style="background:${BRAND_GOLD};color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;display:inline-block">Track on carrier site</a>
       </p>`
    : "";
  const html = shell(
    `Update on order ${opts.orderNumber}`,
    `<p>Status changed to <strong>${opts.statusLabel}</strong>.</p>
     <p>${opts.details}</p>
     ${cta}`,
    opts.unsubscribeUrl,
  );
  return sendResend(opts.to, `📦 ${opts.orderNumber} — ${opts.statusLabel}`, html);
}

export function statusLabel(status?: string | null, fulfillment?: string | null): string {
  const v = (fulfillment || status || "").toLowerCase();
  const map: Record<string, string> = {
    pending: "Order received",
    paid: "Payment received",
    processing: "Being prepared",
    fulfilled: "Dispatched",
    shipped: "Shipped",
    in_transit: "In transit",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };
  return map[v] || (v ? v.replace(/_/g, " ") : "Update");
}
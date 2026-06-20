import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { admin } from "../_shared/tracking-notify.ts";

const BRAND_DARK = "#1a3a2e";
const BRAND_GOLD = "#b8893d";
const BRAND_CREAM = "#faf6ef";

function page(title: string, body: string, status = 200): Response {
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
  <body style="margin:0;font-family:Helvetica,Arial,sans-serif;background:${BRAND_CREAM};color:#2b2b2b">
    <div style="max-width:520px;margin:60px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
      <div style="background:${BRAND_DARK};color:#fff;padding:24px">
        <div style="font-size:13px;letter-spacing:2px;color:${BRAND_GOLD};text-transform:uppercase">Mount Kailash</div>
        <h1 style="margin:6px 0 0;font-size:22px;font-weight:600">${title}</h1>
      </div>
      <div style="padding:28px;line-height:1.6;font-size:15px">${body}</div>
    </div>
  </body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  if (!/^[0-9a-f-]{36}$/i.test(token)) {
    return page("Invalid link", "<p>This unsubscribe link is missing or malformed.</p>", 400);
  }
  const sb = admin();
  const { data: sub } = await sb
    .from("tracking_subscriptions")
    .select("id, contact")
    .eq("unsubscribe_token", token)
    .maybeSingle();
  if (!sub) {
    return page("Already unsubscribed", "<p>You're not on this list — nothing more to do.</p>");
  }
  await sb.from("tracking_subscriptions").update({ active: false }).eq("id", sub.id);
  return page(
    "Unsubscribed ✓",
    `<p>We won't send any more shipment updates to <strong>${sub.contact}</strong> for this order.</p>`,
  );
});
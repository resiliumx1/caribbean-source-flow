/** Retreat application review pipeline — organiser/admin only.
 *
 *  Moves a wce_leads row through: new -> reviewing -> approved | declined.
 *  Approval is the ONLY thing that mints a private checkout token, so payment
 *  is impossible before a human review. Tokens are single-use and expire.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const MAIL_FROM = "Mount Kailash <orders@mountkailashslu.com>";
const SITE_URL = "https://mountkailashslu.com";

const ACTIONS = ["reviewing", "approve", "decline", "resend_link"] as const;
type Action = (typeof ACTIONS)[number];

function mintToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function approvalEmail(name: string | null, link: string, expiresAt: string, priceLabel: string) {
  const greeting = name ? `Dear ${name},` : "Dear applicant,";
  const expires = new Date(expiresAt).toUTCString();
  return `<!doctype html><html><body style="margin:0;background:#0B2114;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#F5EFE0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#123020;border:1px solid rgba(201,162,39,0.35);border-radius:8px">
      <tr><td style="padding:28px 28px 8px">
        <p style="margin:0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#C9A227">Caribbean Wellness Saint Lucia 2026</p>
        <h1 style="margin:8px 0 0;font-size:24px;font-weight:600;color:#F5EFE0">Your retreat application has been approved</h1>
      </td></tr>
      <tr><td style="padding:8px 28px 0;font-size:15px;line-height:1.6">
        <p style="margin:0 0 12px">${greeting}</p>
        <p style="margin:0 0 16px">Thank you for applying to the six-day Caribbean Wellness Fortification Retreat at Mount Kailash Rejuvenation Centre, 12&ndash;17 October 2026. Your application has been reviewed and approved by our team.</p>
        <p style="margin:0 0 16px">Your place is confirmed once payment of <strong>${priceLabel}</strong> is complete. The private link below is reserved for you.</p>
        <p style="margin:0 0 22px">
          <a href="${link}" style="display:inline-block;background:#C9A227;color:#0B2114;font-weight:700;text-decoration:none;padding:14px 22px;border-radius:4px">Complete your retreat payment</a>
        </p>
        <p style="margin:0 0 8px;font-size:13px;color:rgba(245,239,224,0.75)">This link is personal to you, can be used once, and expires on ${expires}. If it stops working, reply to this email and we will issue a new one.</p>
        <p style="margin:0;font-size:12px;color:rgba(245,239,224,0.55);word-break:break-all">${link}</p>
      </td></tr>
      <tr><td style="padding:22px 28px 26px;font-size:12px;color:rgba(245,239,224,0.55)">Mount Kailash Rejuvenation Centre &middot; Saint Lucia</td></tr>
    </table>
  </td></tr></table></body></html>`;
}

function declineEmail(name: string | null, reason: string | null) {
  const greeting = name ? `Dear ${name},` : "Dear applicant,";
  return `<!doctype html><html><body style="margin:0;background:#0B2114;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#F5EFE0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#123020;border:1px solid rgba(201,162,39,0.35);border-radius:8px">
      <tr><td style="padding:28px 28px 8px">
        <p style="margin:0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#C9A227">Caribbean Wellness Saint Lucia 2026</p>
        <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;color:#F5EFE0">About your retreat application</h1>
      </td></tr>
      <tr><td style="padding:8px 28px 0;font-size:15px;line-height:1.6">
        <p style="margin:0 0 12px">${greeting}</p>
        <p style="margin:0 0 16px">Thank you for your interest in the Caribbean Wellness Fortification Retreat. On this occasion we are not able to move your application forward.${reason ? ` ${reason}` : ""}</p>
        <p style="margin:0 0 16px">You remain very welcome at the Caribbean Wellness Symposium on 11 October 2026, in person or online.</p>
        <p style="margin:0"><a href="${SITE_URL}/wce-2026#pathways" style="color:#C9A227">View symposium options</a></p>
      </td></tr>
      <tr><td style="padding:22px 28px 26px;font-size:12px;color:rgba(245,239,224,0.55)">Mount Kailash Rejuvenation Centre &middot; Saint Lucia</td></tr>
    </table>
  </td></tr></table></body></html>`;
}

async function sendMail(to: string, subject: string, html: string) {
  if (!RESEND_KEY) return { sent: false, error: "No mail provider configured." };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: MAIL_FROM, to: [to], subject, html }),
  });
  if (!res.ok) return { sent: false, error: `Mail provider returned ${res.status}` };
  return { sent: true, error: null as string | null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: claims, error: claimErr } = await admin.auth.getClaims(authHeader.slice(7).trim());
    const userId = claims?.claims?.sub as string | undefined;
    if (claimErr || !userId) return json({ error: "Unauthorized" }, 401);

    // Organisers (wce_admin) and full admins may review. Nobody else.
    const { data: allowed } = await admin.rpc("has_wce_access", { _user_id: userId });
    if (allowed !== true) return json({ error: "Forbidden" }, 403);

    const body = (await req.json()) as { lead_id?: string; action?: Action; decline_reason?: string };
    const action = body.action as Action;
    if (!body.lead_id || !ACTIONS.includes(action)) return json({ error: "Invalid request" }, 400);

    const { data: lead, error: leadErr } = await admin
      .from("wce_leads")
      .select("id, full_name, email, application_status, checkout_token, paid_at")
      .eq("id", body.lead_id)
      .maybeSingle();
    if (leadErr || !lead) return json({ error: "Application not found" }, 404);
    if (lead.paid_at) return json({ error: "This application has already been paid." }, 409);

    const now = new Date();

    if (action === "reviewing") {
      await admin.from("wce_leads")
        .update({ application_status: "reviewing", reviewed_at: now.toISOString() })
        .eq("id", lead.id);
      return json({ ok: true, application_status: "reviewing" });
    }

    if (action === "decline") {
      const reason = (body.decline_reason ?? "").trim().slice(0, 500) || null;
      await admin.from("wce_leads").update({
        application_status: "declined",
        declined_at: now.toISOString(),
        reviewed_at: lead.application_status === "new" ? now.toISOString() : undefined,
        decline_reason: reason,
        // A declined applicant must never retain a payable link.
        checkout_token: null,
        checkout_token_expires_at: null,
      }).eq("id", lead.id);
      const mail = await sendMail(lead.email, "About your Caribbean Wellness Fortification Retreat application", declineEmail(lead.full_name, reason));
      return json({ ok: true, application_status: "declined", email_sent: mail.sent, email_error: mail.error });
    }

    /* approve | resend_link — both mint a fresh single-use token. */
    const { data: settings } = await admin
      .from("wce_settings")
      .select("retreat_checkout_expiry_days, retreat_product_id")
      .limit(1).maybeSingle();

    const days = Math.max(1, Number(settings?.retreat_checkout_expiry_days ?? 7));
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
    const token = mintToken();

    let priceLabel = "US$4,500";
    if (settings?.retreat_product_id) {
      const { data: product } = await admin
        .from("products").select("price_usd").eq("id", settings.retreat_product_id).maybeSingle();
      if (product?.price_usd != null) {
        priceLabel = `US$${Number(product.price_usd).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
      }
    }

    const { error: upErr } = await admin.from("wce_leads").update({
      application_status: "approved",
      approved_at: lead.application_status === "approved" ? undefined : now.toISOString(),
      reviewed_at: lead.application_status === "new" ? now.toISOString() : undefined,
      declined_at: null,
      decline_reason: null,
      checkout_token: token,
      checkout_token_expires_at: expiresAt,
      checkout_token_used_at: null,
      checkout_sent_at: now.toISOString(),
    }).eq("id", lead.id);
    if (upErr) return json({ error: upErr.message }, 500);

    const link = `${SITE_URL}/wce-2026/retreat-checkout/${token}`;
    const mail = await sendMail(
      lead.email,
      action === "resend_link"
        ? "Your Caribbean Wellness Fortification Retreat payment link"
        : "Your Caribbean Wellness Fortification Retreat application has been approved",
      approvalEmail(lead.full_name, link, expiresAt, priceLabel),
    );

    return json({
      ok: true,
      application_status: "approved",
      checkout_link: link,
      expires_at: expiresAt,
      email_sent: mail.sent,
      email_error: mail.error,
    });
  } catch (e) {
    console.error("wce-retreat-approve error", e);
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});

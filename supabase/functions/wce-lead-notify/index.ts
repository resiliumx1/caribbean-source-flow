import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BRAND_DARK = "#1a3a2e";
const BRAND_GOLD = "#b8893d";
const BRAND_CREAM = "#faf6ef";
const FROM = "MKRC Applications <orders@mountkailashslu.com>";
const FROM_FALLBACK = "Mount Kailash <onboarding@resend.dev>";
const ADMIN_TO = ["info@mountkailashslu.com"];
const ADMIN_CC = ["blessedlove@mountkailashslu.com"];

const PATHWAY_LABEL: Record<string, string> = {
  retreat: "Fortification Retreat",
  in_person: "Symposium — In Person",
  online: "Symposium — Online",
};

interface Lead {
  id: string;
  created_at: string;
  full_name: string | null;
  email: string | null;
  whatsapp: string | null;
  country: string | null;
  pathway_interest: string | null;
  reason: string | null;
  participation_notes: string | null;
  dietary_notes: string | null;
  preferred_contact: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referral_code: string | null;
  landing_path: string | null;
  consent_marketing: boolean | null;
}

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const row = (label: string, value: unknown) =>
  value === null || value === undefined || String(value).trim() === ""
    ? ""
    : `<tr><td style="padding:6px 12px 6px 0;color:#6b6b6b;font-size:13px;white-space:nowrap">${esc(label)}</td>
       <td style="padding:6px 0;color:#2b2b2b;font-size:14px">${esc(value)}</td></tr>`;

function leadTable(lead: Lead) {
  const when = new Date(lead.created_at).toLocaleString("en-US", {
    timeZone: "America/St_Lucia",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const attribution = [lead.utm_source, lead.utm_medium, lead.utm_campaign]
    .filter(Boolean)
    .join(" / ");
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 22px;padding:16px;background:${BRAND_CREAM};border-radius:10px">
    ${row("Name", lead.full_name)}
    ${row("Email", lead.email)}
    ${row("WhatsApp", lead.whatsapp)}
    ${row("Country", lead.country)}
    ${row("Interest", PATHWAY_LABEL[lead.pathway_interest ?? ""] ?? lead.pathway_interest)}
    ${row("Prefers", lead.preferred_contact)}
    ${row("Reason", lead.reason)}
    ${row("Participation", lead.participation_notes)}
    ${row("Dietary", lead.dietary_notes)}
    ${row("Referral code", lead.referral_code)}
    ${row("Came from", attribution || lead.landing_path)}
    ${row("Marketing consent", lead.consent_marketing ? "Yes" : "No")}
    ${row("Submitted", `${when} (Saint Lucia time)`)}
  </table>`;
}

function wrap(title: string, intro: string, body: string) {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f1ea;font-family:Helvetica,Arial,sans-serif">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden">
    <div style="background:${BRAND_DARK};padding:22px 24px">
      <p style="margin:0;color:${BRAND_GOLD};font-size:12px;letter-spacing:.14em;text-transform:uppercase">Caribbean Wellness Saint Lucia 2026</p>
      <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px">${esc(title)}</h1>
    </div>
    <div style="padding:24px">
      <p style="margin:0 0 18px;color:#2b2b2b;font-size:14px;line-height:1.6">${intro}</p>
      ${body}
      <p style="margin:18px 0 0;color:#6b6b6b;font-size:12px;line-height:1.6">
        Every application is also stored in the organiser dashboard at
        <a href="https://mountkailashslu.com/admin/wce" style="color:${BRAND_GOLD}">mountkailashslu.com/admin/wce</a>.
      </p>
    </div>
  </div></body></html>`;
}

async function sendEmail(subject: string, html: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const send = (from: string) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: ADMIN_TO, cc: ADMIN_CC, subject, html }),
    });

  let res = await send(FROM);
  if (!res.ok) {
    const first = await res.text();
    res = await send(FROM_FALLBACK);
    if (!res.ok) throw new Error(`Resend failed: ${first} | ${await res.text()}`);
  }
  return await res.json();
}

const LEAD_COLUMNS =
  "id, created_at, full_name, email, whatsapp, country, pathway_interest, reason, participation_notes, dietary_notes, preferred_contact, utm_source, utm_medium, utm_campaign, referral_code, landing_path, consent_marketing";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, serviceRoleKey);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "notify_lead");

    if (action === "notify_lead") {
      // Public: only accepts an id, reads the row server-side, and emails the
      // organisers. Never returns lead data to the caller.
      const leadId = String(body?.lead_id ?? "");
      if (!/^[0-9a-f-]{36}$/i.test(leadId)) return json({ error: "invalid lead_id" }, 400);

      const { data: lead, error } = await admin
        .from("wce_leads")
        .select(LEAD_COLUMNS)
        .eq("id", leadId)
        .maybeSingle();
      if (error || !lead) return json({ error: "lead not found" }, 404);

      const l = lead as Lead;
      const pathway = PATHWAY_LABEL[l.pathway_interest ?? ""] ?? "Application";
      await sendEmail(
        `New WCE 2026 application — ${l.full_name ?? "Applicant"} (${pathway})`,
        wrap(
          "New retreat application",
          "Someone has just applied through the Caribbean Wellness Saint Lucia 2026 page. Details below.",
          leadTable(l),
        ),
      );
      return json({ ok: true });
    }

    if (action === "backfill") {
      // Admin/service only: re-sends every stored application as one digest.
      const authHeader = req.headers.get("Authorization") || "";
      const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
      let authorized = token !== "" && token === serviceRoleKey;
      if (!authorized && token.split(".").length === 3) {
        const { data: userData } = await admin.auth.getUser(token);
        const uid = userData?.user?.id;
        if (uid) {
          const { data: isAdmin } = await admin.rpc("has_role", { _user_id: uid, _role: "admin" });
          const { data: isWce } = await admin.rpc("has_role", { _user_id: uid, _role: "wce_admin" });
          authorized = Boolean(isAdmin || isWce);
        }
      }
      if (!authorized) return json({ error: "unauthorized" }, 403);

      const { data, error } = await admin
        .from("wce_leads")
        .select(LEAD_COLUMNS)
        .order("created_at", { ascending: false });
      if (error) return json({ error: error.message }, 500);

      const leads = (data ?? []) as Lead[];
      if (leads.length === 0) return json({ ok: true, count: 0 });

      await sendEmail(
        `WCE 2026 — all ${leads.length} applications received to date`,
        wrap(
          `All applications to date (${leads.length})`,
          "This is a complete record of every application submitted through the Caribbean Wellness Saint Lucia 2026 page, newest first. Email alerts are now sent automatically for each new application.",
          leads.map(leadTable).join(""),
        ),
      );
      return json({ ok: true, count: leads.length });
    }

    return json({ error: "unknown action" }, 400);
  } catch (e) {
    console.error("wce-lead-notify error", e);
    return json({ error: e instanceof Error ? e.message : "unexpected error" }, 500);
  }
});

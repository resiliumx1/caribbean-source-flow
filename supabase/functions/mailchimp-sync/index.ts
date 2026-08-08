/** MAILCHIMP SYNC — server-side only.
 *
 *  The API key lives in the MAILCHIMP_API_KEY secret and never reaches the
 *  browser. Audience ID and server prefix are read from wce_settings so they
 *  can be changed without a deploy.
 *
 *  CONSENT IS ABSOLUTE: a lead with consent_marketing = false is never sent to
 *  Mailchimp in any form — not subscribed, not unsubscribed, not transactional.
 *  Transactional mail (application decisions, order confirmations) is sent by
 *  our own system via Resend and never routed through Mailchimp.
 */
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.224.0/encoding/hex.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MERGE_TAGS = [
  "FNAME", "LNAME", "COUNTRY", "WHATSAPP", "PATHWAY",
  "REFCODE", "UTMSOURCE", "UTMMEDIUM", "UTMCAMP", "UTMCONTENT",
] as const;

const PATHWAY_TAG: Record<string, string> = {
  in_person: "Symposium-InPerson",
  online: "Symposium-Online",
  retreat: "Retreat-Applicant",
};

const PATHWAY_LABEL: Record<string, string> = {
  in_person: "Symposium In Person",
  online: "Symposium Online",
  retreat: "Retreat Applicant",
};

/** Mailchimp addresses members by the MD5 of the lowercased email. */
function subscriberHash(email: string): string {
  return encodeHex(crypto.subtle.digestSync("MD5", new TextEncoder().encode(email.trim().toLowerCase())));
}

/** Everything after the first space becomes the last name. */
function splitName(full: string | null): { first: string; last: string } {
  const parts = (full ?? "").trim().replace(/\s+/g, " ");
  if (!parts) return { first: "", last: "" };
  const i = parts.indexOf(" ");
  return i === -1 ? { first: parts, last: "" } : { first: parts.slice(0, i), last: parts.slice(i + 1) };
}

interface Lead {
  id: string;
  full_name: string | null;
  email: string | null;
  whatsapp: string | null;
  country: string | null;
  pathway_interest: string | null;
  referral_code: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  consent_marketing: boolean;
}

interface SyncOutcome {
  ok: boolean;
  status: string;
  accepted: string[];
  rejected: string[];
  error: string | null;
}

/** Pull the merge-field tags Mailchimp complained about out of its error body. */
function rejectedFieldsFrom(body: string): string[] {
  const found = new Set<string>();
  for (const tag of MERGE_TAGS) {
    if (new RegExp(`\\b${tag}\\b`).test(body)) found.add(tag);
  }
  return Array.from(found);
}

function isMergeFieldError(status: number, body: string): boolean {
  const b = body.toLowerCase();
  return status === 400 && (b.includes("merge") || b.includes("required field"));
}

/** Which of our merge tags actually exist in the audience.
 *  Mailchimp silently discards unknown tags rather than always erroring, so we
 *  check first and report precisely what the audience is still missing. */
async function audienceMergeTags(prefix: string, key: string, audience: string): Promise<string[] | null> {
  const res = await mcFetch(prefix, key, `/lists/${audience}/merge-fields?count=200`, { method: "GET" });
  if (res.status >= 400) {
    console.error(`mailchimp-sync: could not read merge fields [${res.status}]: ${res.body}`);
    return null;
  }
  try {
    const parsed = JSON.parse(res.body) as { merge_fields?: { tag?: string }[] };
    return (parsed.merge_fields ?? []).map((f) => String(f.tag ?? "").toUpperCase());
  } catch {
    return null;
  }
}

async function mcFetch(
  prefix: string,
  key: string,
  path: string,
  init: { method: string; body?: unknown },
): Promise<{ status: number; body: string }> {
  const res = await fetch(`https://${prefix}.api.mailchimp.com/3.0${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  return { status: res.status, body: await res.text() };
}

/**
 * Upsert one consented person into the audience.
 * `extraTags` lets the purchase path add the tier that was bought.
 */
async function syncPerson(
  admin: SupabaseClient,
  lead: Lead,
  extraTags: string[] = [],
): Promise<SyncOutcome> {
  const key = Deno.env.get("MAILCHIMP_API_KEY") ?? "";
  if (!key) {
    console.log("mailchimp-sync: MAILCHIMP_API_KEY absent — skipping silently.");
    return { ok: true, status: "skipped_not_configured", accepted: [], rejected: [], error: null };
  }

  // === THE CONSENT GATE — no consent, no Mailchimp call of any kind. ===
  if (!lead.consent_marketing) {
    console.log(`mailchimp-sync: lead ${lead.id} has no marketing consent — no Mailchimp request made.`);
    return { ok: true, status: "skipped_no_consent", accepted: [], rejected: [], error: null };
  }

  const email = (lead.email ?? "").trim().toLowerCase();
  if (!email) return { ok: false, status: "failed", accepted: [], rejected: [], error: "Lead has no email address." };

  const { data: settings } = await admin
    .from("wce_settings")
    .select("mailchimp_audience_id, mailchimp_server_prefix")
    .limit(1)
    .maybeSingle();

  const audience = (settings?.mailchimp_audience_id ?? "").trim();
  const prefix = (settings?.mailchimp_server_prefix ?? "").trim();
  if (!audience || !prefix) {
    console.log("mailchimp-sync: audience id / server prefix not configured in wce_settings — skipping.");
    return { ok: true, status: "skipped_not_configured", accepted: [], rejected: [], error: null };
  }

  const { first, last } = splitName(lead.full_name);
  const pathwayKey = lead.pathway_interest ?? "";
  const fullMerge: Record<string, string> = {
    FNAME: first,
    LNAME: last,
    COUNTRY: lead.country ?? "",
    WHATSAPP: lead.whatsapp ?? "",
    PATHWAY: PATHWAY_LABEL[pathwayKey] ?? pathwayKey,
    REFCODE: (lead.referral_code ?? "").toUpperCase(),
    UTMSOURCE: lead.utm_source ?? "",
    UTMMEDIUM: lead.utm_medium ?? "",
    UTMCAMP: lead.utm_campaign ?? "",
    UTMCONTENT: lead.utm_content ?? "",
  };

  const tags = ["WCE2026"];
  if (PATHWAY_TAG[pathwayKey]) tags.push(PATHWAY_TAG[pathwayKey]);
  if (lead.referral_code?.trim()) tags.push(`Referral-${lead.referral_code.trim().toUpperCase()}`);
  for (const t of extraTags) if (t && !tags.includes(t)) tags.push(t);

  const hash = subscriberHash(email);
  const path = `/lists/${audience}/members/${hash}`;

  /* Trim the payload to the fields the audience really has. Anything missing is
     reported so the organiser knows exactly what to create in Mailchimp. */
  let sendMerge = fullMerge;
  let missing: string[] = [];
  const existing = await audienceMergeTags(prefix, key, audience);
  if (existing) {
    missing = MERGE_TAGS.filter((t) => !existing.includes(t));
    if (missing.length) {
      sendMerge = Object.fromEntries(
        Object.entries(fullMerge).filter(([t]) => existing.includes(t)),
      ) as Record<string, string>;
      console.log(`mailchimp-sync: audience is missing merge fields ${missing.join(", ")} — not sending those.`);
    }
  }

  const put = (merge: Record<string, string>, withStatus: boolean) =>
    mcFetch(prefix, key, path, {
      method: "PUT", // PUT upserts, so a second submission updates rather than failing
      body: {
        email_address: email,
        status_if_new: "subscribed", // single opt-in, per client instruction
        ...(withStatus ? { status: "subscribed" } : {}),
        merge_fields: merge,
        tags,
      },
    });

  let accepted = Object.keys(sendMerge);
  let rejected: string[] = [...missing];
  let res = await put(sendMerge, true);

  // An already-unsubscribed member cannot be forced back by the API.
  if (res.status >= 400 && res.body.toLowerCase().includes("compliance state")) {
    res = await put(sendMerge, false);
  }

  // Retry once with email + names only when a merge field is rejected.
  if (isMergeFieldError(res.status, res.body)) {
    const errored = rejectedFieldsFrom(res.body);
    rejected = Array.from(
      new Set([...missing, ...(errored.length ? errored : MERGE_TAGS.filter((t) => t !== "FNAME" && t !== "LNAME"))]),
    );
    console.error(
      `mailchimp-sync: merge fields rejected for lead ${lead.id}: ${rejected.join(", ")} — retrying with FNAME/LNAME only. Mailchimp said: ${res.body}`,
    );
    const minimal = { FNAME: first, LNAME: last };
    res = await put(minimal, true);
    if (res.status >= 400 && res.body.toLowerCase().includes("compliance state")) {
      res = await put(minimal, false);
    }
    accepted = ["FNAME", "LNAME"];
  }

  if (res.status >= 400) {
    console.error(`mailchimp-sync: lead ${lead.id} failed [${res.status}]: ${res.body}`);
    return { ok: false, status: "failed", accepted: [], rejected, error: `[${res.status}] ${res.body}`.slice(0, 900) };
  }

  // Tags on PUT only apply to new members, so set them explicitly too.
  const tagRes = await mcFetch(prefix, key, `${path}/tags`, {
    method: "POST",
    body: { tags: tags.map((name) => ({ name, status: "active" })) },
  });
  if (tagRes.status >= 400) {
    console.error(`mailchimp-sync: tagging failed for lead ${lead.id} [${tagRes.status}]: ${tagRes.body}`);
  }

  return {
    ok: true,
    status: rejected.length ? "synced_partial" : "synced",
    accepted,
    rejected,
    error: rejected.length ? `Merge fields missing in audience: ${rejected.join(", ")}` : null,
  };
}

/** Record the outcome on the lead so the admin table can show it. */
async function recordOutcome(admin: SupabaseClient, leadId: string, out: SyncOutcome) {
  await admin
    .from("wce_leads")
    .update({
      mailchimp_status: out.status,
      mailchimp_error: out.error,
      mailchimp_synced_at: out.status.startsWith("synced") ? new Date().toISOString() : null,
    })
    .eq("id", leadId);
}

const LEAD_COLS =
  "id, full_name, email, whatsapp, country, pathway_interest, referral_code, utm_source, utm_medium, utm_campaign, utm_content, consent_marketing";

async function syncLeadById(admin: SupabaseClient, leadId: string, extraTags: string[] = []) {
  const { data: lead } = await admin.from("wce_leads").select(LEAD_COLS).eq("id", leadId).maybeSingle();
  if (!lead) return { ok: false, error: "Lead not found." };
  const out = await syncPerson(admin, lead as Lead, extraTags);
  await recordOutcome(admin, lead.id as string, out);
  return { ok: out.ok, status: out.status, accepted: out.accepted, rejected: out.rejected, error: out.error };
}

/** Organiser or admin, for the retry actions. */
async function requireWceAccess(admin: SupabaseClient, req: Request) {
  const header = req.headers.get("Authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new Error("Not authenticated.");
  const { data: userRes } = await admin.auth.getUser(token);
  const user = userRes?.user;
  if (!user) throw new Error("Not authenticated.");
  const { data: allowed } = await admin.rpc("has_wce_access", { _user_id: user.id });
  if (!allowed) throw new Error("Organiser access required.");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const payload = (await req.json().catch(() => ({}))) as {
      action?: string;
      lead_id?: string;
      order_id?: string;
      email?: string;
      tier_tag?: string;
    };
    const action = payload.action ?? "sync_lead";

    if (action === "sync_lead" || action === "retry") {
      const leadId = (payload.lead_id ?? "").trim();
      if (!UUID_RE.test(leadId)) return json({ error: "A valid lead id is required." }, 400);
      if (action === "retry") await requireWceAccess(admin, req);
      return json(await syncLeadById(admin, leadId));
    }

    if (action === "retry_failed") {
      await requireWceAccess(admin, req);
      const { data: rows } = await admin
        .from("wce_leads")
        .select("id")
        .eq("consent_marketing", true)
        .in("mailchimp_status", ["failed", "synced_partial"]);
      const results = [] as { lead_id: string; status?: string; error?: string | null }[];
      for (const row of rows ?? []) {
        const r = await syncLeadById(admin, row.id as string);
        results.push({ lead_id: row.id as string, status: r.status, error: r.error });
      }
      return json({ ok: true, retried: results.length, results });
    }

    /* Symposium ticket purchase. Consent still governs: we only sync a buyer
       who already granted marketing consent on their WCE lead record. */
    if (action === "purchase") {
      const email = (payload.email ?? "").trim().toLowerCase();
      if (!email) return json({ error: "Email is required." }, 400);
      const { data: lead } = await admin
        .from("wce_leads")
        .select(LEAD_COLS)
        .ilike("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!lead) {
        console.log(`mailchimp-sync: purchase by ${email} has no consented WCE lead record — skipping.`);
        return json({ ok: true, status: "skipped_no_consent_record" });
      }
      const out = await syncPerson(admin, lead as Lead, payload.tier_tag ? [payload.tier_tag] : []);
      await recordOutcome(admin, lead.id as string, out);
      return json({ ok: out.ok, status: out.status, accepted: out.accepted, rejected: out.rejected, error: out.error });
    }

    return json({ error: "Unknown action." }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mailchimp sync failed.";
    console.error("mailchimp-sync error:", message);
    return json({ error: message }, 400);
  }
});

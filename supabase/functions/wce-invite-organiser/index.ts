/** Invite, resend or revoke a WCE 2026 organiser.
 *
 *  Only a FULL store admin (profiles.is_admin) may call this. A wce_admin is
 *  explicitly refused — organisers can never invite anyone. Because the function
 *  can reveal whether an address already has an account, the full-admin check
 *  happens before any lookup, and non-admins get an identical 403 in every case.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Invitation links stay valid for 12 hours; after that a resend is required. */
const INVITE_TTL_HOURS = 12;

const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const MAIL_FROM = "Mount Kailash <orders@mountkailashslu.com>";

/** Deliver the organiser link through Resend.
 *
 *  The built-in auth mailer has a low hourly cap shared with every password
 *  reset on the site, so a few invitations in a row fail with
 *  "email rate limit exceeded". Generating the link and sending it ourselves
 *  keeps invitations working and lets us brand the message.
 */
async function sendInviteEmail(to: string, link: string, name: string | null, existing: boolean) {
  if (!RESEND_KEY) return { sent: false, error: "No mail provider configured." };
  const greeting = name ? `Hello ${name},` : "Hello,";
  const intro = existing
    ? "Your existing Mount Kailash account has been given organiser access to the Caribbean Wellness Experience 2026 console. Use the button below to set a password and sign in."
    : "You have been invited to help run the Caribbean Wellness Experience 2026. Use the button below to choose a password and open the organiser console.";
  const html = `<!doctype html><html><body style="margin:0;background:#0B2114;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#F5EFE0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#123020;border:1px solid rgba(201,162,39,0.35);border-radius:8px">
      <tr><td style="padding:28px 28px 8px">
        <p style="margin:0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#C9A227">Caribbean Wellness Experience</p>
        <h1 style="margin:8px 0 0;font-size:24px;font-weight:600;color:#F5EFE0">Organiser access</h1>
      </td></tr>
      <tr><td style="padding:8px 28px 0;font-size:15px;line-height:1.6">
        <p style="margin:0 0 12px">${greeting}</p>
        <p style="margin:0 0 20px">${intro}</p>
        <p style="margin:0 0 22px">
          <a href="${link}" style="display:inline-block;background:#C9A227;color:#0B2114;font-weight:700;text-decoration:none;padding:14px 22px;border-radius:4px">Set your password</a>
        </p>
        <p style="margin:0 0 8px;font-size:13px;color:rgba(245,239,224,0.75)">This link can be used once and expires in ${INVITE_TTL_HOURS} hours. If it stops working, ask a site administrator to resend your invitation.</p>
        <p style="margin:0;font-size:12px;color:rgba(245,239,224,0.55);word-break:break-all">${link}</p>
      </td></tr>
      <tr><td style="padding:22px 28px 26px;font-size:12px;color:rgba(245,239,224,0.55)">Mount Kailash Rejuvenation Centre · Saint Lucia</td></tr>
    </table>
  </td></tr></table></body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [to],
      subject: "Your Caribbean Wellness Experience 2026 organiser access",
      html,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    console.error(`Resend invite failed [${res.status}]: ${detail}`);
    return { sent: false, error: `Mail provider error (${res.status}): ${detail}` };
  }
  return { sent: true, error: null as string | null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const svc = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // ---- 1. Authenticate the caller -----------------------------------------
  const header = req.headers.get("Authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) return json({ error: "Not authenticated." }, 401);

  const { data: userRes, error: authErr } = await svc.auth.getUser(token);
  const caller = userRes?.user;
  if (authErr || !caller) return json({ error: "Not authenticated." }, 401);

  // ---- 2. Require FULL admin, never wce_admin -----------------------------
  const { data: profile } = await svc
    .from("profiles").select("is_admin").eq("id", caller.id).maybeSingle();
  if (!profile?.is_admin) {
    // Deliberately identical for wce_admins and ordinary users: no probing.
    return json({ error: "Full administrator access is required." }, 403);
  }

  // ---- 3. Parse and validate input ---------------------------------------
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const action = String(body.action ?? "invite");
  const email = String(body.email ?? "").trim().toLowerCase();
  const displayName = body.display_name ? String(body.display_name).trim().slice(0, 120) : null;
  const redirectTo = String(body.redirect_to ?? "").trim();

  if (!["invite", "resend", "revoke"].includes(action)) {
    return json({ error: "Unknown action." }, 400);
  }
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ error: "Enter a valid email address." }, 400);
  }
  if (redirectTo && !/^https?:\/\//.test(redirectTo)) {
    return json({ error: "Invalid redirect URL." }, 400);
  }

  try {
    // ---- REVOKE ----------------------------------------------------------
    if (action === "revoke") {
      const existing = await findUserByEmail(svc, email);
      if (existing) {
        await svc.from("user_roles").delete()
          .eq("user_id", existing.id).eq("role", "wce_admin");
      }
      await svc.from("wce_organiser_invites")
        .update({ status: "revoked", accepted_at: null, expires_at: null })
        .eq("email", email);
      return json({ ok: true, action: "revoke", email });
    }

    // ---- INVITE / RESEND -------------------------------------------------
    // Read the current record first: a resend must reuse its display name and
    // bump its counters rather than silently create a brand-new invitation.
    const { data: prior } = await svc.from("wce_organiser_invites")
      .select("id, display_name, resend_count").eq("email", email).maybeSingle();
    if (action === "resend" && !prior) {
      return json({ error: "There is no invitation for that address to resend." }, 404);
    }

    const existing = await findUserByEmail(svc, email);
    let userId = existing?.id ?? null;
    let alreadyExisted = Boolean(existing);
    let emailSent = false;
    let mailError: string | null = null;
    const name = displayName ?? (prior?.display_name as string | null) ?? null;

    if (!existing) {
      // Create the account without sending anything, then generate the link and
      // deliver it ourselves — the built-in invite mailer is rate limited.
      const { data: created, error: createErr } = await svc.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: name ? { full_name: name } : undefined,
      });
      if (createErr) {
        // Race: created between our lookup and this call.
        const retry = await findUserByEmail(svc, email);
        if (!retry) return json({ error: createErr.message }, 400);
        userId = retry.id;
        alreadyExisted = true;
      } else {
        userId = created.user?.id ?? null;
      }
    }

    if (!userId) return json({ error: "Could not resolve the invited account." }, 500);

    // One channel for both cases: a recovery link lets them set a password and
    // land on the accept screen. generateLink does not send an email itself.
    const { data: linkData, error: linkErr } = await svc.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: redirectTo || undefined },
    });
    if (linkErr) {
      mailError = linkErr.message;
    } else {
      const link = linkData?.properties?.action_link;
      if (link) {
        const out = await sendInviteEmail(email, link, name, alreadyExisted);
        emailSent = out.sent;
        mailError = out.error;
      } else {
        mailError = "Could not generate the invitation link.";
      }
    }

    // Grant the narrow organiser role.
    const { error: roleErr } = await svc.from("user_roles")
      .upsert({ user_id: userId, role: "wce_admin" }, { onConflict: "user_id,role" });
    if (roleErr) return json({ error: roleErr.message }, 400);

    // Record / refresh the invite. Existing accounts that have signed in before
    // can already use their password, so those count as accepted immediately.
    const nowIso = new Date().toISOString();
    const expiresIso = new Date(Date.now() + INVITE_TTL_HOURS * 3600_000).toISOString();
    const preAccepted = alreadyExisted && Boolean(existing?.last_sign_in_at);
    const record: Record<string, unknown> = {
      email,
      display_name: name,
      invited_by: caller.id,
      invited_at: nowIso,
      status: preAccepted ? "accepted" : "pending",
      accepted_at: preAccepted ? nowIso : null,
      // A fresh link was just issued, so the clock restarts from now. An
      // account that can already sign in has no pending link to expire.
      expires_at: preAccepted ? null : expiresIso,
      last_sent_at: emailSent ? nowIso : null,
      resend_count:
        action === "resend" ? Number(prior?.resend_count ?? 0) + 1 : 0,
    };

    const writer = prior
      ? svc.from("wce_organiser_invites").update(record).eq("id", prior.id)
      : svc.from("wce_organiser_invites").insert(record);
    const { data: invite, error: invErr } = await writer.select().maybeSingle();
    if (invErr) return json({ error: invErr.message }, 400);

    return json({
      ok: true,
      action,
      email,
      already_existed: alreadyExisted,
      email_sent: emailSent,
      email_error: mailError,
      expires_at: record.expires_at,
      expires_in_hours: preAccepted ? null : INVITE_TTL_HOURS,
      invite,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error." }, 500);
  }
});

/** Page through auth users to find one by email. */
async function findUserByEmail(
  svc: ReturnType<typeof createClient>,
  email: string,
): Promise<{ id: string; last_sign_in_at: string | null } | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = data?.users ?? [];
    const hit = users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (hit) return { id: hit.id, last_sign_in_at: hit.last_sign_in_at ?? null };
    if (users.length < 200) break;
  }
  return null;
}

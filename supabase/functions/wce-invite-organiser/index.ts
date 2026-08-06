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
        .update({ status: "revoked", accepted_at: null })
        .eq("email", email);
      return json({ ok: true, action: "revoke", email });
    }

    // ---- INVITE / RESEND -------------------------------------------------
    const existing = await findUserByEmail(svc, email);
    let userId = existing?.id ?? null;
    let alreadyExisted = Boolean(existing);
    let emailSent = false;

    if (!existing) {
      const { data, error } = await svc.auth.admin.inviteUserByEmail(email, {
        redirectTo: redirectTo || undefined,
        data: displayName ? { full_name: displayName } : undefined,
      });
      if (error) {
        // Race: created between our lookup and the invite.
        const retry = await findUserByEmail(svc, email);
        if (!retry) return json({ error: error.message }, 400);
        userId = retry.id;
        alreadyExisted = true;
      } else {
        userId = data.user?.id ?? null;
        emailSent = true;
      }
    } else if (action === "resend") {
      // The account exists but has never signed in — resend a set-password link.
      const { error } = await svc.auth.admin.generateLink({
        type: existing.last_sign_in_at ? "recovery" : "invite",
        email,
        options: { redirectTo: redirectTo || undefined },
      });
      // generateLink does not send mail on its own; fall back to a reset email.
      if (error) {
        await svc.auth.resetPasswordForEmail?.(email, { redirectTo });
      }
      const { error: resetErr } = await svc.auth.admin.inviteUserByEmail(email, {
        redirectTo: redirectTo || undefined,
      }).then((r) => ({ error: r.error }));
      emailSent = !resetErr;
    }

    if (!userId) return json({ error: "Could not resolve the invited account." }, 500);

    // Grant the narrow organiser role.
    const { error: roleErr } = await svc.from("user_roles")
      .upsert({ user_id: userId, role: "wce_admin" }, { onConflict: "user_id,role" });
    if (roleErr) return json({ error: roleErr.message }, 400);

    // Record / refresh the invite.
    const { data: invite, error: invErr } = await svc.from("wce_organiser_invites")
      .upsert(
        {
          email,
          display_name: displayName,
          invited_by: caller.id,
          invited_at: new Date().toISOString(),
          status: "pending",
          accepted_at: null,
        },
        { onConflict: "email" },
      )
      .select()
      .maybeSingle();
    if (invErr) return json({ error: invErr.message }, 400);

    return json({
      ok: true,
      action,
      email,
      already_existed: alreadyExisted,
      email_sent: emailSent,
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

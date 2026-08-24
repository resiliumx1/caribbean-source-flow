// TEMPORARY, SINGLE-PURPOSE ROUTINE. Deleted immediately after use.
// Sets a new password on one hardcoded admin account. Guarded by a one-time token.
import { createClient } from "npm:@supabase/supabase-js@2";

const ONE_TIME_TOKEN = "BxLDm_kwlt5lcY5KbYge8p15km36-2dm";
const ALLOWED_EMAIL = "yannick23d@gmail.com";

Deno.serve(async (req) => {
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { "Content-Type": "application/json" } });

  if (req.headers.get("x-one-time-token") !== ONE_TIME_TOKEN) return json({ error: "Forbidden" }, 403);

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid body" }, 400);
  }

  if ((body.email ?? "").toLowerCase() !== ALLOWED_EMAIL) return json({ error: "Email not allowed" }, 403);
  if (!body.password || body.password.length < 10) return json({ error: "Password too short" }, 400);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: list, error: lErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (lErr) return json({ error: lErr.message }, 500);
  const user = list?.users?.find((u) => u.email?.toLowerCase() === ALLOWED_EMAIL);
  if (!user) return json({ error: "Account not found" }, 404);

  const { error: uErr } = await admin.auth.admin.updateUserById(user.id, {
    password: body.password,
    email_confirm: true,
  });
  if (uErr) return json({ error: uErr.message }, 500);

  return json({ ok: true, user_id: user.id });
});

import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { email, password, bootstrap_token } = await req.json();
    const expected = Deno.env.get('ADMIN_BOOTSTRAP_TOKEN');
    if (!expected || bootstrap_token !== expected) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'email and password required' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Find or create user
    let userId: string | null = null;
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = list?.users?.find((u) => u.email?.toLowerCase() === String(email).toLowerCase());
    if (existing) {
      userId = existing.id;
      await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
    } else {
      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
      });
      if (cErr) throw cErr;
      userId = created.user!.id;
    }

    // Ensure profile + admin flag
    await admin.from('profiles').upsert({ id: userId, email, is_admin: true }, { onConflict: 'id' });
    await admin.from('profiles').update({ is_admin: true }).eq('id', userId);

    return new Response(JSON.stringify({ ok: true, user_id: userId }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
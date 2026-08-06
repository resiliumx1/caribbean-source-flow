import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

const ALLOWED_EMAIL = 'yannick2d@live.com'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  const token = req.headers.get('x-bootstrap-token')
  if (!token || token !== Deno.env.get('ADMIN_BOOTSTRAP_TOKEN')) {
    return json({ error: 'unauthorized' }, 401)
  }

  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  const email = (body.email ?? '').trim().toLowerCase()
  const password = body.password ?? ''
  if (email !== ALLOWED_EMAIL) return json({ error: 'email not allowed' }, 403)
  if (typeof password !== 'string' || password.length < 10) {
    return json({ error: 'password must be at least 10 characters' }, 400)
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )

  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listErr) return json({ error: listErr.message }, 500)
  const user = list.users.find((u) => (u.email ?? '').toLowerCase() === email)
  if (!user) return json({ error: 'user not found' }, 404)

  const { error: updErr } = await admin.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
  })
  if (updErr) return json({ error: updErr.message }, 500)

  return json({ ok: true, user_id: user.id })
})

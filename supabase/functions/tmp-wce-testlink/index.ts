// TEMPORARY test helper: full admins can mint an invite token_hash for QA. Delete after use.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const token = (req.headers.get("Authorization") ?? "").replace(/^bearer /i, "").trim();
  const { data: u } = await svc.auth.getUser(token);
  const { data: p } = await svc.from("profiles").select("is_admin").eq("id", u?.user?.id ?? "").maybeSingle();
  if (!p?.is_admin) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: corsHeaders });
  const { email, type } = await req.json();
  const { data, error } = await svc.auth.admin.generateLink({ type: type ?? "invite", email });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
  return new Response(JSON.stringify({ hashed_token: data.properties?.hashed_token, verification_type: data.properties?.verification_type }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});

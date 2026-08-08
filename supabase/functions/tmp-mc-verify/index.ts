// TEMPORARY verification helper — deleted immediately after the Mailchimp test.
import { createClient } from "npm:@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.224.0/encoding/hex.ts";

Deno.serve(async (req) => {
  const { email, del } = await req.json();
  const key = Deno.env.get("MAILCHIMP_API_KEY")!;
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: s } = await admin.from("wce_settings").select("mailchimp_audience_id, mailchimp_server_prefix").limit(1).maybeSingle();
  const hash = encodeHex(crypto.subtle.digestSync("MD5", new TextEncoder().encode(String(email).toLowerCase())));
  const base = `https://${s!.mailchimp_server_prefix}.api.mailchimp.com/3.0/lists/${s!.mailchimp_audience_id}/members/${hash}`;
  if (del) {
    const r = await fetch(`${base}/actions/delete-permanent`, { method: "POST", headers: { Authorization: `Bearer ${key}` } });
    return new Response(JSON.stringify({ deleted: r.status }), { headers: { "Content-Type": "application/json" } });
  }
  const r = await fetch(base, { headers: { Authorization: `Bearer ${key}` } });
  const body = await r.text();
  const fieldsRes = await fetch(`https://${s!.mailchimp_server_prefix}.api.mailchimp.com/3.0/lists/${s!.mailchimp_audience_id}/merge-fields?count=100`, { headers: { Authorization: `Bearer ${key}` } });
  const fields = await fieldsRes.text();
  return new Response(JSON.stringify({ status: r.status, member: body, merge_fields: fields }), { headers: { "Content-Type": "application/json" } });
});

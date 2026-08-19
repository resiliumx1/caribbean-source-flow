// First-party analytics ingest for the /wce-2026 landing page.
// Accepts a small batch of anonymous events and writes them with the service
// role. No IP address is stored; country comes from the edge header only.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const MAX_BATCH = 40;
const ALLOWED = new Set([
  "page_view",
  "section_view",
  "cta_click",
  "speaker_open",
  "flyer_share",
  "faq_open",
  "retreat_card_expand",
  "form_start",
  "form_submit",
]);

const str = (v: unknown, max = 240): string | null => {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: { session_id?: unknown; events?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const sessionId = str(body.session_id, 64);
  const list = Array.isArray(body.events) ? body.events.slice(0, MAX_BATCH) : [];
  if (!sessionId || !list.length) return json({ error: "session_id and events are required" }, 400);

  const country =
    req.headers.get("cf-ipcountry") ??
    req.headers.get("x-vercel-ip-country") ??
    null;

  const rows = list
    .map((raw) => {
      const e = (raw ?? {}) as Record<string, unknown>;
      const type = str(e.event_type, 40);
      if (!type || !ALLOWED.has(type)) return null;
      return {
        session_id: sessionId,
        event_type: type,
        event_target: str(e.event_target, 200),
        path: str(e.path, 300),
        referrer: str(e.referrer, 300),
        utm_source: str(e.utm_source, 120),
        utm_medium: str(e.utm_medium, 120),
        utm_campaign: str(e.utm_campaign, 120),
        referral_code: str(e.referral_code, 60),
        device_type: str(e.device_type, 20),
        country: country && country !== "XX" ? country.slice(0, 4) : null,
        meta: e.meta && typeof e.meta === "object" ? e.meta : null,
      };
    })
    .filter(Boolean);

  if (!rows.length) return json({ inserted: 0 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supabase.from("wce_page_events").insert(rows);
  if (error) return json({ error: error.message }, 500);

  return json({ inserted: rows.length });
});
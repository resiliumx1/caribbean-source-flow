/** Meta Conversions API twin — DORMANT until credentials are supplied.
 *
 *  Add these two Supabase secrets to activate, no code change required:
 *    WCE_META_PIXEL_ID    — the Pixel / dataset ID
 *    WCE_META_CAPI_TOKEN  — the Conversions API access token
 *  Then flip WCE_META_CAPI_TOKEN_CONFIGURED to true in
 *  src/components/wce/meta-events.ts so the browser starts calling this.
 *
 *  Every event carries the SAME event_id as its browser Pixel twin, which is how
 *  Meta deduplicates the pair instead of double-counting it.
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const PIXEL_ID = Deno.env.get("WCE_META_PIXEL_ID") ?? "";
const CAPI_TOKEN = Deno.env.get("WCE_META_CAPI_TOKEN") ?? "";

/** Meta requires user identifiers to be SHA-256 hashed, lowercase and trimmed. */
async function hash(value: string) {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // No credentials yet: accept and ignore, so the client never sees an error.
  if (!PIXEL_ID || !CAPI_TOKEN) return json({ ok: true, skipped: "not_configured" });

  try {
    const body = (await req.json()) as {
      event_name?: string;
      event_id?: string;
      event_source_url?: string | null;
      email?: string | null;
      custom_data?: Record<string, unknown>;
    };
    if (!body.event_name || !body.event_id) return json({ error: "Invalid request" }, 400);

    const user_data: Record<string, unknown> = {
      client_user_agent: req.headers.get("user-agent") ?? undefined,
    };
    if (body.email) user_data.em = [await hash(body.email)];

    const res = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: CAPI_TOKEN,
        data: [{
          event_name: body.event_name,
          event_id: body.event_id,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: body.event_source_url ?? undefined,
          user_data,
          custom_data: body.custom_data ?? {},
        }],
      }),
    });

    if (!res.ok) {
      console.error("Meta CAPI rejected event", res.status, await res.text());
      return json({ ok: false }, 200); // never break the user's journey
    }
    return json({ ok: true });
  } catch (e) {
    console.error("wce-meta-capi error", e);
    return json({ ok: false }, 200);
  }
});

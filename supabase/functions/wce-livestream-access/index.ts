/** Gated livestream access for online symposium purchasers.
 *
 *  The embed URL / embed code is NEVER shipped to the browser bundle. It is
 *  returned only after an entitlement is verified here, so the stream cannot be
 *  reached by reading page source. Entitlements are granted automatically by a
 *  database trigger when the online symposium product is purchased.
 *
 *  Unlocking requires either the private access_token (from the purchaser's
 *  emailed link / this device) or BOTH the purchase email AND the matching
 *  order number, so knowing an email address alone is not enough.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email, access_token, order_number } = (await req.json()) as {
      email?: string;
      access_token?: string;
      order_number?: string;
    };
    const clean = (email ?? "").trim().toLowerCase();
    const token = (access_token ?? "").trim();
    const orderRef = (order_number ?? "").trim().toUpperCase();

    if (!token && !EMAIL_RE.test(clean)) {
      return json({ error: "Please enter the email address you used to purchase online access." }, 400);
    }
    if (!token && !orderRef) {
      return json({ error: "Please also enter your order number so we can confirm your purchase." }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let query = admin
      .from("wce_livestream_entitlements")
      .select("id, email, access_token, revoked_at, order_id")
      .is("revoked_at", null)
      .limit(token ? 1 : 20);
    query = token ? query.eq("access_token", token) : query.eq("email", clean);

    const { data: rows, error } = await query;
    if (error) throw error;

    let entitlement = token ? rows?.[0] : undefined;

    // Email path: require the matching order number as a second factor.
    if (!token) {
      for (const row of rows ?? []) {
        if (!row.order_id) continue;
        const { data: order } = await admin
          .from("orders")
          .select("order_number")
          .eq("id", row.order_id)
          .maybeSingle();
        const num = String(order?.order_number ?? "").trim().toUpperCase();
        if (num && num === orderRef) {
          entitlement = row;
          break;
        }
      }
    }

    if (!entitlement) {
      // Deliberately identical for "no purchase" and "revoked" so the endpoint
      // cannot be used to probe who bought a ticket.
      return json(
        {
          entitled: false,
          message:
            "We could not confirm online access for that email address and order number. If you have just purchased, please allow a few minutes, or contact us and we will help.",
        },
        200,
      );
    }

    const { data: settings } = await admin
      .from("wce_settings")
      .select("livestream_provider, livestream_embed_url, livestream_embed_code, livestream_fallback_copy")
      .limit(1)
      .maybeSingle();

    const ready = !!(settings?.livestream_embed_url || settings?.livestream_embed_code);

    return json({
      entitled: true,
      access_token: entitlement.access_token,
      email: entitlement.email,
      ready,
      provider: settings?.livestream_provider ?? null,
      embed_url: ready ? settings?.livestream_embed_url ?? null : null,
      embed_code: ready ? settings?.livestream_embed_code ?? null : null,
      fallback_copy:
        settings?.livestream_fallback_copy ??
        "Your online access is confirmed. The stream will appear here on 11 October 2026. Joining details are also sent to your email before the event.",
    });
  } catch (e) {
    console.error("wce-livestream-access error", e);
    return json({ error: "We could not check your access just now. Please try again in a moment." }, 500);
  }
});

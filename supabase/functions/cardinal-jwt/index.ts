// Mints a signed Cardinal Cruise (3-D Secure / SCA) JWT for the browser.
//
// The Cardinal API key secret NEVER leaves the server — only the signed JWT
// and the public Org Unit Id are returned. If Cardinal credentials are not
// configured, the function reports { enabled: false } so the card form can
// fall back to a normal (non-3DS) charge.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

function b64url(bytes: Uint8Array | string): string {
  const raw = typeof bytes === "string"
    ? bytes
    : String.fromCharCode(...bytes);
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signJwt(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const enc = new TextEncoder();
  const signingInput =
    `${b64url(enc.encode(JSON.stringify(header)) as Uint8Array)}.${b64url(enc.encode(JSON.stringify(payload)) as Uint8Array)}`;
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(signingInput)));
  return `${signingInput}.${b64url(sig)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const orgUnitId = Deno.env.get("CARDINAL_ORG_UNIT_ID");
  const apiKeyId = Deno.env.get("CARDINAL_API_KEY_ID");
  const apiKeySecret = Deno.env.get("CARDINAL_API_KEY_SECRET");
  const environment = (Deno.env.get("CARDINAL_ENV") ?? "sandbox").toLowerCase() === "production"
    ? "production"
    : "sandbox";

  if (!orgUnitId || !apiKeyId || !apiKeySecret) {
    // Not yet onboarded with Cardinal — 3DS is simply unavailable.
    return new Response(JSON.stringify({ enabled: false }), { headers: jsonHeaders });
  }

  let body: { amount?: unknown; currency?: unknown; referenceId?: unknown } = {};
  try {
    body = await req.json();
  } catch { /* optional body */ }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return new Response(JSON.stringify({ error: "A valid amount is required." }), {
      status: 400,
      headers: jsonHeaders,
    });
  }
  const currency = typeof body.currency === "string" && /^[A-Z]{3}$/.test(body.currency)
    ? body.currency
    : "USD";
  const referenceId = typeof body.referenceId === "string"
    ? body.referenceId.slice(0, 50)
    : crypto.randomUUID();

  const now = Math.floor(Date.now() / 1000);
  const jwt = await signJwt({
    jti: crypto.randomUUID(),
    iat: now,
    exp: now + 60 * 30,
    iss: apiKeyId,
    OrgUnitId: orgUnitId,
    Payload: {
      OrderDetails: {
        OrderNumber: referenceId,
        // Cardinal expects the amount in minor units (cents).
        Amount: Math.round(amount * 100),
        CurrencyCode: currency,
      },
    },
    ObjectifyPayload: true,
  }, apiKeySecret);

  return new Response(
    JSON.stringify({ enabled: true, jwt, orgUnitId, environment, referenceId }),
    { headers: jsonHeaders },
  );
});

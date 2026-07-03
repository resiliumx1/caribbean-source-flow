// Returns the Authorize.net PUBLIC keys the browser needs to tokenize a card
// via Accept.js. Both values are safe to expose (per Authorize.net docs) —
// only the Transaction Key and Signature Key stay server-side.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiLoginId = Deno.env.get("AUTHORIZENET_API_LOGIN_ID");
  const clientKey = Deno.env.get("AUTHORIZENET_PUBLIC_CLIENT_KEY");

  if (!apiLoginId || !clientKey) {
    return new Response(
      JSON.stringify({ error: "Authorize.net public keys are not configured." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ apiLoginId, clientKey, environment: "production" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
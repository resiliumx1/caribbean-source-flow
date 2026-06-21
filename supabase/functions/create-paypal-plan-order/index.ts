import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PAYPAL_BASE = "https://api-m.paypal.com";
const PAYPAL_CLIENT_ID =
  "ARA5I0pb-Sr8CDj3wiliKf-qILV9wMuX0YRNaBFbBsVld88v2CWs2ILHegOPuLfizo2G-czuNEyHje0L";

async function getAccessToken(): Promise<string> {
  const secret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  if (!secret) throw new Error("PAYPAL_CLIENT_SECRET missing");
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${secret}`);
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`PayPal token error: ${res.status} ${t}`);
  }
  const json = await res.json();
  return json.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { planId, requestedAmount } = await req.json();
    if (!planId) throw new Error("planId required");
    const reqAmt = Number(requestedAmount);
    if (!Number.isFinite(reqAmt) || reqAmt <= 0) throw new Error("Invalid amount");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: plan, error } = await supabase
      .from("payment_plans")
      .select("*")
      .eq("id", planId)
      .maybeSingle();
    if (error) throw error;
    if (!plan) throw new Error("Plan not found");
    if (plan.status !== "active") throw new Error("Plan is not active");

    const remaining = Number(plan.balance_remaining);
    if (remaining <= 0) throw new Error("Plan already paid in full");

    const min = Number(plan.min_payment ?? 1);
    const amount = Math.min(reqAmt, remaining);
    if (amount < min && amount < remaining) {
      throw new Error(`Minimum payment is $${min.toFixed(2)}`);
    }

    const amountStr = amount.toFixed(2);
    const token = await getAccessToken();

    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: planId,
            description: `${plan.package_name} — payment`.slice(0, 127),
            amount: { currency_code: "USD", value: amountStr },
          },
        ],
        application_context: {
          brand_name: "Mount Kailash Rejuvenation Centre",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
        },
      }),
    });
    if (!orderRes.ok) {
      const t = await orderRes.text();
      throw new Error(`PayPal order error: ${orderRes.status} ${t}`);
    }
    const order = await orderRes.json();

    return new Response(
      JSON.stringify({ orderID: order.id, amount: amountStr }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("create-paypal-plan-order error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
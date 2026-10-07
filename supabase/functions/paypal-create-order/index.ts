import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { priceCart, type CartLine, type DeliveryType } from "../_shared/cart-pricing.ts";

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
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal token error: ${res.status}`);
  return (await res.json()).access_token as string;
}

// Creates the PayPal order for a store cart. The amount is computed here from
// database prices, shipping rules and the validated coupon — never from the browser.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as {
      items: CartLine[];
      delivery_type: DeliveryType;
      coupon_code?: string;
    };
    const dt: DeliveryType =
      body.delivery_type === "local" || body.delivery_type === "international" || body.delivery_type === "pickup"
        ? body.delivery_type
        : "pickup";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const priced = await priceCart(supabase, body.items, dt, body.coupon_code);
    const amountStr = priced.total_usd.toFixed(2);

    const token = await getAccessToken();
    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: "Mount Kailash Rejuvenation Centre order",
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
    if (!orderRes.ok) throw new Error(`PayPal order error: ${orderRes.status}`);
    const order = await orderRes.json();

    return new Response(JSON.stringify({ orderID: order.id, amount: amountStr }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("paypal-create-order error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

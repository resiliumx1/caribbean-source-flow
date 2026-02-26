import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body = await req.json();
    const { line_items, billing, shipping, payment_method, customer_note } = body;

    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return new Response(
        JSON.stringify({ error: "line_items is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!billing?.email) {
      return new Response(
        JSON.stringify({ error: "billing.email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // WooCommerce credentials
    const wooKey = Deno.env.get("WOO_CONSUMER_KEY");
    const wooSecret = Deno.env.get("WOO_CONSUMER_SECRET");
    const wooUrl = Deno.env.get("WOO_STORE_URL");

    if (!wooKey || !wooSecret || !wooUrl) {
      return new Response(
        JSON.stringify({ error: "WooCommerce credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create order in WooCommerce
    const orderData = {
      payment_method: payment_method || "cod",
      payment_method_title: payment_method === "cod" ? "Cash on Delivery" : payment_method,
      set_paid: false,
      billing: {
        first_name: billing.first_name || "",
        last_name: billing.last_name || "",
        email: billing.email,
        phone: billing.phone || "",
        address_1: billing.address_1 || "",
        address_2: billing.address_2 || "",
        city: billing.city || "",
        state: billing.state || "",
        postcode: billing.postcode || "",
        country: billing.country || "LC",
      },
      shipping: shipping || undefined,
      line_items: line_items.map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity || 1,
        ...(item.variation_id ? { variation_id: item.variation_id } : {}),
      })),
      customer_note: customer_note || "",
    };

    const apiUrl = `${wooUrl}/wp-json/wc/v3/orders?consumer_key=${encodeURIComponent(wooKey)}&consumer_secret=${encodeURIComponent(wooSecret)}`;

    const wooRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const wooOrder = await wooRes.json();

    if (!wooRes.ok) {
      throw new Error(
        `WooCommerce order creation failed [${wooRes.status}]: ${JSON.stringify(wooOrder)}`
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: wooOrder.id,
        order_number: wooOrder.number,
        order_key: wooOrder.order_key,
        total: wooOrder.total,
        currency: wooOrder.currency,
        payment_url: `${wooUrl}/checkout/order-pay/${wooOrder.id}/?pay_for_order=true&key=${wooOrder.order_key}`,
        status: wooOrder.status,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("woo-order error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

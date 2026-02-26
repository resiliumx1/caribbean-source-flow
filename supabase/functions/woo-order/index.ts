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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
    const { items, billing, customer_note } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "items is required" }),
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

    // Normalize URL and build Basic Auth
    const normalizedUrl = wooUrl.trim().replace(/\/+$/, '').replace(/\/wp-json(\/wc\/v3)?$/, '');
    const basicAuth = btoa(`${wooKey}:${wooSecret}`);

    // Look up woo_product_id for each item from DB
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const productIds = items.map((i: any) => i.product_id);
    const { data: products, error: prodErr } = await adminClient
      .from("products")
      .select("id, woo_product_id, name")
      .in("id", productIds);

    if (prodErr) throw new Error(`Failed to look up products: ${prodErr.message}`);

    const productMap = new Map(
      (products || []).map((p) => [p.id, p])
    );

    // Build WooCommerce line_items
    const lineItems = items.map((item: any) => {
      const product = productMap.get(item.product_id);
      if (!product?.woo_product_id) {
        throw new Error(
          `Product "${product?.name || item.product_id}" has no WooCommerce ID. Run a sync first.`
        );
      }
      return {
        product_id: product.woo_product_id,
        quantity: item.quantity || 1,
      };
    });

    // Create order in WooCommerce
    const orderData = {
      payment_method: "cod",
      payment_method_title: "Cash on Delivery",
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
      line_items: lineItems,
      customer_note: customer_note || "",
    };

    const apiUrl = `${normalizedUrl}/wp-json/wc/v3/orders`;

    const wooRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${basicAuth}`,
        "User-Agent": "MountKailash/1.0",
        "Accept": "application/json",
      },
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

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Parse request body — guest checkout allowed (no auth required)
    const body = await req.json();
    const { items, billing, customer_note, return_url } = body;

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

    // Basic input validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof billing.email !== "string" || billing.email.length > 255 || !emailRe.test(billing.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const lenChecks: [string, unknown, number][] = [
      ["first_name", billing.first_name, 100],
      ["last_name", billing.last_name, 100],
      ["phone", billing.phone, 30],
      ["address_1", billing.address_1, 255],
      ["address_2", billing.address_2, 255],
      ["city", billing.city, 100],
      ["state", billing.state, 100],
      ["postcode", billing.postcode, 20],
      ["country", billing.country, 2],
      ["customer_note", customer_note, 1000],
    ];
    for (const [name, val, max] of lenChecks) {
      if (val != null && (typeof val !== "string" || val.length > max)) {
        return new Response(
          JSON.stringify({ error: `Invalid ${name}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    if (items.length > 50) {
      return new Response(
        JSON.stringify({ error: "Too many items" }),
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

    // Normalize URL and authenticate with query parameters.
    // Some WordPress hosts strip Authorization headers, so do not use Basic Auth here.
    const normalizedUrl = wooUrl.trim().replace(/\/+$/, '').replace(/\/wp-json(\/wc\/v3)?$/, '');

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

    // Identify any items missing a WooCommerce ID before attempting to build the order.
    const unsyncedNames = items
      .map((item: any) => productMap.get(item.product_id))
      .filter((p: any) => !p?.woo_product_id)
      .map((p: any) => p?.name || "Unknown product");

    if (unsyncedNames.length > 0) {
      return new Response(
        JSON.stringify({
          error: `These items aren't available for online checkout yet: ${unsyncedNames.join(", ")}. Please remove them from your cart or contact us to complete your order.`,
          code: "MISSING_WOO_PRODUCT_ID",
          unsynced: unsyncedNames,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build WooCommerce line_items
    const lineItems = items.map((item: any) => {
      const product = productMap.get(item.product_id)!;
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
      // `pending` triggers WooCommerce's customer "order received" email.
      status: "pending",
    };

    const apiUrl =
      `${normalizedUrl}/wp-json/wc/v3/orders` +
      `?consumer_key=${encodeURIComponent(wooKey)}` +
      `&consumer_secret=${encodeURIComponent(wooSecret)}`;

    const wooRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "MountKailash/1.0",
        "Accept": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const wooOrder = await wooRes.json();

    if (!wooRes.ok) {
      console.error("WooCommerce order error:", wooRes.status, wooOrder);
      throw new Error("Order creation failed");
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: wooOrder.id,
        order_number: wooOrder.number,
        order_key: wooOrder.order_key,
        total: wooOrder.total,
        currency: wooOrder.currency,
        payment_url: `${normalizedUrl}/checkout/order-pay/${wooOrder.id}/?pay_for_order=true&key=${wooOrder.order_key}${
          return_url ? `&return_url=${encodeURIComponent(return_url)}` : ""
        }`,
        status: wooOrder.status,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("woo-order error:", error);
    return new Response(
      JSON.stringify({ error: "An internal error occurred while creating your order. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

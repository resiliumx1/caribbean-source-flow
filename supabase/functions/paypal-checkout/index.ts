import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CartLine {
  product_id: string;
  quantity: number;
}

interface CheckoutPayload {
  items: CartLine[];
  form: {
    customer_name: string;
    email: string;
    phone: string;
    delivery_type: "shipping" | "pickup";
    address_line1: string;
    address_line2?: string;
    city: string;
    state_province?: string;
    postal_code?: string;
    country: string;
    customer_notes?: string;
  };
  paypal_order_id: string;
  paypal_capture_id: string;
  currency_used: "USD" | "XCD";
  user_id?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as CheckoutPayload;

    // Basic validation
    if (!payload?.items?.length) throw new Error("Cart is empty.");
    if (!payload?.paypal_capture_id) throw new Error("Missing PayPal capture id.");
    if (!payload?.form?.email) throw new Error("Email is required.");
    if (!payload?.form?.customer_name) throw new Error("Customer name is required.");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Re-fetch products from DB to get authoritative pricing (never trust client prices)
    const productIds = [...new Set(payload.items.map((i) => i.product_id))];
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price_usd, price_xcd")
      .in("id", productIds);
    if (prodErr) throw prodErr;
    if (!products || products.length !== productIds.length) {
      throw new Error("One or more cart items are no longer available.");
    }

    const productMap = new Map(products.map((p: any) => [p.id, p]));

    let subtotal_usd = 0;
    let subtotal_xcd = 0;
    const itemRows = payload.items.map((line) => {
      const p: any = productMap.get(line.product_id);
      if (!p) throw new Error(`Product not found: ${line.product_id}`);
      const qty = Math.max(1, Math.floor(line.quantity));
      subtotal_usd += Number(p.price_usd) * qty;
      subtotal_xcd += Number(p.price_xcd) * qty;
      return {
        product_id: p.id,
        product_name: p.name,
        quantity: qty,
        price_usd: Number(p.price_usd),
        price_xcd: Number(p.price_xcd),
      };
    });

    // Shipping is free for now
    const shipping_usd = 0;
    const shipping_xcd = 0;
    const total_usd = subtotal_usd + shipping_usd;
    const total_xcd = subtotal_xcd + shipping_xcd;

    // Insert order — trigger generates order_number, history trigger logs status
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: payload.user_id ?? null,
        customer_name: payload.form.customer_name,
        email: payload.form.email.toLowerCase().trim(),
        phone: payload.form.phone || null,
        delivery_type: payload.form.delivery_type,
        address_line1: payload.form.address_line1 || "—",
        address_line2: payload.form.address_line2 || null,
        city: payload.form.city || "—",
        state_province: payload.form.state_province || null,
        postal_code: payload.form.postal_code || null,
        country: payload.form.country || "LC",
        subtotal_usd,
        subtotal_xcd,
        shipping_usd,
        shipping_xcd,
        total_usd,
        total_xcd,
        currency_used: payload.currency_used,
        payment_method: "paypal",
        payment_status: "completed",
        payment_transaction_id: payload.paypal_capture_id,
        status: "pending",
        customer_notes: payload.form.customer_notes || null,
      })
      .select("id, order_number")
      .single();

    if (orderErr) throw orderErr;

    // Insert order_items
    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(itemRows.map((row) => ({ ...row, order_id: order.id })));

    if (itemsErr) {
      console.error("order_items insert failed, rolling back order:", itemsErr);
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemsErr;
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        order_number: order.order_number,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("paypal-checkout error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Checkout failed." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyPaypalCapture } from "../_shared/paypal-verify.ts";
import { sanitizeAttribution, type OrderAttribution } from "../_shared/attribution.ts";

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
    delivery_type: "local" | "international" | "pickup";
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
  /** Marketing attribution only — never used for pricing. */
  attribution?: OrderAttribution;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as CheckoutPayload;
    const attribution = sanitizeAttribution(payload.attribution);

    // Basic validation
    if (!payload?.items?.length) throw new Error("Cart is empty.");
    if (!payload?.paypal_capture_id) throw new Error("Missing PayPal capture id.");
    if (!payload?.form?.email) throw new Error("Email is required.");
    if (!payload?.form?.customer_name) throw new Error("Customer name is required.");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve authenticated user (if any) from incoming Authorization header.
    // We never trust a user_id from the client; the only authoritative source
    // is a valid JWT verified server-side. Anything else => guest order.
    let authedUserId: string | null = null;
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (authHeader?.toLowerCase().startsWith("bearer ")) {
      const token = authHeader.slice(7).trim();
      // Skip our own publishable/anon key (not a user JWT)
      if (token && token.split(".").length === 3) {
        try {
          const { data: userData, error: userErr } = await supabase.auth.getUser(token);
          if (!userErr && userData?.user?.id) {
            authedUserId = userData.user.id;
          }
        } catch (_e) {
          // ignore — treat as guest
        }
      }
    }

    // Map delivery_type to allowed DB values. Country LC => local default; else international.
    const incomingDt = payload.form.delivery_type;
    const deliveryType: "local" | "international" | "pickup" =
      incomingDt === "local" || incomingDt === "international" || incomingDt === "pickup"
        ? incomingDt
        : (payload.form.country?.toUpperCase() === "LC" ? "local" : "international");

    // Re-fetch products from DB to get authoritative pricing (never trust client prices)
    const productIds = [...new Set(payload.items.map((i) => i.product_id))];
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price_usd, price_xcd, is_digital, is_active")
      .in("id", productIds);
    if (prodErr) throw prodErr;
    if (!products || products.length !== productIds.length) {
      throw new Error("One or more cart items are no longer available.");
    }
    // Mirrors authnet-charge: withdrawn products (e.g. application-only retreats)
    // can never be bought by pushing their ID straight into a cart.
    const withdrawn = products.find((p: any) => p.is_active === false);
    if (withdrawn) {
      throw new Error(`${withdrawn.name} is no longer available for purchase.`);
    }

    const productMap = new Map(products.map((p: any) => [p.id, p]));

    let subtotal_usd = 0;
    let subtotal_xcd = 0;
    let hasPhysical = false;
    const itemRows = payload.items.map((line) => {
      const p: any = productMap.get(line.product_id);
      if (!p) throw new Error(`Product not found: ${line.product_id}`);
      const qty = Math.max(1, Math.floor(line.quantity));
      subtotal_usd += Number(p.price_usd) * qty;
      subtotal_xcd += Number(p.price_xcd) * qty;
      if (!p.is_digital) hasPhysical = true;
      return {
        product_id: p.id,
        product_name: p.name,
        quantity: qty,
        price_usd: Number(p.price_usd),
        price_xcd: Number(p.price_xcd),
      };
    });

    // Shipping rules (must match Checkout.tsx):
    //   - No physical items → free
    //   - pickup → free
    //   - local → 30 XCD (~$11.11 USD)
    //   - international → $30 USD (81 XCD)
    const EXCHANGE = 2.7;
    let shipping_usd = 0;
    let shipping_xcd = 0;
    if (hasPhysical) {
      if (deliveryType === "local") {
        shipping_xcd = 30;
        shipping_usd = +(30 / EXCHANGE).toFixed(2);
      } else if (deliveryType === "international") {
        shipping_usd = 30;
        shipping_xcd = +(30 * EXCHANGE).toFixed(2);
      }
    }
    const total_usd = subtotal_usd + shipping_usd;
    const total_xcd = subtotal_xcd + shipping_xcd;

    // Server-side PayPal verification: confirm the capture really completed
    // for the amount we just computed. Never trust the client-supplied capture id alone.
    await verifyPaypalCapture({
      paypal_order_id: payload.paypal_order_id,
      paypal_capture_id: payload.paypal_capture_id,
      expected_usd: +total_usd.toFixed(2),
    });

    // Insert order — trigger generates order_number, history trigger logs status
    const orderInsert = {
      user_id: authedUserId,
      customer_name: payload.form.customer_name,
      email: payload.form.email.toLowerCase().trim(),
      phone: payload.form.phone || null,
      delivery_type: deliveryType,
      address_line1: payload.form.address_line1 || (deliveryType === "pickup" ? "Pickup at Mount Kailash" : "—"),
      address_line2: payload.form.address_line2 || null,
      city: payload.form.city || (deliveryType === "pickup" ? "Saint Lucia" : "—"),
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
      payment_status: "paid", // allowed: pending|paid|failed|refunded
      payment_transaction_id: payload.paypal_capture_id,
      status: "pending",
      customer_notes: payload.form.customer_notes || null,
      ...attribution,
    };

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert(orderInsert)
      .select("id, order_number")
      .single();

    if (orderErr) {
      await logFailedOrder(supabase, payload, orderInsert, orderErr.message);
      throw orderErr;
    }

    // Insert order_items
    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(itemRows.map((row) => ({ ...row, order_id: order.id })));

    if (itemsErr) {
      console.error("order_items insert failed, rolling back order:", itemsErr);
      await supabase.from("orders").delete().eq("id", order.id);
      await logFailedOrder(supabase, payload, orderInsert, `order_items: ${itemsErr.message}`);
      throw itemsErr;
    }

    // Fire-and-forget order confirmation emails. Never block the order on email failure.
    try {
      const { error: emailErr } = await supabase.functions.invoke("send-order-emails", {
        body: { orderId: order.id, emailType: "order_placed" },
      });
      if (emailErr) console.error("send-order-emails invoke error:", emailErr);
    } catch (e) {
      console.error("send-order-emails threw (order still saved):", e);
    }

    // Fire-and-forget SMS notifications. Never block the order on SMS failure.
    try {
      await supabase.functions.invoke("send-sms", {
        body: { orderId: order.id, smsType: "order_placed" },
      });
      await supabase.functions.invoke("send-sms", {
        body: { orderId: order.id, smsType: "admin_new_order" },
      });
    } catch (e) {
      console.error("send-sms threw (order still saved):", e);
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
      JSON.stringify({
        error: err?.message || "Checkout failed.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function logFailedOrder(
  supabase: any,
  payload: CheckoutPayload,
  orderInsert: any,
  errorMessage: string
) {
  // VERY LOUD console marker so this is unmissable in logs
  console.error(
    "\n========================================================\n" +
      "🚨 PAYPAL PAID BUT ORDER SAVE FAILED — MANUAL RECONCILE 🚨\n" +
      `PayPal Capture ID: ${payload.paypal_capture_id}\n` +
      `PayPal Order ID:   ${payload.paypal_order_id}\n` +
      `Customer Email:    ${payload.form?.email}\n` +
      `Customer Name:     ${payload.form?.customer_name}\n` +
      `Amount USD:        ${orderInsert?.total_usd}\n` +
      `Error:             ${errorMessage}\n` +
      "Email info@mountkailashslu.com to refund or fulfill manually.\n" +
      "========================================================\n"
  );
  try {
    await supabase.from("failed_order_alerts").insert({
      paypal_capture_id: payload.paypal_capture_id,
      paypal_order_id: payload.paypal_order_id,
      customer_email: payload.form?.email ?? null,
      customer_name: payload.form?.customer_name ?? null,
      amount_usd: orderInsert?.total_usd ?? null,
      error_message: errorMessage,
      payload: payload as any,
    });
  } catch (e) {
    console.error("Failed to log failed_order_alerts row:", e);
  }
}
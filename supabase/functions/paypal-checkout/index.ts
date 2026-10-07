import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyPaypalCapture } from "../_shared/paypal-verify.ts";
import { sanitizeAttribution, type OrderAttribution } from "../_shared/attribution.ts";
import { invokeFunction } from "../_shared/invoke-function.ts";
import { priceCart } from "../_shared/cart-pricing.ts";

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
    billing_same_as_shipping?: string | boolean;
    billing_name?: string;
    billing_address_line1?: string;
    billing_address_line2?: string;
    billing_city?: string;
    billing_state_province?: string;
    billing_postal_code?: string;
    billing_country?: string;
  };
  paypal_order_id: string;
  paypal_capture_id: string;
  currency_used: "USD" | "XCD";
  coupon_code?: string;
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
    const billingSame =
      payload.form?.billing_same_as_shipping === false ||
      payload.form?.billing_same_as_shipping === "false"
        ? false
        : true;

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

    // Authoritative pricing (products, shipping, coupon) computed server-side.
    const {
      productMap, itemRows, subtotal_usd, subtotal_xcd, shipping_usd, shipping_xcd,
      discount_usd, appliedCoupon, total_usd, total_xcd,
    } = await priceCart(supabase, payload.items, deliveryType, payload.coupon_code);

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
      discount_usd,
      coupon_code: appliedCoupon?.code ?? null,
      currency_used: payload.currency_used,
      payment_method: "paypal",
      payment_status: "paid", // allowed: pending|paid|failed|refunded
      payment_transaction_id: payload.paypal_capture_id,
      status: "pending",
      customer_notes: payload.form.customer_notes || null,
      billing_same_as_shipping: billingSame,
      billing_name: billingSame ? null : (payload.form.billing_name || null),
      billing_address_line1: billingSame ? null : (payload.form.billing_address_line1 || null),
      billing_address_line2: billingSame ? null : (payload.form.billing_address_line2 || null),
      billing_city: billingSame ? null : (payload.form.billing_city || null),
      billing_state_province: billingSame ? null : (payload.form.billing_state_province || null),
      billing_postal_code: billingSame ? null : (payload.form.billing_postal_code || null),
      billing_country: billingSame ? null : (payload.form.billing_country || null),
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

    // Record coupon redemption + decrement tracked inventory (non-fatal).
    try {
      if (appliedCoupon) {
        await supabase.from("coupon_redemptions").insert({
          coupon_id: appliedCoupon.id,
          order_id: order.id,
          email: orderInsert.email,
          discount_usd,
        });
        await supabase.from("coupons")
          .update({ used_count: Number(appliedCoupon.used_count) + 1 })
          .eq("id", appliedCoupon.id);
      }
      for (const row of itemRows) {
        const p: any = productMap.get(row.product_id);
        if (p?.track_inventory) {
          await supabase.from("products")
            .update({ stock_quantity: Math.max(0, Number(p.stock_quantity) - row.quantity) })
            .eq("id", p.id);
        }
      }
    } catch (e) {
      console.error("post-order bookkeeping failed:", e);
    }

    // Fire-and-forget order confirmation emails. Never block the order on email failure.
    try {
      const { error: emailErr } = await invokeFunction("send-order-emails", {
        orderId: order.id,
        emailType: "order_placed",
      });
      if (emailErr) console.error("send-order-emails invoke error:", emailErr);
    } catch (e) {
      console.error("send-order-emails threw (order still saved):", e);
    }

    // Fire-and-forget SMS notifications. Never block the order on SMS failure.
    try {
      const { error: smsErr1 } = await invokeFunction("send-sms", {
        orderId: order.id,
        smsType: "order_placed",
      });
      if (smsErr1) console.error("send-sms order_placed invoke error:", smsErr1);
      const { error: smsErr2 } = await invokeFunction("send-sms", {
        orderId: order.id,
        smsType: "admin_new_order",
      });
      if (smsErr2) console.error("send-sms admin_new_order invoke error:", smsErr2);
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
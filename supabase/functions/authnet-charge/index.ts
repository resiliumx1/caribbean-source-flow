import { createClient } from "npm:@supabase/supabase-js@2";
import { chargeCard, splitName, type OpaqueData } from "../_shared/authnet.ts";
import { logCartEvent, syncCartToCrm } from "../_shared/cart-recovery.ts";
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
  opaqueData: OpaqueData;
  currency_used: "USD" | "XCD";
  coupon_code?: string;
  /** Marketing attribution only — never used for pricing. */
  attribution?: OrderAttribution;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = (await req.json()) as CheckoutPayload;
    const attribution = sanitizeAttribution(payload.attribution);

    if (!payload?.items?.length) throw new Error("Cart is empty.");
    if (!payload?.opaqueData?.dataValue) throw new Error("Missing payment token.");
    if (!payload?.form?.email) throw new Error("Email is required.");
    if (!payload?.form?.customer_name) throw new Error("Customer name is required.");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Optional authed user
    let authedUserId: string | null = null;
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (authHeader?.toLowerCase().startsWith("bearer ")) {
      const token = authHeader.slice(7).trim();
      if (token && token.split(".").length === 3) {
        try {
          const { data, error } = await supabase.auth.getUser(token);
          if (!error && data?.user?.id) authedUserId = data.user.id;
        } catch (_e) {
          /* guest */
        }
      }
    }

    const incomingDt = payload.form.delivery_type;
    const deliveryType: "local" | "international" | "pickup" =
      incomingDt === "local" || incomingDt === "international" || incomingDt === "pickup"
        ? incomingDt
        : payload.form.country?.toUpperCase() === "LC" ? "local" : "international";

    // Re-fetch authoritative pricing. is_active is fetched and enforced below so
    // that products withdrawn from public sale (e.g. the WCE Fortification
    // Retreat, which is application-only) cannot be bought by posting a raw
    // product id at this endpoint.
    const productIds = [...new Set(payload.items.map((i) => i.product_id))];
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price_usd, price_xcd, is_digital, category_id, track_inventory, stock_quantity, is_active")
      .in("id", productIds);
    if (prodErr) throw prodErr;
    if (!products || products.length !== productIds.length) {
      throw new Error("One or more cart items are no longer available.");
    }
    const withdrawn = products.find((p: any) => p.is_active === false);
    if (withdrawn) {
      throw new Error(`${withdrawn.name} is not available for purchase here.`);
    }
    const productMap = new Map(products.map((p: any) => [p.id, p]));

    let subtotal_usd = 0;
    let subtotal_xcd = 0;
    let hasPhysical = false;
    const itemRows = payload.items.map((line) => {
      const p: any = productMap.get(line.product_id);
      if (!p) throw new Error(`Product not found: ${line.product_id}`);
      const qty = Math.max(1, Math.floor(line.quantity));
      if (p.track_inventory && Number(p.stock_quantity) < qty) {
        throw new Error(
          `${p.name} only has ${Math.max(0, Number(p.stock_quantity))} left in stock. Please adjust your cart.`,
        );
      }
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
    // ---- Coupon (re-validated server-side) ----
    let discount_usd = 0;
    let appliedCoupon: any = null;
    const code = (payload.coupon_code || "").trim().toUpperCase();
    if (code) {
      const { data: coupon } = await supabase
        .from("coupons").select("*").ilike("code", code).maybeSingle();
      const now = Date.now();
      const valid =
        coupon &&
        coupon.is_active &&
        (!coupon.starts_at || new Date(coupon.starts_at).getTime() <= now) &&
        (!coupon.expires_at || new Date(coupon.expires_at).getTime() >= now) &&
        (!coupon.max_uses || Number(coupon.used_count) < Number(coupon.max_uses)) &&
        subtotal_usd >= Number(coupon.min_order_usd ?? 0);
      if (!valid) throw new Error("That discount code is not valid for this order.");

      const scoped: string[] = (coupon.product_ids ?? []).length || (coupon.category_ids ?? []).length
        ? itemRows
            .filter((r) => {
              const p: any = productMap.get(r.product_id);
              return (coupon.product_ids ?? []).includes(p.id) ||
                (coupon.category_ids ?? []).includes(p.category_id);
            })
            .map((r) => r.product_id)
        : itemRows.map((r) => r.product_id);

      const eligibleSubtotal = itemRows
        .filter((r) => scoped.includes(r.product_id))
        .reduce((s, r) => s + r.price_usd * r.quantity, 0);
      if (eligibleSubtotal <= 0) throw new Error("That discount code doesn't apply to the items in your cart.");

      discount_usd = coupon.discount_type === "percent"
        ? +(eligibleSubtotal * (Number(coupon.discount_value) / 100)).toFixed(2)
        : Math.min(Number(coupon.discount_value), eligibleSubtotal);
      discount_usd = Math.min(discount_usd, subtotal_usd);
      appliedCoupon = coupon;
    }

    const total_usd = +(subtotal_usd - discount_usd + shipping_usd).toFixed(2);
    const total_xcd = +((subtotal_xcd - discount_usd * EXCHANGE) + shipping_xcd).toFixed(2);
    if (total_usd <= 0) throw new Error("Order total must be greater than zero.");

    // Charge card via Authorize.net
    const { firstName, lastName } = splitName(payload.form.customer_name);
    const charge = await chargeCard({
      amount: total_usd,
      opaqueData: payload.opaqueData,
      description: "Mount Kailash Order",
      billTo: {
        firstName,
        lastName,
        address: (payload.form.address_line1 || "").slice(0, 60) || undefined,
        city: (payload.form.city || "").slice(0, 40) || undefined,
        state: (payload.form.state_province || "").slice(0, 40) || undefined,
        zip: (payload.form.postal_code || "").slice(0, 20) || undefined,
        country: (payload.form.country || "LC").slice(0, 60),
        phoneNumber: (payload.form.phone || "").replace(/[^\d+\-() ]/g, "").slice(0, 25) || undefined,
      },
      customerEmail: payload.form.email.toLowerCase().trim(),
    });

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
      payment_method: "authorize_net",
      payment_status: "paid",
      payment_transaction_id: charge.transId,
      status: "pending",
      customer_notes: payload.form.customer_notes || null,
      discount_usd,
      coupon_code: appliedCoupon?.code ?? null,
      ...attribution,
    };

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert(orderInsert)
      .select("id, order_number")
      .single();

    if (orderErr) {
      await logFailedOrder(supabase, payload, orderInsert, charge.transId, orderErr.message);
      throw orderErr;
    }

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(itemRows.map((row) => ({ ...row, order_id: order.id })));

    if (itemsErr) {
      console.error("order_items insert failed, rolling back order:", itemsErr);
      await supabase.from("orders").delete().eq("id", order.id);
      await logFailedOrder(supabase, payload, orderInsert, charge.transId, `order_items: ${itemsErr.message}`);
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

    // Close out any abandoned cart captured for this shopper.
    try {
      const { data: closed } = await supabase
        .from("abandoned_carts")
        .update({ recovered: true, recovered_order_id: order.id })
        .eq("email", String(orderInsert.email || "").toLowerCase())
        .eq("recovered", false)
        .select("*");
      for (const cart of closed ?? []) {
        await logCartEvent(supabase, cart.id, "recovered", {
          detail: order.id,
          valueUsd: Number(order.total_usd ?? cart.subtotal_usd ?? 0),
        });
        await syncCartToCrm(supabase, "cart_recovered", cart);
      }
    } catch (e) {
      console.error("abandoned cart close failed:", e);
    }

    // Fire-and-forget notifications
    try {
      await supabase.functions.invoke("send-order-emails", {
        body: { orderId: order.id, emailType: "order_placed" },
      });
    } catch (e) {
      console.error("send-order-emails threw:", e);
    }
    try {
      await supabase.functions.invoke("send-sms", {
        body: { orderId: order.id, smsType: "order_placed" },
      });
      await supabase.functions.invoke("send-sms", {
        body: { orderId: order.id, smsType: "admin_new_order" },
      });
    } catch (e) {
      console.error("send-sms threw:", e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        order_number: order.order_number,
        transaction_id: charge.transId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("authnet-charge error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Checkout failed." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

async function logFailedOrder(
  supabase: any,
  payload: CheckoutPayload,
  orderInsert: any,
  transactionId: string,
  errorMessage: string,
) {
  console.error(
    "\n========================================================\n" +
      "🚨 AUTHORIZE.NET CHARGED BUT ORDER SAVE FAILED 🚨\n" +
      `Authorize.net Transaction ID: ${transactionId}\n` +
      `Customer Email:               ${payload.form?.email}\n` +
      `Amount USD:                   ${orderInsert?.total_usd}\n` +
      `Error:                        ${errorMessage}\n` +
      "Email info@mountkailashslu.com to refund or fulfill manually.\n" +
      "========================================================\n",
  );
  try {
    await supabase.from("failed_order_alerts").insert({
      paypal_capture_id: transactionId,
      paypal_order_id: null,
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
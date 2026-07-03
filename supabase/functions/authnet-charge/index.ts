import { createClient } from "npm:@supabase/supabase-js@2";
import { chargeCard, splitName, type OpaqueData } from "../_shared/authnet.ts";

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
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = (await req.json()) as CheckoutPayload;

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

    // Re-fetch authoritative pricing
    const productIds = [...new Set(payload.items.map((i) => i.product_id))];
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price_usd, price_xcd, is_digital")
      .in("id", productIds);
    if (prodErr) throw prodErr;
    if (!products || products.length !== productIds.length) {
      throw new Error("One or more cart items are no longer available.");
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
    const total_usd = +(subtotal_usd + shipping_usd).toFixed(2);
    const total_xcd = +(subtotal_xcd + shipping_xcd).toFixed(2);

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
        email: payload.form.email.toLowerCase().trim().slice(0, 255),
        phoneNumber: (payload.form.phone || "").slice(0, 25) || undefined,
      },
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
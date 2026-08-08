/** Private, token-gated retreat checkout.
 *
 *  The Fortification Retreat is withdrawn from public sale. The only way to pay
 *  is with a single-use token minted by wce-retreat-approve after a human
 *  review. This function verifies that token and, on success, charges the card
 *  and records a normal order carrying the applicant's original attribution.
 *
 *  Purchase measurement fires only after a successful charge — never on the
 *  application itself.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { chargeCard, splitName, type OpaqueData } from "../_shared/authnet.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const TOKEN_RE = /^[a-f0-9]{64}$/;
const EXCHANGE = 2.7;

interface Payload {
  action: "verify" | "pay";
  token: string;
  opaqueData?: OpaqueData;
  phone?: string;
  country?: string;
  notes?: string;
}

/** Everything the checkout page and the charge path both need. */
async function resolveToken(admin: ReturnType<typeof createClient>, token: string) {
  const { data: lead } = await admin
    .from("wce_leads")
    .select(
      "id, full_name, email, whatsapp, country, application_status, checkout_token_expires_at, checkout_token_used_at, paid_at, order_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term, referral_code, landing_path, referrer, meta_event_ids",
    )
    .eq("checkout_token", token)
    .maybeSingle();

  if (!lead) return { error: "This payment link is not valid. Please contact us for a new one." as string };
  if (lead.application_status !== "approved") {
    return { error: "This payment link is no longer active. Please contact us for a new one." };
  }
  if (lead.paid_at || lead.checkout_token_used_at) {
    return { error: "This payment link has already been used. Your place is confirmed." };
  }
  if (lead.checkout_token_expires_at && new Date(lead.checkout_token_expires_at).getTime() < Date.now()) {
    return { error: "This payment link has expired. Please contact us for a new one." };
  }

  const { data: settings } = await admin
    .from("wce_settings").select("retreat_product_id").limit(1).maybeSingle();
  if (!settings?.retreat_product_id) return { error: "Retreat checkout is not configured yet." };

  const { data: product } = await admin
    .from("products")
    .select("id, name, price_usd, price_xcd")
    .eq("id", settings.retreat_product_id)
    .maybeSingle();
  if (!product) return { error: "Retreat checkout is not configured yet." };

  return { lead, product };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = (await req.json()) as Payload;
    const token = (payload?.token ?? "").trim().toLowerCase();
    if (!TOKEN_RE.test(token)) return json({ error: "This payment link is not valid." }, 400);
    if (payload.action !== "verify" && payload.action !== "pay") {
      return json({ error: "Invalid request" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const resolved = await resolveToken(admin, token);
    if ("error" in resolved) return json({ error: resolved.error }, 403);
    const { lead, product } = resolved;

    const price_usd = Number(product.price_usd);
    const price_xcd = Number(product.price_xcd ?? +(price_usd * EXCHANGE).toFixed(2));

    if (payload.action === "verify") {
      return json({
        ok: true,
        applicant: { full_name: lead.full_name, email: lead.email, country: lead.country },
        product: { name: product.name, price_usd, price_xcd },
        expires_at: lead.checkout_token_expires_at,
      });
    }

    /* ---- pay ---- */
    if (!payload.opaqueData?.dataValue) return json({ error: "Missing payment details." }, 400);

    const { firstName, lastName } = splitName(lead.full_name);
    const charge = await chargeCard({
      amount: price_usd,
      opaqueData: payload.opaqueData,
      description: "WCE 2026 Fortification Retreat",
      billTo: {
        firstName,
        lastName,
        country: (payload.country || lead.country || "LC").slice(0, 60),
        phoneNumber: (payload.phone || lead.whatsapp || "").replace(/[^\d+\-() ]/g, "").slice(0, 25) || undefined,
      },
      customerEmail: lead.email.toLowerCase().trim(),
    });

    const orderInsert = {
      customer_name: lead.full_name,
      email: lead.email.toLowerCase().trim(),
      phone: payload.phone || lead.whatsapp || null,
      delivery_type: "pickup",
      address_line1: "Mount Kailash Rejuvenation Centre",
      city: "Soufrière",
      country: payload.country || lead.country || "LC",
      subtotal_usd: price_usd,
      subtotal_xcd: price_xcd,
      shipping_usd: 0,
      shipping_xcd: 0,
      total_usd: price_usd,
      total_xcd: price_xcd,
      currency_used: "USD",
      payment_method: "authorize_net",
      payment_status: "paid",
      payment_transaction_id: charge.transId,
      status: "pending",
      customer_notes: payload.notes?.slice(0, 1000) || null,
      utm_source: lead.utm_source,
      utm_medium: lead.utm_medium,
      utm_campaign: lead.utm_campaign,
      utm_content: lead.utm_content,
      utm_term: lead.utm_term,
      referral_code: lead.referral_code,
      landing_path: lead.landing_path,
      referrer: lead.referrer,
    };

    const { data: order, error: orderErr } = await admin
      .from("orders").insert(orderInsert).select("id, order_number").single();
    if (orderErr) {
      await admin.from("failed_order_alerts").insert({
        customer_name: lead.full_name,
        customer_email: lead.email,
        amount_usd: price_usd,
        paypal_capture_id: charge.transId,
        error_message: `wce retreat order insert: ${orderErr.message}`,
      });
      return json({ error: "Your payment went through but we could not save the booking. Our team has been alerted." }, 500);
    }

    await admin.from("order_items").insert({
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      price_usd,
      price_xcd,
    });

    // Burn the token so the link cannot be replayed.
    await admin.from("wce_leads").update({
      application_status: "paid",
      checkout_token: null,
      checkout_token_used_at: new Date().toISOString(),
      paid_at: new Date().toISOString(),
      order_id: order.id,
    }).eq("id", lead.id);

    return json({
      ok: true,
      order_id: order.id,
      order_number: order.order_number,
      transaction_id: charge.transId,
      amount_usd: price_usd,
    });
  } catch (e) {
    console.error("wce-retreat-checkout error", e);
    return json({ error: e instanceof Error ? e.message : "Payment could not be completed." }, 400);
  }
});

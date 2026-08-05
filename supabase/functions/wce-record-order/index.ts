// Records a completed purchase for the WCE revenue view and increments the
// referral code's use count. Used by the site checkout after an order is
// created, so attribution survives regardless of which payment path ran.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  findActiveReferralCode,
  markReferralUsed,
  recordWceOrder,
  sanitizeAttribution,
  wooCouponExists,
} from "../_shared/wce-attribution.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const str = (v: unknown, max: number) =>
      typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

    const orderNumber = str(body.order_number, 60);
    if (!orderNumber) return json({ error: "order_number is required" }, 400);

    const email = str(body.email, 255);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Invalid email" }, 400);
    }

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000) {
      return json({ error: "Invalid amount" }, 400);
    }

    const attribution = sanitizeAttribution(body.attribution);
    const referralCode = str(body.referral_code, 60)?.toUpperCase() ?? null;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let wooCouponFound = false;
    let referralRow: any = null;
    if (referralCode) {
      referralRow = await findActiveReferralCode(admin, referralCode);
      const wooKey = Deno.env.get("WOO_CONSUMER_KEY");
      const wooSecret = Deno.env.get("WOO_CONSUMER_SECRET");
      const wooUrl = Deno.env.get("WOO_STORE_URL");
      if (wooKey && wooSecret && wooUrl) {
        const normalized = wooUrl.trim().replace(/\/+$/, "").replace(/\/wp-json(\/wc\/v3)?$/, "");
        wooCouponFound = await wooCouponExists(normalized, wooKey, wooSecret, referralCode);
      }
    }

    await recordWceOrder(admin, {
      woo_order_id: Number.isFinite(Number(body.woo_order_id)) ? Number(body.woo_order_id) : null,
      order_number: orderNumber,
      email,
      pathway_key: str(body.pathway_key, 60),
      amount,
      currency: str(body.currency, 8) || "USD",
      referral_code: referralCode,
      status: str(body.status, 40) || "paid",
      attribution,
    });

    if (referralRow) await markReferralUsed(admin, referralRow, wooCouponFound);

    return json({ success: true, coupon_applied: wooCouponFound });
  } catch (error) {
    console.error("wce-record-order error:", error);
    return json({ error: "Failed to record order" }, 500);
  }
});

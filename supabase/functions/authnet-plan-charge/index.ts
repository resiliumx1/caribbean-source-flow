import { createClient } from "npm:@supabase/supabase-js@2";
import { chargeCard, splitName, type OpaqueData } from "../_shared/authnet.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { planId, requestedAmount, opaqueData, cardholderName, billingZip, email } =
      (await req.json()) as {
        planId: string;
        requestedAmount: number;
        opaqueData: OpaqueData;
        cardholderName?: string;
        billingZip?: string;
        email?: string;
      };

    if (!planId) throw new Error("planId required");
    if (!opaqueData?.dataValue) throw new Error("Missing payment token.");
    const zip = String(billingZip ?? "").trim();
    if (!zip) throw new Error("Billing zip / postal code is required.");
    const reqAmt = Number(requestedAmount);
    if (!Number.isFinite(reqAmt) || reqAmt <= 0) throw new Error("Invalid amount");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: plan, error } = await supabase
      .from("payment_plans").select("*").eq("id", planId).maybeSingle();
    if (error) throw error;
    if (!plan) throw new Error("Plan not found");
    if (plan.archived_at) throw new Error("This payment plan is no longer available.");
    if (plan.status !== "active") throw new Error("Plan is not active");

    const remaining = Number(plan.balance_remaining);
    if (remaining <= 0) throw new Error("Plan already paid in full");

    const min = Number(plan.min_payment ?? 1);
    const amount = +Math.min(reqAmt, remaining).toFixed(2);
    if (amount < min && amount < remaining) {
      throw new Error(`Minimum payment is $${min.toFixed(2)}`);
    }

    const { firstName, lastName } = splitName(cardholderName || plan.customer_name);
    const charge = await chargeCard({
      amount,
      opaqueData,
      description: `${plan.package_name} — payment`,
      billTo: {
        firstName,
        lastName,
        zip: zip.slice(0, 20),
      },
      customerEmail: (email || "").toLowerCase().trim() || undefined,
    });

    // Idempotent write
    const { data: existing } = await supabase
      .from("payments").select("id").eq("paypal_capture_id", charge.transId).maybeSingle();

    let updatedPlan;
    if (existing) {
      const { data } = await supabase.from("payment_plans").select("*").eq("id", planId).maybeSingle();
      updatedPlan = data;
    } else {
      const { error: insErr } = await supabase
        .from("payments")
        .insert({
          plan_id: planId,
          amount,
          paypal_capture_id: charge.transId,
          type: "payment",
          status: "succeeded",
          card_last4: String(charge.accountNumber ?? "").replace(/[^0-9]/g, "").slice(-4) || null,
          card_type: charge.accountType || null,
        });
      if (insErr && !String(insErr.message || "").toLowerCase().includes("duplicate")) throw insErr;

      const { data: applied, error: applyErr } = await supabase.rpc("apply_payment", {
        p_plan_id: planId,
        p_amount: amount,
      });
      if (applyErr) throw applyErr;
      updatedPlan = Array.isArray(applied) ? applied[0] : applied;
    }

    return new Response(
      JSON.stringify({
        success: true,
        captureId: charge.transId,
        amount,
        plan: updatedPlan,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("authnet-plan-charge error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
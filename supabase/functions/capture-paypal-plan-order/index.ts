import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PAYPAL_BASE = "https://api-m.paypal.com";
const PAYPAL_CLIENT_ID =
  "ARA5I0pb-Sr8CDj3wiliKf-qILV9wMuX0YRNaBFbBsVld88v2CWs2ILHegOPuLfizo2G-czuNEyHje0L";

async function getAccessToken(): Promise<string> {
  const secret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  if (!secret) throw new Error("PAYPAL_CLIENT_SECRET missing");
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${secret}`);
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal token error: ${res.status}`);
  const json = await res.json();
  return json.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { orderID } = await req.json();
    if (!orderID) throw new Error("orderID required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = await getAccessToken();
    const capRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const capJson = await capRes.json();
    if (!capRes.ok) {
      // 422 with ORDER_ALREADY_CAPTURED — fetch the order to read capture
      console.error("Capture error:", capRes.status, capJson);
      throw new Error(capJson?.message || `Capture failed (${capRes.status})`);
    }

    const pu = capJson?.purchase_units?.[0];
    const cap = pu?.payments?.captures?.[0];
    if (!cap?.id) throw new Error("No capture in PayPal response");

    const captureId = cap.id as string;
    const amount = Number(cap.amount?.value ?? 0);
    const planId = (pu?.custom_id ?? pu?.reference_id) as string;
    if (!planId) throw new Error("Missing plan id on capture");
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid capture amount");

    // Idempotent: if a payment with this capture id exists, just return current plan.
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("paypal_capture_id", captureId)
      .maybeSingle();

    let updatedPlan;
    if (existing) {
      const { data } = await supabase.from("payment_plans").select("*").eq("id", planId).maybeSingle();
      updatedPlan = data;
    } else {
      const { error: insErr } = await supabase
        .from("payments")
        .insert({ plan_id: planId, amount, paypal_capture_id: captureId });
      if (insErr) {
        // Race: another concurrent capture inserted — treat as success
        if (!String(insErr.message || "").toLowerCase().includes("duplicate")) throw insErr;
      } else {
        const { data: applied, error: applyErr } = await supabase.rpc("apply_payment", {
          p_plan_id: planId,
          p_amount: amount,
        });
        if (applyErr) throw applyErr;
        updatedPlan = Array.isArray(applied) ? applied[0] : applied;
      }
      if (!updatedPlan) {
        const { data } = await supabase.from("payment_plans").select("*").eq("id", planId).maybeSingle();
        updatedPlan = data;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        captureId,
        amount,
        plan: updatedPlan,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("capture-paypal-plan-order error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
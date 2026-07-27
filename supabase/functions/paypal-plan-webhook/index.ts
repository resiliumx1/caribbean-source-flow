import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const logWebhookFailure = async (errorName: string, message: string, payload: unknown) => {
    try {
      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      await admin.from("payment_attempts").insert({
        stage: "webhook_paypal_plan",
        error_name: errorName,
        error_message: message,
        payload: payload ?? null,
      });
    } catch (e) {
      console.error("Failed to log webhook failure:", e);
    }
  };

  try {
    const event = await req.json();
    const eventType = event?.event_type as string | undefined;

    if (eventType !== "PAYMENT.CAPTURE.COMPLETED") {
      return new Response(JSON.stringify({ ignored: true, eventType }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resource = event.resource;
    const captureId = resource?.id as string | undefined;
    const amount = Number(resource?.amount?.value ?? 0);
    const planId = (resource?.custom_id ?? resource?.supplementary_data?.related_ids?.custom_id) as string | undefined;

    if (!captureId || !planId || !(amount > 0)) {
      await logWebhookFailure("MissingCaptureData", "Webhook received without capture id, plan id or amount", event);
      return new Response(JSON.stringify({ error: "Missing capture data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("paypal_capture_id", captureId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ ok: true, idempotent: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insErr } = await supabase
      .from("payments")
      .insert({ plan_id: planId, amount, paypal_capture_id: captureId });
    if (insErr && !String(insErr.message || "").toLowerCase().includes("duplicate")) {
      throw insErr;
    }
    if (!insErr) {
      const { error: applyErr } = await supabase.rpc("apply_payment", {
        p_plan_id: planId,
        p_amount: amount,
      });
      if (applyErr) throw applyErr;
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("paypal-plan-webhook error:", err);
    await logWebhookFailure("WebhookProcessingError", (err as Error).message, null);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
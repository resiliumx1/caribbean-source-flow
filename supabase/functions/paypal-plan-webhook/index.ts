import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYPAL_BASE = "https://api-m.paypal.com";
const PAYPAL_CLIENT_ID =
  "ARA5I0pb-Sr8CDj3wiliKf-qILV9wMuX0YRNaBFbBsVld88v2CWs2ILHegOPuLfizo2G-czuNEyHje0L";

async function paypalToken(): Promise<string> {
  const secret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  if (!secret) throw new Error("PAYPAL_CLIENT_SECRET is not configured.");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status}).`);
  const { access_token } = await res.json();
  return access_token as string;
}

/**
 * Never trust the webhook body. Re-fetch the capture from PayPal and confirm it
 * completed, is in USD, matches the claimed amount, and belongs to this plan.
 */
async function verifyCapture(captureId: string, planId: string, amount: number) {
  const token = await paypalToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/payments/captures/${captureId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`PayPal capture lookup failed (${res.status}).`);
  const capture = await res.json();
  if (capture?.status !== "COMPLETED") {
    throw new Error(`Capture status is ${capture?.status ?? "unknown"}, expected COMPLETED.`);
  }
  if ((capture?.amount?.currency_code ?? "USD") !== "USD") {
    throw new Error(`Unexpected capture currency ${capture?.amount?.currency_code}.`);
  }
  const captured = Number(capture?.amount?.value ?? 0);
  if (!Number.isFinite(captured) || Math.abs(captured - amount) > 0.05) {
    throw new Error(`Capture amount mismatch (got ${captured}, expected ${amount}).`);
  }
  const customId = capture?.custom_id ??
    capture?.supplementary_data?.related_ids?.custom_id;
  if (customId !== planId) {
    throw new Error("Capture custom_id does not match the plan id.");
  }
  return captured;
}

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
      .insert({ plan_id: planId, amount: verifiedAmount, paypal_capture_id: captureId });
    if (insErr && !String(insErr.message || "").toLowerCase().includes("duplicate")) {
      throw insErr;
    }
    if (!insErr) {
      const { error: applyErr } = await supabase.rpc("apply_payment", {
        p_plan_id: planId,
        p_amount: verifiedAmount,
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
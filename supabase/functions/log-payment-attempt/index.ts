import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const row = {
      stage: String(body?.stage ?? "paypal_sdk_error").slice(0, 64),
      error_name: body?.error_name ? String(body.error_name).slice(0, 200) : null,
      error_message: body?.error_message ? String(body.error_message).slice(0, 2000) : null,
      paypal_debug_id: body?.paypal_debug_id ? String(body.paypal_debug_id).slice(0, 200) : null,
      paypal_order_id: body?.paypal_order_id ? String(body.paypal_order_id).slice(0, 200) : null,
      cart_total_usd: Number.isFinite(body?.cart_total_usd) ? Number(body.cart_total_usd) : null,
      customer_email: body?.customer_email ? String(body.customer_email).slice(0, 255) : null,
      user_agent: (req.headers.get("user-agent") || "").slice(0, 500) || null,
      payload: body?.payload ?? null,
    };

    const { error } = await supabase.from("payment_attempts").insert(row);
    if (error) {
      console.error("payment_attempts insert failed:", error);
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("log-payment-attempt error:", err);
    return new Response(JSON.stringify({ ok: false, error: err?.message || "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
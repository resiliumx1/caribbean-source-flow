import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const planId = url.searchParams.get("planId") ?? (await req.json().catch(() => ({}))).planId;
    if (!planId || !/^[0-9a-f-]{36}$/i.test(String(planId))) {
      return new Response(JSON.stringify({ error: "Invalid planId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data, error } = await supabase
      .from("payment_plans")
      .select("id,customer_name,customer_email,package_name,total_amount,amount_paid,balance_remaining,min_payment,status,archived_at")
      .eq("id", planId)
      .maybeSingle();
    if (error || !data || data.archived_at) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: schedule } = await supabase
      .from("plan_billing_schedules")
      .select("id,amount,cadence,status,next_run_date")
      .eq("plan_id", planId)
      .eq("status", "active")
      .maybeSingle();

    const { archived_at: _archived, ...plan } = data as Record<string, unknown>;
    return new Response(JSON.stringify({ plan, schedule: schedule ?? null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
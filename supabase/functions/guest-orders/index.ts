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
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .order("created_at", { ascending: false })
      .limit(20);

    if (ordersError) throw ordersError;

    let orderItems: Record<string, any[]> = {};
    if (orders && orders.length > 0) {
      const ids = orders.map((o: any) => o.id);
      const { data: items } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", ids);
      if (items) {
        items.forEach((item: any) => {
          if (!orderItems[item.order_id]) orderItems[item.order_id] = [];
          orderItems[item.order_id].push(item);
        });
      }
    }

    return new Response(
      JSON.stringify({ orders: orders || [], orderItems }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

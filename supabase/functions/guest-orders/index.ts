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
    const { email, order_number } = await req.json();
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

    // ------------------------------------------------------------------
    // Anti-enumeration gate:
    //   - If the request carries a valid auth JWT whose email matches the
    //     requested email, return all orders for that email.
    //   - Otherwise (guest), require BOTH email AND a specific order_number
    //     so a random visitor cannot enumerate orders by guessing an email.
    // ------------------------------------------------------------------
    let isOwner = false;
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization") || "";
    if (authHeader.toLowerCase().startsWith("bearer ")) {
      const token = authHeader.slice(7).trim();
      if (token && token.split(".").length === 3) {
        const { data: userData } = await supabase.auth.getUser(token);
        const userEmail = userData?.user?.email?.toLowerCase().trim() || "";
        if (userEmail && userEmail === email.toLowerCase().trim()) {
          isOwner = true;
        }
      }
    }

    const normalizedOrderNumber =
      typeof order_number === "string" ? order_number.trim() : "";

    if (!isOwner && !normalizedOrderNumber) {
      return new Response(
        JSON.stringify({
          error: "Order number required for guest lookup",
          code: "order_number_required",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let query = supabase
      .from("orders")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .order("created_at", { ascending: false })
      .limit(20);
    if (!isOwner) {
      query = query.eq("order_number", normalizedOrderNumber);
    }
    const { data: orders, error: ordersError } = await query;

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
    console.error("guest-orders error:", err);
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

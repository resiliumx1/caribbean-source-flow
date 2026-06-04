import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the Mount Kailash Rejuvenation Centre ADMIN assistant. You serve internal staff only — never customers.

Your job:
- Help staff navigate the admin section and understand what each tab does.
- Look up orders, products, and notifications using the provided tools.
- Explain order status, totals, customer, items, and where it sits in the fulfillment pipeline.
- Point staff at the right admin tab when relevant.

Admin tabs you can reference:
- Orders — view/manage all customer orders, fulfillment status, tracking, refunds.
- Products — manage product catalog, variants, pricing, stock status.
- Retreats — manage retreat types and offerings.
- Retreat Dates — schedule specific retreat sessions and capacity.
- Reviews — moderate customer reviews (approve/reject).
- Webinars — manage webinar video library.
- Analytics — view chat analytics and store activity.
- Notifications — see new orders, payments, stock alerts.

Rules:
- You are READ-ONLY. Never offer to change, cancel, refund, ship, or modify anything. Tell staff which tab to use instead.
- Always use tools to look up specific orders/products rather than guessing.
- When citing an order, always include its order number and current fulfillment + payment status.
- Be concise. Staff are busy. No marketing fluff, no emojis unless useful, no medical advice.
- If you don't know, say so.`;

const TOOLS = [
  {
    name: "search_orders",
    description: "Search recent orders by customer name, email, phone, or order number. Returns up to `limit` matches.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search text matched against order_number, customer_name, email, phone." },
        status: { type: "string", description: "Optional fulfillment_status filter (e.g. pending, shipped, delivered, cancelled)." },
        payment_status: { type: "string", description: "Optional payment_status filter (e.g. pending, paid, refunded)." },
        limit: { type: "number", description: "Max results, default 10, cap 25." },
      },
    },
  },
  {
    name: "get_order",
    description: "Fetch full detail for a single order by order_number (e.g. MK-20260604-1234). Includes line items and latest status history.",
    input_schema: {
      type: "object",
      properties: { order_number: { type: "string" } },
      required: ["order_number"],
    },
  },
  {
    name: "count_orders_by_status",
    description: "Count orders grouped by status, payment_status, or fulfillment_status.",
    input_schema: {
      type: "object",
      properties: {
        group_by: { type: "string", enum: ["status", "payment_status", "fulfillment_status"] },
      },
      required: ["group_by"],
    },
  },
  {
    name: "get_product",
    description: "Look up a product by slug or name (partial match).",
    input_schema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        name: { type: "string" },
      },
    },
  },
  {
    name: "recent_notifications",
    description: "Get the most recent admin notifications.",
    input_schema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max results, default 10, cap 25." },
        unread_only: { type: "boolean" },
      },
    },
  },
];

async function runTool(name: string, input: any, admin: ReturnType<typeof createClient>) {
  try {
    if (name === "search_orders") {
      const limit = Math.min(Math.max(Number(input?.limit) || 10, 1), 25);
      let q = admin.from("orders").select(
        "order_number, customer_name, email, phone, status, payment_status, fulfillment_status, total_usd, currency_used, created_at"
      ).order("created_at", { ascending: false }).limit(limit);
      if (input?.status) q = q.eq("fulfillment_status", input.status);
      if (input?.payment_status) q = q.eq("payment_status", input.payment_status);
      if (input?.query) {
        const s = String(input.query).replace(/[%,]/g, "");
        q = q.or(`order_number.ilike.%${s}%,customer_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return { orders: data ?? [] };
    }
    if (name === "get_order") {
      const { data: order, error } = await admin.from("orders").select("*").eq("order_number", input.order_number).maybeSingle();
      if (error) throw error;
      if (!order) return { error: "Order not found" };
      const { data: items } = await admin.from("order_items").select("product_name, quantity, price_usd").eq("order_id", order.id);
      const { data: history } = await admin
        .from("order_status_history")
        .select("status, previous_status, created_at")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return { order, items: items ?? [], history: history ?? [] };
    }
    if (name === "count_orders_by_status") {
      const col = input.group_by;
      if (!["status", "payment_status", "fulfillment_status"].includes(col)) return { error: "Invalid group_by" };
      const { data, error } = await admin.from("orders").select(col);
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        const k = (row as any)[col] ?? "null";
        counts[k] = (counts[k] ?? 0) + 1;
      }
      return { group_by: col, counts };
    }
    if (name === "get_product") {
      let q = admin.from("products").select("id, name, slug, price_usd, stock_status, is_active, short_description, badge").limit(5);
      if (input?.slug) q = q.eq("slug", input.slug);
      else if (input?.name) q = q.ilike("name", `%${String(input.name).replace(/%/g, "")}%`);
      else return { error: "Provide slug or name" };
      const { data, error } = await q;
      if (error) throw error;
      return { products: data ?? [] };
    }
    if (name === "recent_notifications") {
      const limit = Math.min(Math.max(Number(input?.limit) || 10, 1), 25);
      let q = admin.from("notifications").select("type, title, body, is_read, created_at").order("created_at", { ascending: false }).limit(limit);
      if (input?.unread_only) q = q.eq("is_read", false);
      const { data, error } = await q;
      if (error) throw error;
      return { notifications: data ?? [] };
    }
    return { error: `Unknown tool ${name}` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.claims.sub;

    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: profile } = await admin.from("profiles").select("is_admin").eq("id", userId).maybeSingle();
    if (!profile?.is_admin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : null;
    if (!messages) {
      return new Response(JSON.stringify({ error: "messages required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    for (const m of messages) {
      if (!m?.role || !["user", "assistant"].includes(m.role)) {
        return new Response(JSON.stringify({ error: "Invalid role" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (typeof m.content !== "string" && !Array.isArray(m.content)) {
        return new Response(JSON.stringify({ error: "Invalid content" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const ANTHROPIC_KEY = Deno.env.get("VITE_ANTHROPIC_API_KEY") || Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_KEY) {
      return new Response(JSON.stringify({ error: "Assistant not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Tool-use loop (non-streaming for tool rounds, stream the final answer)
    const convo: any[] = [...messages];
    const MAX_ROUNDS = 6;

    for (let round = 0; round < MAX_ROUNDS; round++) {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-latest",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          tools: TOOLS,
          messages: convo,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("Anthropic error", resp.status, errText);
        return new Response(JSON.stringify({ error: "Assistant temporarily unavailable" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await resp.json();
      const stopReason = data.stop_reason;
      const content = data.content || [];

      if (stopReason === "tool_use") {
        // Append assistant message with tool_use blocks
        convo.push({ role: "assistant", content });
        const toolResults: any[] = [];
        for (const block of content) {
          if (block.type === "tool_use") {
            const result = await runTool(block.name, block.input, admin);
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify(result).slice(0, 12000),
            });
          }
        }
        convo.push({ role: "user", content: toolResults });
        continue;
      }

      // Final text response — return as plain text
      const text = content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("");
      return new Response(JSON.stringify({ text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ text: "I had to stop after several tool lookups without a final answer. Try rephrasing or asking a narrower question." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-assistant error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
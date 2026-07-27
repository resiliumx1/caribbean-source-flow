import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const admin = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

const UUID = /^[0-9a-f-]{36}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = admin();

    // GET ?cartId=... → items for a recovery link (no PII returned)
    if (req.method === "GET") {
      const cartId = new URL(req.url).searchParams.get("cartId") ?? "";
      if (!UUID.test(cartId)) return json({ error: "Invalid cart id" }, 400);
      const { data } = await supabase
        .from("abandoned_carts")
        .select("id, items, recovered")
        .eq("id", cartId)
        .maybeSingle();
      if (!data) return json({ error: "Not found" }, 404);
      return json({ cart: { id: data.id, items: data.items, recovered: data.recovered } });
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Invalid email" }, 400);

    const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
    if (!items.length) return json({ error: "No items" }, 400);

    const subtotal = Number(body.subtotal_usd);
    const row = {
      email,
      customer_name: String(body.customer_name ?? "").slice(0, 200) || null,
      phone: String(body.phone ?? "").slice(0, 40) || null,
      user_id: UUID.test(String(body.user_id ?? "")) ? body.user_id : null,
      items,
      subtotal_usd: Number.isFinite(subtotal) && subtotal > 0 ? +subtotal.toFixed(2) : 0,
      last_seen_at: new Date().toISOString(),
    };

    // One open cart per email — refresh it instead of piling up rows.
    const { data: existing } = await supabase
      .from("abandoned_carts")
      .select("id")
      .eq("email", email)
      .eq("recovered", false)
      .order("last_seen_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from("abandoned_carts").update(row).eq("id", existing.id);
      if (error) throw error;
      return json({ id: existing.id });
    }

    const { data: inserted, error } = await supabase
      .from("abandoned_carts")
      .insert(row)
      .select("id")
      .single();
    if (error) throw error;
    return json({ id: inserted.id });
  } catch (e) {
    console.error("capture-abandoned-cart error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});

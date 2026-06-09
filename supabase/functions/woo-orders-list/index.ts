import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) return json({ error: "Unauthorized" }, 401);

    const userId = claimsData.claims.sub;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profile } = await adminClient
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();
    if (!profile?.is_admin) return json({ error: "Admin access required" }, 403);

    // Woo creds
    const wooKey = Deno.env.get("WOO_CONSUMER_KEY");
    const wooSecret = Deno.env.get("WOO_CONSUMER_SECRET");
    const wooUrl = Deno.env.get("WOO_STORE_URL");
    if (!wooKey || !wooSecret || !wooUrl) {
      return json({ error: "WooCommerce credentials not configured" }, 500);
    }

    const normalizedUrl = wooUrl.trim().replace(/\/+$/, "").replace(/\/wp-json(\/wc\/v3)?$/, "");
    const baseApi = `${normalizedUrl}/wp-json/wc/v3`;

    // Params
    let params: Record<string, string> = {};
    if (req.method === "POST") {
      try { params = (await req.json()) ?? {}; } catch { /* ignore */ }
    } else {
      const u = new URL(req.url);
      u.searchParams.forEach((v, k) => { params[k] = v; });
    }

    const now = new Date();
    const defaultAfter = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();

    const qp = new URLSearchParams();
    qp.set("after", String(params.after || defaultAfter));
    if (params.before) qp.set("before", String(params.before));
    if (params.status && params.status !== "any") qp.set("status", String(params.status));
    if (params.search) qp.set("search", String(params.search));
    qp.set("per_page", String(Math.min(Number(params.per_page) || 50, 100)));
    qp.set("page", String(Math.max(Number(params.page) || 1, 1)));
    qp.set("orderby", "date");
    qp.set("order", "desc");

    const auth = "Basic " + btoa(`${wooKey}:${wooSecret}`);
    const url = `${baseApi}/orders?${qp.toString()}`;
    const res = await fetch(url, { headers: { Authorization: auth } });

    if (!res.ok) {
      const text = await res.text();
      return json({ error: `WooCommerce error ${res.status}`, details: text.slice(0, 500) }, 502);
    }

    const totalPages = Number(res.headers.get("X-WP-TotalPages") || "1");
    const totalCount = Number(res.headers.get("X-WP-Total") || "0");
    const data = await res.json();

    const orders = (data as any[]).map((o) => ({
      id: o.id,
      number: o.number,
      date_created: o.date_created,
      status: o.status,
      total: o.total,
      currency: o.currency,
      payment_method_title: o.payment_method_title,
      transaction_id: o.transaction_id,
      customer_note: o.customer_note,
      billing: o.billing,
      shipping: o.shipping,
      line_items: (o.line_items || []).map((li: any) => ({
        id: li.id,
        name: li.name,
        quantity: li.quantity,
        total: li.total,
        sku: li.sku,
      })),
    }));

    return json({ orders, totalPages, totalCount });
  } catch (e) {
    console.error("woo-orders-list error", e);
    return json({ error: (e as Error).message || "Unknown error" }, 500);
  }
});

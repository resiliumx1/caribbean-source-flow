// Site-wide search. One round trip: every group is queried in parallel and the
// grouped result set is returned already trimmed to the per-group limit.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const PER_GROUP = 5;

type Hit = {
  id: string;
  title: string;
  subtitle?: string | null;
  url: string;
  image?: string | null;
  price_usd?: number | null;
  price_xcd?: number | null;
  meta?: string | null;
};

type Group = { key: string; label: string; hits: Hit[]; total: number; seeAll: string | null };

/** PostgREST `or` needs the pattern escaped: commas and parens break the filter. */
function safePattern(q: string) {
  return `%${q.replace(/[,()\\*]/g, " ").trim()}%`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const url = new URL(req.url);
    let q = (url.searchParams.get("q") ?? "").trim();
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (typeof body?.q === "string") q = body.q.trim();
    }

    if (q.length < 2) return json({ query: q, groups: [] });
    if (q.length > 80) q = q.slice(0, 80);
    const pattern = safePattern(q);
    if (pattern === "%%") return json({ query: q, groups: [] });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const encoded = encodeURIComponent(q);

    const [products, consultations, retreats, webinars, articles] = await Promise.all([
      supabase
        .from("products")
        .select("id,name,slug,short_description,image_url,price_usd,price_xcd,product_categories!products_category_id_fkey(name)", { count: "exact" })
        .eq("is_active", true)
        .or(`name.ilike.${pattern},short_description.ilike.${pattern},description.ilike.${pattern}`)
        .order("is_featured", { ascending: false })
        .limit(PER_GROUP),
      supabase
        .from("consultation_services")
        .select("id,name,slug,description,image_url,price_usd,price_xcd", { count: "exact" })
        .eq("is_active", true)
        .or(`name.ilike.${pattern},description.ilike.${pattern},long_description.ilike.${pattern}`)
        .order("display_order")
        .limit(PER_GROUP),
      supabase
        .from("retreat_types")
        .select("id,name,slug,description,image_url,base_price_usd", { count: "exact" })
        .eq("is_active", true)
        .or(`name.ilike.${pattern},description.ilike.${pattern}`)
        .limit(PER_GROUP),
      supabase
        .from("webinar_videos")
        .select("id,title,description,thumbnail_url,category,youtube_video_id", { count: "exact" })
        .or(`title.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern}`)
        .order("published_at", { ascending: false })
        .limit(PER_GROUP),
      supabase
        .from("articles")
        .select("id,title,slug,excerpt", { count: "exact" })
        .eq("is_published", true)
        .or(`title.ilike.${pattern},excerpt.ilike.${pattern},body_markdown.ilike.${pattern}`)
        .order("published_date", { ascending: false })
        .limit(PER_GROUP),
    ]);

    const groups: Group[] = [];

    const push = (
      key: string,
      label: string,
      res: { data: unknown[] | null; count: number | null; error: unknown },
      map: (row: any) => Hit,
      seeAll: string | null,
    ) => {
      if (res.error) {
        console.error(`site-search: ${key} failed`, res.error);
        return;
      }
      const hits = (res.data ?? []).map(map);
      if (!hits.length) return;
      const total = res.count ?? hits.length;
      groups.push({ key, label, hits, total, seeAll: total > hits.length ? seeAll : seeAll });
    };

    push("products", "Products", products as any, (p) => ({
      id: p.id,
      title: p.name,
      subtitle: p.short_description,
      url: `/shop/${p.slug}`,
      image: p.image_url,
      price_usd: p.price_usd,
      price_xcd: p.price_xcd,
      meta: p.product_categories?.name ?? null,
    }), `/shop?q=${encoded}`);

    push("consultations", "Consultations", consultations as any, (c) => ({
      id: c.id,
      title: c.name,
      subtitle: c.description,
      url: `/consultations`,
      image: c.image_url,
      price_usd: c.price_usd,
      price_xcd: c.price_xcd,
    }), `/consultations`);

    push("retreats", "Retreats", retreats as any, (r) => ({
      id: r.id,
      title: r.name,
      subtitle: r.description,
      url: `/retreats`,
      image: r.image_url,
      price_usd: r.base_price_usd,
    }), `/retreats`);

    push("webinars", "Webinars", webinars as any, (w) => ({
      id: w.id,
      title: w.title,
      subtitle: w.description,
      url: `/webinars`,
      image: w.thumbnail_url,
      meta: w.category,
    }), `/webinars`);

    push("articles", "Learn articles", articles as any, (a) => ({
      id: a.id,
      title: a.title,
      subtitle: a.excerpt,
      url: `/learn/${a.slug}`,
    }), `/learn?q=${encoded}`);

    return json({ query: q, groups });
  } catch (err) {
    console.error("site-search error", err);
    return json({ error: "Search is temporarily unavailable." }, 500);
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const XCD_RATE = 2.7;

interface WooProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  images: { src: string }[];
  categories: { id: number; name: string; slug: string }[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller is admin
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profile } = await adminClient
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (!profile?.is_admin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // WooCommerce credentials
    const wooKey = Deno.env.get("WOO_CONSUMER_KEY");
    const wooSecret = Deno.env.get("WOO_CONSUMER_SECRET");
    const wooUrl = Deno.env.get("WOO_STORE_URL");

    if (!wooKey || !wooSecret || !wooUrl) {
      return new Response(
        JSON.stringify({ error: "WooCommerce credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const baseApi = `${wooUrl}/wp-json/wc/v3`;

    // Fetch all products from WooCommerce (paginated)
    const allWooProducts: WooProduct[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = `${baseApi}/products?consumer_key=${encodeURIComponent(wooKey)}&consumer_secret=${encodeURIComponent(wooSecret)}&per_page=100&page=${page}&status=publish`;
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`WooCommerce API error [${res.status}]: ${body}`);
      }
      const products: WooProduct[] = await res.json();
      allWooProducts.push(...products);
      hasMore = products.length === 100;
      page++;
    }

    // Fetch existing categories from DB
    const { data: existingCategories } = await adminClient
      .from("product_categories")
      .select("id, slug, name");
    const categoryMap = new Map(
      (existingCategories || []).map((c) => [c.slug, c.id])
    );

    // Process each WooCommerce product
    let synced = 0;
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const woo of allWooProducts) {
      try {
        // Resolve category
        let categoryId: string | null = null;
        if (woo.categories.length > 0) {
          const wooCat = woo.categories[0];
          if (categoryMap.has(wooCat.slug)) {
            categoryId = categoryMap.get(wooCat.slug)!;
          } else {
            // Create new category
            const { data: newCat, error: catErr } = await adminClient
              .from("product_categories")
              .insert({ name: wooCat.name, slug: wooCat.slug })
              .select("id")
              .single();
            if (newCat && !catErr) {
              categoryId = newCat.id;
              categoryMap.set(wooCat.slug, newCat.id);
            }
          }
        }

        const priceUsd = parseFloat(woo.regular_price || woo.price) || 0;
        const priceXcd = Math.round(priceUsd * XCD_RATE * 100) / 100;
        const originalPriceUsd = woo.sale_price && woo.regular_price
          ? parseFloat(woo.regular_price) || null
          : null;
        const originalPriceXcd = originalPriceUsd
          ? Math.round(originalPriceUsd * XCD_RATE * 100) / 100
          : null;

        const stockStatus =
          woo.stock_status === "instock"
            ? "in_stock"
            : woo.stock_status === "onbackorder"
            ? "pre_order"
            : "out_of_stock";

        // Strip HTML tags from descriptions
        const stripHtml = (html: string) =>
          html.replace(/<[^>]*>/g, "").trim();

        const productData = {
          name: woo.name,
          slug: woo.slug,
          woo_product_id: woo.id,
          product_type: woo.type === "simple" ? "tincture" : woo.type,
          category_id: categoryId,
          price_usd: woo.sale_price ? parseFloat(woo.sale_price) : priceUsd,
          price_xcd: woo.sale_price
            ? Math.round(parseFloat(woo.sale_price) * XCD_RATE * 100) / 100
            : priceXcd,
          original_price_usd: originalPriceUsd,
          original_price_xcd: originalPriceXcd,
          description: stripHtml(woo.description),
          short_description: stripHtml(woo.short_description) || null,
          image_url: woo.images.length > 0 ? woo.images[0].src : null,
          additional_images:
            woo.images.length > 1 ? woo.images.slice(1).map((i) => i.src) : [],
          stock_status: stockStatus,
          is_active: true,
          updated_at: new Date().toISOString(),
        };

        // Check if product exists by slug
        const { data: existing } = await adminClient
          .from("products")
          .select("id")
          .eq("slug", woo.slug)
          .maybeSingle();

        if (existing) {
          await adminClient
            .from("products")
            .update(productData)
            .eq("id", existing.id);
          updated++;
        } else {
          await adminClient.from("products").insert(productData);
          created++;
        }
        synced++;
      } catch (e) {
        errors.push(`${woo.name}: ${e.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_fetched: allWooProducts.length,
        synced,
        created,
        updated,
        errors,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("woo-sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

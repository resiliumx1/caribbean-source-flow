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
    // Parse request body for mode parameter
    let mode = "safe";
    try {
      const body = await req.json();
      if (body?.mode === "full") mode = "full";
    } catch {
      // No body or invalid JSON — default to safe
    }

    console.log("DEBUG woo-sync: mode =", mode);

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

    const normalizedUrl = wooUrl.trim().replace(/\/+$/, '').replace(/\/wp-json(\/wc\/v3)?$/, '');
    const baseApi = `${normalizedUrl}/wp-json/wc/v3`;
    const basicAuth = btoa(`${wooKey}:${wooSecret}`);

    // Fetch all products from WooCommerce (paginated)
    const allWooProducts: WooProduct[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = `${baseApi}/products?per_page=100&page=${page}&status=publish`;
      const res = await fetch(url, {
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "User-Agent": "MountKailash/1.0",
          "Accept": "application/json",
        },
      });
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

    // Helper functions
    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();

    const resolveCategory = async (woo: WooProduct): Promise<string | null> => {
      if (woo.categories.length === 0) return null;
      const wooCat = woo.categories[0];
      if (categoryMap.has(wooCat.slug)) return categoryMap.get(wooCat.slug)!;
      const { data: newCat, error: catErr } = await adminClient
        .from("product_categories")
        .insert({ name: wooCat.name, slug: wooCat.slug })
        .select("id")
        .single();
      if (newCat && !catErr) {
        categoryMap.set(wooCat.slug, newCat.id);
        return newCat.id;
      }
      return null;
    };

    const computePrices = (woo: WooProduct) => {
      const priceUsd = parseFloat(woo.regular_price || woo.price) || 0;
      const priceXcd = Math.round(priceUsd * XCD_RATE * 100) / 100;
      const originalPriceUsd = woo.sale_price && woo.regular_price
        ? parseFloat(woo.regular_price) || null
        : null;
      const originalPriceXcd = originalPriceUsd
        ? Math.round(originalPriceUsd * XCD_RATE * 100) / 100
        : null;
      return {
        price_usd: woo.sale_price ? parseFloat(woo.sale_price) : priceUsd,
        price_xcd: woo.sale_price
          ? Math.round(parseFloat(woo.sale_price) * XCD_RATE * 100) / 100
          : priceXcd,
        original_price_usd: originalPriceUsd,
        original_price_xcd: originalPriceXcd,
      };
    };

    const mapStockStatus = (status: string) =>
      status === "instock" ? "in_stock" : status === "onbackorder" ? "pre_order" : "out_of_stock";

    // Process each WooCommerce product
    let synced = 0;
    let created = 0;
    let updated = 0;
    let images_preserved = 0;
    const errors: string[] = [];

    for (const woo of allWooProducts) {
      try {
        const prices = computePrices(woo);
        const stockStatus = mapStockStatus(woo.stock_status);

        // Check if product exists by slug
        const { data: existing } = await adminClient
          .from("products")
          .select("id, image_url")
          .eq("slug", woo.slug)
          .maybeSingle();

        if (existing) {
          if (mode === "safe") {
            // SAFE MODE: Only update prices, stock, and woo_product_id
            await adminClient.from("products").update({
              woo_product_id: woo.id,
              ...prices,
              stock_status: stockStatus,
              updated_at: new Date().toISOString(),
            }).eq("id", existing.id);
          } else {
            // FULL MODE: Update everything, but preserve custom images
            const categoryId = await resolveCategory(woo);
            const productData: Record<string, any> = {
              name: woo.name,
              woo_product_id: woo.id,
              product_type: woo.type === "simple" ? "tincture" : woo.type,
              category_id: categoryId,
              ...prices,
              description: stripHtml(woo.description),
              short_description: stripHtml(woo.short_description) || null,
              image_url: woo.images.length > 0 ? woo.images[0].src : null,
              additional_images: woo.images.length > 1 ? woo.images.slice(1).map((i) => i.src) : [],
              stock_status: stockStatus,
              is_active: true,
              updated_at: new Date().toISOString(),
            };

            // Preserve custom images stored in Supabase
            const hasCustomImage = existing.image_url?.includes('supabase.co');
            if (hasCustomImage) {
              delete productData.image_url;
              delete productData.additional_images;
              images_preserved++;
            }

            await adminClient.from("products").update(productData).eq("id", existing.id);
          }
          updated++;
        } else {
          // NEW PRODUCT: Always insert with full WooCommerce data
          const categoryId = await resolveCategory(woo);
          await adminClient.from("products").insert({
            name: woo.name,
            slug: woo.slug,
            woo_product_id: woo.id,
            product_type: woo.type === "simple" ? "tincture" : woo.type,
            category_id: categoryId,
            ...prices,
            description: stripHtml(woo.description),
            short_description: stripHtml(woo.short_description) || null,
            image_url: woo.images.length > 0 ? woo.images[0].src : null,
            additional_images: woo.images.length > 1 ? woo.images.slice(1).map((i) => i.src) : [],
            stock_status: stockStatus,
            is_active: true,
          });
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
        mode,
        total_fetched: allWooProducts.length,
        synced,
        created,
        updated,
        images_preserved,
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

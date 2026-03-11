import { useState, useMemo, useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { ShopHero } from "@/components/store/ShopHero";
import { ShopFilterNav } from "@/components/store/ShopFilterNav";
import { FeaturedProduct } from "@/components/store/FeaturedProduct";
import { BundlesGrid } from "@/components/store/BundlesGrid";
import { ProductCard } from "@/components/store/ProductCard";
import { TrustBar } from "@/components/store/TrustBar";
import { StoreFooter } from "@/components/store/StoreFooter";
import { MobileStickyCtA } from "@/components/store/MobileStickyCtA";
import { useProducts, type Product } from "@/hooks/use-products";
import { useConditions, useProductConditionAssignments } from "@/hooks/use-conditions";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Leaf } from "lucide-react";

// Form-to-product_type mapping
const FORM_TYPES: Record<string, string[]> = {
  tinctures: ["tincture"],
  capsules: ["capsule"],
  teas: ["tea"],
  books: ["book"],
  "raw-herbs": ["raw_herb", "powder", "bulk"],
};

function ProductSkeleton() {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden" style={{ background: "var(--site-bg-card)", border: "1px solid var(--site-border)" }}>
      <div className="aspect-square animate-pulse" style={{ background: "var(--site-green-dark)" }} />
      <div className="p-3 space-y-2">
        <div className="h-4 rounded animate-pulse" style={{ background: "var(--site-border)", width: "80%" }} />
        <div className="h-3 rounded animate-pulse" style={{ background: "var(--site-border)", width: "50%" }} />
        <div className="h-4 rounded animate-pulse" style={{ background: "var(--site-border)", width: "30%" }} />
      </div>
    </div>
  );
}

export default function Shop() {
  const { data: products, isLoading } = useProducts();
  const { data: conditions } = useConditions();
  const { data: assignments } = useProductConditionAssignments();
  const [activeCondition, setActiveCondition] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("featured");

  // SEOHead handles meta tags now

  // Build condition → product ID lookup
  const conditionProductMap = useMemo(() => {
    if (!conditions || !assignments) return new Map<string, Set<string>>();
    const idToSlug = new Map(conditions.map((c) => [c.id, c.slug]));
    const map = new Map<string, Set<string>>();
    for (const a of assignments) {
      const slug = idToSlug.get(a.condition_id);
      if (!slug) continue;
      if (!map.has(slug)) map.set(slug, new Set());
      map.get(slug)!.add(a.product_id);
    }
    return map;
  }, [conditions, assignments]);

  // Separate product types
  const { bundles, theAnswerProduct, allSingles } = useMemo(() => {
    if (!products) return { bundles: [] as Product[], theAnswerProduct: null as Product | null, allSingles: [] as Product[] };
    const bundles = products.filter((p) => p.product_type === "bundle" || (p.product_categories as any)?.slug === "curated-bundles");
    const theAnswerProduct = products.find((p) => p.slug === "the-answer") || null;
    const bundleIds = new Set(bundles.map(b => b.id));
    const allSingles = products.filter((p) => !bundleIds.has(p.id) && p.slug !== "the-answer" && p.is_active !== false);
    return { bundles, theAnswerProduct, allSingles };
  }, [products]);

  // Apply filters + sorting
  const displayProducts = useMemo(() => {
    let filtered = [...allSingles];

    if (activeCondition) {
      const ids = conditionProductMap.get(activeCondition) || new Set();
      filtered = filtered.filter((p) => ids.has(p.id));
    }

    if (activeForm) {
      const types = FORM_TYPES[activeForm] || [];
      filtered = filtered.filter((p) => types.includes(p.product_type));
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price_usd - b.price_usd);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price_usd - a.price_usd);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      default:
        // "featured" — keep display_order
        break;
    }

    return filtered;
  }, [allSingles, activeCondition, activeForm, sortBy, conditionProductMap]);

  // Section products for default view (no filters)
  const sectionRows = useMemo(() => {
    if (activeCondition || activeForm) return [];
    if (!conditions || !allSingles.length) return [];

    return conditions
      .filter(c => {
        const ids = conditionProductMap.get(c.slug);
        return ids && ids.size > 0;
      })
      .slice(0, 4) // Show top 4 condition sections
      .map((condition) => {
        const ids = conditionProductMap.get(condition.slug) || new Set();
        const matched = allSingles.filter((p) => ids.has(p.id)).slice(0, 8);
        return { title: condition.name, slug: condition.slug, products: matched };
      })
      .filter((row) => row.products.length > 0);
  }, [allSingles, conditions, conditionProductMap, activeCondition, activeForm]);

  const isFiltered = !!activeCondition || !!activeForm;
  const showDefaultView = !isFiltered;

  return (
    <div className="min-h-screen" style={{ background: "var(--site-bg-primary)", scrollBehavior: "smooth" }}>
      <SEOHead title="Natural Herbal Products | The Sulphur Ridge Apothecary | Mount Kailash" description="Shop wildcrafted Caribbean herbal tinctures, capsules, teas and raw herbs. Hand-extracted bush medicine with 40% higher alkaloid concentration." path="/shop" />
      <ShopHero />
      <ShopFilterNav
        activeCondition={activeCondition}
        onConditionChange={setActiveCondition}
        activeForm={activeForm}
        onFormChange={setActiveForm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalProducts={displayProducts.length}
      />

      <main className="container mx-auto px-4 pt-8 sm:pt-12 pb-20">
        {isLoading ? (
          /* Loading skeletons */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : showDefaultView ? (
          /* ─── Default View: Featured → Sections → Bundles ─── */
          <>
            <FeaturedProduct />

            {sectionRows.length > 0 ? (
              sectionRows.map((row) => (
                <section key={row.slug} className="mb-12 sm:mb-16">
                  <div className="flex items-baseline justify-between mb-4 sm:mb-6">
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "clamp(20px, 3vw, 28px)", color: "var(--site-text-primary)" }}>
                      {row.title}
                    </h2>
                    <button onClick={() => setActiveCondition(row.slug)} style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500, color: "var(--site-gold)" }}>
                      View All →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {row.products.map((product, idx) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              ))
            ) : allSingles.length > 0 ? (
              <section className="mb-12 sm:mb-16">
                <h2 className="mb-4 sm:mb-6" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "clamp(20px, 3vw, 28px)", color: "var(--site-text-primary)" }}>
                  All Remedies
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {allSingles.map((product, idx) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ) : null}

            {bundles.length > 0 && <BundlesGrid bundles={bundles} />}
          </>
        ) : (
          /* ─── Filtered View ─── */
          <>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  color: "var(--site-text-muted)",
                }}
              >
                {displayProducts.length} product{displayProducts.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {displayProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "rgba(188,138,95,0.1)" }}
                >
                  <Leaf className="w-7 h-7" style={{ color: "var(--site-gold)" }} />
                </div>
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--site-text-primary)",
                    marginBottom: "8px",
                  }}
                >
                  No remedies found
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    color: "var(--site-text-muted)",
                    marginBottom: "16px",
                  }}
                >
                  Try adjusting your filters to find what you're looking for.
                </p>
                <button
                  onClick={() => { setActiveCondition(null); setActiveForm(null); }}
                  className="px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:brightness-110"
                  style={{
                    border: "1px solid var(--site-border)",
                    color: "var(--site-text-primary)",
                    fontFamily: "'Inter', sans-serif",
                    minHeight: "44px",
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <TrustBar />
      <StoreFooter />
      <MobileStickyCtA />
    </div>
  );
}

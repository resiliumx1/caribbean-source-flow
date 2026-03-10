import { useState, useMemo, useEffect } from "react";
import { ShopHero } from "@/components/store/ShopHero";
import { ShopFilterNav } from "@/components/store/ShopFilterNav";
import { FeaturedProduct } from "@/components/store/FeaturedProduct";
import { ProtocolRow } from "@/components/store/ProtocolRow";
import { BundlesGrid } from "@/components/store/BundlesGrid";
import { ProductCard } from "@/components/store/ProductCard";
import { TrustBar } from "@/components/store/TrustBar";
import { StoreFooter } from "@/components/store/StoreFooter";
import { MobileStickyCtA } from "@/components/store/MobileStickyCtA";
import { useProducts, type Product } from "@/hooks/use-products";
import { useConditions, useProductConditionAssignments } from "@/hooks/use-conditions";
import { Skeleton } from "@/components/ui/skeleton";

// Form-to-product_type mapping
const FORM_TYPES: Record<string, string[]> = {
  tinctures: ["tincture"],
  capsules: ["capsule"],
  teas: ["tea"],
  "raw-herbs": ["raw_herb", "powder", "bulk"],
};

export default function Shop() {
  const { data: products, isLoading } = useProducts();
  const { data: conditions } = useConditions();
  const { data: assignments } = useProductConditionAssignments();
  const [activeCondition, setActiveCondition] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<string | null>(null);

  useEffect(() => {
    document.title =
      "The Sulphur Ridge Apothecary | Mount Kailash Rejuvenation Centre";
    const meta = document.querySelector('meta[name="description"]');
    if (meta)
      meta.setAttribute(
        "content",
        "Shop wildcrafted Caribbean herbal tinctures, capsules, teas and raw herbs. Hand-extracted bush medicine with 40% higher alkaloid concentration."
      );
  }, []);

  // Build a lookup: conditionSlug -> Set of product IDs
  const conditionProductMap = useMemo(() => {
    if (!conditions || !assignments) return new Map<string, Set<string>>();
    const conditionIdToSlug = new Map(conditions.map((c) => [c.id, c.slug]));
    const map = new Map<string, Set<string>>();
    for (const a of assignments) {
      const slug = conditionIdToSlug.get(a.condition_id);
      if (!slug) continue;
      if (!map.has(slug)) map.set(slug, new Set());
      map.get(slug)!.add(a.product_id);
    }
    return map;
  }, [conditions, assignments]);

  // Separate bundles, "The Answer", and regular products
  const { bundles, theAnswer, regularProducts, teas } = useMemo(() => {
    if (!products) return { bundles: [], theAnswer: null, regularProducts: [], teas: [] };
    const bundles = products.filter((p) => p.product_type === "bundle");
    const theAnswer = products.find((p) => p.slug === "the-answer");
    const teas = products.filter((p) => p.product_type === "tea");
    const regularProducts = products.filter(
      (p) =>
        p.product_type !== "bundle" &&
        p.slug !== "the-answer" &&
        p.product_type !== "tea"
    );
    return { bundles, theAnswer, regularProducts, teas };
  }, [products]);

  // Protocol rows by condition (from DB)
  const protocolRows = useMemo(() => {
    if (!regularProducts.length || !conditions) return [];
    const protocolConditions = conditions.filter((c) =>
      ["inflammation-pain", "gut-health", "immune-defense"].includes(c.slug)
    );
    return protocolConditions
      .map((condition) => {
        const productIds = conditionProductMap.get(condition.slug) || new Set();
        const matched = regularProducts.filter((p) => productIds.has(p.id)).slice(0, 5);
        return {
          title: condition.name === "Inflammation & Pain" ? "For Inflammation" :
                 condition.name === "Gut Health & Digestion" ? "Gut Terrain Repair" :
                 condition.name,
          products: matched,
        };
      })
      .filter((row) => row.products.length > 0);
  }, [regularProducts, conditions, conditionProductMap]);

  // Filtered products for grid view (when a filter is active)
  const filteredProducts = useMemo(() => {
    if (!activeCondition && !activeForm) return null;
    let filtered = [...regularProducts, ...teas, ...bundles];

    if (activeCondition) {
      const productIds = conditionProductMap.get(activeCondition) || new Set();
      filtered = filtered.filter((p) => productIds.has(p.id));
    }

    if (activeForm) {
      const types = FORM_TYPES[activeForm] || [];
      filtered = filtered.filter((p) => types.includes(p.product_type));
    }

    return filtered;
  }, [regularProducts, teas, bundles, activeCondition, activeForm, conditionProductMap]);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--site-bg-primary)",
        scrollBehavior: "smooth",
      }}
    >
      <ShopHero />
      <ShopFilterNav
        activeCondition={activeCondition}
        onConditionChange={setActiveCondition}
        activeForm={activeForm}
        onFormChange={setActiveForm}
      />

      <main className="container mx-auto px-4 pt-12 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredProducts ? (
          /* Filtered grid view */
          <>
            <p
              className="mb-6"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                color: "var(--site-text-muted)",
              }}
            >
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""} found
            </p>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    style={{
                      animation: `shopFadeUp 0.6s ease forwards`,
                      animationDelay: `${idx * 80}ms`,
                      opacity: 0,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p
                  style={{
                    fontSize: "16px",
                    color: "var(--site-text-muted)",
                  }}
                >
                  No products match the current filters.
                </p>
              </div>
            )}
          </>
        ) : (
          /* Default: Featured → Protocol rows → Bundles → Teas */
          <>
            <FeaturedProduct />

            {protocolRows.map((row) => (
              <ProtocolRow
                key={row.title}
                title={row.title}
                products={row.products}
              />
            ))}

            {bundles.length > 0 && <BundlesGrid bundles={bundles} />}

            {/* Traditional Teas */}
            {teas.length > 0 && (
              <section className="mb-16">
                <h2
                  className="mb-8"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 600,
                    fontSize: "24px",
                    color: "var(--site-text-primary)",
                  }}
                >
                  Traditional Teas
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                  {teas.map((product, idx) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      style={{
                        animation: `shopFadeUp 0.6s ease forwards`,
                        animationDelay: `${idx * 60}ms`,
                        opacity: 0,
                      }}
                    />
                  ))}
                </div>
              </section>
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

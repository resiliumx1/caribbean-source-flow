import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { ShopHero } from "@/components/store/ShopHero";
import { ShopFilterNav } from "@/components/store/ShopFilterNav";
import { FeaturedProduct } from "@/components/store/FeaturedProduct";

import { ProductCard } from "@/components/store/ProductCard";
import { TrustBar } from "@/components/store/TrustBar";
import { StoreFooter } from "@/components/store/StoreFooter";
import { MobileStickyCtA } from "@/components/store/MobileStickyCtA";
import { RecentSalesPopup } from "@/components/store/RecentSalesPopup";
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

function ProductReel({ products }: { products: Product[] }) {
  const reelItems = products.filter(p => p.image_url).slice(0, 12);
  if (reelItems.length < 3) return null;
  const doubled = [...reelItems, ...reelItems];

  return (
    <div style={{ background: 'var(--site-bg-secondary)', borderTop: '1px solid var(--site-border)', borderBottom: '1px solid var(--site-border)', padding: '16px 0' }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--site-gold)', textAlign: 'center', marginBottom: '12px' }}>
        Our Formulas
      </p>
      <div style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'reel-scroll 30s linear infinite', gap: '0px' }}>
          {doubled.map((p, i) => (
            <Link
              key={`${p.id}-${i}`}
              to={`/shop/${p.slug}`}
              className="group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '0 20px',
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              <div
                className="rounded-full overflow-hidden transition-all duration-300 group-hover:scale-[1.08]"
                style={{
                  width: 100,
                  height: 100,
                  background: '#ffffff',
                  border: '2px solid rgba(255,255,255,0.2)',
                  boxShadow: 'none',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(255,255,255,0.3)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                <img
                  src={p.image_url!}
                  alt={`${p.name} | Mount Kailash Rejuvenation Centre`}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center' }}
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <span
                className="line-clamp-2 text-center"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  fontWeight: 400,
                  color: 'var(--site-text-primary)',
                  lineHeight: 1.3,
                  maxWidth: 100,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {p.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes reel-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes gridFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .rounded-full[style*="width: 100"] {
            width: 80px !important;
            height: 80px !important;
          }
        }
      `}</style>
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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 300ms debounce for search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  // All active products (including bundles and The Answer)
  const allSingles = useMemo(() => {
    if (!products) return [] as Product[];
    return products.filter((p) => p.is_active !== false);
  }, [products]);

  // Apply filters + sorting + search
  const displayProducts = useMemo(() => {
    let filtered = debouncedSearch
      ? [...(products || [])].filter(p => p.is_active !== false)
      : [...allSingles];

    // Search filter
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.short_description && p.short_description.toLowerCase().includes(q)) ||
        p.product_type.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    }

    if (activeCondition) {
      const ids = conditionProductMap.get(activeCondition) || new Set();
      filtered = filtered.filter((p) => ids.has(p.id));
    }

    if (activeForm) {
      const types = FORM_TYPES[activeForm] || [];
      filtered = filtered.filter((p) => types.some(t => t.toLowerCase() === p.product_type?.toLowerCase()));
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
        break;
    }

    return filtered;
  }, [allSingles, activeCondition, activeForm, sortBy, conditionProductMap, debouncedSearch]);

  // Section products for default view (no filters)
  const sectionRows = useMemo(() => {
    if (activeCondition || activeForm || debouncedSearch) return [];
    if (!conditions || !allSingles.length) return [];

    return conditions
      .filter(c => {
        const ids = conditionProductMap.get(c.slug);
        return ids && ids.size > 0;
      })
      .slice(0, 4)
      .map((condition) => {
        const ids = conditionProductMap.get(condition.slug) || new Set();
        const matched = allSingles.filter((p) => ids.has(p.id)).slice(0, 8);
        return { title: condition.name, slug: condition.slug, products: matched };
      })
      .filter((row) => row.products.length > 0);
  }, [allSingles, conditions, conditionProductMap, activeCondition, activeForm, debouncedSearch]);

  // Total all active products (singles + bundles + the answer)
  const totalAllProducts = useMemo(() => {
    if (!products) return 0;
    return products.filter(p => p.is_active !== false).length;
  }, [products]);

  // Condition product counts for dropdown
  const conditionCounts = useMemo(() => {
    const map = new Map<string, number>();
    if (!conditions || !conditionProductMap) return map;
    for (const c of conditions) {
      const ids = conditionProductMap.get(c.slug);
      map.set(c.slug, ids ? ids.size : 0);
    }
    return map;
  }, [conditions, conditionProductMap]);

  const isFiltered = !!activeCondition || !!activeForm || !!debouncedSearch || sortBy !== "featured";
  const showDefaultView = !isFiltered;

  // Auto-scroll to results when filter changes
  useEffect(() => {
    if (activeCondition || activeForm || sortBy !== "featured") {
      setTimeout(() => {
        const filterNav = document.getElementById('filter-nav');
        if (filterNav) {
          filterNav.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [activeCondition, activeForm, sortBy]);

  return (
    <div className="min-h-screen" style={{ background: "var(--site-bg-primary)", scrollBehavior: "smooth" }}>
      <SEOHead title="Natural Herbal Products | The Sulphur Ridge Apothecary | Mount Kailash" description="Shop wildcrafted Caribbean herbal tinctures, capsules, teas and raw herbs. Hand-extracted bush medicine with 40% higher alkaloid concentration." path="/shop" />
      <ShopHero />

      <ProductReel products={allSingles} />

      <ShopFilterNav
        activeCondition={activeCondition}
        onConditionChange={setActiveCondition}
        activeForm={activeForm}
        onFormChange={setActiveForm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalProducts={displayProducts.length}
        totalAllProducts={totalAllProducts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        conditionCounts={conditionCounts}
        allProducts={products || []}
      />

      <main className="container mx-auto px-4 pt-8 sm:pt-12 pb-20">
        {/* Search results indicator */}
        {debouncedSearch && displayProducts.length > 0 && (
          <p className="mb-4" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#555' }}>
            {displayProducts.length} result{displayProducts.length !== 1 ? 's' : ''} for "<strong>{debouncedSearch}</strong>"
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : showDefaultView ? (
          <>
            <FeaturedProduct />

            {sectionRows.length > 0 && (
              sectionRows.map((row) => (
                <section key={row.slug} className="mb-12 sm:mb-16">
                  <div className="flex items-baseline justify-between mb-4 sm:mb-6">
                    <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "clamp(20px, 3vw, 28px)", color: "var(--site-text-primary)" }}>
                      {row.title}
                    </h2>
                    <button onClick={() => setActiveCondition(row.slug)} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 500, color: "var(--site-gold)" }}>
                      View All →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {row.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              ))
            )}

            {/* All Products grid - always shown in default view */}
            {allSingles.length > 0 && (
              <section className="mb-12 sm:mb-16">
                <h2 className="mb-4 sm:mb-6" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "clamp(20px, 3vw, 28px)", color: "var(--site-text-primary)" }}>
                  All Remedies
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {allSingles.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <>
            {!debouncedSearch && (
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "var(--site-text-muted)" }}>
                  {displayProducts.length} product{displayProducts.length !== 1 ? "s" : ""} found
                </p>
              </div>
            )}

            {displayProducts.length > 0 ? (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
                style={{ animation: 'gridFadeIn 0.3s ease-out' }}
                key={`${activeCondition}-${activeForm}-${sortBy}`}
              >
                {displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(188,138,95,0.1)" }}>
                  <Leaf className="w-7 h-7" style={{ color: "var(--site-gold)" }} />
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "20px", fontWeight: 600, color: "var(--site-text-primary)", marginBottom: "8px" }}>
                  {debouncedSearch ? `No products found for "${debouncedSearch}"` : "No remedies found"}
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "var(--site-text-muted)", marginBottom: "16px" }}>
                  {debouncedSearch ? "Try a different search term or clear filters." : "Try adjusting your filters to find what you're looking for."}
                </p>
                <button
                  onClick={() => { setActiveCondition(null); setActiveForm(null); setSearchQuery(''); }}
                  className="px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:brightness-110"
                  style={{
                    border: "1px solid var(--site-border)",
                    color: "var(--site-text-primary)",
                    fontFamily: "'DM Sans', sans-serif",
                    minHeight: "44px",
                  }}
                >
                  {debouncedSearch ? "Clear Search" : "Clear Filters"}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <TrustBar />
      <StoreFooter />
      <MobileStickyCtA />
      <RecentSalesPopup />
    </div>
  );
}

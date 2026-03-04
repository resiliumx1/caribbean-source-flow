import { useState, useMemo, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { ShopHero } from "@/components/store/ShopHero";
import { StoreFooter } from "@/components/store/StoreFooter";
import { CategoryNav } from "@/components/store/CategoryNav";
import { ProductCard } from "@/components/store/ProductCard";
import { FeaturedProduct } from "@/components/store/FeaturedProduct";
import { TrustBar } from "@/components/store/TrustBar";
import { QuickViewModal } from "@/components/store/QuickViewModal";
import { WhatsAppFloat } from "@/components/store/WhatsAppFloat";
import { RecentSalesPopup } from "@/components/store/RecentSalesPopup";
import { useProducts, useCategories, type Product } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

function CategoryDivider({ name }: { name: string }) {
  return (
    <div className="col-span-full flex items-center gap-4 py-6">
      <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.2)" }} />
      <span
        className="flex items-center gap-2 px-4 py-1 rounded-full"
        style={{
          background: "#0f0f0d",
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 700,
          fontSize: "24px",
          color: "#f2ead8",
        }}
      >
        <span style={{ color: "#c9a84c", fontSize: "14px" }}>✦</span>
        {name}
        <span style={{ color: "#c9a84c", fontSize: "14px" }}>✦</span>
      </span>
      <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.2)" }} />
    </div>
  );
}

function AnimatedGrid({ products, onQuickView, categorySlug, searchQuery }: {
  products: Product[];
  onQuickView: (p: Product) => void;
  categorySlug?: string;
  searchQuery: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Group products by category for section dividers (only when viewing all)
  const grouped = useMemo(() => {
    if (categorySlug || searchQuery) return null;
    const map = new Map<string, Product[]>();
    products.forEach((p) => {
      const cat = p.product_categories?.name || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    });
    return map;
  }, [products, categorySlug, searchQuery]);

  let cardIndex = 0;

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {grouped ? (
        Array.from(grouped.entries()).map(([catName, catProducts]) => {
          const elements: React.ReactNode[] = [];
          elements.push(<CategoryDivider key={`div-${catName}`} name={catName} />);
          catProducts.forEach((product) => {
            const idx = cardIndex++;
            elements.push(
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(24px)",
                  transition: `opacity 600ms ease ${idx * 80}ms, transform 600ms ease ${idx * 80}ms`,
                }}
              />
            );
          });
          return elements;
        })
      ) : (
        products.map((product, idx) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={onQuickView}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 600ms ease ${idx * 80}ms, transform 600ms ease ${idx * 80}ms`,
            }}
          />
        ))
      )}
    </div>
  );
}

export default function Shop() {
  const { categorySlug } = useParams();
  const { data: products, isLoading } = useProducts(categorySlug);
  const { data: categories } = useCategories();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const currentCategory = categories?.find((c) => c.slug === categorySlug);

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", scrollBehavior: "smooth" }}>
      <ShopHero />

      <main className="container mx-auto px-4" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
        {/* Category header */}
        {categorySlug && currentCategory && (
          <div className="text-center mb-10">
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "36px",
                color: "#f2ead8",
                marginBottom: "12px",
              }}
            >
              {currentCategory.name}
            </h2>
            {currentCategory.description && (
              <p style={{ color: "rgba(242,234,216,0.5)", maxWidth: "640px", margin: "0 auto" }}>
                {currentCategory.description}
              </p>
            )}
          </div>
        )}

        {/* Search bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(242,234,216,0.4)" }} />
          <input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-full outline-none"
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "#f2ead8",
              fontFamily: "'Jost', sans-serif",
              fontSize: "14px",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "rgba(242,234,216,0.5)" }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category navigation */}
        <div className="mb-12">
          <CategoryNav />
        </div>

        {/* Featured product banner (only on "All" view) */}
        {!categorySlug && !searchQuery && <FeaturedProduct />}

        {/* Product grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <AnimatedGrid
            products={filteredProducts}
            onQuickView={setQuickViewProduct}
            categorySlug={categorySlug}
            searchQuery={searchQuery}
          />
        ) : (
          <div className="text-center py-16">
            <p style={{ fontSize: "16px", color: "rgba(242,234,216,0.5)" }}>
              {searchQuery ? `No products found for "${searchQuery}".` : "No products found in this category."}
            </p>
          </div>
        )}
      </main>

      <TrustBar />
      <StoreFooter />
      <WhatsAppFloat />
      <RecentSalesPopup />

      <QuickViewModal
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </div>
  );
}

import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { ShopHero } from "@/components/store/ShopHero";
import { StoreFooter } from "@/components/store/StoreFooter";
import { CategoryNav } from "@/components/store/CategoryNav";
import { ProductCard } from "@/components/store/ProductCard";
import { QuickViewModal } from "@/components/store/QuickViewModal";
import { WhatsAppFloat } from "@/components/store/WhatsAppFloat";
import { useProducts, useCategories, type Product } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

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

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <ShopHero />

      <main className="container mx-auto px-4 py-12">
        {/* Category header when viewing specific category */}
        {categorySlug && currentCategory && (
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
              {currentCategory.name}
            </h2>
            {currentCategory.description && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {currentCategory.description}
              </p>
            )}
          </div>
        )}

        {/* Search bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 rounded-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category navigation */}
        <div className="mb-12">
          <CategoryNav />
        </div>

        {/* Product grid - 3 columns on desktop */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredProducts.map((product, index) => {
              const showBestSellerBadge = !categorySlug && !searchQuery && !!product.image_url && index < 6;
              return (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  onQuickView={handleQuickView}
                  showBestSellerBadge={showBestSellerBadge}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              {searchQuery ? `No products found for "${searchQuery}".` : "No products found in this category."}
            </p>
          </div>
        )}
      </main>

      <StoreFooter />
      <WhatsAppFloat />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </div>
  );
}

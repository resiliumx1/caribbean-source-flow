import { useState } from "react";
import { useParams } from "react-router-dom";
import { StoreHeader } from "@/components/store/StoreHeader";
import { ShopHero } from "@/components/store/ShopHero";
import { StoreFooter } from "@/components/store/StoreFooter";
import { CategoryNav } from "@/components/store/CategoryNav";
import { ProductCard } from "@/components/store/ProductCard";
import { QuickViewModal } from "@/components/store/QuickViewModal";
import { WhatsAppFloat } from "@/components/store/WhatsAppFloat";
import { useProducts, useCategories, type Product } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";

export default function Shop() {
  const { categorySlug } = useParams();
  const { data: products, isLoading } = useProducts(categorySlug);
  const { data: categories } = useCategories();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const currentCategory = categories?.find((c) => c.slug === categorySlug);

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />

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
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                onQuickView={handleQuickView}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              No products found in this category.
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

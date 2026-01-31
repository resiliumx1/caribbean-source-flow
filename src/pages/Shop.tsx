import { useParams } from "react-router-dom";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreHero } from "@/components/store/StoreHero";
import { StoreFooter } from "@/components/store/StoreFooter";
import { CategoryNav } from "@/components/store/CategoryNav";
import { ProductCard } from "@/components/store/ProductCard";
import { WhatsAppFloat } from "@/components/store/WhatsAppFloat";
import { useProducts, useCategories } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";

export default function Shop() {
  const { categorySlug } = useParams();
  const { data: products, isLoading } = useProducts(categorySlug);
  const { data: categories } = useCategories();

  const currentCategory = categories?.find((c) => c.slug === categorySlug);

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      
      {!categorySlug && <StoreHero />}

      <main className="container mx-auto px-4 py-8">
        {/* Category header */}
        {categorySlug && currentCategory && (
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
              {currentCategory.name}
            </h1>
            {currentCategory.description && (
              <p className="text-muted-foreground max-w-2xl">
                {currentCategory.description}
              </p>
            )}
          </div>
        )}

        {!categorySlug && (
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
              The Dispensary
            </h2>
            <p className="text-muted-foreground">
              Explore our complete collection of wildcrafted St. Lucian botanicals
            </p>
          </div>
        )}

        {/* Category navigation */}
        <div className="mb-8">
          <CategoryNav />
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
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
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { useStore } from "@/lib/store-context";
import type { Product } from "@/hooks/use-products";

interface RelatedProductsProps {
  productId: string;
  categoryId: string | null;
}

export function RelatedProducts({ productId, categoryId }: RelatedProductsProps) {
  const { formatPriceBoth } = useStore();

  const { data: products = [] } = useQuery({
    queryKey: ["related-products", productId, categoryId],
    queryFn: async () => {
      const results: Product[] = [];

      // Same category first
      if (categoryId) {
        const { data } = await supabase
          .from("products")
          .select("*, product_categories!category_id(*)")
          .eq("category_id", categoryId)
          .neq("id", productId)
          .eq("is_active", true)
          .limit(3);
        if (data) results.push(...(data as Product[]));
      }

      // Fill with featured if needed
      if (results.length < 3) {
        const exclude = [productId, ...results.map((r) => r.id)];
        const { data } = await supabase
          .from("products")
          .select("*, product_categories!category_id(*)")
          .eq("is_active", true)
          .eq("is_featured", true)
          .not("id", "in", `(${exclude.join(",")})`)
          .limit(3 - results.length);
        if (data) results.push(...(data as Product[]));
      }

      return results.slice(0, 3);
    },
    enabled: !!productId,
  });

  if (products.length === 0) return null;

  return (
    <section className="py-12 border-t border-border">
      <h2 className="text-2xl font-serif font-bold text-foreground mb-6">You May Also Need</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {products.map((product) => {
          const prices = formatPriceBoth(product.price_usd, product.price_xcd);
          return (
            <Link
              key={product.id}
              to={`/shop/${product.slug}`}
              className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-elevated transition-all duration-300"
            >
              <div className="aspect-square bg-muted/20 relative overflow-hidden flex items-center justify-center p-4">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    loading="lazy"
                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <ProductPlaceholder productType={product.product_type} className="w-24 h-32" />
                )}
                {product.product_categories?.name && (
                  <Badge className="absolute top-3 left-3 text-xs" variant="secondary">
                    {product.product_categories.name}
                  </Badge>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-serif font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{prices.primary}</span>
                  <span className="text-xs text-muted-foreground">{prices.secondary}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View Details
                </Button>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

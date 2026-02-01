import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { useStore } from "@/lib/store-context";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/hooks/use-products";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { formatPriceBoth } = useStore();
  const { addToCart, isAddingToCart } = useCart();
  const prices = formatPriceBoth(product.price_usd, product.price_xcd);

  const getBadgeVariant = (badge: string | null) => {
    switch (badge) {
      case "best_seller":
        return "default";
      case "fermented":
        return "secondary";
      case "wildcrafted":
        return "outline";
      case "new":
        return "default";
      default:
        return "outline";
    }
  };

  const getBadgeLabel = (badge: string | null) => {
    switch (badge) {
      case "best_seller":
        return "Best Seller";
      case "fermented":
        return "Fermented";
      case "wildcrafted":
        return "Wildcrafted";
      case "new":
        return "New";
      default:
        return badge;
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ productId: product.id, quantity: 1 });
  };

  return (
    <Link to={`/shop/${product.slug}`} className="group">
      <div className="bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-square bg-muted/30 p-6 flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <ProductPlaceholder
              productType={product.product_type}
              className="w-32 h-48"
            />
          )}

          {/* Badge */}
          {product.badge && (
            <Badge
              variant={getBadgeVariant(product.badge)}
              className="absolute top-4 left-4"
            >
              {getBadgeLabel(product.badge)}
            </Badge>
          )}

          {/* Stock status */}
          {product.stock_status !== "in_stock" && (
            <Badge variant="destructive" className="absolute top-4 right-4">
              {product.stock_status === "out_of_stock"
                ? "Out of Stock"
                : product.stock_status === "low_stock"
                ? "Low Stock"
                : "Pre-order"}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category */}
          {product.product_categories && (
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
              {product.product_categories.name}
            </p>
          )}

          {/* Name */}
          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
            {product.name}
          </h3>

          {/* Short description */}
          {product.short_description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {product.short_description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-lg font-bold text-foreground">
              {prices.primary}
            </span>
            <span className="text-sm text-muted-foreground">
              {prices.secondary}
            </span>
          </div>

          {/* Add to Cart Button */}
          <Button
            variant="default"
            className="w-full gap-2"
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock_status === "out_of_stock"}
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  );
}

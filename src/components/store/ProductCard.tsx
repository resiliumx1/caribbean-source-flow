import { Link } from "react-router-dom";
import { ShoppingBag, Star, Eye, Leaf, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { useStore } from "@/lib/store-context";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/hooks/use-products";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { formatPrice, formatPriceBoth } = useStore();
  const { addToCart, isAddingToCart } = useCart();
  const prices = formatPriceBoth(product.price_usd, product.price_xcd);

  // Check for promotions (these fields now exist in the Product type)
  const promotionBadge = (product as any).promotion_badge;
  const promotionText = (product as any).promotion_text;
  const originalPriceUsd = (product as any).original_price_usd;
  const originalPriceXcd = (product as any).original_price_xcd;

  // Generate consistent rating based on product id (in real app, this would come from DB)
  const rating = 4 + (parseInt(product.id.slice(-2), 16) % 10) / 10;
  const reviewCount = 100 + (parseInt(product.id.slice(-4), 16) % 250);

  const getBadgeColor = (badge: string | null) => {
    switch (badge) {
      case "best_seller":
        return "bg-accent text-accent-foreground";
      case "new":
        return "bg-forest text-cream";
      case "staff_pick":
        return "bg-earth text-cream";
      default:
        return "bg-forest text-cream";
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
      case "staff_pick":
        return "Staff Pick";
      default:
        return badge;
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ productId: product.id, quantity: 1 });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  return (
    <div className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
      {/* Decorative leaf background */}
      <div className="absolute top-0 right-0 text-forest/5 pointer-events-none">
        <Leaf className="w-32 h-32 -rotate-45 translate-x-8 -translate-y-8" />
      </div>

      {/* Image Container */}
      <Link to={`/shop/${product.slug}`} className="block relative aspect-square bg-gradient-to-br from-muted/30 to-muted/10 p-6 overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <ProductPlaceholder
              productType={product.product_type}
              className="w-28 h-40 transition-transform duration-500 group-hover:scale-110"
            />
          )}
        </div>

        {/* Badges */}
        {(promotionBadge || product.badge) && (
          <Badge className={`absolute top-4 left-4 gap-1 ${
            promotionBadge 
              ? "bg-accent text-accent-foreground" 
              : getBadgeColor(product.badge)
          }`}>
            {promotionBadge && <Sparkles className="w-3 h-3" />}
            {promotionBadge 
              ? (promotionBadge === "savings" ? "Hot Deal" : 
                 promotionBadge === "popular" ? "Popular" : 
                 promotionBadge === "limited" ? "Limited" : promotionBadge)
              : getBadgeLabel(product.badge)
            }
          </Badge>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 gap-2 bg-cream/95 text-foreground hover:bg-cream shadow-elevated"
            onClick={handleQuickView}
          >
            <Eye className="w-4 h-4" />
            Quick View
          </Button>
        </div>

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
      </Link>

      {/* Content */}
      <div className="p-5 relative">
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(rating)
                    ? "fill-gold text-gold"
                    : i < rating
                    ? "fill-gold/50 text-gold"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({reviewCount})</span>
        </div>

        {/* Name */}
        <Link to={`/shop/${product.slug}`}>
          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
            {product.name}
          </h3>
        </Link>

        {/* Short description */}
        {product.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
            {product.short_description}
          </p>
        )}

        {/* Feature bullets from traditional_use */}
        {product.traditional_use && (
          <div className="space-y-1 mb-4">
            {product.traditional_use.split(",").slice(0, 2).map((use, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Leaf className="w-3 h-3 text-forest flex-shrink-0" />
                <span className="line-clamp-1">{use.trim()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Promotion callout */}
        {promotionText && (
          <div className="flex items-center gap-1.5 text-xs text-accent-foreground bg-accent/10 rounded-lg px-2 py-1 mb-3">
            <Tag className="w-3 h-3" />
            <span className="font-medium">{promotionText}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl font-bold text-foreground">
            {prices.primary}
          </span>
          {originalPriceUsd && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPriceUsd, originalPriceXcd || 0)}
            </span>
          )}
          {!originalPriceUsd && (
            <span className="text-sm text-muted-foreground">
              {prices.secondary}
            </span>
          )}
        </div>

        {/* Subscribe & Save hint */}
        <p className="text-xs text-forest font-medium mb-3">
          Subscribe & Save 15%
        </p>

        {/* Add to Cart Button */}
        <Button
          variant="default"
          className="w-full gap-2 bg-forest hover:bg-forest-dark text-cream"
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.stock_status === "out_of_stock"}
        >
          <ShoppingBag className="w-4 h-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

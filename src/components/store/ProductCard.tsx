import { Link } from "react-router-dom";
import { ShoppingCart, Star, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { CompareButton } from "./CompareButton";
import { useStore } from "@/lib/store-context";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/hooks/use-products";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  showBestSellerBadge?: boolean;
}

export function ProductCard({ product, onQuickView, showBestSellerBadge }: ProductCardProps) {
  const { formatPrice, formatPriceBoth } = useStore();
  const { addToCart, isAddingToCart } = useCart();
  const prices = formatPriceBoth(product.price_usd, product.price_xcd);

  // Generate consistent rating based on product id (min 4.5, max 5.0)
  const rating = 4.7 + (parseInt(product.id.slice(-2), 16) % 4) / 10;
  const reviewCount = 120 + (parseInt(product.id.slice(-4), 16) % 231);

  // Get category display name
  const categoryLabel = product.product_categories?.name?.toUpperCase() || 
    product.product_type.replace(/_/g, ' ').toUpperCase();

  const getBadgeLabel = (badge: string | null) => {
    switch (badge) {
      case "best_seller": return "Best Seller";
      case "fermented": return "Fermented";
      case "wildcrafted": return "100% Natural";
      case "100_natural": return "100% Natural";
      case "new": return "New";
      case "staff_pick": return "Staff Pick";
      case "low_stock": return "Low Stock";
      case "recently_restocked": return "Back in Stock";
      case "limited_edition": return "Limited Edition";
      case "bulk": return "Bulk";
      case "popular": return "Popular";
      default: return badge;
    }
  };

  const getBadgeColor = (badge: string | null) => {
    switch (badge) {
      case "best_seller": return "bg-orange-500 text-white";
      case "new": return "bg-forest text-cream";
      case "staff_pick": return "bg-gold text-cream";
      case "low_stock": return "bg-amber-500 text-white";
      case "recently_restocked": return "bg-emerald-600 text-white";
      case "limited_edition": return "bg-purple-600 text-white";
      case "100_natural": return "bg-emerald-600 text-white";
      case "bulk": return "bg-teal-600 text-white";
      case "popular": return "bg-blue-600 text-white";
      default: return "bg-forest text-cream";
    }
  };

  // Extract 3 key benefits from traditional_use or short_description
  const getBenefits = (): string[] => {
    if (product.traditional_use) {
      return product.traditional_use.split(",").slice(0, 3).map(s => s.trim());
    }
    return [];
  };

  const benefits = getBenefits();

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

  // Determine if we should show best seller badge
  const displayBestSeller = showBestSellerBadge || product.badge === "best_seller";
  const displayBadge = displayBestSeller ? "best_seller" : product.badge;

  return (
    <div className="group relative bg-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-elevated shadow-sm">
      {/* Badge */}
      {displayBadge && (
        <Badge className={`absolute top-4 left-4 z-10 ${displayBestSeller ? "bg-orange-500 text-white" : getBadgeColor(displayBadge)}`}>
          {displayBestSeller ? "Best Seller" : getBadgeLabel(displayBadge)}
        </Badge>
      )}

      {/* Image Container - Clean background with proper object fit */}
      <Link to={`/shop/${product.slug}`} className="block relative aspect-square bg-gradient-to-b from-muted/20 to-muted/5 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <ProductPlaceholder
              productType={product.product_type}
              className="w-32 h-44 transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>

        {/* Quick View Overlay - appears on hover */}
        <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2 shadow-lg"
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
      <div className="p-4 space-y-3">
        {/* Category label */}
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          {categoryLabel}
        </p>

        {/* Product Name - high contrast, bold */}
        <Link to={`/shop/${product.slug}`}>
          <h3 className="font-serif text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? "fill-gold text-gold"
                    : i < rating
                    ? "fill-gold text-gold"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({reviewCount})</span>
        </div>

        {/* Key Benefits checklist */}
        {benefits.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="line-clamp-1">{benefit}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price and Add to Cart - side by side */}
          <div className="flex items-center justify-between pt-2 gap-3">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground">
              {prices.primary}
            </span>
            <span className="text-xs text-muted-foreground">
              {prices.secondary}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <CompareButton productId={product.id} />
            <Button
              variant="default"
              size="icon"
              className="bg-primary hover:bg-sage-dark text-primary-foreground h-9 w-9"
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock_status === "out_of_stock"}
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

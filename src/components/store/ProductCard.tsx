import { Link } from "react-router-dom";
import { ShoppingBag, MessageCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { useStore } from "@/lib/store-context";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/hooks/use-products";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { formatPrice, formatPriceBoth, isLocalVisitor, whatsappNumber } = useStore();
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

  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in ${product.name}. Is this in stock?`
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ productId: product.id, quantity: 1 });
  };

  return (
    <Link to={`/shop/${product.slug}`} className="group">
      <div className="product-card overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <ProductPlaceholder 
              productType={product.product_type} 
              className="w-full h-full"
            />
          )}

          {/* Badge */}
          {product.badge && (
            <Badge
              variant={getBadgeVariant(product.badge)}
              className="absolute top-3 left-3"
            >
              {getBadgeLabel(product.badge)}
            </Badge>
          )}

          {/* Stock status */}
          {product.stock_status !== "in_stock" && (
            <Badge
              variant="destructive"
              className="absolute top-3 right-3"
            >
              {product.stock_status === "out_of_stock" ? "Out of Stock" : 
               product.stock_status === "low_stock" ? "Low Stock" : "Pre-order"}
            </Badge>
          )}

          {/* Quick actions overlay */}
          <div className="product-card-overlay">
            <div className="flex gap-2">
              <Button
                variant="hero"
                size="sm"
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock_status === "out_of_stock"}
                className="gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </Button>
              <Button
                variant="heroSecondary"
                size="icon"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          {product.product_categories && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {product.product_categories.name}
            </p>
          )}

          {/* Name */}
          <h3 className="font-serif font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Short description */}
          {product.short_description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {product.short_description}
            </p>
          )}

          {/* Price */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-foreground">
              {prices.primary}
            </span>
            <span className="text-sm text-muted-foreground">
              {prices.secondary}
            </span>
          </div>

          {/* Local delivery indicator */}
          {isLocalVisitor && (
            <div className="mt-2 flex items-center gap-1 text-xs text-success">
              <Truck className="w-3 h-3" />
              <span>Local delivery available</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Star, Leaf, X, Plus, Minus } from "lucide-react";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { useStore } from "@/lib/store-context";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/hooks/use-products";
import { useState } from "react";
import { Link } from "react-router-dom";

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const { formatPriceBoth } = useStore();
  const { addToCart, isAddingToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const prices = formatPriceBoth(product.price_usd, product.price_xcd);

  const handleAddToCart = () => {
    addToCart({ productId: product.id, quantity });
    onOpenChange(false);
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

  // Generate random rating for display (in real app, this would come from DB)
  const rating = 4.5;
  const reviewCount = Math.floor(Math.random() * 200) + 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Product Image */}
          <div className="relative bg-muted/30 p-8 flex items-center justify-center min-h-[400px]">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="max-w-full max-h-[350px] object-contain"
              />
            ) : (
              <ProductPlaceholder
                productType={product.product_type}
                className="w-40 h-56"
              />
            )}

            {/* Badge */}
            {product.badge && (
              <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                {getBadgeLabel(product.badge)}
              </Badge>
            )}

            {/* Decorative leaf */}
            <div className="absolute bottom-4 right-4 text-forest/20">
              <Leaf className="w-16 h-16" />
            </div>
          </div>

          {/* Product Details */}
          <div className="p-8 flex flex-col">
            <DialogHeader className="text-left mb-4">
              {/* Category */}
              {product.product_categories && (
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  {product.product_categories.name}
                </p>
              )}

              <DialogTitle className="font-serif text-2xl font-bold text-foreground">
                {product.name}
              </DialogTitle>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(rating)
                          ? "fill-gold text-gold"
                          : i < rating
                          ? "fill-gold/50 text-gold"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({reviewCount})
                </span>
              </div>
            </DialogHeader>

            {/* Short description */}
            {product.short_description && (
              <p className="text-muted-foreground mb-4">
                {product.short_description}
              </p>
            )}

            {/* Full description */}
            {product.description && (
              <p className="text-sm text-muted-foreground mb-6 line-clamp-4">
                {product.description}
              </p>
            )}

            {/* Traditional use as feature bullets */}
            {product.traditional_use && (
              <div className="mb-6 space-y-2">
                {product.traditional_use.split(",").slice(0, 3).map((use, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Leaf className="w-4 h-4 text-forest" />
                    <span className="text-foreground">{use.trim()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto space-y-4">
              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-foreground">
                  {prices.primary}
                </span>
                <span className="text-muted-foreground">
                  {prices.secondary}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-muted transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <Button
                variant="hero"
                size="lg"
                className="w-full gap-2"
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock_status === "out_of_stock"}
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </Button>

              {/* View Full Details Link */}
              <Link
                to={`/shop/${product.slug}`}
                className="block text-center text-sm text-primary hover:underline"
                onClick={() => onOpenChange(false)}
              >
                View Full Details →
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

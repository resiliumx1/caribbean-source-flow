import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Star, Check, X, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) return null;

  const allImages = [product.image_url, ...((product as any).additional_images || [])].filter(
    (url): url is string => !!url
  );

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
        return "100% Natural";
      case "new":
        return "New";
      case "staff_pick":
        return "Staff Pick";
      case "bulk":
        return "Bulk";
      case "popular":
        return "Popular";
      default:
        return badge;
    }
  };

  // Generate random rating for display (in real app, this would come from DB)
  const rating = 4.7 + (parseInt(product.id.slice(-2), 16) % 4) / 10;
  const reviewCount = 120 + (parseInt(product.id.slice(-4), 16) % 231);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Product Image */}
          <div className="relative bg-muted/30 p-8 flex items-center justify-center min-h-[400px]">
            {allImages.length > 0 ? (
              <img
                src={allImages[selectedImageIndex]}
                alt={product.name}
                className="max-w-full max-h-[350px] object-contain"
                width={400}
                height={400}
              />
            ) : (
              <ProductPlaceholder
                productType={product.product_type}
                className="w-40 h-56"
              />
            )}

            {/* Navigation arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((i) => (i - 1 + allImages.length) % allImages.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-background transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex((i) => (i + 1) % allImages.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-background transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}

            {/* Badge */}
            {product.badge && (
              <Badge className={`absolute top-4 left-4 ${product.badge === "best_seller" ? "bg-orange-500 text-white" : "bg-accent text-accent-foreground"}`}>
                {getBadgeLabel(product.badge)}
              </Badge>
            )}
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
                          ? "fill-gold text-gold"
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

            {/* Key Benefits checklist */}
            {product.traditional_use && (
              <div className="mb-6 space-y-2">
                <p className="text-sm font-semibold text-foreground mb-2">Key Benefits</p>
                {product.traditional_use.split(",").slice(0, 5).map((use, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-forest flex-shrink-0" />
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
                onClick={() => onOpenChange(false)}
              >
                <Button variant="outline" size="lg" className="w-full gap-2 font-semibold">
                  View Full Details →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

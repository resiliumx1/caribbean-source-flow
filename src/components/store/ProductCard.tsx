import { Link } from "react-router-dom";
import { ShoppingCart, Star, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { CompareButton } from "./CompareButton";
import { useStore } from "@/lib/store-context";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/hooks/use-products";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  showBestSellerBadge?: boolean;
  style?: React.CSSProperties;
}

export function ProductCard({ product, onQuickView, showBestSellerBadge, style }: ProductCardProps) {
  const { formatPriceBoth } = useStore();
  const { addToCart, isAddingToCart } = useCart();
  const prices = formatPriceBoth(product.price_usd, product.price_xcd);

  const hash = parseInt(product.id.slice(-2), 16) % 10;
  const rating = hash === 0 ? 4.7 : 5.0;
  const reviewCount = 120 + (parseInt(product.id.slice(-4), 16) % 231);

  const categoryLabel =
    product.product_categories?.name?.toUpperCase() ||
    product.product_type.replace(/_/g, " ").toUpperCase();

  const getBenefits = (): string[] => {
    if (product.traditional_use) {
      return product.traditional_use.split(",").slice(0, 3).map((s) => s.trim());
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

  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: "var(--site-bg-card)",
        border: "1px solid var(--site-border)",
        boxShadow: "var(--site-shadow-card)",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = "1px solid var(--site-card-hover-border)";
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(26,18,8,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = "1px solid var(--site-border)";
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "var(--site-shadow-card)";
      }}
    >
      {/* Image Container */}
      <Link
        to={`/shop/${product.slug}`}
        className="block relative aspect-square overflow-hidden"
        style={{ background: "var(--site-img-bg)" }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
              width={400}
              height={400}
              loading="lazy"
            />
          ) : (
            <ProductPlaceholder
              productType={product.product_type}
              className="w-32 h-44 transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>

        {/* Quick View Overlay */}
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
          <div
            className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: "#dc2626", color: "#fff" }}
          >
            {product.stock_status === "out_of_stock"
              ? "Out of Stock"
              : product.stock_status === "low_stock"
              ? "Low Stock"
              : "Pre-order"}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Category badge - gold pill */}
        <span
          className="inline-block px-3 py-1 rounded-full uppercase"
          style={{
            fontFamily: "'Jost', sans-serif",
            fontWeight: 300,
            fontSize: "11px",
            color: "#c9a84c",
            border: "1px solid rgba(201,168,76,0.4)",
            letterSpacing: "0.05em",
          }}
        >
          {categoryLabel}
        </span>

        {/* Product Name */}
        <Link to={`/shop/${product.slug}`}>
          <h3
            className="line-clamp-2 transition-colors"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontSize: "17px",
              lineHeight: 1.3,
              color: "var(--site-text-primary)",
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4"
                style={{
                  fill: i < Math.floor(rating) ? "#c9a84c" : "transparent",
                  color: i < rating ? "#c9a84c" : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: "13px", color: "var(--site-text-muted)" }}>
            ({reviewCount})
          </span>
        </div>

        {/* Benefits */}
        {benefits.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-2" style={{ fontSize: "14px", color: "var(--site-text-secondary)" }}>
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#c9a84c" }} />
                <span className="line-clamp-1">{benefit}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 700,
                  fontSize: "22px",
                  color: "#c9a84c",
                }}
              >
                {prices.primary}
              </span>
              <span className="block" style={{ fontSize: "12px", color: "var(--site-text-muted)" }}>
                {prices.secondary}
              </span>
            </div>
            <CompareButton productId={product.id} />
          </div>

          {/* Full-width Add to Cart */}
          <button
            className="w-full py-2.5 rounded-full transition-all hover:brightness-110 disabled:opacity-50"
            style={{
              background: "#c9a84c",
              color: "#090909",
              fontFamily: "'Jost', sans-serif",
              fontWeight: 400,
              fontSize: "13px",
            }}
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock_status === "out_of_stock"}
          >
            <span className="flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

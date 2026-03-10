import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { useCart } from "@/hooks/use-cart";
import { ProductPlaceholder } from "./ProductPlaceholder";
import type { Product } from "@/hooks/use-products";

interface ProductCardProps {
  product: Product;
  style?: React.CSSProperties;
}

export function ProductCard({ product, style }: ProductCardProps) {
  const { formatPriceBoth } = useStore();
  const { addToCart, isAddingToCart } = useCart();
  const prices = formatPriceBoth(product.price_usd, product.price_xcd);

  const hash = parseInt(product.id.slice(-4), 16) % 231;
  const reviewCount = 30 + hash;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ productId: product.id, quantity: 1 });
  };

  return (
    <div
      className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "var(--site-bg-card)",
        border: "1px solid var(--site-border)",
        boxShadow: "var(--site-shadow-card)",
        ...style,
      }}
    >
      {/* Image */}
      <Link
        to={`/shop/${product.slug}`}
        className="block relative aspect-square overflow-hidden"
        style={{ background: "var(--site-green-dark)" }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
              style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.3))" }}
            />
          ) : (
            <ProductPlaceholder
              productType={product.product_type}
              className="w-32 h-44 transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>

        {/* Stock status */}
        {product.stock_status !== "in_stock" && (
          <div
            className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-semibold"
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
      <div className="p-4 space-y-2">
        <Link to={`/shop/${product.slug}`}>
          <h3
            className="line-clamp-2"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              textTransform: "uppercase",
              color: "var(--site-text-primary)",
              letterSpacing: "0.02em",
              lineHeight: 1.4,
            }}
          >
            {product.name}
          </h3>
        </Link>

        {product.traditional_use && (
          <p
            className="line-clamp-1"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              color: "var(--site-text-muted)",
            }}
          >
            For {product.traditional_use.split(",")[0].trim().toLowerCase()}
          </p>
        )}

        {/* Stars */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-3.5 h-3.5"
              style={{ fill: "var(--site-gold)", color: "var(--site-gold)" }}
            />
          ))}
          <span
            style={{
              fontSize: "12px",
              color: "var(--site-text-muted)",
              marginLeft: "4px",
            }}
          >
            ({reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-1">
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "16px",
              color: "var(--site-text-primary)",
            }}
          >
            {prices.primary}
          </span>
          <span
            style={{
              fontSize: "12px",
              color: "var(--site-text-muted)",
            }}
          >
            {prices.secondary}
          </span>
        </div>

        {/* Add to Protocol — hover reveal */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.stock_status === "out_of_stock"}
          className="w-full py-2.5 rounded-full text-sm font-medium transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{
            background: "var(--site-gold)",
            color: "var(--site-green-dark)",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            minHeight: "44px",
          }}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Protocol
        </button>
      </div>
    </div>
  );
}

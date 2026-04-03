import { Link } from "react-router-dom";
import { ShoppingCart, Star, Plus } from "lucide-react";
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

  // Form type dot color
  const formDot = product.product_type === "tincture" ? "#8B4513"
    : product.product_type === "capsule" ? "#BC8A5F"
    : product.product_type === "tea" ? "#2D5F2D"
    : "#999";

  return (
    <div
      className="group flex flex-col rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      style={{
        background: "var(--site-bg-card)",
        border: "1px solid var(--site-border)",
        ...style,
      }}
    >
      {/* Image — strict 1:1 */}
      <Link
        to={`/shop/${product.slug}`}
        className="block relative product-image-container"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={`${product.name} by Mount Kailash Rejuvenation Centre`}
            className="transition-transform duration-500 group-hover:scale-105"
            style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.3))" }}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ) : (
          <ProductPlaceholder
            productType={product.product_type}
            className="w-24 h-32 transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Stock badge */}
        {product.stock_status !== "in_stock" && (
          <div
            className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ background: "#dc2626", color: "#fff" }}
          >
            {product.stock_status === "out_of_stock" ? "Out of Stock" : "Low Stock"}
          </div>
        )}

        {/* Form type dot */}
        <div
          className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full"
          style={{ background: formDot, border: "1px solid rgba(255,255,255,0.3)" }}
        />
      </Link>

      {/* Content — flex-grow to push price to bottom */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <Link to={`/shop/${product.slug}`}>
          <h3
            className="line-clamp-2"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              textTransform: "uppercase",
              color: "var(--site-text-primary)",
              letterSpacing: "0.02em",
              lineHeight: 1.4,
              minHeight: "2.5rem",
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Stars */}
        <div className="flex items-center gap-0.5 mt-1.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-3 h-3"
              style={{ fill: "var(--site-gold)", color: "var(--site-gold)" }}
            />
          ))}
          <span
            style={{
              fontSize: "11px",
              color: "var(--site-text-muted)",
              marginLeft: "4px",
            }}
          >
            ({reviewCount})
          </span>
        </div>

        {/* Price row — pushed to bottom */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "15px",
              color: "var(--site-text-primary)",
            }}
          >
            {prices.primary}
          </span>

          {/* Desktop: small quick-add circle */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock_status === "out_of_stock"}
            className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center transition-all hover:scale-110 disabled:opacity-40"
            style={{
              background: "rgba(188,138,95,0.12)",
              color: "var(--site-gold)",
            }}
            aria-label="Add to cart"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile: full width Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.stock_status === "out_of_stock"}
          className="sm:hidden w-full mt-2 py-3.5 rounded-full text-xs font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
          style={{
            background: "var(--site-gold)",
            color: "var(--site-green-dark)",
            fontFamily: "'DM Sans', sans-serif",
            minHeight: "44px",
          }}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

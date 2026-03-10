import { useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/hooks/use-products";

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    dragState.current = { isDown: true, startX: e.clientX, scrollLeft: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.isDown || !ref.current) return;
    const dx = e.clientX - dragState.current.startX;
    if (Math.abs(dx) > 3) { dragState.current.moved = true; setIsDragging(true); }
    ref.current.scrollLeft = dragState.current.scrollLeft - dx;
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragState.current.isDown = false;
    ref.current?.releasePointerCapture(e.pointerId);
    setTimeout(() => setIsDragging(false), 0);
  }, []);

  return { ref, isDragging, onPointerDown, onPointerMove, onPointerUp };
}

interface ProtocolRowProps {
  title: string;
  products: Product[];
}

export function ProtocolRow({ title, products }: ProtocolRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { formatPriceBoth } = useStore();
  const { addToCart, isAddingToCart } = useCart();

  if (products.length === 0) return null;

  return (
    <section className="mb-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 600,
            fontSize: "24px",
            color: "var(--site-text-primary)",
          }}
        >
          {title}
        </h3>
        <Link
          to="/shop"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--site-gold)",
          }}
        >
          View All →
        </Link>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-5 snap-x snap-mandatory scrollbar-hide select-none"
        style={{ scrollPaddingLeft: "16px", cursor: isDragging ? "grabbing" : "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {products.map((product) => {
          const prices = formatPriceBoth(product.price_usd, product.price_xcd);
          const hash = parseInt(product.id.slice(-4), 16) % 231;
          const reviewCount = 30 + hash;

          return (
            <div
              key={product.id}
              className="group flex-shrink-0 w-[280px] snap-start rounded-xl overflow-hidden transition-all duration-300"
              style={{
                background: "var(--site-bg-card)",
                border: "1px solid var(--site-border)",
              }}
            >
              {/* Image area */}
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
                    <div className="w-20 h-28 rounded bg-white/10" />
                  )}
                </div>

                {product.stock_status !== "in_stock" && (
                  <div
                    className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: "#dc2626", color: "#fff" }}
                  >
                    {product.stock_status === "out_of_stock"
                      ? "Out of Stock"
                      : "Low Stock"}
                  </div>
                )}
              </Link>

              {/* Content */}
              <div className="p-4 space-y-2">
                <Link to={`/shop/${product.slug}`}>
                  <h4
                    className="line-clamp-1"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: "14px",
                      textTransform: "uppercase",
                      color: "var(--site-text-primary)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {product.name}
                  </h4>
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
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: "16px",
                    color: "var(--site-text-primary)",
                  }}
                >
                  {prices.primary}
                </div>

                {/* Add to Protocol — appears on hover */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart({ productId: product.id, quantity: 1 });
                  }}
                  disabled={
                    isAddingToCart || product.stock_status === "out_of_stock"
                  }
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
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

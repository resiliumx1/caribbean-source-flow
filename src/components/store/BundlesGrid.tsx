import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { useCart } from "@/hooks/use-cart";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import type { Product } from "@/hooks/use-products";

interface BundlesGridProps {
  bundles: Product[];
}

export function BundlesGrid({ bundles }: BundlesGridProps) {
  const { formatPriceBoth } = useStore();
  const { addToCart, isAddingToCart } = useCart();
  const mobileScroll = useDragScroll();

  if (bundles.length === 0) return null;

  const renderCard = (bundle: Product, isDragging?: boolean) => {
    const prices = formatPriceBoth(bundle.price_usd, bundle.price_xcd);
    const originalPrices = bundle.original_price_usd
      ? formatPriceBoth(bundle.original_price_usd, bundle.original_price_xcd ?? bundle.original_price_usd * 2.7)
      : null;
    const savings = bundle.original_price_usd
      ? Math.round(bundle.original_price_usd - bundle.price_usd)
      : null;

    return (
      <div
        key={bundle.id}
        className="group flex-shrink-0 w-[280px] sm:w-auto rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
        style={{
          background: "var(--site-green-dark)",
          border: "2px solid rgba(188,138,95,0.3)",
        }}
      >
        <Link
          to={`/shop/${bundle.slug}`}
          className="block relative aspect-[16/9] overflow-hidden"
          onClick={(e) => { if (isDragging) e.preventDefault(); }}
          draggable={false}
        >
          {bundle.image_url ? (
            <img
              src={bundle.image_url}
              alt={bundle.name}
              className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/30 text-sm">Bundle</span>
            </div>
          )}
          {savings && (
            <div
              className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: "var(--site-gold)", color: "var(--site-green-dark)" }}
            >
              Save ${savings}
            </div>
          )}
        </Link>

        <div className="p-4 space-y-2">
          <Link
            to={`/shop/${bundle.slug}`}
            onClick={(e) => { if (isDragging) e.preventDefault(); }}
            draggable={false}
          >
            <h3
              className="line-clamp-1"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: "16px",
                color: "#F5F1E8",
                lineHeight: 1.3,
              }}
            >
              {bundle.name}
            </h3>
          </Link>

          {bundle.short_description && (
            <p
              className="line-clamp-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                color: "rgba(245,241,232,0.6)",
                lineHeight: 1.5,
              }}
            >
              {bundle.short_description}
            </p>
          )}

          <div className="flex items-center gap-2">
            {originalPrices && (
              <span className="line-through" style={{ fontSize: "13px", color: "rgba(245,241,232,0.4)" }}>
                {originalPrices.primary}
              </span>
            )}
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "18px", color: "var(--site-gold)" }}>
              {prices.primary}
            </span>
          </div>

          <button
            onClick={(e) => { e.preventDefault(); if (isDragging) return; addToCart({ productId: bundle.id, quantity: 1 }); }}
            disabled={isAddingToCart}
            className="w-full py-2.5 rounded-full text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              background: "var(--site-gold)",
              color: "var(--site-green-dark)",
              fontFamily: "'DM Sans', sans-serif",
              minHeight: "48px",
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            Add All to Cart
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: "24px",
            color: "var(--site-text-primary)",
          }}
        >
          Curated Protocols
        </h2>
      </div>

      {/* Mobile: horizontal scroll */}
      <div
        ref={mobileScroll.ref}
        className="flex gap-4 overflow-x-auto pb-4 sm:hidden select-none snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", cursor: mobileScroll.isDragging ? "grabbing" : "grab" }}
        {...mobileScroll.scrollHandlers}
      >
        {bundles.map((b) => renderCard(b, mobileScroll.isDragging))}
      </div>

      {/* Desktop: grid */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((b) => renderCard(b))}
      </div>
    </section>
  );
}

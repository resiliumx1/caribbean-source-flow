import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/hooks/use-products";

interface BundlesGridProps {
  bundles: Product[];
}

export function BundlesGrid({ bundles }: BundlesGridProps) {
  const { formatPriceBoth } = useStore();
  const { addToCart, isAddingToCart } = useCart();

  if (bundles.length === 0) return null;

  return (
    <section className="mb-16">
      <h2
        className="text-center mb-10"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "32px",
          color: "var(--site-text-primary)",
        }}
      >
        Curated Protocols
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bundles.map((bundle) => {
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
              className="group rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "var(--site-bg-card)",
                border: "1px solid var(--site-border)",
                boxShadow: "var(--site-shadow-card)",
              }}
            >
              {/* Image */}
              <Link
                to={`/shop/${bundle.slug}`}
                className="block relative aspect-[4/3] overflow-hidden"
                style={{ background: "var(--site-green-dark)" }}
              >
                {bundle.image_url ? (
                  <img
                    src={bundle.image_url}
                    alt={bundle.name}
                    className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white/30">Bundle</span>
                  </div>
                )}
              </Link>

              {/* Content */}
              <div className="p-5 space-y-3">
                <Link to={`/shop/${bundle.slug}`}>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 600,
                      fontSize: "18px",
                      color: "var(--site-text-primary)",
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
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                      color: "var(--site-text-muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    {bundle.short_description}
                  </p>
                )}

                {savings && (
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--site-gold)",
                    }}
                  >
                    Save ${savings}
                  </p>
                )}

                {/* Pricing */}
                <div className="flex items-center gap-2">
                  {originalPrices && (
                    <span
                      className="line-through"
                      style={{
                        fontSize: "14px",
                        color: "var(--site-text-muted)",
                      }}
                    >
                      {originalPrices.primary}
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: "20px",
                      color: "var(--site-text-primary)",
                    }}
                  >
                    {prices.primary}
                  </span>
                </div>

                <button
                  onClick={() =>
                    addToCart({ productId: bundle.id, quantity: 1 })
                  }
                  disabled={isAddingToCart}
                  className="w-full py-2.5 rounded-full text-sm font-medium transition-all hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
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
        })}
      </div>
    </section>
  );
}

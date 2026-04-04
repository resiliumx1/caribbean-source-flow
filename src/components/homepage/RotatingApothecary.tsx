import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store-context";
import { VineVariationB } from "@/components/decorative/BotanicalVine";

export function RotatingApothecary() {
  const { currency } = useStore();

  const { data: products = [] } = useQuery({
    queryKey: ["featured-products-carousel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("display_order", { ascending: true })
        .limit(8);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (products.length === 0) return null;

  // Duplicate for infinite loop
  const items = [...products, ...products];

  return (
    <section style={{ background: "var(--site-bg-secondary)" }} className="py-24 md:py-28 overflow-hidden">
      <div className="container mx-auto max-w-6xl px-4 mb-10">
        <div className="flex items-end justify-between">
          <div>
            <h2
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 3vw, 36px)",
                color: "var(--site-text-primary)",
                marginBottom: "4px",
              }}
            >
              The Apothecary
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 300,
                fontSize: "14px",
                color: "var(--site-text-secondary)",
              }}
            >
              Small-batch formulations
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium"
            style={{ color: "var(--site-gold)", fontFamily: "'DM Sans', sans-serif" }}
          >
            View All Remedies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Carousel with gradient masks */}
      <div className="relative">
        {/* Left mask */}
        <div
          className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to right, var(--site-bg-secondary), transparent)",
          }}
        />
        {/* Right mask */}
        <div
          className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to left, var(--site-bg-secondary), transparent)",
          }}
        />

        <div
          className="flex gap-6 px-4 apothecary-scroll"
          style={{
            animation: "apothecary-scroll 30s linear infinite",
            width: "max-content",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.animationPlayState = "paused";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.animationPlayState = "running";
          }}
        >
          {items.map((product, i) => {
            const price = currency === "XCD" ? product.price_xcd : product.price_usd;
            const symbol = currency === "XCD" ? "EC$" : "$";
            return (
              <Link
                key={product.id + "-" + i}
                to={`/shop/${product.slug}`}
                className="group block flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{
                  width: "300px",
                  background: "var(--site-bg-card)",
                  border: "1px solid var(--site-border)",
                  boxShadow: "var(--site-shadow-card)",
                }}
              >
                {/* Image */}
                <div
                  className="aspect-square overflow-hidden"
                  style={{ background: "var(--site-img-bg)" }}
                >
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 dark:brightness-110"
                    loading="lazy"
                    width={300}
                    height={300}
                  />
                </div>
                {/* Content */}
                <div className="p-4">
                  <h3
                    className="truncate"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: "18px",
                      color: "var(--site-text-primary)",
                      marginBottom: "4px",
                    }}
                  >
                    {product.name}
                  </h3>
                  {product.short_description && (
                    <p
                      className="truncate"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 300,
                        fontSize: "14px",
                        color: "var(--site-text-secondary)",
                        marginBottom: "8px",
                      }}
                    >
                      {product.short_description}
                    </p>
                  )}
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                      color: "var(--site-text-primary)",
                      marginBottom: "12px",
                    }}
                  >
                    {symbol}{price.toFixed(2)}
                  </div>
                  <div
                    className="w-full text-center py-2.5 rounded-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: "var(--site-gold)",
                      color: "#0F281E",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Add to Cart
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile link */}
      <div className="container mx-auto max-w-6xl px-4 mt-8 sm:hidden">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-sm font-medium"
          style={{ color: "var(--site-gold)", fontFamily: "'DM Sans', sans-serif" }}
        >
          View All Remedies <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <style>{`
        @keyframes apothecary-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

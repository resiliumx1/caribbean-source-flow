import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import { useProduct } from "@/hooks/use-products";
import { useStore } from "@/lib/store-context";
import { useCart } from "@/hooks/use-cart";
import { Skeleton } from "@/components/ui/skeleton";
import theAnswerImg from "@/assets/the-answer-chronixx-studio.webp";

export function FeaturedProduct() {
  const { data: product, isLoading } = useProduct("the-answer");
  const { formatPriceBoth } = useStore();
  const { addToCart, isAddingToCart } = useCart();

  if (isLoading) {
    return (
      <div className="rounded-2xl p-8 md:p-12 mb-12" style={{ background: "#1b4332" }}>
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const prices = formatPriceBoth(product.price_usd, product.price_xcd);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ productId: product.id, quantity: 1 });
  };

  return (
    <Link to={`/shop/${product.slug}`} className="block mb-16 group">
      <section
        className="relative rounded-2xl overflow-hidden transition-shadow duration-300 group-hover:shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 60%, #1b4332 100%)",
          border: "1px solid rgba(212,163,115,0.25)",
        }}
      >
        {/* Botanical overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M40 10 Q50 30 40 50 Q30 30 40 10Z' fill='%23d4a373'/%3E%3Cpath d='M20 40 Q35 35 40 50 Q25 50 20 40Z' fill='%23d4a373'/%3E%3Cpath d='M60 40 Q45 35 40 50 Q55 50 60 40Z' fill='%23d4a373'/%3E%3C/svg%3E")`,
            backgroundSize: "80px 80px",
          }}
        />

        {/* Badge */}
        <div
          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(212,163,115,0.15)",
            border: "1px solid rgba(212,163,115,0.3)",
          }}
        >
          <Star className="w-3.5 h-3.5 fill-current" style={{ color: "#d4a373" }} />
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#d4a373",
            }}
          >
            Flagship Product
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div
            className="relative flex items-center justify-center p-8 md:p-12 min-h-[320px]"
            style={{
              background: "radial-gradient(ellipse at center, rgba(212,163,115,0.1) 0%, transparent 70%)",
            }}
          >
            <img
              src={theAnswerImg}
              alt={`${product.name} - Flagship Herbal Tincture | Mount Kailash Rejuvenation Centre`}
              className="max-w-full max-h-[300px] object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center p-8 md:p-12">
            <p
              className="mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#d4a373",
              }}
            >
              Our Foundational Protocol
            </p>
            <h2
              className="mb-4"
              style={{
                fontFamily: "'Cormorant Garamond', 'DM Sans', serif",
                fontWeight: 700,
                fontSize: "clamp(28px, 4vw, 40px)",
                color: "#F5F1E8",
                lineHeight: 1.1,
              }}
            >
              {product.name}
            </h2>

            <p
              className="mb-6 max-w-md"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
                fontSize: 15,
                lineHeight: 1.7,
                color: "rgba(245,241,232,0.65)",
              }}
            >
              Wildcrafted Vervine extracted within 6 hours of harvest for maximum alkaloid retention. The anti-inflammatory protocol trusted by thousands.
            </p>

            <div className="mb-6">
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 28,
                  color: "#d4a373",
                }}
              >
                {prices.primary}
              </span>
              <span className="ml-3" style={{ fontSize: 14, color: "rgba(245,241,232,0.45)" }}>
                {prices.secondary}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="w-full max-w-xs py-3.5 rounded-full font-medium text-sm transition-all hover:shadow-lg hover:shadow-amber-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: "#d4a373",
                color: "#1b4332",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </section>
    </Link>
  );
}

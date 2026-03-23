import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useProduct } from "@/hooks/use-products";
import { useStore } from "@/lib/store-context";
import { useCart } from "@/hooks/use-cart";
import { Skeleton } from "@/components/ui/skeleton";
import theAnswerImg from "@/assets/the-answer-chronixx-studio.png";

export function FeaturedProduct() {
  const { data: product, isLoading } = useProduct("the-answer");
  const { formatPriceBoth } = useStore();
  const { addToCart, isAddingToCart } = useCart();
  const [subscribe, setSubscribe] = useState(false);

  if (isLoading) {
    return (
      <div
        className="rounded-2xl p-8 md:p-12 mb-12"
        style={{ background: "var(--site-green-dark)" }}
      >
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

  const handleAddToCart = () => {
    addToCart({ productId: product.id, quantity: 1 });
  };

  return (
    <section
      className="rounded-2xl overflow-hidden mb-16"
      style={{
        background: "var(--site-green-dark)",
        border: "1px solid rgba(188,138,95,0.2)",
      }}
    >
      <div className="grid md:grid-cols-2 gap-0">
        {/* Image — 50% */}
        <Link
          to={`/shop/${product.slug}`}
          className="relative flex items-center justify-center p-8 md:p-12 min-h-[360px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(188,138,95,0.12) 0%, transparent 70%)",
          }}
        >
          <img
            src={theAnswerImg}
            alt={product.name}
            className="max-w-full max-h-[320px] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
          />
        </Link>

        {/* Content — 50% */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <h2
            className="mb-4"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "36px",
              color: "#F5F1E8",
              lineHeight: 1.15,
            }}
          >
            {product.name}
          </h2>

          <p
            className="mb-6 max-w-md"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: 1.6,
              color: "rgba(245,241,232,0.7)",
            }}
          >
            Our foundational anti-inflammatory protocol. Wildcrafted Vervine
            extracted within 6 hours of harvest for maximum alkaloid retention.
          </p>

          <div className="mb-6">
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: "28px",
                color: "var(--site-gold)",
              }}
            >
              {prices.primary}
            </span>
            <span
              className="ml-3"
              style={{ fontSize: "14px", color: "rgba(245,241,232,0.5)" }}
            >
              {prices.secondary}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="w-full max-w-xs py-3 rounded-full font-medium text-sm transition-all hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
            style={{
              background: "var(--site-gold)",
              color: "var(--site-green-dark)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>

          {/* Subscribe checkbox */}
          <label
            className="flex items-center gap-2 cursor-pointer max-w-xs"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              color: "rgba(245,241,232,0.6)",
            }}
          >
            <input
              type="checkbox"
              checked={subscribe}
              onChange={(e) => setSubscribe(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--site-gold)]"
            />
            Subscribe &amp; Save 15%
          </label>
        </div>
      </div>
    </section>
  );
}

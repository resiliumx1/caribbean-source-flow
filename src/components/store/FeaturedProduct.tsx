import { Link } from "react-router-dom";
import { useProduct } from "@/hooks/use-products";
import { useStore } from "@/lib/store-context";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedProduct() {
  const { data: product, isLoading } = useProduct("the-answer");
  const { formatPriceBoth } = useStore();

  if (isLoading) {
    return (
      <div className="rounded-2xl p-12" style={{ background: "var(--site-bg-card)" }}>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-40" />
          </div>
          <Skeleton className="aspect-square" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const prices = formatPriceBoth(product.price_usd, product.price_xcd);

  return (
    <div
      className="rounded-2xl overflow-hidden mb-12"
      style={{
        background: "var(--site-bg-card)",
        border: "1px solid var(--site-border)",
        borderTop: "3px solid #c9a84c",
        padding: "48px",
        boxShadow: "var(--site-shadow-card)",
      }}
    >
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - text */}
        <div>
          <span
            className="inline-block mb-4"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: "13px",
              color: "#c9a84c",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            ✦ STAFF PICK
          </span>

          <h2
            className="mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "36px",
              color: "var(--site-text-primary)",
              lineHeight: 1.2,
            }}
          >
            {product.name}
          </h2>

          <p
            className="mb-4 max-w-md"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: "15px",
              color: "var(--site-text-muted)",
              lineHeight: 1.7,
            }}
          >
            {product.short_description || product.description?.slice(0, 150)}
          </p>

          <span
            className="inline-block px-3 py-1 rounded-full mb-6"
            style={{
              background: "rgba(201,168,76,0.15)",
              color: "#c9a84c",
              fontFamily: "'Jost', sans-serif",
              fontWeight: 400,
              fontSize: "12px",
              border: "1px solid rgba(201,168,76,0.3)",
            }}
          >
            Bestseller
          </span>

          <div className="mb-6">
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "28px",
                color: "#c9a84c",
              }}
            >
              {prices.primary}
            </span>
            <span className="ml-2" style={{ fontSize: "14px", color: "var(--site-text-muted)" }}>
              {prices.secondary}
            </span>
          </div>

          <Link
            to={`/shop/${product.slug}`}
            className="inline-block px-8 py-3 rounded-full transition-all hover:brightness-110"
            style={{
              background: "#c9a84c",
              color: "#090909",
              fontFamily: "'Jost', sans-serif",
              fontWeight: 500,
              fontSize: "14px",
            }}
          >
            Shop Now →
          </Link>
        </div>

        {/* Right side - image */}
        <div className="flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="object-contain"
              style={{ maxHeight: "280px" }}
            />
          ) : (
            <div
              className="w-full aspect-square rounded-xl flex items-center justify-center"
              style={{ background: "var(--site-img-bg)" }}
            >
              <span style={{ color: "var(--site-text-muted)" }}>No image</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

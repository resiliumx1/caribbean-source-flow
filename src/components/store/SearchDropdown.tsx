import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import type { Product } from "@/hooks/use-products";

interface SearchDropdownProps {
  query: string;
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onViewAll?: (query: string) => void;
}

function scoreMatch(product: Product, q: string): number {
  const name = product.name.toLowerCase();
  const slug = product.slug.toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const shortDesc = (product.short_description || "").toLowerCase();
  const type = product.product_type.toLowerCase();

  if (name === q) return 100;
  if (name.startsWith(q)) return 90;
  if (slug === q) return 85;
  if (slug.startsWith(q)) return 80;
  if (name.includes(q)) return 70;
  if (type.includes(q)) return 60;
  if (slug.includes(q)) return 55;
  if (shortDesc.includes(q)) return 40;
  if (desc.includes(q)) return 30;
  return 0;
}

export function SearchDropdown({ query, products, isOpen, onClose, onViewAll }: SearchDropdownProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase();
    const scored = products
      .filter(p => p.is_active !== false)
      .map(p => ({ product: p, score: scoreMatch(p, q) }))
      .filter(r => r.score > 0)
      .sort((a, b) => {
        // The Answer always on top if it matches
        if (a.product.slug === "the-answer") return -1;
        if (b.product.slug === "the-answer") return 1;
        return b.score - a.score;
      });
    return scored;
  }, [query, products]);

  const visible = results.slice(0, 8);
  const hasMore = results.length > 8;

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen || visible.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, visible.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      navigate(`/shop/${visible[activeIndex].product.slug}`);
      onClose();
    } else if (e.key === "Escape") {
      onClose();
    }
  }, [isOpen, visible, activeIndex, navigate, onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const el = listRef.current.children[activeIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  if (!isOpen || !query) return null;

  const formatPrice = (p: Product) => `$${p.price_usd.toFixed(2)}`;
  const getTypeBadge = (p: Product) => {
    if (p.slug === "the-answer") return { label: "Bestseller", color: "#c9a84c", bg: "rgba(201,168,76,0.12)" };
    if (p.product_type === "bundle") return { label: "Bundle", color: "#1b4332", bg: "rgba(27,67,50,0.08)" };
    return null;
  };
  const getTypeLabel = (p: Product) => {
    const map: Record<string, string> = { tincture: "Tincture", capsule: "Capsule", tea: "Tea", book: "Book", raw_herb: "Raw Herb", powder: "Powder", bulk: "Bulk", bundle: "Bundle", soap: "Soap" };
    return map[p.product_type] || p.product_type;
  };

  return (
    <div
      ref={listRef}
      className="absolute left-0 top-full mt-1 z-50"
      style={{
        width: "clamp(280px, 100%, 380px)",
        maxHeight: "min(400px, 50vh)",
        overflowY: "auto",
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
        padding: 8,
      }}
    >
      {visible.length === 0 ? (
        <div className="py-6 text-center">
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#888" }}>
            No products found for "{query}"
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#aaa", marginTop: 4 }}>
            Try searching by product name, type, or condition
          </p>
        </div>
      ) : (
        <>
          {visible.map((r, i) => {
            const badge = getTypeBadge(r.product);
            return (
              <button
                key={r.product.id}
                onClick={() => { navigate(`/shop/${r.product.slug}`); onClose(); }}
                className="w-full flex items-center gap-3 rounded-lg transition-colors"
                style={{
                  padding: "8px 12px",
                  background: activeIndex === i ? "#f5f0e8" : "transparent",
                  cursor: "pointer",
                  minHeight: 64,
                }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {/* Image */}
                <div
                  className="flex-shrink-0 rounded-lg overflow-hidden"
                  style={{ width: 48, height: 48, background: "#fafafa" }}
                >
                  {r.product.image_url ? (
                    <img
                      src={r.product.image_url}
                      alt={r.product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Search className="w-4 h-4" style={{ color: "#ccc" }} />
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 text-left">
                  <p
                    className="truncate"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}
                  >
                    {r.product.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#888" }}>
                      {getTypeLabel(r.product)}
                    </span>
                    {badge && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px]"
                        style={{ background: badge.bg, color: badge.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
                      >
                        {badge.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <span
                  className="flex-shrink-0"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#1b4332" }}
                >
                  {formatPrice(r.product)}
                </span>
              </button>
            );
          })}

          {hasMore && (
            <button
              onClick={() => { onViewAll?.(query); onClose(); }}
              className="w-full flex items-center justify-center gap-1.5 py-3 mt-1 rounded-lg transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: "#1b4332" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f5f0e8"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              View all {results.length} results <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

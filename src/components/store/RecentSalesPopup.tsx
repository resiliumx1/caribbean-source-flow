import { useState, useEffect, useCallback, useMemo } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/use-products";

const PURCHASE_DATA = [
  { product: "The Answer", city: "Brooklyn", country: "US", minutes: 3 },
  { product: "Colax Colon Cleanser", city: "Toronto", country: "Canada", minutes: 7 },
  { product: "Pure Green", city: "London", country: "UK", minutes: 12 },
  { product: "Virili-Tea", city: "Castries", country: "Saint Lucia", minutes: 5 },
  { product: "Hemp Syrup", city: "Atlanta", country: "US", minutes: 18 },
  { product: "Moon Cycle Tea", city: "Bridgetown", country: "Barbados", minutes: 2 },
  { product: "Dewormer", city: "Houston", country: "US", minutes: 9 },
  { product: "Super Male Vitality Package", city: "Miami", country: "US", minutes: 14 },
  { product: "Restful Tea", city: "Kingston", country: "Jamaica", minutes: 6 },
  { product: "Sea Moss", city: "New York", country: "US", minutes: 4 },
  { product: "Detox Bundle", city: "Soufrière", country: "Saint Lucia", minutes: 11 },
  { product: "Queenly Tea Bundle", city: "Port of Spain", country: "Trinidad", minutes: 8 },
  { product: "The Answer", city: "Chicago", country: "US", minutes: 1 },
  { product: "Immunity Kit", city: "Montego Bay", country: "Jamaica", minutes: 16 },
  { product: "Kingly Tea Bundle", city: "Lagos", country: "Nigeria", minutes: 10 },
  { product: "Medina Tea", city: "Charlotte", country: "US", minutes: 3 },
  { product: "Blue Vervaine", city: "Roseau", country: "Dominica", minutes: 7 },
  { product: "Digestive Bundle", city: "Antigua", country: "Antigua & Barbuda", minutes: 13 },
];

const SESSION_KEY = "mkrc_popup_count";
const MAX_POPUPS = 6;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function RecentSalesPopup() {
  const { data: products } = useProducts();
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [order] = useState(() => shuffle(PURCHASE_DATA.map((_, i) => i)));

  const productImageMap = useMemo(() => {
    if (!products) return new Map<string, { image: string; slug: string }>();
    const map = new Map<string, { image: string; slug: string }>();
    for (const p of products) {
      map.set(p.name.toLowerCase(), { image: p.image_url || "", slug: p.slug });
    }
    return map;
  }, [products]);

  const getShownCount = () => parseInt(sessionStorage.getItem(SESSION_KEY) || "0", 10);
  const incCount = () => sessionStorage.setItem(SESSION_KEY, String(getShownCount() + 1));

  const showNext = useCallback(() => {
    if (getShownCount() >= MAX_POPUPS) return;
    setCurrentIndex((prev) => (prev + 1) % order.length);
    setVisible(true);
    incCount();
    setTimeout(() => setVisible(false), 5000);
  }, [order]);

  useEffect(() => {
    if (getShownCount() >= MAX_POPUPS) return;
    const initialTimer = setTimeout(showNext, 8000);
    const interval = setInterval(() => {
      if (getShownCount() >= MAX_POPUPS) return;
      showNext();
    }, 15000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [showNext]);

  if (!visible) return null;

  const sale = PURCHASE_DATA[order[currentIndex]];
  const match = productImageMap.get(sale.product.toLowerCase());
  const slug = match?.slug || "the-answer";

  return (
    <Link
      to={`/shop/${slug}`}
      className="fixed bottom-20 left-4 z-50 max-w-[320px] block"
      style={{ animation: "saleSlideIn 0.35s ease-out forwards" }}
      onClick={() => setVisible(false)}
    >
      <div
        className="rounded-xl shadow-lg flex items-start gap-3 p-3.5"
        style={{
          background: "rgba(255,255,255,0.97)",
          border: "1px solid rgba(0,0,0,0.06)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Thumbnail */}
        <div
          className="flex-shrink-0 w-[60px] h-[60px] rounded-lg overflow-hidden flex items-center justify-center"
          style={{ background: "#fafafa" }}
        >
          {match?.image ? (
            <img
              src={match.image}
              alt={sale.product}
              className="w-full h-full object-contain p-1"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-lg"
              style={{ color: "#1b4332" }}
            >
              🌿
            </div>
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: "#333",
              lineHeight: 1.3,
            }}
          >
            Someone in {sale.city}, {sale.country}
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#555",
              lineHeight: 1.3,
            }}
          >
            just purchased <strong>{sale.product}</strong>
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              color: "#999",
              marginTop: 2,
            }}
          >
            {sale.minutes} minute{sale.minutes !== 1 ? "s" : ""} ago
          </p>
        </div>

        {/* Close */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setVisible(false);
          }}
          className="flex-shrink-0 p-1 hover:opacity-70"
        >
          <X className="w-3.5 h-3.5" style={{ color: "#999" }} />
        </button>
      </div>

      <style>{`
        @keyframes saleSlideIn {
          from { transform: translateX(-110%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </Link>
  );
}

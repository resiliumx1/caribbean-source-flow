import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RECENT_SALES = [
  { name: "Sarah M.", location: "Miami, FL", product: "Sea Moss Gold", time: "2 minutes ago" },
  { name: "David R.", location: "London, UK", product: "The Answer Tincture", time: "5 minutes ago" },
  { name: "Keisha T.", location: "Castries, St. Lucia", product: "Soursop Bitters", time: "8 minutes ago" },
  { name: "Marcus J.", location: "Toronto, Canada", product: "Alkaline Herbal Bundle", time: "12 minutes ago" },
  { name: "Amara L.", location: "Brooklyn, NY", product: "Moringa Capsules", time: "15 minutes ago" },
  { name: "James W.", location: "Atlanta, GA", product: "Seamoss Gel (32oz)", time: "18 minutes ago" },
  { name: "Priya S.", location: "Birmingham, UK", product: "Detox Tea Blend", time: "22 minutes ago" },
  { name: "Tamika B.", location: "Houston, TX", product: "Elderberry Syrup", time: "25 minutes ago" },
  { name: "Andre C.", location: "Vieux Fort, St. Lucia", product: "Turmeric & Ginger Elixir", time: "30 minutes ago" },
  { name: "Nicole F.", location: "Los Angeles, CA", product: "Full Body Cleanse Kit", time: "35 minutes ago" },
  { name: "Omar H.", location: "Chicago, IL", product: "Irish Sea Moss Capsules", time: "40 minutes ago" },
  { name: "Grace P.", location: "Kingston, Jamaica", product: "Fertility Blend", time: "45 minutes ago" },
];

export function RecentSalesPopup() {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const showNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % RECENT_SALES.length);
    setVisible(true);
    setTimeout(() => setVisible(false), 5000);
  }, []);

  useEffect(() => {
    const initialTimer = setTimeout(showNext, 15000);
    const interval = setInterval(showNext, 45000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [showNext]);

  const sale = RECENT_SALES[currentIndex];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-20 left-4 z-50 max-w-xs"
        >
          <div className="bg-card border border-border rounded-xl shadow-lg p-3.5 flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug">
                {sale.name} <span className="text-muted-foreground font-normal">from</span> {sale.location}
              </p>
              <p className="text-sm text-primary font-semibold truncate">
                purchased {sale.product}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{sale.time}</p>
            </div>
            <button
              onClick={() => setVisible(false)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

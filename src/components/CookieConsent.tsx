import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "mkrc-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // Small delay so banner doesn't fight with gate entrance
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="Cookie consent"
          className="fixed bottom-0 inset-x-0 z-[9998] shadow-[0_-4px_18px_rgba(0,0,0,0.18)]"
          style={{ backgroundColor: "#1a3c2a", color: "#f5f0e0" }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <p
              className="text-sm leading-relaxed text-center sm:text-left flex-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              We use cookies to improve your experience. See our{" "}
              <Link
                to="/privacy-policy"
                className="underline underline-offset-2"
                style={{ color: "#c9a84c" }}
              >
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <Link
                to="/privacy-policy"
                className="text-sm underline underline-offset-2 min-h-[44px] inline-flex items-center px-2"
                style={{ color: "#c9a84c" }}
              >
                Learn More
              </Link>
              <button
                type="button"
                onClick={accept}
                className="min-h-[44px] px-5 rounded-md text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "#c9a84c",
                  color: "#1a3c2a",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
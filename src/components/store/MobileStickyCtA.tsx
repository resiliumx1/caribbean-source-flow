import { ArrowRight } from "lucide-react";

export function MobileStickyCtA() {
  const handleClick = () => {
    // Dispatch event to open the concierge/chat panel
    window.dispatchEvent(new CustomEvent("open-concierge"));
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{
        background: "var(--site-green-dark)",
        borderTop: "1px solid var(--site-gold)",
      }}
    >
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 transition-all hover:bg-white/5"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "14px",
          fontWeight: 500,
          color: "#F5F1E8",
          minHeight: "64px",
        }}
      >
        Not sure which protocol? Ask a Practitioner
        <ArrowRight className="w-4 h-4" style={{ color: "var(--site-gold)" }} />
      </button>
    </div>
  );
}

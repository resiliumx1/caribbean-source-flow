import { MessageCircle } from "lucide-react";

export function MobileStickyCtA() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-concierge"));
  };

  return (
    <>
      {/* Desktop: slim banner */}
      <div
        className="hidden md:block fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: '#1b4332',
          borderTop: '1px solid rgba(212,163,115,0.3)',
        }}
      >
        <button
          onClick={handleClick}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 transition-all hover:bg-white/5"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            color: '#F5F1E8',
          }}
        >
          <MessageCircle className="w-4 h-4" style={{ color: '#d4a373' }} />
          Not sure which protocol? Ask our AI Herbal Physician
        </button>
      </div>
    </>
  );
}

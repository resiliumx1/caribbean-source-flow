import { MessageCircle } from "lucide-react";
import { useState } from "react";

export function MobileStickyCtA() {
  const [pulsed, setPulsed] = useState(false);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-concierge"));
  };

  return (
    <>
      {/* Mobile: floating chat bubble */}
      <button
        onClick={handleClick}
        onAnimationEnd={() => setPulsed(true)}
        className="fixed bottom-6 right-5 z-40 md:hidden flex items-center justify-center rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95"
        style={{
          width: 56,
          height: 56,
          background: '#1b4332',
          border: '2px solid #d4a373',
          animation: pulsed ? 'none' : 'chatPulse 2s ease-out 1s 2',
        }}
        aria-label="Ask our AI Herbal Physician"
      >
        <MessageCircle className="w-6 h-6" style={{ color: '#d4a373' }} />
      </button>

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

      <style>{`
        @keyframes chatPulse {
          0% { box-shadow: 0 0 0 0 rgba(27,67,50,0.5); }
          70% { box-shadow: 0 0 0 14px rgba(27,67,50,0); }
          100% { box-shadow: 0 0 0 0 rgba(27,67,50,0); }
        }
      `}</style>
    </>
  );
}

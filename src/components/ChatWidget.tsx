import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { X, ChevronDown } from "lucide-react";

const MountKailashChat = lazy(() => import("@/components/MountKailashChat"));

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show intro bubble after 5s
  useEffect(() => {
    bubbleTimer.current = setTimeout(() => {
      if (!bubbleDismissed) setShowBubble(true);
    }, 5000);
    return () => { if (bubbleTimer.current) clearTimeout(bubbleTimer.current); };
  }, []);

  // Auto-dismiss bubble after 8s
  useEffect(() => {
    if (showBubble) {
      autoDismissTimer.current = setTimeout(() => {
        setShowBubble(false);
        setBubbleDismissed(true);
      }, 8000);
      return () => { if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current); };
    }
  }, [showBubble]);

  const dismissBubble = () => {
    setShowBubble(false);
    setBubbleDismissed(true);
  };

  const toggleChat = () => {
    if (!isOpen) {
      dismissBubble();
    }
    setIsOpen((v) => !v);
  };

  return (
    <>
      {/* Intro Bubble */}
      {showBubble && !isOpen && (
        <div
          className="fixed z-[9999] animate-fade-in"
          style={{
            bottom: 90,
            right: 16,
            width: "min(320px, calc(100vw - 40px))",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              color: "#1c4a1c",
              borderRadius: 14,
              padding: "14px 16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              fontFamily: "Jost, sans-serif",
              fontSize: 14,
              lineHeight: 1.5,
              position: "relative",
            }}
          >
            <button
              onClick={dismissBubble}
              style={{
                position: "absolute",
                top: 6,
                right: 8,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#1c4a1c",
                opacity: 0.5,
                fontSize: 16,
              }}
              aria-label="Dismiss"
            >
              ✕
            </button>
            <span>
              👋 Need help finding the right herb? I'm your personal health
              advisor — ask me anything!
            </span>
            {/* Triangle arrow */}
            <div
              style={{
                position: "absolute",
                bottom: -8,
                right: 28,
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "8px solid #ffffff",
              }}
            />
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-[9999] w-[60px] h-[60px] rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{
          background: isOpen
            ? "#1c4a1c"
            : "linear-gradient(135deg, #1c4a1c, #2e6e2e)",
          boxShadow: "0 8px 32px rgba(28,74,28,0.4)",
        }}
        aria-label={isOpen ? "Close chat" : "Open health advisor chat"}
      >
        {isOpen ? (
          <ChevronDown className="w-7 h-7 text-white" />
        ) : (
          <>
            <span style={{ fontSize: 28, lineHeight: 1 }}>🌿</span>
            {/* Pulsing red dot */}
            <span
              className="absolute top-0 right-0 w-3 h-3 rounded-full"
              style={{
                background: "#ef4444",
                border: "2px solid #1c4a1c",
                animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
              }}
            />
          </>
        )}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div
          className="fixed z-[9999] flex flex-col overflow-hidden"
          style={{
            bottom: "max(16px, env(safe-area-inset-bottom, 16px))",
            right: 16,
            width: "min(420px, calc(100vw - 32px))",
            height: "min(85vh, calc(100vh - 32px))",
            borderRadius: 16,
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            animation: "chatSlideUp 400ms cubic-bezier(0.34,1.56,0.64,1) forwards",
            background: "#0a0a0a",
          }}
        >
          {/* Close button overlay */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ background: "rgba(0,0,0,0.4)" }}
            aria-label="Close chat"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* MountKailashChat rendered inline */}
          <div className="flex-1 overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full" style={{ background: "#0a0a0a" }}>
                  <span style={{ fontSize: 32 }}>🌿</span>
                </div>
              }
            >
              <MountKailashChat />
            </Suspense>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

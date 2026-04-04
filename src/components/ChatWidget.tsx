import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const MountKailashChat = lazy(() => import("@/components/MountKailashChat"));

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  showHandoff?: boolean;
}

const DEFAULT_WELCOME: ChatMessage = {
  role: "assistant",
  content: "Blessed Love 🌿\n\nWelcome to Mount Kailash Rejuvenation Centre. I'm your AI Health Assistant — here to guide you on your path to natural wellness.\n\nI can help you with:\n• 🌿 Finding the right herbal remedy for your condition\n• 💊 Understanding our product range and bundles\n• 🏔️ Learning about our 7-day healing retreats in St. Lucia\n• 📚 Exploring our herbal physician training school\n• 📦 Wholesale & practitioner sourcing\n\nWhat brings you here today? Tell me your health concern or goal and I'll guide you to the right solution.",
  showHandoff: false,
};

export default function ChatWidget() {
  const [visible, setVisible] = useState(() => {
    return !!localStorage.getItem('mkrc-gate-seen');
  });

  useEffect(() => {
    if (visible) return;
    const onComplete = () => setVisible(true);
    window.addEventListener('gate-complete', onComplete);
    return () => window.removeEventListener('gate-complete', onComplete);
  }, [visible]);

  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useIsMobile();

  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME]);

  useEffect(() => {
    bubbleTimer.current = setTimeout(() => {
      if (!bubbleDismissed) setShowBubble(true);
    }, 5000);
    return () => { if (bubbleTimer.current) clearTimeout(bubbleTimer.current); };
  }, []);

  useEffect(() => {
    if (showBubble) {
      autoDismissTimer.current = setTimeout(() => {
        setShowBubble(false);
        setBubbleDismissed(true);
      }, 8000);
      return () => { if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current); };
    }
  }, [showBubble]);

  const dismissBubble = () => { setShowBubble(false); setBubbleDismissed(true); };

  const toggleChat = () => {
    if (!isOpen) {
      dismissBubble();
      setIsMinimized(false);
    }
    setIsOpen((v) => !v);
  };

  const getPopupStyle = (): React.CSSProperties => {
    if (isMinimized) {
      return {
        bottom: isMobile ? 80 : "max(16px, env(safe-area-inset-bottom, 16px))",
        right: isMobile ? 8 : 16,
        width: isMobile ? "92vw" : 420,
        height: 48,
        borderRadius: 16,
      };
    }
    if (isMobile) {
      return { bottom: 0, right: 0, left: 0, width: '100vw', height: '95vh', borderRadius: '20px 20px 0 0' };
    }
    if (isMaximized) {
      return { bottom: 16, right: 16, width: 600, height: "calc(100vh - 88px)", borderRadius: 16, top: "auto" };
    }
    return {
      bottom: "max(16px, env(safe-area-inset-bottom, 16px))",
      right: 16, width: 420, height: "min(82vh, calc(100vh - 32px))", borderRadius: 16,
    };
  };

  if (!visible) return null;

  return (
    <>
      {/* Speech bubble - only when chat closed */}
      {showBubble && !isOpen && (
        <div className="fixed z-[9999] animate-fade-in" style={{ bottom: 90, right: 16, width: "min(320px, calc(100vw - 40px))" }}>
          <div style={{
            background: "#ffffff", color: "#1c4a1c", borderRadius: 14,
            padding: "14px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.5, position: "relative",
          }}>
            <button onClick={dismissBubble} style={{
              position: "absolute", top: 6, right: 8, background: "none", border: "none",
              cursor: "pointer", color: "#1c4a1c", opacity: 0.5, fontSize: 16,
            }} aria-label="Dismiss">✕</button>
            <span>👋 Need help finding the right herb? I'm your personal health advisor — ask me anything!</span>
            <div style={{
              position: "absolute", bottom: -8, right: 28, width: 0, height: 0,
              borderLeft: "8px solid transparent", borderRight: "8px solid transparent",
              borderTop: "8px solid #ffffff",
            }} />
          </div>
        </div>
      )}

      {/* Star icon FAB - HIDDEN when chat is open */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-[9999] w-[60px] h-[60px] rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #1c4a1c, #2e6e2e)",
            boxShadow: "0 8px 32px rgba(28,74,28,0.4)",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease 0.3s",
          }}
          aria-label="Open health advisor chat"
        >
          <img src="/star-seal-for-lovable.png" alt="Mount Kailash" style={{ width: 34, height: 34, filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full" style={{
            background: "#ef4444",
            border: "2px solid #1c4a1c",
            animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
          }} />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed z-[9000] flex flex-col overflow-hidden"
          style={{
            ...getPopupStyle(),
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            animation: "chatSlideUp 400ms cubic-bezier(0.34,1.56,0.64,1) forwards",
            background: "#0a0a0a",
            transition: "width 0.3s ease, height 0.3s ease, border-radius 0.3s ease",
          }}
        >
          {/* Header Row 1: Title + controls */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 12px 4px 14px", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img src="/star-seal-for-lovable.png" alt="" style={{ width: 22, height: 22, filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: '#e8c870', textTransform: 'uppercase' }}>
                Mount Kailash
              </span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {!isMobile && (
                <button onClick={() => setIsMinimized((v) => !v)} style={{
                  width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }} aria-label={isMinimized ? "Restore" : "Minimize"}>
                  <span className="text-white text-sm" style={{ opacity: 0.85, lineHeight: 1 }}>—</span>
                </button>
              )}
              {!isMobile && (
                <button onClick={() => { setIsMaximized((v) => !v); setIsMinimized(false); }} style={{
                  width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }} aria-label={isMaximized ? "Restore size" : "Maximize"}>
                  {isMaximized ? <Minimize2 className="w-3.5 h-3.5 text-white" style={{ opacity: 0.85 }} /> : <Maximize2 className="w-3.5 h-3.5 text-white" style={{ opacity: 0.85 }} />}
                </button>
              )}
              <button onClick={() => { setIsOpen(false); setIsMaximized(false); setIsMinimized(false); }} style={{
                width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }} aria-label="Close chat">
                <X className="w-4 h-4 text-white" style={{ opacity: 0.85 }} />
              </button>
            </div>
          </div>

          {/* Chat content */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
              <Suspense fallback={
                <div className="flex items-center justify-center h-full" style={{ background: "#0a0a0a" }}>
                  <span style={{ fontSize: 32 }}>🌿</span>
                </div>
              }>
                <MountKailashChat externalMessages={messages} setExternalMessages={setMessages} />
              </Suspense>
            </div>
          )}

          {isMinimized && (
            <div onClick={() => setIsMinimized(false)} style={{
              height: 48, display: "flex", alignItems: "center", padding: "0 16px", gap: 10, cursor: "pointer",
              background: "#1c4a1c", color: "#e8c870", fontSize: 13,
              letterSpacing: "0.5px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            }}>
              <img src="/star-seal-for-lovable.png" alt="" style={{ width: 22, height: 22, filter: 'brightness(0) invert(1)', opacity: 0.85 }} />
              Mount Kailash AI Assistant
            </div>
          )}
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

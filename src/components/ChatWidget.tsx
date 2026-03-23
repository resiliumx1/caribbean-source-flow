import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { X, Maximize2, Minimize2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MountKailashChat = lazy(() => import("@/components/MountKailashChat"));

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  showHandoff?: boolean;
}

const DEFAULT_WELCOME: ChatMessage = {
  role: "assistant",
  content: "Welcome to Mount Kailash Rejuvenation Centre 🌿\n\nI'm your personal herbal health advisor. Tell me what's troubling you — whether it's a symptom, condition, or health goal — and I'll recommend the perfect natural remedy from our wildcrafted herbal range.\n\nHow can I help you today?",
  showHandoff: false,
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

export default function ChatWidget() {
  const visible = true;

  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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
      setIsMobileFullscreen(false);
      setShowOptions(messages.length <= 1);
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
    if (isMobile && isMobileFullscreen) {
      return { top: 0, right: 0, bottom: 0, left: 0, width: "100vw", height: "100vh", borderRadius: 0 };
    }
    if (!isMobile && isMaximized) {
      return { bottom: 16, right: 16, width: 600, height: "calc(100vh - 88px)", borderRadius: 16, top: "auto" };
    }
    if (isMobile) {
      return { bottom: 80, right: 8, width: "92vw", height: "55vh", borderRadius: 16 };
    }
    return {
      bottom: "max(16px, env(safe-area-inset-bottom, 16px))",
      right: 16, width: 420, height: "min(82vh, calc(100vh - 32px))", borderRadius: 16,
    };
  };

  const isFullyCovering = isMobile && isMobileFullscreen;

  if (!visible) return null;

  return (
    <>
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

      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-[9999] w-[60px] h-[60px] rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{
          background: isOpen ? "#1c4a1c" : "linear-gradient(135deg, #1c4a1c, #2e6e2e)",
          boxShadow: "0 8px 32px rgba(28,74,28,0.4)",
          display: isOpen && !isMinimized ? "none" : "flex",
        }}
        aria-label={isOpen ? "Close chat" : "Open health advisor chat"}
      >
        {isOpen && isMinimized ? (
          <Plus className="w-6 h-6 text-white" />
        ) : (
          <>
            <span style={{ fontSize: 28, lineHeight: 1 }}>🌿</span>
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full" style={{
              background: isMinimized ? "#22c55e" : "#ef4444",
              border: "2px solid #1c4a1c",
              animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
            }} />
          </>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed z-[9000] flex flex-col overflow-hidden"
          style={{
            ...getPopupStyle(),
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            animation: isFullyCovering ? "none" : "chatSlideUp 400ms cubic-bezier(0.34,1.56,0.64,1) forwards",
            background: "#0a0a0a",
            transition: "width 0.3s ease, height 0.3s ease, border-radius 0.3s ease",
          }}
        >
          <div style={{
            position: "absolute", top: 0, right: 0, left: 0, height: 48, zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 10px", pointerEvents: "none",
          }}>
            <div style={{ pointerEvents: "auto", display: "flex", gap: 4 }}>
              {isMobile && !isMinimized && (
                <button onClick={() => setIsMobileFullscreen((v) => !v)} style={{
                  height: 26, borderRadius: 13, background: "rgba(0,0,0,0.45)", border: "none",
                  display: "flex", alignItems: "center", gap: 4, padding: "0 10px",
                  cursor: "pointer", color: "white", fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 500, opacity: 0.85,
                }}>
                  {isMobileFullscreen ? "⤡ Compact" : "⤢ Expand"}
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 4, pointerEvents: "auto" }}>
              <button onClick={() => setIsMinimized((v) => !v)} style={{
                width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "opacity 0.15s",
              }} aria-label={isMinimized ? "Restore" : "Minimize"}>
                <span className="text-white text-sm" style={{ opacity: 0.85, lineHeight: 1 }}>—</span>
              </button>
              {!isMobile && (
                <button onClick={() => { setIsMaximized((v) => !v); setIsMinimized(false); }} style={{
                  width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "opacity 0.15s",
                }} aria-label={isMaximized ? "Restore size" : "Maximize"}>
                  {isMaximized ? <Minimize2 className="w-3.5 h-3.5 text-white" style={{ opacity: 0.85 }} /> : <Maximize2 className="w-3.5 h-3.5 text-white" style={{ opacity: 0.85 }} />}
                </button>
              )}
              <button onClick={() => { setIsOpen(false); setIsMaximized(false); setIsMinimized(false); setIsMobileFullscreen(false); }} style={{
                width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "opacity 0.15s",
              }} aria-label="Close chat">
                <X className="w-4 h-4 text-white" style={{ opacity: 0.85 }} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex-1 overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
              {showOptions && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 205, background: '#0a0a0a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ textAlign: 'center', padding: '48px 20px 16px', flexShrink: 0 }}>
                    <img src="/star-seal.svg" alt="Mount Kailash" style={{ width: 44, height: 44, margin: '0 auto 12px', opacity: 0.85 }} />
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: '#F4EFEA', marginBottom: 4 }}>Mount Kailash Health Advisor</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 13, color: 'rgba(244,238,234,0.6)' }}>How can we help you today?</div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px' }}>
                    {[
                      { icon: '🌿', label: 'Personal Health Advice', sub: 'Find the right remedy for your condition', action: 'health' },
                      { icon: '🧴', label: 'Shop the Apothecary', sub: 'Browse tinctures, teas & bundles', action: 'shop' },
                      { icon: '🏔️', label: 'Book a Retreat', sub: '7-day healing immersion in St. Lucia', action: 'retreat' },
                      { icon: '📞', label: 'Book a Consultation', sub: 'Speak directly with Priest Kailash', action: 'consult' },
                      { icon: '📦', label: 'Wholesale / Practitioner', sub: 'Bulk orders, COA docs, partner pricing', action: 'wholesale' },
                      { icon: '🎓', label: 'Free Health Webinars', sub: 'Watch educational sessions with Priest Kailash', action: 'webinars' },
                    ].map((opt) => (
                      <button key={opt.action} onClick={() => {
                        if (opt.action === 'shop') { navigate('/shop'); setIsOpen(false); return; }
                        if (opt.action === 'retreat') { navigate('/retreats'); setIsOpen(false); return; }
                        if (opt.action === 'wholesale') { navigate('/wholesale'); setIsOpen(false); return; }
                        if (opt.action === 'webinars') { navigate('/webinars'); setIsOpen(false); return; }
                        if (opt.action === 'consult') { window.open('https://wa.me/13059429407?text=' + encodeURIComponent('Hello, I would like to book a consultation with Priest Kailash.'), '_blank'); return; }
                        setShowOptions(false);
                      }} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: '12px 14px', marginBottom: 8, cursor: 'pointer', textAlign: 'left', width: '100%' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,168,76,0.1)')} onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>
                        <span style={{ fontSize: 24, flexShrink: 0 }}>{opt.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: '#F4EFEA' }}>{opt.label}</div>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 12, color: 'rgba(244,238,234,0.5)' }}>{opt.sub}</div>
                        </div>
                        <span style={{ color: 'rgba(201,168,76,0.6)', fontSize: 18, flexShrink: 0 }}>›</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <Suspense fallback={
                <div className="flex items-center justify-center h-full" style={{ background: "#0a0a0a" }}>
                  <span style={{ fontSize: 32 }}>🌿</span>
                </div>
              }>
                <MountKailashChat externalMessages={messages} setExternalMessages={setMessages} />
              </Suspense>
              <img src="/star-seal.svg" alt="Mount Kailash" style={{
                position: "absolute", bottom: 12, left: 12, zIndex: 210,
                width: 36, height: 36, pointerEvents: "none", opacity: 0.7,
              }} />
              {!showOptions && (
                <button onClick={() => setShowOptions(true)} style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 210, background: 'rgba(28,74,28,0.85)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: '5px 12px', color: 'rgba(201,168,76,0.9)', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} aria-label="Back to menu">
                  ← Menu
                </button>
              )}
            </div>
          )}

          {isMinimized && (
            <div onClick={() => setIsMinimized(false)} style={{
              height: 48, display: "flex", alignItems: "center", padding: "0 16px", cursor: "pointer",
              background: "#1c4a1c", color: "#e8c870", fontWeight: "bold", fontSize: 13,
              letterSpacing: "0.5px", fontFamily: "Georgia, serif",
            }}>
              🌿 Mount Kailash Health Advisor
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
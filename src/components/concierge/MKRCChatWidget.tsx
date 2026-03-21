import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, ArrowUp, Phone } from "lucide-react";
import { useConcierge, ConciergeMessage } from "@/hooks/use-concierge";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const WHATSAPP_LINK = "https://wa.me/13059429407?text=Hi%20MKRC%2C%20I%20have%20a%20question";

const quickReplies = [
  "What is The Answer?",
  "Wholesale Info",
  "Book a Retreat",
  "Free Webinars",
];

export function MKRCChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [showDot, setShowDot] = useState(() => !sessionStorage.getItem("mkrc-chat-opened"));
  const [inactiveNudgeSent, setInactiveNudgeSent] = useState(false);
  const { messages, isLoading, sendMessage, clearHistory, initWelcome, whatsappLink } = useConcierge();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inactiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      sessionStorage.setItem("mkrc-chat-opened", "1");
      setShowDot(false);
      initWelcome(location.pathname);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, initWelcome, location.pathname]);

  // Inactivity nudge — 90s after last user message
  useEffect(() => {
    if (!isOpen || inactiveNudgeSent) return;
    if (inactiveTimerRef.current) clearTimeout(inactiveTimerRef.current);
    
    const hasUserMessage = messages.some(m => m.role === "user");
    if (!hasUserMessage) return;

    inactiveTimerRef.current = setTimeout(() => {
      if (!sessionStorage.getItem("mkrc-nudge-sent")) {
        sendMessage("__SYSTEM_NUDGE__"); // We'll handle this differently
        // Actually let's just inject a message directly
        setInactiveNudgeSent(true);
        sessionStorage.setItem("mkrc-nudge-sent", "1");
      }
    }, 90000);

    return () => {
      if (inactiveTimerRef.current) clearTimeout(inactiveTimerRef.current);
    };
  }, [isOpen, messages, inactiveNudgeSent]);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput("");
      // Reset textarea height
      if (inputRef.current) inputRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasUserMessages = messages.some(m => m.role === "user");

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] group">
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap" 
              style={{ background: '#1a1a1a', color: '#f2ead8', fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 12 }}>
              Ask MKRC AI
            </div>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-[60px] h-[60px] rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            style={{
              background: '#c9a84c',
              boxShadow: '0 8px 32px rgba(201,168,76,0.4)',
              animation: 'pulseGold 8s ease-in-out infinite',
            }}
            aria-label="Open MKRC AI Assistant"
          >
            <MessageCircle className="w-7 h-7 text-white" />
            {showDot && (
              <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-red-500 border-2" style={{ borderColor: '#c9a84c' }} />
            )}
          </button>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed z-[9999] flex flex-col overflow-hidden"
          style={{
            bottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
            right: 16,
            width: 'min(380px, calc(100vw - 32px))',
            height: 'min(560px, 80vh)',
            background: '#0f0f0d',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: 20,
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            animation: 'chatSlideUp 400ms cubic-bezier(0.34,1.56,0.64,1) forwards',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 shrink-0" style={{
            height: 70,
            background: '#111111',
            borderBottom: '1px solid rgba(201,168,76,0.2)',
          }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.15)' }}>
                <span style={{ color: '#c9a84c', fontSize: 16 }}>✦</span>
              </div>
              <div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, fontSize: 18, color: '#f2ead8' }}>
                  MKRC Assistant
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 11, color: 'rgba(242,234,216,0.5)' }}>
                  🟢 Online · Powered by Lovable AI
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full hover:bg-white/5 transition-colors">
              <X className="w-5 h-5" style={{ color: '#c9a84c' }} />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(201,168,76,0.3) transparent' }}>
            {/* Welcome screen when no user messages */}
            {!hasUserMessages && messages.length <= 1 && (
              <div className="flex flex-col items-center justify-center text-center pt-6 pb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(201,168,76,0.1)' }}>
                  <span style={{ fontSize: 24, color: '#c9a84c' }}>✦</span>
                </div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 24, color: '#f2ead8', marginBottom: 8 }}>
                  How can I help you?
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 13, color: 'rgba(242,234,216,0.5)', maxWidth: 260, lineHeight: 1.5 }}>
                  Ask me about our products, retreats, webinars, wholesale, or Priest Kailash.
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <ChatBubble key={i} message={msg} />
              ))}
              {/* Typing indicator */}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3" style={{
                    background: '#1a1a1a',
                    borderRadius: '18px 18px 18px 4px',
                    border: '1px solid rgba(201,168,76,0.1)',
                  }}>
                    <div className="flex gap-1.5 items-center h-5">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-2 h-2 rounded-full" style={{
                          background: '#c9a84c',
                          animation: `typingBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Replies — show only on welcome */}
            {!hasUserMessages && (
              <div className="grid grid-cols-2 gap-2 mt-6">
                {quickReplies.map((text) => (
                  <button
                    key={text}
                    onClick={() => sendMessage(text)}
                    disabled={isLoading}
                    className="px-3 py-2.5 rounded-xl text-left transition-all hover:border-opacity-60"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(201,168,76,0.3)',
                      color: '#f2ead8',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 300,
                      fontSize: 13,
                    }}
                  >
                    {text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="shrink-0" style={{
            background: '#111111',
            borderTop: '1px solid rgba(201,168,76,0.2)',
            padding: '12px 12px 8px',
          }}>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about MKRC..."
                rows={1}
                className="flex-1 resize-none outline-none"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f2ead8',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                  fontSize: 14,
                  lineHeight: 1.5,
                  padding: '8px 4px',
                  maxHeight: 100,
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity"
                style={{
                  background: input.trim() ? '#c9a84c' : 'rgba(201,168,76,0.2)',
                  opacity: input.trim() ? 1 : 0.5,
                }}
              >
                <ArrowUp className="w-4 h-4 text-white" />
              </button>
            </div>
            {/* Footer */}
            <div className="text-center mt-2 pb-1" style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: 10,
              color: 'rgba(201,168,76,0.4)',
            }}>
              Powered by Lovable AI · For urgent matters use{' '}
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(201,168,76,0.6)', textDecoration: 'underline' }}>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulseGold {
          0%, 85%, 100% { box-shadow: 0 8px 32px rgba(201,168,76,0.4); }
          90% { box-shadow: 0 8px 32px rgba(201,168,76,0.4), 0 0 0 0 rgba(201,168,76,0.4); }
          95% { box-shadow: 0 8px 32px rgba(201,168,76,0.4), 0 0 0 12px rgba(201,168,76,0); }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </>
  );
}

function ChatBubble({ message }: { message: ConciergeMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className="max-w-[85%]"
        style={{
          background: isUser ? '#c9a84c' : '#1a1a1a',
          color: isUser ? '#090909' : '#f2ead8',
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: isUser ? 400 : 300,
          fontSize: 14,
          lineHeight: isUser ? 1.5 : 1.6,
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '12px 16px',
          border: isUser ? 'none' : '1px solid rgba(201,168,76,0.1)',
        }}
      >
        <div className="prose prose-sm max-w-none" style={{ color: 'inherit' }}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p style={{ margin: '0 0 8px', color: 'inherit' }} className="last:mb-0">{children}</p>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: isUser ? '#090909' : '#c9a84c', textDecoration: 'underline' }}>
                  {children}
                </a>
              ),
              strong: ({ children }) => <strong style={{ fontWeight: 600, color: 'inherit' }}>{children}</strong>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
      {/* WhatsApp handoff below every AI message */}
      {!isUser && (
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 mt-1.5 px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderLeft: '3px solid rgba(201,168,76,0.4)',
          }}
        >
          <Phone className="w-3 h-3" style={{ color: '#25D366' }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: 11,
            color: 'rgba(201,168,76,0.7)',
          }}>
            Speak with our team on WhatsApp →
          </span>
        </a>
      )}
    </div>
  );
}

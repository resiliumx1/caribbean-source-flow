import { useEffect, useRef, useState } from "react";
import { Star, X, Send, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-assistant`;
const PUBLISHABLE = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export default function AdminChat() {
  const { isAdmin, isLoading } = useAdmin();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  if (isLoading || !isAdmin) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in");
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: PUBLISHABLE,
        },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setMessages((m) => [...m, { role: "assistant", content: data.text || "(no response)" }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${e.message || "Something went wrong."}` }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const gold = "linear-gradient(135deg, #e6b800 0%, #b8860b 100%)";

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Admin assistant"
          className="fixed z-[60] rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
          style={{
            bottom: "max(16px, env(safe-area-inset-bottom, 16px))",
            right: 16,
            width: 56,
            height: 56,
            background: gold,
            border: "2px solid #fff8dc",
            boxShadow: "0 6px 20px rgba(184, 134, 11, 0.45)",
          }}
        >
          <Star className="w-6 h-6 text-white" fill="white" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          className="fixed z-[60] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            bottom: "max(16px, env(safe-area-inset-bottom, 16px))",
            right: 16,
            width: "min(420px, calc(100vw - 32px))",
            height: "min(620px, calc(100vh - 32px))",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 text-white" style={{ background: gold }}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4" fill="white" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold leading-tight truncate">Admin Assistant</div>
                <div className="text-[10px] opacity-90 uppercase tracking-wide">Read-only · Internal</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  aria-label="Clear conversation"
                  className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/20">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: gold }}>
                  <Star className="w-7 h-7 text-white" fill="white" />
                </div>
                <p className="text-sm font-bold text-foreground mb-1">Hello, admin.</p>
                <p className="text-xs text-muted-foreground mb-4 px-4">
                  Ask about orders, products, or how to use any tab.
                </p>
                <div className="flex flex-col gap-2 max-w-[280px] mx-auto">
                  {[
                    "Show me unpaid orders",
                    "How many orders are pending fulfillment?",
                    "What does the Reviews tab do?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="text-xs text-left px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_code]:text-xs">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-border p-2.5 bg-card">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Ask about an order, product, or tab…"
                rows={1}
                className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-32"
              />
              <button
                onClick={send}
                disabled={!input.trim() || sending}
                aria-label="Send"
                className="h-10 w-10 rounded-lg flex items-center justify-center text-white disabled:opacity-40"
                style={{ background: gold }}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
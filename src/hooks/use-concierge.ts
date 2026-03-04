import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

export interface ConciergeMessage {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/concierge-chat`;
const WHATSAPP_LINK = "https://wa.me/13059429407?text=Hi%20MKRC%2C%20I%20have%20a%20question";

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

function getPageGreeting(pathname: string): string {
  if (pathname.startsWith("/wholesale")) {
    return "Welcome! Looking for wholesale Caribbean botanicals? I can help with pricing, documentation, and our Miami warehouse. What would you like to know?";
  }
  if (pathname.startsWith("/retreats")) {
    return "Welcome! Interested in a healing retreat in Saint Lucia with Priest Kailash? I can tell you about our private and group programs. What would you like to know?";
  }
  if (pathname.startsWith("/the-answer")) {
    return "Welcome! The Answer is one of our most powerful formulas. Do you have questions about the ingredients, how to use it, or Chronixx's experience with it?";
  }
  if (pathname.startsWith("/webinars")) {
    return "Welcome! All MKRC webinars are completely free. Are you looking for upcoming sessions or want to browse past recordings?";
  }
  if (pathname.startsWith("/shop")) {
    return "Welcome! I can help you find the right herbal formulation for your wellness goals. Are you looking for something specific or would you like a recommendation?";
  }
  if (pathname.startsWith("/school")) {
    return "Welcome! Interested in the Mount Kailash School of Esoteric Knowledge? I can tell you about our formal herbal medicine training programs.";
  }
  return "Welcome to Mount Kailash Rejuvenation Centre 🌿 I'm here to help with products, retreats, webinars, wholesale, or anything else. What can I help you with?";
}

export function useConcierge() {
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string>(generateSessionId());
  const location = useLocation();
  const initializedRef = useRef(false);

  // Page-aware welcome message
  const initWelcome = useCallback((pathname: string) => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setMessages([
        { role: "assistant", content: getPageGreeting(pathname) },
      ]);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ConciergeMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    let assistantContent = "";

    const updateAssistantMessage = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const allMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          sessionId: sessionIdRef.current,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const chunkContent = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (chunkContent) updateAssistantMessage(chunkContent);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const chunkContent = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (chunkContent) updateAssistantMessage(chunkContent);
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      console.error("Concierge error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I'm having a moment — our team can help you directly on WhatsApp right now.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearHistory = useCallback(() => {
    sessionIdRef.current = generateSessionId();
    initializedRef.current = false;
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    initWelcome,
    whatsappLink: WHATSAPP_LINK,
  };
}

import { useState, useCallback, useRef, useEffect } from "react";

export interface ConciergeMessage {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/concierge-chat`;

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function useConcierge() {
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string>(generateSessionId());

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `Welcome to Mount Kailash. I'm your Dispensary Guide.

I can help you:
- Find the right formulation for your wellness goals
- Explain our bush medicine traditions
- Check retreat availability
- Connect you with our wholesale team

**Note:** I provide information about traditional St. Lucian bush medicine. This is not medical advice. Always consult your physician.

How may I assist you?`,
        },
      ]);
    }
  }, [messages.length]);

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
          // Update the last assistant message
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        // Add new assistant message
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

      if (!response.body) {
        throw new Error("No response body");
      }

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
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const chunkContent = parsed.choices?.[0]?.delta?.content as
              | string
              | undefined;
            if (chunkContent) {
              updateAssistantMessage(chunkContent);
            }
          } catch {
            // Incomplete JSON, put back and wait for more
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
            const chunkContent = parsed.choices?.[0]?.delta?.content as
              | string
              | undefined;
            if (chunkContent) {
              updateAssistantMessage(chunkContent);
            }
          } catch {
            /* ignore partial leftovers */
          }
        }
      }
    } catch (err) {
      console.error("Concierge error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble connecting right now. Please reach out directly via WhatsApp: [+1 (758) 285-5195](https://wa.me/17582855195)",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearHistory = useCallback(() => {
    sessionIdRef.current = generateSessionId();
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
  };
}

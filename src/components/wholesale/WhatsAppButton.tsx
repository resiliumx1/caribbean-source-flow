import { MessageCircle } from "lucide-react";

export const WhatsAppButton = () => {
  const whatsappMessage = encodeURIComponent(
    "Hi, I'm interested in wholesale botanicals from St. Lucia for my business. Can you help with availability and custom pricing?"
  );

  return (
    <a
      href={`https://wa.me/13059429407?text=${whatsappMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 hover:brightness-110"
      style={{ background: "#c9a84c", color: "#090909" }}
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
};

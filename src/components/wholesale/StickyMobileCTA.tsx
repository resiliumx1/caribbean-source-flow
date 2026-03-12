import { MessageCircle } from "lucide-react";

export const StickyMobileCTA = () => {
  const whatsappMessage = encodeURIComponent(
    "Hi, I'm interested in wholesale botanicals from St. Lucia for my business. Can you help with availability and custom pricing?"
  );

  return (
    <a
      href={`https://wa.me/13059429407?text=${whatsappMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-center gap-2"
      style={{
        height: "64px",
        background: "var(--site-green-dark)",
        borderTop: "1px solid var(--site-gold)",
        color: "var(--site-footer-text)",
        fontFamily: "'Jost', sans-serif",
        fontWeight: 500,
        fontSize: "15px",
      }}
    >
      <MessageCircle className="w-5 h-5" style={{ color: "var(--site-gold)" }} />
      Speak With Our Team
    </a>
  );
};

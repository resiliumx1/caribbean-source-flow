import { MessageCircle } from "lucide-react";
import { useStore } from "@/lib/store-context";

export function WhatsAppFloat() {
  const { whatsappNumber, salesManager } = useStore();

  const whatsappMessage = encodeURIComponent(
    "Hello, I'd like a consultation on which products are right for me."
  );

  return (
    <a
      href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float group"
      aria-label={`Chat with ${salesManager} on WhatsApp`}
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}

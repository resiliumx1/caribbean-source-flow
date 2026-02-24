import { TrinityHero } from "@/components/trinity/TrinityHero";
import { OriginStory } from "@/components/trinity/OriginStory";
import { SocialProofMatrix } from "@/components/trinity/SocialProofMatrix";
import { ByTheNumbers } from "@/components/trinity/ByTheNumbers";
import { ReSegmentation } from "@/components/trinity/ReSegmentation";
import { UnifiedFooter } from "@/components/trinity/UnifiedFooter";
import { MessageCircle } from "lucide-react";

const GoddessWhatsApp = () => (
  <a
    href={`https://wa.me/13059429407?text=${encodeURIComponent("Hello Goddess Itopia, I have a question about Mount Kailash products.")}`}
    target="_blank"
    rel="noopener noreferrer"
    className="whatsapp-float group"
    aria-label="Chat with Goddess Itopia on WhatsApp"
  >
    <MessageCircle className="w-6 h-6" />
  </a>
);

const TrinityHomepage = () => {
  return (
    <main className="min-h-screen">
      <TrinityHero />
      <OriginStory />
      <SocialProofMatrix />
      <ByTheNumbers />
      <ReSegmentation />
      <UnifiedFooter />
      <GoddessWhatsApp />
    </main>
  );
};

export default TrinityHomepage;

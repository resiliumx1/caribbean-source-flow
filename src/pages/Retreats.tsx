import { useEffect } from "react";
import { RetreatsHero } from "@/components/retreats/RetreatsHero";
import { RetreatPathSplit } from "@/components/retreats/RetreatPathSplit";
import { ProtocolTimeline } from "@/components/retreats/ProtocolTimeline";
import { RetreatGallery } from "@/components/retreats/RetreatGallery";
import { RetreatVideoGallery } from "@/components/retreats/RetreatVideoGallery";
import { TransformationStories } from "@/components/retreats/TransformationStories";
import { PriestKailashBio } from "@/components/retreats/PriestKailashBio";
import { RetreatCalendar } from "@/components/retreats/RetreatCalendar";
import { GroupRetreatsList } from "@/components/retreats/GroupRetreatsList";
import { RetreatFAQ } from "@/components/retreats/RetreatFAQ";
import { UnifiedFooter } from "@/components/trinity/UnifiedFooter";
import { MessageCircle } from "lucide-react";

const GoddessWhatsApp = () => (
  <a
    href={`https://wa.me/13059429407?text=${encodeURIComponent("Hello Goddess Itopia, I'd like to learn more about the retreats.")}`}
    target="_blank"
    rel="noopener noreferrer"
    className="whatsapp-float group"
    aria-label="Chat with Goddess Itopia on WhatsApp"
  >
    <MessageCircle className="w-6 h-6" />
  </a>
);

const Retreats = () => {
  useEffect(() => {
    document.title = "Healing Retreats in Saint Lucia | Private & Group Programs | Mount Kailash";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Experience healing retreats in Saint Lucia's rainforest. Private and group wellness programs led by Priest Kailash Kay Leonce. All-inclusive with herbal protocols.");
  }, []);

  return (
    <main className="min-h-screen">
      <RetreatsHero />
      <RetreatPathSplit />
      <ProtocolTimeline />
      <RetreatCalendar />
      <GroupRetreatsList />
      <RetreatGallery />
      <RetreatVideoGallery />
      <TransformationStories />
      <PriestKailashBio />
      <RetreatFAQ />
      <UnifiedFooter />
      <GoddessWhatsApp />
    </main>
  );
};

export default Retreats;

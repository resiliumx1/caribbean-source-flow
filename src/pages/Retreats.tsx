import { StoreHeader } from "@/components/store/StoreHeader";
import { RetreatsHero } from "@/components/retreats/RetreatsHero";
import { RetreatPathSplit } from "@/components/retreats/RetreatPathSplit";
import { ProtocolTimeline } from "@/components/retreats/ProtocolTimeline";
import { RetreatGallery } from "@/components/retreats/RetreatGallery";
import { TransformationStories } from "@/components/retreats/TransformationStories";
import { PriestKailashBio } from "@/components/retreats/PriestKailashBio";
import { RetreatCalendar } from "@/components/retreats/RetreatCalendar";
import { RetreatFAQ } from "@/components/retreats/RetreatFAQ";
import { UnifiedFooter } from "@/components/trinity/UnifiedFooter";
import { WhatsAppFloat } from "@/components/store/WhatsAppFloat";
import { ConciergeButton } from "@/components/concierge/ConciergeButton";

const Retreats = () => {
  return (
    <main className="min-h-screen">
      <StoreHeader />
      <RetreatsHero />
      <RetreatPathSplit />
      <ProtocolTimeline />
      <RetreatGallery />
      <TransformationStories />
      <PriestKailashBio />
      <RetreatCalendar />
      <RetreatFAQ />
      <UnifiedFooter />
      <WhatsAppFloat />
      <ConciergeButton />
    </main>
  );
};

export default Retreats;

import { TrinityHero } from "@/components/trinity/TrinityHero";
import { OriginStory } from "@/components/trinity/OriginStory";
import { SocialProofMatrix } from "@/components/trinity/SocialProofMatrix";
import { ByTheNumbers } from "@/components/trinity/ByTheNumbers";
import { ReSegmentation } from "@/components/trinity/ReSegmentation";
import { UnifiedFooter } from "@/components/trinity/UnifiedFooter";
import { WhatsAppButton } from "@/components/wholesale/WhatsAppButton";
import { ConciergeButton } from "@/components/concierge/ConciergeButton";
import { StoreHeader } from "@/components/store/StoreHeader";

const TrinityHomepage = () => {
  return (
    <>
      <StoreHeader />
      <main className="min-h-screen">
        <TrinityHero />
        <OriginStory />
        <SocialProofMatrix />
        <ByTheNumbers />
        <ReSegmentation />
        <UnifiedFooter />
        <WhatsAppButton />
        <ConciergeButton />
      </main>
    </>
  );
};

export default TrinityHomepage;

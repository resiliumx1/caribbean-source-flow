import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import FadeInStagger from "@/components/FadeInStagger";
import { RetreatsHero } from "@/components/retreats/RetreatsHero";
import { RetreatPathSplit } from "@/components/retreats/RetreatPathSplit";
import { ExperienceGrid } from "@/components/retreats/ExperienceGrid";
import { PriestKailashBio } from "@/components/retreats/PriestKailashBio";
import { RetreatGallery } from "@/components/retreats/RetreatGallery";
import { RetreatVideoGallery } from "@/components/retreats/RetreatVideoGallery";
import { TransformationStories } from "@/components/retreats/TransformationStories";
import { RetreatCalendar } from "@/components/retreats/RetreatCalendar";
import { GroupRetreatsList } from "@/components/retreats/GroupRetreatsList";
import { TikTokGuestJourney } from "@/components/retreats/TikTokGuestJourney";
import { RetreatFAQ } from "@/components/retreats/RetreatFAQ";
import { UnifiedFooter } from "@/components/trinity/UnifiedFooter";
import { MessageCircle } from "lucide-react";

const GoddessWhatsApp = () => (
  <a
    href={`https://wa.me/17582855195?text=${encodeURIComponent("Hello, I'd like to learn more about the retreats.")}`}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
    style={{ background: 'var(--site-gold)', color: 'var(--site-green-dark)' }}
    aria-label="Chat on WhatsApp"
  >
    <MessageCircle className="w-6 h-6" />
  </a>
);

const Retreats = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#calendar') {
      setTimeout(() => {
        document.getElementById('retreat-calendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [location.hash]);

  return (
    <main className="min-h-screen">
      <SEOHead title="Wellness Retreats in Saint Lucia | Mount Kailash" description="Immersive wellness retreats in St. Lucia's tropical rainforest. Group and private programs with plant-based cuisine, bush medicine workshops, and personal renewal." path="/retreats" />
      <RetreatsHero />
      <FadeInStagger delay={0.1}>
        <RetreatPathSplit />
      </FadeInStagger>
      <FadeInStagger delay={0.15}>
        <ExperienceGrid />
      </FadeInStagger>
      <FadeInStagger delay={0.2}>
        <PriestKailashBio />
      </FadeInStagger>
      <FadeInStagger delay={0.25}>
        <RetreatGallery />
      </FadeInStagger>
      <FadeInStagger delay={0.3}>
        <RetreatVideoGallery />
      </FadeInStagger>
      <FadeInStagger delay={0.35}>
        <TransformationStories />
      </FadeInStagger>
      <FadeInStagger delay={0.38}>
        <TikTokGuestJourney />
      </FadeInStagger>
      <FadeInStagger delay={0.4}>
        <RetreatFAQ />
      </FadeInStagger>
      <FadeInStagger delay={0.45}>
        <RetreatCalendar />
      </FadeInStagger>
      <FadeInStagger delay={0.5}>
        <GroupRetreatsList />
      </FadeInStagger>
      <UnifiedFooter />
      <GoddessWhatsApp />
    </main>
  );
};

export default Retreats;

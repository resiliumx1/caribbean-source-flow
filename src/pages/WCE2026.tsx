import { Helmet } from "react-helmet-async";
import { WceThemeProvider } from "@/components/wce/WceThemeProvider";
import { WceHero, WcePartnerStrip, WcePathwaysSection, WceSpeakersSection } from "@/components/wce/SectionsTop";
import { WceMediaSection, WceActivitiesSection, WceRetreatBand, WceApplicationForm } from "@/components/wce/SectionsMid";
import { WceFaqSection, WceFinalCta, WceFooter } from "@/components/wce/SectionsBottom";

export default function WCE2026() {
  return (
    <WceThemeProvider>
      <Helmet>
        <title>Caribbean Wellness Saint Lucia 2026 | 11–17 October</title>
        <meta
          name="description"
          content="Caribbean Wellness Saint Lucia 2026: wellness symposium, 6-day fortification retreat and LifeCraft experience at Mount Kailash Rejuvenation Centre, 11–17 October 2026."
        />
      </Helmet>
      <main>
        <WceHero />
        <WcePartnerStrip />
        <WcePathwaysSection />
        <WceSpeakersSection />
        <WceMediaSection />
        <WceActivitiesSection />
        <WceRetreatBand />
        <WceApplicationForm />
        <WceFaqSection />
        <WceFinalCta />
      </main>
      <WceFooter />
    </WceThemeProvider>
  );
}

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { useRetreatDates } from "@/hooks/use-retreats";
import retreatOg from "@/assets/retreat-hero-yoga.webp";
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
    href={`https://wa.me/13059429407?text=${encodeURIComponent("Hello, I'd like to learn more about the retreats.")}`}
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
  const { data: retreatDates = [] } = useRetreatDates();

  useEffect(() => {
    if (location.hash === '#calendar') {
      setTimeout(() => {
        document.getElementById('retreat-calendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [location.hash]);

  // Build a JSON-LD Event for every PUBLISHED, FUTURE retreat date.
  // Pull every value from the DB; skip any record missing a real start_date.
  const today = new Date().toISOString().split("T")[0];
  const eventSchemas = retreatDates
    .filter((d) => d?.start_date && d.start_date >= today)
    .map((d) => {
      const rt = d.retreat_types as { name?: string; slug?: string; base_price_usd?: number; description?: string } | undefined;
      const priceUsd = d.price_override_usd ?? rt?.base_price_usd;
      const url = rt?.slug
        ? `https://mountkailashslu.com/retreats/book/${rt.slug}`
        : "https://mountkailashslu.com/retreats";
      const schema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Event",
        name: rt?.name || "Mount Kailash Healing Retreat",
        ...(rt?.description ? { description: rt.description } : {}),
        startDate: d.start_date,
        ...(d.end_date ? { endDate: d.end_date } : {}),
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: "Mount Kailash Rejuvenation Centre",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Soufrière",
            addressRegion: "Saint Lucia",
            addressCountry: "LC",
          },
        },
        organizer: {
          "@type": "Organization",
          name: "Mount Kailash Rejuvenation Centre",
          url: "https://mountkailashslu.com",
        },
      };
      if (priceUsd != null) {
        schema.offers = {
          "@type": "Offer",
          price: Number(priceUsd).toFixed(2),
          priceCurrency: "USD",
          availability:
            d.spots_total && d.spots_booked >= d.spots_total
              ? "https://schema.org/SoldOut"
              : "https://schema.org/InStock",
          url,
        };
      }
      return schema;
    });

  const retreatsSchemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      name: "Mount Kailash Wellness Retreats",
      description:
        "7-day immersive wellness retreats in the volcanic highlands of Saint Lucia, with daily herbal feasts and clinical bush medicine protocols.",
      url: "https://mountkailashslu.com/retreats",
      address: { "@type": "PostalAddress", addressLocality: "Soufriere", addressCountry: "LC" },
    },
    ...eventSchemas,
  ];

  return (
    <main className="min-h-screen">
      <SEOHead
        title="Healing Retreats in Saint Lucia — 7-Day Herbal Detox | Mount Kailash"
        description="Immersive 7-day wellness retreats in the volcanic highlands of Soufrière, Saint Lucia. Herbal feasts, bush-medicine protocols and clinical consultations with Priest Kailash."
        path="/retreats"
        ogImage={retreatOg}
        breadcrumbs={[{ name: "Retreats", path: "/retreats" }]}
        schema={retreatsSchemas}
      />
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

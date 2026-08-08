import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { WceThemeProvider } from "@/components/wce/WceThemeProvider";
import { WceHero, WcePathwaysSection, WceSpeakersSection } from "@/components/wce/SectionsTop";
import { WceMediaSection, WceCeremonySection, WceRetreatBand, WceApplicationForm } from "@/components/wce/SectionsMid";
import { WceItinerarySection } from "@/components/wce/Itinerary";
import { WceWhoForSection, WceArcSection, WceIncludedSection, WceInvestmentSection, WceFortifiedBanner } from "@/components/wce/RetreatDetail";
import { WceLifeCraftSection } from "@/components/wce/LifeCraft";
import { WceFaqSection, WceFinalCta, WceFooter } from "@/components/wce/SectionsBottom";
import { useWceFaqs, useWcePathways, useWceSettings, useWceSpeakers, pathwayFeatures } from "@/components/wce/useWceData";
import { WceSubNav } from "@/components/wce/WceSubNav";
import { WceStickyCta } from "@/components/wce/WceStickyCta";
import { useWceAttribution } from "@/components/wce/useWceAttribution";
import { dataLayerPush } from "@/lib/tracking";
import { SITE_URL } from "@/lib/site-config";
import { EVENT_END, EVENT_START, RETREAT_END, RETREAT_START, SYMPOSIUM_DATE } from "@/components/wce/campaign";
import { speakerOgDescription, speakerOgTitle, speakerShareUrl } from "@/components/wce/share";
import type { WceSpeaker } from "@/components/wce/speaker-utils";

const PAGE_URL = `${SITE_URL}/wce-2026`;
// Stable, unhashed public path — social platforms cache the image URL aggressively.
const OG_IMAGE = `${SITE_URL}/og/wce-2026.jpg`;
/** Secondary square card, for platforms that prefer 1:1. Listed after the landscape one. */
const OG_IMAGE_SQUARE = `${SITE_URL}/og/wce-2026-square.jpg`;
const OG_TITLE = "Caribbean Wellness Experience Saint Lucia 2026";
const OG_DESCRIPTION =
  "11–17 October 2026 at Mount Kailash Rejuvenation Centre. A holistic symposium, fortification retreat and LifeCraft experience. What started in Jamaica continues in St. Lucia.";

export default function WCE2026() {
  const { data: settings } = useWceSettings();
  const { data: pathways } = useWcePathways();
  const { data: speakers } = useWceSpeakers();
  const { data: faqs } = useWceFaqs();
  const { slug } = useParams<{ slug?: string }>();
  const attribution = useWceAttribution();

  const speaker = slug
    ? (((speakers ?? []) as WceSpeaker[]).find((s) => s.slug === slug) ?? null)
    : null;
  const pageUrl = speaker?.slug ? speakerShareUrl(speaker.slug) : PAGE_URL;
  const shareTitle = speaker ? speakerOgTitle(speaker) : OG_TITLE;
  const shareDescription = speaker ? speakerOgDescription(speaker) : OG_DESCRIPTION;
  const shareImage = speaker?.og_image_url
    ? (speaker.og_image_url.startsWith("http") ? speaker.og_image_url : `${SITE_URL}${speaker.og_image_url}`)
    : OG_IMAGE;

  const pageViewFired = useRef(false);

  useEffect(() => {
    if (pageViewFired.current || !attribution.user_agent) return; // wait for UTM capture
    pageViewFired.current = true;
    dataLayerPush("page_view", {
      page_path: "/wce-2026",
      page_title: "Caribbean Wellness Saint Lucia 2026",
      utm_source: attribution.utm_source,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attribution.user_agent, attribution.utm_source]);

  const name = settings?.hero_headline?.trim() || "Caribbean Wellness Saint Lucia 2026";
  const description =
    settings?.hero_subline?.trim() ||
    "Caribbean Wellness Saint Lucia 2026: wellness symposium, 6-day fortification retreat and LifeCraft experience at Mount Kailash Rejuvenation Centre, 11–17 October 2026.";
  const venue = settings?.venue?.trim() || "Mount Kailash Rejuvenation Centre, St. Lucia";

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    description,
    startDate: EVENT_START,
    endDate: EVENT_END,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    image: [OG_IMAGE],
    url: PAGE_URL,
    location: {
      "@type": "Place",
      name: venue,
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
      url: SITE_URL,
    },
    // The symposium is the ticketed day; the retreat is application-only and so
    // is described as a sub-event with no offer. No capacity or attendee counts
    // are ever emitted.
    subEvent: [
      {
        "@type": "Event",
        name: "Caribbean Wellness Symposium",
        startDate: SYMPOSIUM_DATE,
        endDate: SYMPOSIUM_DATE,
        eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
        url: `${PAGE_URL}#pathways`,
      },
      {
        "@type": "Event",
        name: "Fortification Retreat",
        description:
          "Six-day fortification retreat at Mount Kailash Rejuvenation Centre, including LifeCraft experiences. Participation begins with an application reviewed by the Mount Kailash team.",
        startDate: RETREAT_START,
        endDate: RETREAT_END,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        url: `${PAGE_URL}#apply`,
        // Described as an application-gated offer so the price is discoverable
        // without ever presenting the retreat as directly purchasable.
        offers: {
          "@type": "Offer",
          name: "Fortification Retreat place",
          price: "4500.00",
          priceCurrency: "USD",
          availability: "https://schema.org/LimitedAvailability",
          url: `${PAGE_URL}#apply`,
          validFrom: "2026-01-01",
          description:
            "US$4,500 per person, including six nights of villa accommodation. A US$500 non-refundable deposit is requested after acceptance and credited toward the total.",
        },
      },
    ],
    offers: (pathways ?? [])
      // Only the symposium tiers are purchasable. The retreat must never be
      // advertised as buyable — it is gated behind application review.
      .filter((p) => Number(p.price) > 0 && p.key !== "retreat")
      .map((p) => ({
        "@type": "Offer",
        name: p.label,
        price: Number(p.price).toFixed(2),
        priceCurrency: p.currency || "USD",
        availability: p.is_open ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
        url: `${PAGE_URL}#pathways`,
        validFrom: "2026-01-01",
        description: pathwayFeatures(p.features).join(" · ") || undefined,
      })),
  };

  const faqSchema = (faqs ?? []).filter((f) => !!f.answer).length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: (faqs ?? [])
          .filter((f) => !!f.answer)
          .map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer as string },
          })),
      }
    : null;

  return (
    <WceThemeProvider>
      <Helmet>
        <title>{speaker ? shareTitle : "Caribbean Wellness Saint Lucia 2026 | 11–17 October"}</title>
        <meta name="description" content={speaker ? shareDescription : "11–17 October 2026 at Mount Kailash Rejuvenation Centre, Saint Lucia. Attend the symposium in person or online, or apply for the six-day Fortification Retreat."} />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Mount Kailash Rejuvenation Centre" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={shareDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={shareImage} />
        <meta property="og:image:secure_url" content={shareImage} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={speaker ? shareTitle : "Caribbean Wellness Saint Lucia 2026, 11–17 October, Mount Kailash Rejuvenation Centre"} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={speaker ? shareDescription : "11–17 October 2026 at Mount Kailash Rejuvenation Centre. What started in Jamaica continues in St. Lucia."} />
        <meta name="twitter:image" content={shareImage} />
        <meta name="twitter:image:alt" content={speaker ? shareTitle : "Caribbean Wellness Saint Lucia 2026"} />

        <script type="application/ld+json">{JSON.stringify(eventSchema)}</script>
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      </Helmet>
      <WceSubNav />
      <main>
        <WceHero />
        <WcePathwaysSection />
        <WceSpeakersSection />
        <WceMediaSection />
        <WceItinerarySection />
        <WceLifeCraftSection />
        <WceWhoForSection />
        <WceArcSection />
        <WceIncludedSection />
        <WceCeremonySection />
        <WceRetreatBand />
        <WceInvestmentSection />
        <WceApplicationForm />
        <WceFaqSection />
        <WceFortifiedBanner />
        <WceFinalCta />
      </main>
      <WceFooter />
      <WceStickyCta />
    </WceThemeProvider>
  );
}

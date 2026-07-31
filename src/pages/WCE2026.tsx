import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { WceThemeProvider } from "@/components/wce/WceThemeProvider";
import { WceHero, WcePartnerStrip, WcePathwaysSection, WceSpeakersSection } from "@/components/wce/SectionsTop";
import { WceMediaSection, WceActivitiesSection, WceRetreatBand, WceApplicationForm } from "@/components/wce/SectionsMid";
import { WceFaqSection, WceFinalCta, WceFooter } from "@/components/wce/SectionsBottom";
import { useWcePathways, useWceSettings, pathwayFeatures } from "@/components/wce/useWceData";
import { WceSubNav } from "@/components/wce/WceSubNav";
import { WceStickyCta } from "@/components/wce/WceStickyCta";
import { useWceAttribution } from "@/components/wce/useWceAttribution";
import { dataLayerPush } from "@/lib/tracking";
import { SITE_URL } from "@/lib/site-config";
import heroPoster from "@/assets/wce-hero-poster.jpg.asset.json";

const PAGE_URL = `${SITE_URL}/wce-2026`;
const OG_IMAGE = `${SITE_URL}${heroPoster.url}`;

export default function WCE2026() {
  const { data: settings } = useWceSettings();
  const { data: pathways } = useWcePathways();
  const attribution = useWceAttribution();

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
    startDate: "2026-10-11",
    endDate: "2026-10-17",
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
    offers: (pathways ?? [])
      .filter((p) => Number(p.price) > 0)
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

  return (
    <WceThemeProvider>
      <Helmet>
        <title>Caribbean Wellness Saint Lucia 2026 | 11–17 October</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={PAGE_URL} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Caribbean Wellness Saint Lucia 2026 | 11–17 October" />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:alt" content="Caribbean Wellness Saint Lucia 2026" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Caribbean Wellness Saint Lucia 2026 | 11–17 October" />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={OG_IMAGE} />

        <script type="application/ld+json">{JSON.stringify(eventSchema)}</script>
      </Helmet>
      <WceSubNav />
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
      <WceStickyCta />
    </WceThemeProvider>
  );
}

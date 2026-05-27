/**
 * Central Mount Kailash image map.
 *
 * All asset paths are imported so Vite hashes + bundles them.
 * Use these constants instead of hardcoding asset paths so the
 * hero, CTA cards, and other sections stay visually consistent
 * and easy to re-skin.
 */

// Founder / practitioner
import priestHost from "@/assets/priest-kailash-host.webp";
import priestHarvesting from "@/assets/priest-kailash-harvesting.webp";

// Logo / star mark
import logoGreen from "@/assets/mount-kailash-logo-green.webp";
import logoAlt from "@/assets/mt-kailash-logo.webp";

// CTA 1 — Professional Supply (wholesale / product group)
import bottleLineup from "@/assets/bottle-lineup-wholesale.webp";
import wholesaleCollage from "@/assets/wholesale-collage.webp";
import pillarWholesale from "@/assets/pillar-wholesale.webp";

// CTA 2 — The Apothecary (bottle / remedy / shelf)
import apothecaryDisplay from "@/assets/apothecary-display.webp";
import pillarApothecary from "@/assets/pillar-apothecary.webp";
import shopHeroApothecary from "@/assets/shop-hero-apothecary.webp";

// CTA 3 — Sacred Immersions (retreat / nature)
import pillarRetreat from "@/assets/pillar-retreat.webp";
import retreatYoga from "@/assets/retreat-hero-yoga.webp";
import homeHeroForest from "@/assets/home-hero-forest.webp";

// CTA 4 — Herbal Physician School (education / books)
import pillarSchool from "@/assets/pillar-school.webp";
import schoolCeremony from "@/assets/school-faculty-ceremony.webp";

// Botanical / supporting imagery
import bushMedicine from "@/assets/bush-medicine-basket.webp";
import herbProcessing from "@/assets/herb-processing.webp";
import seamossHarvest from "@/assets/seamoss-harvest.webp";
import oceanBotanicals from "@/assets/ocean-botanicals.webp";

// Star seal lives in /public
const STAR_SEAL = "/star-seal.png";

export const MK_IMAGES = {
  hero: {
    founderPortrait: priestHost,
    founderHarvesting: priestHarvesting,
  },
  brand: {
    logo: logoGreen,
    logoAlt,
    starSeal: STAR_SEAL,
  },
  cta: {
    professionalSupply: {
      primary: bottleLineup,
      fallback: wholesaleCollage,
      tile: pillarWholesale,
      alt: "Mount Kailash Rejuvenation Centre professional product line",
    },
    apothecary: {
      primary: apothecaryDisplay,
      fallback: pillarApothecary,
      tile: shopHeroApothecary,
      alt: "Mount Kailash Apothecary shelf of small-batch herbal remedies",
    },
    sacredImmersions: {
      primary: pillarRetreat,
      fallback: homeHeroForest,
      tile: retreatYoga,
      alt: "Sacred immersion retreat at Mount Kailash Rejuvenation Centre",
    },
    herbalPhysicianSchool: {
      primary: pillarSchool,
      fallback: schoolCeremony,
      tile: schoolCeremony,
      alt: "Mount Kailash Herbal Physician School certification cohort",
    },
  },
  botanical: {
    bushMedicine,
    herbProcessing,
    seamossHarvest,
    oceanBotanicals,
  },
} as const;

export type MKImageMap = typeof MK_IMAGES;

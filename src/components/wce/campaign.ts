/** Approved 2026 campaign copy. Client-signed off — treat every string here as
 *  verbatim. Prices and open/closed state still come from the database; only the
 *  narrative lives in code so it cannot drift.
 *
 *  RULE: never publish a participant number, capacity or "spots left" figure
 *  anywhere on the site, in metadata or in schema. Availability is expressed
 *  only as the words "Limited Availability".
 */

export type WcePathwayKey = "in_person" | "online" | "retreat";

export interface WcePathwayCopy {
  title: string;
  /** Date + price line shown under the title. */
  dateLine: string;
  priceLine: string;
  /** Words-only availability note, or null. Never a number. */
  availability: string | null;
  /** Scannable lead line — max two lines on the card. */
  lead: string;
  /** Exactly three one-line bullets. */
  bullets: [string, string, string];
  body: string;
  cta: string;
}

export const PATHWAY_COPY: Record<WcePathwayKey, WcePathwayCopy> = {
  in_person: {
    title: "Attend In Person",
    dateLine: "Sunday, October 11, 2026",
    priceLine: "US$70 per person",
    availability: null,
    lead: "Be present at Mount Kailash for the opening day of the experience.",
    bullets: [
      "Live keynote sessions and panels",
      "Caribbean-rooted wellness conversations",
      "On-site community and environment",
    ],
    body:
      "Join us at Mount Kailash Rejuvenation Centre in Saint Lucia for the opening day of Caribbean Wellness Experience Saint Lucia 2026 — a public symposium bringing together powerful voices, practical perspectives, and Caribbean-rooted approaches to wellness, conscious living, movement, food, herbs, leadership, culture and community. The in-person experience is designed for those who want to be present for the conversations, environment and community.",
    cta: "Reserve My Place",
  },
  online: {
    title: "Get Online Access",
    dateLine: "Sunday, October 11, 2026",
    priceLine: "US$50 per person",
    availability: null,
    lead: "Join the Symposium from anywhere in the world.",
    bullets: [
      "Secure, gated livestream access",
      "Access instructions sent by email",
      "For international and diaspora audiences",
    ],
    body:
      "Join the Caribbean Wellness Saint Lucia 2026 Symposium from anywhere across the world. Online access is intended for international audiences, diaspora communities, and anyone unable to attend Mount Kailash in person but who still wants to experience the main conversations and programme. Purchasers will receive access instructions before the event through a secure, gated livestream experience.",
    cta: "Get Online Access",
  },
  retreat: {
    title: "Fortification Retreat",
    dateLine: "October 12–17, 2026",
    priceLine: "From US$4,500 per person",
    availability: "Limited Availability",
    lead: "Six days of deeper practice, beyond the Symposium.",
    bullets: [
      "Guided wellness practice, food and herbs",
      "LifeCraft experiences throughout the week",
      "Application reviewed by the Mount Kailash team",
    ],
    body:
      "Continue beyond the Caribbean Wellness Symposium with a deeper, six-day fortification experience at Mount Kailash Rejuvenation Centre. The Fortification Retreat is designed for participants seeking more time for guided wellness practice, reflection, food, herbs, movement, discipline, community and restorative rhythms within the Mount Kailash environment. The six-day immersion will also feature LifeCraft experiences running throughout the retreat period, with Chalice Station and An Evening with Jah9 serving as key components of the wider retreat week. Retreat participation begins with an application, which will be reviewed by the Mount Kailash team.",
    cta: "Begin Your Application",
  },
};

export function pathwayCopy(key: string): WcePathwayCopy | null {
  return (PATHWAY_COPY as Record<string, WcePathwayCopy>)[key] ?? null;
}

/* ---------------- hero ---------------- */

export const HERO_DATE_SUPPORT =
  "The Symposium opens the experience on October 11. The Fortification Retreat continues October 12–17.";

export const HERO_CIRCUIT_LINE = "What started in Jamaica continues in St. Lucia.";

/* ---------------- LifeCraft ---------------- */

export const LIFECRAFT_HEADING = "LifeCraft Experience";

export const LIFECRAFT_BODY =
  "A series of guided experiences woven through the Fortification Retreat, designed to support reflection, creative expression, intentional living, and deeper engagement with the week's themes. LifeCraft activities run in sync with the retreat programme, including access to Chalice Station and An Evening with Jah9 serving as key components of the experience.";

/** Fallback components, used until the organiser backend fills these in. */
export const LIFECRAFT_COMPONENTS = [
  {
    title: "Chalice Station",
    body: "A guided space for stillness, reflection and shared presence within the retreat rhythm.",
  },
  {
    title: "An Evening with Jah9",
    body: "An evening of music, movement and reflection with our Host and Facilitator.",
  },
];

/* ---------------- containment ---------------- */

/** Speakers whose panels must only ever offer the symposium registration route,
 *  never the retreat application. Matched case-insensitively on the name. */
const SYMPOSIUM_ONLY_SPEAKERS = ["rizza islam"];

export function isSymposiumOnlySpeaker(name: string | null | undefined): boolean {
  const n = (name ?? "").toLowerCase();
  return SYMPOSIUM_ONLY_SPEAKERS.some((s) => n.includes(s));
}

/* ---------------- event window ---------------- */

export const EVENT_START = "2026-10-11";
export const EVENT_END = "2026-10-17";
export const SYMPOSIUM_DATE = "2026-10-11";
export const RETREAT_START = "2026-10-12";
export const RETREAT_END = "2026-10-17";

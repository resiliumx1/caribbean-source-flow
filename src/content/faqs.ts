/**
 * Canonical FAQ copy, shared by the React pages and the build-time prerenderer
 * (scripts/prerender.ts imports this file directly) so the visible accordion and
 * the FAQPage JSON-LD in the raw HTML never drift apart.
 *
 * Answer style: the question is answered in the first two sentences.
 */

export interface FaqItem {
  q: string;
  a: string;
}

export const retreatFaqs: FaqItem[] = [
  {
    q: "What is included in a Mount Kailash Rejuvenation Centre retreat in Saint Lucia?",
    a: "Every retreat includes lodging, all plant-based herbal feasts, airport transfers, daily workshops, herbal materials and a personal wellness consultation with Rt. Hon. Priest Kailash K. Leonce. Guided excursions into the volcanic highlands around Soufrière are also part of the week.",
  },
  {
    q: "Where is the retreat centre located in Saint Lucia?",
    a: "Mount Kailash Rejuvenation Centre is in Saint Lucia, with retreat grounds in the mountains of Marc on the outskirts of Castries and programming in the Soufrière volcanic highlands. It is roughly a 90-minute drive from Hewanorra International Airport (UVF).",
  },
  {
    q: "How long is the retreat and what does a typical day look like?",
    a: "The core immersion runs seven days. A typical day opens with a herbal tonic and movement, continues with a teaching session, a plant walk or steam, two herbal feasts, and closes with rest and reflection.",
  },
  {
    q: "Do I need any experience with herbal or wellness medicine to attend?",
    a: "No experience is required — the protocols are paced for first-timers as well as seasoned wellness travellers. Every guest receives a one-to-one consultation so the week is adjusted to their own condition.",
  },
  {
    q: "Can you accommodate dietary restrictions and allergies?",
    a: "Yes. All feasts are fully plant-based and prepared from produce grown in mineral rich soil gardens, and most allergies and sensitivities can be accommodated when declared at booking.",
  },
  {
    q: "What is the cancellation and refund policy for a retreat booking?",
    a: "Group retreats are fully refundable 30 or more days before arrival and 50% refundable 15–29 days before; private retreats are fully refundable 14 or more days before. Any cancellation can instead be taken as full credit toward a future date.",
  },
];

export const theAnswerFaqs: FaqItem[] = [
  {
    q: "What is The Answer tincture from Mount Kailash Rejuvenation Centre?",
    a: "The Answer is the flagship botanical tincture of Mount Kailash Rejuvenation Centre in Saint Lucia, formulated by Rt. Hon. Priest Kailash K. Leonce. It is a wildcrafted extraction steeped for 21 days in oak barrels and used as a daily cellular support and cleansing tonic.",
  },
  {
    q: "What are the ingredients in The Answer?",
    a: "The formulation is built on Foy Duran (Anamu), Vervain and Soursop leaves, all wildcrafted in Saint Lucia. Nothing synthetic is added — the liquid is plant material, extraction medium and time.",
  },
  {
    q: "How do I take The Answer, and how much?",
    a: "The standard adult serving is one capful or the dropper measure stated on the bottle, taken once or twice daily in a little water, away from heavy food. Begin at half the serving for the first three days so the body can adjust.",
  },
  {
    q: "How long does one bottle last and when will I notice a difference?",
    a: "At one serving per day a bottle typically lasts about four weeks. Most people report changes in digestion, energy and sleep within the first two to three weeks of consistent use.",
  },
  {
    q: "Is The Answer safe to take with other supplements or medication?",
    a: "The Answer is a food-grade botanical preparation and is commonly taken alongside other herbs. If you are pregnant, nursing, or on prescription medication, review it with your physician first or book a consultation with the Mount Kailash Rejuvenation Centre team.",
  },
  {
    q: "Do you ship The Answer to the United States and internationally?",
    a: "Yes. Orders ship from Saint Lucia and from a Miami fulfilment point, with most United States deliveries arriving in about three business days, and international shipping is available at checkout.",
  },
];

export const wholesaleFaqs: FaqItem[] = [
  {
    q: "What does Mount Kailash Rejuvenation Centre supply at wholesale?",
    a: "Mount Kailash Rejuvenation Centre wholesales single-origin Saint Lucia botanicals: herbal tinctures, sea moss preparations, syrups, capsules, teas and selected raw herbs. Supply is aimed at clinics, practitioners, dispensaries and wellness retailers.",
  },
  {
    q: "Who can open a wholesale account?",
    a: "Licensed practitioners, clinics, spas, retailers and wellness brands can open an account. Each partnership starts with a short conversation about your patient or customer base rather than a fixed online form.",
  },
  {
    q: "How fast do wholesale orders reach the United States?",
    a: "Most United States wholesale orders arrive in roughly three business days from the Miami fulfilment point. Caribbean and international freight is quoted per shipment.",
  },
  {
    q: "Do you provide certificates of analysis and batch documentation?",
    a: "Yes. Every batch ships with documentation, including certificate of analysis paperwork on request, plus harvest origin and batch identifiers for your own record-keeping.",
  },
  {
    q: "Is private label or white label production available?",
    a: "Yes. Mount Kailash Rejuvenation Centre produces private-label formulations under your own brand, including bespoke blends developed with Rt. Hon. Priest Kailash K. Leonce.",
  },
  {
    q: "How is wholesale pricing structured?",
    a: "Pricing is tiered and scales with case volume across the catalogue rather than published as a single public rate card. You receive a written quote for your specific mix after the first conversation.",
  },
];

/** Build FAQPage JSON-LD from a list of FAQ items. */
export function faqPageSchema(items: FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

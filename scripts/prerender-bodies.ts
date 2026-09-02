/**
 * Per-route static body content for the prerenderer.
 *
 * Each marketing route must ship its OWN substantive HTML inside
 * #seo-static-fallback, so non-JS crawlers (GPTBot, OAI-SearchBot,
 * PerplexityBot, ClaudeBot, Bingbot) see a real page per URL instead of the
 * homepage body repeated seven times.
 *
 * React replaces this markup on hydration, so live visitors never see it.
 */

import { retreatFaqs, theAnswerFaqs, wholesaleFaqs, faqPageSchema, type FaqItem } from "../src/content/faqs";

export const BRAND = "Mount Kailash Rejuvenation Centre";

function esc(s: string | null | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function siteHeader(crumb?: string): string {
  return `
    <header>
      <a href="/" rel="home">${BRAND}</a>
      <nav aria-label="Main navigation">
        <a href="/wce-2026">Caribbean Wellness Saint Lucia 2026</a>
        <a href="/shop">Apothecary</a>
        <a href="/wholesale">Wholesale</a>
        <a href="/retreats">Retreats</a>
        <a href="/school/herbal-physician">School</a>
        <a href="/the-answer">The Answer</a>
        <a href="/webinars">Webinars</a>
        <a href="/consultations">Consultations</a>
      </nav>
      ${crumb ? `<nav aria-label="Breadcrumb"><a href="/">Home</a> · ${esc(crumb)}</nav>` : ""}
    </header>`;
}

function faqHtml(items: FaqItem[]): string {
  return `
      <section id="faq">
        <h2>Frequently asked questions</h2>
        <dl>
          ${items.map((f) => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`).join("\n          ")}
        </dl>
      </section>`;
}

function relatedHtml(links: Array<[string, string, string]>): string {
  return `
      <section aria-label="Explore also">
        <h2>Explore also</h2>
        <ul>
          ${links.map(([href, name, blurb]) => `<li><a href="${href}">${esc(name)}</a> — ${esc(blurb)}</li>`).join("\n          ")}
        </ul>
      </section>`;
}

const CENTRE_LINE =
  `${BRAND} is a clinical wellness medicine centre in Soufriere, Saint Lucia, founded and led by Rt Hon Priest Kailash K Leonce.`;

/* ------------------------------------------------------------------ retreats */

export function retreatsBody(): string {
  return `${siteHeader("Retreats")}
    <main>
      <h1>Wellness Retreats in Saint Lucia — ${BRAND}</h1>
      <p>${CENTRE_LINE} Its seven-day healing retreats are held in the volcanic highlands around Soufriere, Saint Lucia, and combine traditional Caribbean wellness medicine with daily clinical guidance.</p>

      <section>
        <h2>What a retreat at ${BRAND} involves</h2>
        <p>Guests follow a guided wellness medicine protocol for seven days: herbal tonics on waking, two plant-based herbal feasts each day grown in mineral rich soil, botanical steams and baths, plant walks through the Soufriere hills, and evening teaching circles. Every guest receives a one-to-one consultation with Rt Hon Priest Kailash K Leonce, which sets the herbal protocol followed for the rest of the stay.</p>
      </section>

      <section>
        <h2>Retreat pathways</h2>
        <ul>
          <li><strong>Group retreat</strong> — fixed calendar dates, shared teaching sessions, single or shared lodging.</li>
          <li><strong>Private retreat</strong> — designed around one guest, couple or family, on dates of your choosing.</li>
          <li><strong>Caribbean Wellness Fortification Retreat</strong> — the six-day October 2026 programme, 12–17 October, offered by application as part of <a href="/wce-2026">Caribbean Wellness Saint Lucia 2026</a>.</li>
        </ul>
      </section>

      <section>
        <h2>Included in every retreat</h2>
        <ul>
          <li>Lodging for the full seven days in Saint Lucia</li>
          <li>All plant-based herbal feasts and tonics</li>
          <li>Airport transfers from Hewanorra International Airport (UVF)</li>
          <li>Daily workshops, steams and guided plant walks</li>
          <li>Herbal materials used during the stay</li>
          <li>A personal wellness consultation with Rt Hon Priest Kailash K Leonce</li>
        </ul>
      </section>

      <section>
        <h2>Who the retreats are for</h2>
        <p>The programme suits people recovering from burnout and chronic fatigue, those managing long-standing digestive or inflammatory conditions, and practitioners who want to experience Caribbean wellness medicine first hand. No prior experience with herbal medicine is required, and protocols are paced individually.</p>
      </section>

      ${faqHtml(retreatFaqs)}

      <section>
        <h2>Book a retreat in Saint Lucia</h2>
        <p>Group dates are published on the retreat calendar and private retreats are arranged directly with the team. <a href="/retreats#calendar">See upcoming retreat dates</a> or <a href="/consultations">book a consultation</a> first.</p>
      </section>

      ${relatedHtml([
        ["/the-answer", "The Answer tincture", "The oak-aged botanical formulation used throughout the retreat protocol."],
        ["/school/herbal-physician", "School of Wellness Medicine", "Train as a certified clinical herbal physician in Saint Lucia."],
        ["/webinars", "Wellness medicine webinars", "Free teachings with Rt Hon Priest Kailash K Leonce."],
        ["/wce-2026", "Caribbean Wellness Saint Lucia 2026", "The 11–17 October 2026 symposium and fortification retreat."],
      ])}
    </main>`;
}

/* ---------------------------------------------------------------- the-answer */

export function theAnswerBody(): string {
  return `${siteHeader("The Answer")}
    <main>
      <h1>The Answer — Signature Botanical Tincture from ${BRAND}, Saint Lucia</h1>
      <p>The Answer is the flagship formulation of ${BRAND} in Soufriere, Saint Lucia, created by Rt Hon Priest Kailash K Leonce. It is a wildcrafted tincture of Foy Duran (Anamu), Vervain and Soursop leaves, steeped for twenty-one days in oak barrels.</p>

      <section>
        <h2>The formulation</h2>
        <ul>
          <li><strong>Foy Duran (Anamu)</strong> — the traditional Saint Lucian immune and cleansing herb at the base of the blend.</li>
          <li><strong>Vervain</strong> — long used across the Caribbean for the nervous system, digestion and fever.</li>
          <li><strong>Soursop leaves</strong> — hand-picked, used traditionally for rest, circulation and cellular support.</li>
        </ul>
        <p>Nothing synthetic is added. The bottle contains plant material, extraction medium and time.</p>
      </section>

      <section>
        <h2>How The Answer is made</h2>
        <p>Herbs are wildcrafted from mineral rich soil in the volcanic hills of Saint Lucia, cleaned by hand, and laid into oak barrels for a full twenty-one-day steep before bottling in small batches. Roughly 43,000 bottles are formulated each year at ${BRAND}.</p>
      </section>

      <section>
        <h2>How to take it</h2>
        <p>The standard adult serving is one capful, or the dropper measure printed on the bottle, once or twice daily in a little water and away from heavy food. Start with half a serving for the first three days, then continue daily; at one serving a day a bottle lasts about four weeks.</p>
      </section>

      <section>
        <h2>What people use it for</h2>
        <p>Guests and customers most often take The Answer as a daily cleansing and immune tonic, and report changes in digestion, energy and sleep within the first two to three weeks. It is the same formulation used inside the retreat protocols at ${BRAND}.</p>
      </section>

      ${faqHtml(theAnswerFaqs)}

      <section>
        <h2>Order The Answer</h2>
        <p>The Answer ships worldwide from Saint Lucia and from a Miami fulfilment point, with most United States orders arriving in about three business days. <a href="/shop">Browse the full apothecary</a>.</p>
      </section>

      ${relatedHtml([
        ["/shop", "The apothecary", "Wildcrafted Saint Lucia tinctures, sea moss, capsules and teas."],
        ["/retreats", "Healing retreats in Saint Lucia", "Seven-day wellness immersions in the Soufriere highlands."],
        ["/wholesale", "Wholesale botanicals", "Practitioner-grade supply with batch documentation."],
      ])}
    </main>`;
}

/* --------------------------------------------------------------------- shop */

export interface ShopProduct {
  slug: string;
  name: string;
  blurb: string;
  price?: number | null;
}

export function shopBody(products: ShopProduct[]): string {
  const list = products.length
    ? `<ul>${products
        .map(
          (p) =>
            `<li><a href="/shop/${esc(p.slug)}">${esc(p.name)}</a>${
              p.price ? ` — $${Number(p.price).toFixed(2)} USD` : ""
            }${p.blurb ? `. ${esc(p.blurb)}` : ""}</li>`,
        )
        .join("\n        ")}</ul>`
    : "";
  return `${siteHeader("Shop")}
    <main>
      <h1>The Apothecary — Caribbean Herbal Medicine from ${BRAND}, Saint Lucia</h1>
      <p>${CENTRE_LINE} The apothecary carries the centre's own herbal tinctures, sea moss preparations, capsules, teas and raw herbs, wildcrafted from mineral rich soil in Saint Lucia and formulated in small batches.</p>

      <section>
        <h2>What we make</h2>
        <ul>
          <li><strong>Tinctures</strong> — long-steeped botanical extractions, including <a href="/the-answer">The Answer</a>.</li>
          <li><strong>Sea moss</strong> — wildcrafted Saint Lucian sea moss gels and blends.</li>
          <li><strong>Capsules and powders</strong> — single herbs and clinical formulas.</li>
          <li><strong>Teas and raw herbs</strong> — loose bush medicine for daily brewing.</li>
        </ul>
      </section>

      <section>
        <h2>Catalogue</h2>
        ${list}
      </section>

      <section>
        <h2>Shipping and delivery</h2>
        <p>Orders ship from Saint Lucia and from a Miami fulfilment point; most United States deliveries arrive in about three business days. Local Saint Lucia delivery and international shipping are available at checkout.</p>
      </section>

      ${relatedHtml([
        ["/the-answer", "The Answer tincture", "The centre's signature oak-aged formulation."],
        ["/wholesale", "Wholesale supply", "Bulk botanicals for clinics, practitioners and retailers."],
        ["/consultations", "Consultations", "One-to-one sessions with the wellness medicine team."],
      ])}
    </main>`;
}

/* ---------------------------------------------------------------- wholesale */

export function wholesaleBody(): string {
  return `${siteHeader("Wholesale")}
    <main>
      <h1>Wholesale Caribbean Botanicals — ${BRAND}, Saint Lucia</h1>
      <p>${BRAND} in Soufriere, Saint Lucia supplies single-origin Caribbean botanicals at wholesale to clinics, practitioners, dispensaries and wellness retailers. Every batch is grown or wildcrafted in Saint Lucia, formulated in-house, and shipped with documentation.</p>

      <section>
        <h2>The wholesale catalogue</h2>
        <ul>
          <li>Herbal tinctures, including the centre's signature formulations</li>
          <li>Sea moss gels, dried sea moss and blends</li>
          <li>Syrups and tonics</li>
          <li>Capsules and encapsulated single herbs</li>
          <li>Loose teas and selected raw herbs</li>
        </ul>
      </section>

      <section>
        <h2>Sourcing and quality</h2>
        <p>Herbs are harvested from mineral rich volcanic soil in Saint Lucia and processed at the centre rather than bought in from brokers, so each lot can be traced to a harvest and batch. Certificate of analysis documentation is provided on request alongside batch identifiers for your own records.</p>
      </section>

      <section>
        <h2>Fulfilment</h2>
        <p>United States wholesale orders ship from a Miami warehouse and typically arrive within three business days. Caribbean, United Kingdom and other international freight is quoted per shipment.</p>
      </section>

      <section>
        <h2>Private label</h2>
        <p>${BRAND} produces private-label and white-label formulations under your own brand, including bespoke blends developed with Rt Hon Priest Kailash K Leonce. Minimums and lead times are agreed per formulation.</p>
      </section>

      ${faqHtml(wholesaleFaqs)}

      <section>
        <h2>Open a wholesale conversation</h2>
        <p>Partnerships begin with a short conversation about your patients or customers, not a public price list. <a href="/wholesale#lead-form">Request a wholesale conversation</a>.</p>
      </section>

      ${relatedHtml([
        ["/shop", "The apothecary", "See the retail catalogue behind the wholesale range."],
        ["/the-answer", "The Answer tincture", "The centre's flagship botanical formulation."],
        ["/school/herbal-physician", "School of Wellness Medicine", "Certification training for practitioners."],
      ])}
    </main>`;
}

/* ------------------------------------------------------------------- school */

export function schoolBody(): string {
  return `${siteHeader("School of Wellness Medicine")}
    <main>
      <h1>School of Wellness Medicine — Herbal Physician Certification at ${BRAND}, Saint Lucia</h1>
      <p>${CENTRE_LINE} Its School of Wellness Medicine trains clinical herbal physicians, with more than 500 graduates practising worldwide and cohorts capped so each student is taught directly.</p>

      <section>
        <h2>The certification programme</h2>
        <p>Students learn Caribbean materia medica, clinical assessment, formulation and dosing, detoxification protocols, and practice-building, taught by Rt Hon Priest Kailash K Leonce and the Mount Kailash faculty. Coursework combines live instruction with case work, and graduates are certified as Clinical Herbal Physicians.</p>
      </section>

      <section>
        <h2>What you study</h2>
        <ul>
          <li>Caribbean and tropical materia medica</li>
          <li>Clinical assessment and case taking</li>
          <li>Extraction, formulation and dosing</li>
          <li>Detoxification and cellular cleansing protocols</li>
          <li>Ethics, scope of practice and client care</li>
          <li>Building a wellness medicine practice</li>
        </ul>
      </section>

      <section>
        <h2>Admission</h2>
        <p>Entry is by application and each cohort is limited, so places are reviewed rather than sold. Applicants come from nursing, allied health, coaching, and from families who grew up with bush medicine.</p>
      </section>

      ${relatedHtml([
        ["/webinars", "Wellness medicine webinars", "Free teachings that preview the school's approach."],
        ["/retreats", "Healing retreats", "Experience the protocols as a guest before you train."],
        ["/the-answer", "The Answer tincture", "The formulation studied in class."],
      ])}
    </main>`;
}

/* ----------------------------------------------------------------- webinars */

export function webinarsBody(): string {
  return `${siteHeader("Webinars")}
    <main>
      <h1>Wellness Medicine Webinars — ${BRAND}, Saint Lucia</h1>
      <p>${BRAND} publishes free live and on-demand webinars on Caribbean clinical wellness medicine, hosted by Rt Hon Priest Kailash K Leonce from Soufriere, Saint Lucia. Sessions draw around a thousand attendees a month from more than forty countries.</p>

      <section>
        <h2>What the sessions cover</h2>
        <ul>
          <li>Herbal protocols for digestion, inflammation, fatigue and sleep</li>
          <li>Detoxification and cellular cleansing, step by step</li>
          <li>Caribbean materia medica — how each herb is used and dosed</li>
          <li>Case discussions from the clinic in Saint Lucia</li>
          <li>Questions answered live by Rt Hon Priest Kailash K Leonce</li>
        </ul>
      </section>

      <section>
        <h2>How to attend</h2>
        <p>Live sessions are announced by email and streamed free of charge; every past session is archived in the on-demand library and can be watched at any time. No previous study of herbal medicine is assumed.</p>
      </section>

      ${relatedHtml([
        ["/school/herbal-physician", "School of Wellness Medicine", "Take the teaching further as a certified herbal physician."],
        ["/shop", "The apothecary", "Order the formulations discussed in the sessions."],
        ["/consultations", "Consultations", "Book a one-to-one session with the team."],
      ])}
    </main>`;
}

export { faqPageSchema, retreatFaqs, theAnswerFaqs, wholesaleFaqs };

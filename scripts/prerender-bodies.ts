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
        <h2>What the apothecary makes</h2>
        <p>The apothecary is organised around four families of preparation, each drawn from the same Saint Lucian materia medica and each suited to a different way of taking herbs.</p>
        <ul>
          <li><strong>Tinctures</strong> — long-steeped botanical extractions, including <a href="/the-answer">The Answer</a>, the centre's oak-aged immune formulation built on anamu, vervain and soursop leaf. Tinctures are the workhorse of the apothecary: concentrated, shelf stable, and easy to dose by the dropper for people following a protocol over several weeks.</li>
          <li><strong>Sea moss</strong> — wildcrafted Saint Lucian sea moss, sold as gel, dried whole moss and blended preparations. Harvested from the island's coastal waters, sun-cured and rinsed in fresh water before it is turned into gel, it is used at Mount Kailash as a daily mineral food rather than as a short course.</li>
          <li><strong>Capsules and powders</strong> — encapsulated single herbs and clinical formulas for people who prefer no taste and a fixed measure. These are milled from the same dried plant material used in the teas, so the plant and the batch remain traceable.</li>
          <li><strong>Teas and raw herbs</strong> — loose bush medicine for daily brewing, including St John's bush, blue vervain and the leaves and barks used in Caribbean household practice. Raw herbs are the oldest part of the catalogue and remain the least processed way to work with the plants.</li>
        </ul>
        <p>Alongside the single preparations, the apothecary assembles multi-product wellness packages that group the tinctures, teas and sea moss used together in one protocol — for example the women's wellness package and the seasonal fortification sets.</p>
      </section>

      <section>
        <h2>How the formulations are prepared</h2>
        <p>Every formulation is made in-house in Soufriere, in small batches, by the same team that trains herbal physicians at the school. Fresh and dried plant material is sorted and cleaned by hand, then either macerated in menstruum for a set number of days or decocted, depending on the plant part: leaves and flowers are steeped, while barks, roots and seeds are simmered to draw the constituents out.</p>
        <p>The Answer is steeped for twenty-one days in oak before it is pressed and bottled, and the longer aged tinctures are held and turned rather than rushed to bottle. Batches are pressed, filtered, filled and labelled with a batch reference so a bottle can be traced back to its harvest. Nothing is standardised with isolated actives and nothing is heat-treated to shorten the process; the intent is a whole-plant preparation consistent with how these remedies have been made in the Caribbean for generations. Around 43,000 bottles are formulated each year at this scale.</p>
      </section>

      <section>
        <h2>Sourcing</h2>
        <p>The plants come from the volcanic highlands and coastal belt around Soufriere, where mineral rich soil fed by the Pitons and the island's geothermal valley produces dense, aromatic growth. Most material is grown on the centre's own land or wildcrafted by harvesters the centre has worked with for years; sea moss comes from Saint Lucian waters. Harvest is timed to the plant rather than the order book, which is why some items move in and out of stock through the year.</p>
        <p>Where a plant cannot be grown or wildcrafted locally at quality, it is sourced from named Caribbean growers rather than commodity brokers. The same supply feeds the clinical practice, the retreats and the <a href="/wholesale">wholesale line</a>, so the material in a retail bottle is the material used with patients at the centre.</p>
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

/* -------------------------------------------------------------------- learn */

export function learnBody(): string {
  return `${siteHeader("Learn")}
    <main>
      <h1>Learn — Caribbean Herbal Medicine Library from ${BRAND}, Saint Lucia</h1>
      <p>${CENTRE_LINE} The Learn library collects the teaching notes behind that practice: how each Caribbean botanical is identified and prepared, how protocols are sequenced, and what the clinic in Soufriere has observed over more than twenty-one years of case work.</p>

      <section>
        <h2>What you will find here</h2>
        <ul>
          <li>Materia medica notes on Anamu, Soursop leaf, Vervain, St. John's Bush, Fey Duvan and sea moss</li>
          <li>Preparation guides — decoctions, infusions, tinctures, syrups and correct dosing</li>
          <li>Protocol walkthroughs for cleansing, blood support, digestion, sleep and women's wellness</li>
          <li>Sourcing and quality: wildcrafting in volcanic soil, drying, and why single-origin matters</li>
          <li>Clinical case discussions and answers to the questions asked most often in consultation</li>
        </ul>
      </section>

      <section>
        <h2>How the articles are written</h2>
        <p>Every article is written or reviewed by Rt Hon Priest Kailash K Leonce and the Mount Kailash team, drawing on Saint Lucian bush-medicine tradition and on what has held up in clinic. Articles describe traditional use and preparation; they are education, not diagnosis, and do not replace care from a licensed physician.</p>
      </section>

      ${relatedHtml([
        ["/consultations", "Consultations", "Apply the reading to your own case, one to one."],
        ["/shop", "The apothecary", "Order the formulations discussed in the articles."],
        ["/webinars", "Webinars", "Watch the same material taught live."],
      ])}
    </main>`;
}

/* ------------------------------------------------------------ consultations */

export function consultationsBody(): string {
  return `${siteHeader("Consultations")}
    <main>
      <h1>Private Wellness Medicine Consultations — ${BRAND}, Saint Lucia</h1>
      <p>${CENTRE_LINE} Consultations are the heart of the practice: a private session in which your history, diet, digestion, sleep, stress and current medication are reviewed before any herbal protocol is proposed. Sessions are held in person in Soufriere, Saint Lucia, or by video for clients in the United States, Canada, the United Kingdom and across the Caribbean.</p>

      <section>
        <h2>How a consultation works</h2>
        <ol>
          <li>Choose a session type and a time in your own timezone.</li>
          <li>Complete a short intake so the practitioner can prepare beforehand.</li>
          <li>Meet by video or in person for a full assessment and discussion.</li>
          <li>Receive a written protocol — formulations, dosing, sequencing, diet and lifestyle notes.</li>
          <li>Review progress in a follow-up session and adjust the protocol as your body responds.</li>
        </ol>
      </section>

      <section>
        <h2>What clients bring to us</h2>
        <p>Common reasons for booking include digestive complaints, low energy and fatigue, inflammation, sleep disturbance, blood building, fertility and women's wellness, men's wellness, blood-sugar and pressure support, skin conditions, and structured whole-body cleansing. Practitioners and students of herbal medicine also book sessions to discuss formulation and case management.</p>
      </section>

      <section>
        <h2>Important</h2>
        <p>Mount Kailash Rejuvenation Centre practises traditional Caribbean wellness medicine. Consultations do not diagnose, treat or cure disease and are not a substitute for care from a licensed medical doctor. If you are pregnant, nursing, or taking prescription medication, tell us during intake and consult your physician before starting any protocol.</p>
      </section>

      ${relatedHtml([
        ["/retreats", "Healing retreats", "A seven-day immersion with daily practitioner contact."],
        ["/shop", "The apothecary", "The formulations prescribed in consultation."],
        ["/learn", "Learn", "Articles on the protocols discussed in session."],
      ])}
    </main>`;
}

/* -------------------------------------------------- product copy supplements */

/**
 * Extra crawlable copy for products whose database description is a single line.
 * Appended to the prerendered product body — botanical names, traditional use,
 * preparation and sourcing — so each product URL carries real text.
 */
export const PRODUCT_EXTRA: Record<string, string> = {
  "the-answer": `
      <section>
        <h2>About the formulation</h2>
        <p>The Answer is the flagship tincture of ${BRAND}. It is built around Anamu (Petiveria alliacea, known locally as gully root) and Soursop leaf (Annona muricata), with Vervain and a proprietary blend of supporting Saint Lucian herbs. The plant material is wildcrafted in the volcanic hills around Soufriere, cleaned by hand, and steeped in organic cane alcohol and distilled water for a full extraction cycle rather than being rushed to bottle.</p>
      </section>
      <section>
        <h2>Traditional use and preparation</h2>
        <p>Saint Lucian bush-medicine practitioners have used Anamu and Soursop leaf for generations as protective, fortifying herbs, taken as a bitter tea during periods of illness or seasonal weakness. The Answer concentrates that same pairing into a tincture so the dose is consistent and portable. It can be taken undiluted or dropped into a little water, and is traditionally taken daily as a fortifying tonic.</p>
      </section>
      <section>
        <h2>Sourcing</h2>
        <p>Single origin, Saint Lucia. Wildcrafted from mineral rich volcanic soil, processed on the island, bottled in small batches. Nothing irradiated and no isolated compounds added. <a href="/the-answer">Read the full story of The Answer</a>.</p>
      </section>`,
  "blue-vervain": `
      <section>
        <h2>About the herb</h2>
        <p>Blue Vervain (Verbena hastata) is a slender flowering nervine long carried in Caribbean household medicine cabinets. ${BRAND} supplies it as 100% dried, wildcrafted aerial parts — leaf, stem and flowering top — with nothing added, so you control the strength of the preparation.</p>
      </section>
      <section>
        <h2>Traditional use</h2>
        <p>Vervain is deeply respected in Caribbean herbalism as a bitter nervine: traditionally taken for nervous tension and restlessness, to encourage sweating during fever, and as a bitter to wake up sluggish digestion. In Saint Lucia it is commonly drunk in the evening as a calming tea.</p>
      </section>
      <section>
        <h2>Preparation</h2>
        <p>Steep 1–2 teaspoons of the dried herb in 8oz of boiling water for ten minutes, strain, and drink one to three cups daily. Vervain is a bitter herb and is traditionally used in cycles — a week or two on, then a rest — rather than continuously. Not for use in pregnancy without practitioner guidance.</p>
      </section>
      <section>
        <h2>Sourcing</h2>
        <p>Wildcrafted and shade-dried in Saint Lucia, sorted by hand, packed whole rather than powdered so the aroma and bitterness survive storage.</p>
      </section>`,
  "st-johns-bush": `
      <section>
        <h2>About the herb</h2>
        <p>St. John's Bush (Justicia secunda) is one of Saint Lucia's most treasured plants, known across the Caribbean as a blood-building herb and recognisable by the deep red infusion its leaves give up. ${BRAND} supplies it as 100% dried wildcrafted leaf from the hills around Soufriere.</p>
      </section>
      <section>
        <h2>Traditional use</h2>
        <p>Traditionally used for blood deficiency and low iron, for recovery after childbirth and heavy menstruation, and as a general strengthening tea during convalescence. It is a staple of women's health in Saint Lucian bush medicine and is often taken alongside a nourishing diet rather than on its own.</p>
      </section>
      <section>
        <h2>Preparation</h2>
        <p>Boil 1–2 tablespoons of the dried leaf in 2 cups of water for 15–20 minutes, strain, and drink one cup daily. The infusion should run a clear ruby red; that colour is the sign of good, properly dried leaf.</p>
      </section>
      <section>
        <h2>Sourcing</h2>
        <p>Wildcrafted in Saint Lucia's volcanic highlands, shade-dried to preserve the pigment, single origin and single ingredient.</p>
      </section>`,
  "super-female-wellness-package": `
      <section>
        <h2>What is in the package</h2>
        <p>The Super Female Wellness Package is the most complete women's protocol offered by ${BRAND}: seven formulations — Colax, Blood Detox, Fey Duvan Syrup, Pure Gold, Pure Green, Fertility and The Answer — supplied together at a saving of more than $50 against buying each bottle individually.</p>
      </section>
      <section>
        <h2>How the protocol is sequenced</h2>
        <p>The package follows the same order used in clinic. Weeks one and two open with Colax and Blood Detox to support elimination and cleanse the blood. Weeks three and four add Fey Duvan Syrup for the chest and respiratory tract along with Pure Gold and Pure Green for mineral and green-food nourishment. Fertility and The Answer are then continued daily as the ongoing fortifying pair.</p>
      </section>
      <section>
        <h2>Who it is for</h2>
        <p>Built for women who want a structured, staged reset rather than a single bottle: cleansing, blood health, respiratory support and targeted female formulations in one protocol. Anyone pregnant, nursing or taking prescription medication should consult a physician first, and a <a href="/consultations">consultation</a> is recommended if you want the sequence adapted to your own case.</p>
      </section>
      <section>
        <h2>Sourcing</h2>
        <p>Every bottle is formulated at Mount Kailash in Soufriere, Saint Lucia, from wildcrafted botanicals grown in mineral rich volcanic soil.</p>
      </section>`,
  "symposium-experience-in-person": `
      <section>
        <h2>What this ticket includes</h2>
        <p>In-person admission to the Caribbean Wellness Symposium on Sunday 11 October 2026, held at ${BRAND} in Soufriere, Saint Lucia. The day opens the Caribbean Wellness Experience Saint Lucia 2026 week and includes the full speaker programme, live demonstrations, and direct access to Rt Hon Priest Kailash K Leonce and the visiting faculty.</p>
      </section>
      <section>
        <h2>Good to know</h2>
        <p>Travel and accommodation are arranged by the attendee. This ticket covers the symposium day only; the six-day Caribbean Wellness Fortification Retreat that follows (12–17 October 2026) is application only. <a href="/wce-2026">See the full programme</a> or <a href="/wce-2026/apply">apply for the retreat</a>.</p>
      </section>`,
  "symposium-experience-online": `
      <section>
        <h2>What this ticket includes</h2>
        <p>Livestream access to the Caribbean Wellness Symposium on Sunday 11 October 2026, broadcast from ${BRAND} in Soufriere, Saint Lucia. You receive a private link to the full speaker programme and can watch from anywhere in the world.</p>
      </section>
      <section>
        <h2>Good to know</h2>
        <p>The livestream covers the symposium day only. The six-day Caribbean Wellness Fortification Retreat that follows in Saint Lucia (12–17 October 2026) is in person and application only. <a href="/wce-2026">See the full programme</a> or <a href="/wce-2026/apply">apply for the retreat</a>.</p>
      </section>`,
};

export { faqPageSchema, retreatFaqs, theAnswerFaqs, wholesaleFaqs };


/* ------------------------------------------------------------------ 404 page */

/**
 * Crawler-readable body for the catch-all 404 document (dist/404.html). The page
 * is served with an HTTP 404 status and marked noindex, follow.
 */
export function notFoundBody(): string {
  return `${siteHeader("Page not found")}
    <main>
      <h1>Page not found — ${BRAND}, Saint Lucia</h1>
      <p>The address you requested does not exist on this site. ${CENTRE_LINE} Use the links below to reach the section you were looking for.</p>
      ${relatedHtml([
        ["/", "Home", "Overview of the apothecary, retreats, school and wholesale supply."],
        ["/shop", "Apothecary", "Herbal tinctures, sea moss, capsules, teas and raw herbs."],
        ["/the-answer", "The Answer", "The centre's oak-aged signature tincture."],
        ["/retreats", "Healing retreats", "Seven-day wellness immersions in Soufriere, Saint Lucia."],
        ["/school/herbal-physician", "School of Wellness Medicine", "Clinical herbal physician certification."],
        ["/consultations", "Consultations", "One-to-one sessions with the wellness medicine team."],
      ])}
    </main>`;
}

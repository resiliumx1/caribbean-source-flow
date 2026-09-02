/**
 * Post-build prerender.
 *
 * Reads `dist/index.html` and writes per-route HTML files for every product,
 * retreat, and the main marketing pages. Each file is the same SPA shell but
 * with:
 *   - route-specific <title>, meta description, canonical, OG/Twitter tags
 *   - a route-specific JSON-LD block (Product / WebPage)
 *   - a route-specific server-rendered text fallback inside #seo-static-fallback
 *
 * React replaces the static fallback on hydration, so live users never see it.
 * Non-JS crawlers (ChatGPT, Claude, Perplexity, Slack/LinkedIn/FB unfurlers)
 * read the static HTML and get real product context instead of an empty shell.
 *
 * Runs as `postbuild` so Lovable hosting serves these files directly when the
 * path matches; otherwise the SPA fallback continues to work as before.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  retreatsBody,
  theAnswerBody,
  wholesaleBody,
  schoolBody,
  webinarsBody,
  shopBody,
  learnBody,
  consultationsBody,
  notFoundBody,
  PRODUCT_EXTRA,
} from "./prerender-bodies";
import { faqPageSchema, retreatFaqs, theAnswerFaqs, wholesaleFaqs } from "../src/content/faqs";


const BASE_URL = "https://mountkailashslu.com";
const DIST = resolve("dist");
const SHELL_PATH = resolve(DIST, "index.html");

function readEnv(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  try {
    const env = readFileSync(resolve(".env"), "utf8");
    const m = env.match(new RegExp(`^${key}=\"?([^\"\\n]+)\"?`, "m"));
    return m?.[1];
  } catch {
    return undefined;
  }
}

const SUPABASE_URL = readEnv("VITE_SUPABASE_URL");
const SUPABASE_KEY = readEnv("VITE_SUPABASE_PUBLISHABLE_KEY");

function esc(s: string | null | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripHtml(s: string | null | undefined): string {
  return String(s ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clip(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

interface RouteMeta {
  path: string;          // e.g. /shop/moon-cycle-tea
  title: string;
  description: string;
  ogImage?: string;
  ogImageAlt?: string;
  jsonLd?: Record<string, unknown>;
  bodyHtml: string;      // goes into #seo-static-fallback
  /** Absolute canonical URL override (e.g. a duplicate URL pointing at the primary page). */
  canonical?: string;
  /** Keep this route out of search indexes (booking forms, transactional pages). */
  noindex?: boolean;
  /** Extra raw <meta>/<link> markup injected high in <head> (after the <title>). */
  extraHead?: string;
  /** Extra raw markup injected just before </head>, i.e. after all default og:* tags. */
  tailHead?: string;
}


function buildShellTransform(shell: string, m: RouteMeta): string {
  const url = `${BASE_URL}${m.path}`;
  const title = esc(m.title);
  const desc = esc(m.description);
  const image = m.ogImage ? esc(m.ogImage) : null;
  const imageAlt = esc(m.ogImageAlt || m.title);

  let html = shell;

  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);

  // meta name="description"
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${desc}" />`,
  );

  // canonical — insert or replace (an override lets duplicate URLs point at the primary page)
  const canonical = esc(m.canonical || url);
  if (/<link\s+rel="canonical"/i.test(html)) {
    html = html.replace(
      /<link\s+rel="canonical"[^>]*>/i,
      `<link rel="canonical" href="${canonical}" />`,
    );
  } else {
    html = html.replace(
      /<\/head>/i,
      `  <link rel="canonical" href="${canonical}" />\n</head>`,
    );
  }

  // robots
  html = html.replace(
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="robots" content="${m.noindex ? "noindex, follow" : "index, follow"}" />`,
  );


  // og:url
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${url}" />`,
  );
  // og:title / twitter:title
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${title}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${title}" />`,
  );
  // og:description / twitter:description
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${desc}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${desc}" />`,
  );
  // og:image / twitter:image (only replace if a route image is provided)
  if (image) {
    html = html.replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:image" content="${image}" />`,
    );
    html = html.replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:image" content="${image}" />`,
    );
    html = html.replace(
      /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:image:alt" content="${imageAlt}" />`,
    );
    html = html.replace(
      /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:image:secure_url" content="${image}" />`,
    );
    html = html.replace(
      /<meta\s+name="twitter:image:alt"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:image:alt" content="${imageAlt}" />`,
    );
  }

  // Route-specific extra head markup, injected immediately after </title> so the
  // social tags sit in the opening bytes of the document (WhatsApp reads only a
  // small prefix of the response).
  if (m.extraHead) {
    html = html.replace(/<\/title>/i, `</title>\n    ${m.extraHead.trim()}`);
  }

  // Tail markup — anything that must come AFTER the default og:* block, such as
  // the secondary square og:image.
  if (m.tailHead) {
    html = html.replace(/<\/head>/i, `${m.tailHead.trim()}\n</head>`);
  }

  // route-specific JSON-LD: inject just before </head>
  if (m.jsonLd) {
    const ld = `<script type="application/ld+json">${JSON.stringify(m.jsonLd)}</script>\n`;
    html = html.replace(/<\/head>/i, `${ld}</head>`);
  }

  // replace the inner HTML of #seo-static-fallback
  html = html.replace(
    /(<div id="seo-static-fallback"[^>]*>)[\s\S]*?(<\/div>\s*<noscript>)/,
    `$1${m.bodyHtml}$2`,
  );

  return html;
}

function writeRoute(distPath: string, html: string) {
  // Trailing slash routes write to <route>/index.html
  const out = distPath === "/" ? resolve(DIST, "index.html") : resolve(DIST, `.${distPath}/index.html`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}

function productBody(p: ProductRow): string {
  const priceLine = p.price_usd ? `<p><strong>Price:</strong> $${Number(p.price_usd).toFixed(2)} USD</p>` : "";
  return `
    <header>
      <a href="/" rel="home">Mount Kailash Rejuvenation Centre</a>
      <nav aria-label="Breadcrumb"><a href="/shop">Shop</a> · ${esc(p.name)}</nav>
    </header>
    <main>
      <h1>${esc(p.name)} — Mount Kailash Rejuvenation Centre, Saint Lucia</h1>
      ${p.short_description ? `<p>${esc(stripHtml(p.short_description))}</p>` : ""}
      ${priceLine}
      ${p.description ? `<section><h2>Description</h2><p>${esc(stripHtml(p.description))}</p></section>` : ""}
      ${p.ingredients ? `<section><h2>Ingredients</h2><p>${esc(stripHtml(p.ingredients))}</p></section>` : ""}
      ${p.traditional_use ? `<section><h2>Traditional Use</h2><p>${esc(stripHtml(p.traditional_use))}</p></section>` : ""}
      ${p.dosage_instructions ? `<section><h2>Dosage</h2><p>${esc(stripHtml(p.dosage_instructions))}</p></section>` : ""}
      ${PRODUCT_EXTRA[p.slug] ?? ""}
      <p><a href="/shop">Browse the full apothecary</a></p>
    </main>
  `;
}


interface ProductRow {
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  ingredients: string | null;
  traditional_use: string | null;
  dosage_instructions: string | null;
  price_usd: number | null;
  image_url: string | null;
  stock_status: string | null;
}

interface RetreatRow {
  slug: string;
  name: string;
  description: string | null;
  short_description?: string | null;
}

interface SpeakerRow {
  slug: string | null;
  name: string;
  prefix: string | null;
  title: string | null;
  theme: string | null;
  bio: string | null;
  session_title: string | null;
  session_time: string | null;
  og_image_url: string | null;
}

async function loadProducts(): Promise<ProductRow[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data, error } = await sb
    .from("products")
    .select("slug,name,short_description,description,ingredients,traditional_use,dosage_instructions,price_usd,image_url,stock_status")
    .eq("is_active", true)
    .not("slug", "is", null);
  if (error) { console.warn("[prerender] products error:", error.message); return []; }
  return (data || []).filter((p) => p.slug) as ProductRow[];
}

async function loadRetreats(): Promise<RetreatRow[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  // Try short_description; gracefully fall back if column doesn't exist.
  const { data, error } = await sb
    .from("retreat_types")
    .select("slug,name,description")
    .eq("is_active", true)
    .not("slug", "is", null);
  if (error) { console.warn("[prerender] retreats error:", error.message); return []; }
  return (data || []).filter((r) => r.slug) as RetreatRow[];
}

async function loadSpeakers(): Promise<SpeakerRow[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data, error } = await sb
    .from("wce_speakers")
    .select("slug,name,prefix,title,theme,bio,session_title,session_time,og_image_url")
    .eq("published", true)
    .not("slug", "is", null)
    .order("display_order");
  if (error) { console.warn("[prerender] speakers error:", error.message); return []; }
  return (data || []).filter((s) => s.slug) as SpeakerRow[];
}

/** Mirrors src/components/wce/share.tsx so the static head matches the app. */
function speakerOgTitle(s: SpeakerRow) {
  const prefix = (s.prefix || "").trim();
  return clip(`${prefix ? `${prefix} ` : ""}${s.name} — Caribbean Wellness 2026`, 60);
}

function speakerOgDescription(s: SpeakerRow) {
  const theme = (s.theme || "").trim();
  const session = (s.session_title || "").trim();
  let text = [theme, session].filter(Boolean).join(" — ");
  if (!text) {
    const bio = stripHtml(s.bio);
    const m = bio.match(/^.*?[.!?](\s|$)/);
    text = (m?.[0] ?? bio).trim();
  }
  if (!text) text = "Caribbean Wellness Saint Lucia 2026 · 11–17 October";
  return clip(text, 155);
}


/* ---------------- WCE 2026 event data (for rich static HTML + schema) ---------------- */

const EVENT_START = "2026-10-11";
const EVENT_END = "2026-10-17";
const SYMPOSIUM_DATE = "2026-10-11";
const RETREAT_START = "2026-10-12";
const RETREAT_END = "2026-10-17";

interface PathwayRow {
  key: string;
  label: string;
  price: number | null;
  currency: string | null;
  is_open: boolean | null;
  display_order: number | null;
}
interface FaqRow { question: string; answer: string | null }
interface ItineraryRow { date_label: string | null; title: string | null; detail: string | null }

async function loadWceData(): Promise<{
  pathways: PathwayRow[];
  faqs: FaqRow[];
  itinerary: ItineraryRow[];
}> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return { pathways: [], faqs: [], itinerary: [] };
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  const [p, f, i] = await Promise.all([
    sb.from("wce_pathways").select("key,label,price,currency,is_open,display_order").order("display_order"),
    sb.from("wce_faqs").select("question,answer").eq("published", true).order("display_order"),
    sb.from("wce_itinerary").select("date_label,title,detail").eq("published", true).order("display_order"),
  ]);
  if (p.error) console.warn("[prerender] pathways error:", p.error.message);
  if (f.error) console.warn("[prerender] faqs error:", f.error.message);
  if (i.error) console.warn("[prerender] itinerary error:", i.error.message);
  return {
    pathways: (p.data || []) as PathwayRow[],
    faqs: ((f.data || []) as FaqRow[]).filter((x) => !!x.answer),
    itinerary: (i.data || []) as ItineraryRow[],
  };
}

const WCE_TAIL_HEAD = `<meta property="og:image" content="${BASE_URL}/og/wce-2026-square.jpg" />
    <meta property="og:image:secure_url" content="${BASE_URL}/og/wce-2026-square.jpg" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1080" />
    <meta property="og:image:height" content="1080" />
    <meta property="og:image:alt" content="Caribbean Wellness Saint Lucia 2026 — 11–17 October" />`;

/** Event JSON-LD mirroring src/pages/WCE2026.tsx, built from live pathway rows. */
function wceEventSchema(pathways: PathwayRow[]): Record<string, unknown> {
  const pageUrl = `${BASE_URL}/wce-2026`;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Caribbean Wellness Experience Saint Lucia 2026",
    description:
      "Caribbean Wellness Saint Lucia 2026: wellness symposium, six-day fortification retreat and LifeCraft experience at Mount Kailash Rejuvenation Centre, 11–17 October 2026.",
    startDate: EVENT_START,
    endDate: EVENT_END,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    image: [`${BASE_URL}/og/wce-2026.jpg`, `${BASE_URL}/og/wce-2026-square.jpg`],
    url: pageUrl,
    inLanguage: "en",
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
      url: BASE_URL,
    },
    subEvent: [
      {
        "@type": "Event",
        name: "Caribbean Wellness Symposium",
        startDate: SYMPOSIUM_DATE,
        endDate: SYMPOSIUM_DATE,
        eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
        url: `${pageUrl}#pathways`,
      },
      {
        "@type": "Event",
        name: "Caribbean Wellness Fortification Retreat",
        description:
          "Six-day fortification retreat at Mount Kailash Rejuvenation Centre, including LifeCraft experiences. Participation begins with an application reviewed by the Mount Kailash team.",
        startDate: RETREAT_START,
        endDate: RETREAT_END,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        url: `${BASE_URL}/wce-2026/apply`,
      },
    ],
    // Only the symposium tiers are purchasable — the retreat is application-only
    // and must never be described as directly buyable.
    offers: pathways
      .filter((p) => Number(p.price) > 0 && p.key !== "retreat")
      .map((p) => ({
        "@type": "Offer",
        name: p.label,
        price: Number(p.price).toFixed(2),
        priceCurrency: p.currency || "USD",
        availability: p.is_open ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
        url: `${pageUrl}#pathways`,
        validFrom: "2026-01-01",
      })),
  };
}

function wceBreadcrumb(path: string, name: string): Record<string, unknown> {
  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Caribbean Wellness Saint Lucia 2026", item: `${BASE_URL}/wce-2026` },
  ];
  if (path !== "/wce-2026") {
    items.push({ "@type": "ListItem", position: 3, name, item: `${BASE_URL}${path}` });
  }
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items };
}

/** Rich, crawlable text for the WCE landing page — what AI crawlers actually read. */
function wceBodyHtml(
  pathways: PathwayRow[],
  speakers: SpeakerRow[],
  faqs: FaqRow[],
  itinerary: ItineraryRow[],
): string {
  const pathwayList = pathways
    .map((p) => {
      const price =
        Number(p.price) > 0
          ? p.key === "retreat"
            ? ` — from ${p.currency || "US"}$${Number(p.price).toFixed(0)} per person, application only`
            : ` — ${p.currency || "US"}$${Number(p.price).toFixed(0)} per person`
          : "";
      return `<li><strong>${esc(p.label)}</strong>${esc(price)}</li>`;
    })
    .join("");
  const speakerList = speakers
    .map(
      (s) =>
        `<li><a href="/wce-2026/speakers/${esc(s.slug!)}">${esc(
          [(s.prefix || "").trim(), s.name].filter(Boolean).join(" "),
        )}</a>${s.theme ? ` — ${esc(s.theme)}` : ""}</li>`,
    )
    .join("");
  const days = itinerary
    .map(
      (d) =>
        `<li><strong>${esc(d.date_label)}</strong>${d.title ? ` — ${esc(d.title)}` : ""}${
          d.detail ? ` ${esc(stripHtml(d.detail))}` : ""
        }</li>`,
    )
    .join("");
  const faqBlocks = faqs
    .map((f) => `<h3>${esc(f.question)}</h3><p>${esc(stripHtml(f.answer))}</p>`)
    .join("");

  return `
      <header><a href="/" rel="home">Mount Kailash Rejuvenation Centre</a></header>
      <main>
        <h1>Caribbean Wellness Experience Saint Lucia 2026</h1>
        <p>11–17 October 2026 at Mount Kailash Rejuvenation Centre, Soufrière, Saint Lucia. A holistic wellness symposium, a six-day fortification retreat and the LifeCraft experience, hosted by Rt. Hon. Priest Kailash K. Leonce. What started in Jamaica continues in St. Lucia.</p>
        <p>The Caribbean Wellness Symposium opens the week on Sunday 11 October 2026 and can be attended in person in Saint Lucia or online from anywhere. The Caribbean Wellness Fortification Retreat runs 12–17 October 2026 and is application only.</p>
        ${pathwayList ? `<section><h2>Ways to attend</h2><ul>${pathwayList}</ul></section>` : ""}
        ${speakerList ? `<section><h2>Speakers, hosts and facilitators</h2><ul>${speakerList}</ul></section>` : ""}
        ${days ? `<section><h2>Programme</h2><ul>${days}</ul></section>` : ""}
        ${faqBlocks ? `<section><h2>Frequently asked questions</h2>${faqBlocks}</section>` : ""}
        <p><a href="/wce-2026#pathways">See the pathways</a> · <a href="/wce-2026/apply">Apply for the fortification retreat</a></p>
      </main>
    `;
}

function wceApplyBodyHtml(): string {
  return `
      <header>
        <a href="/" rel="home">Mount Kailash Rejuvenation Centre</a>
        <nav aria-label="Breadcrumb"><a href="/wce-2026">Caribbean Wellness Saint Lucia 2026</a> · Retreat Application</nav>
      </header>
      <main>
        <h1>Caribbean Wellness Fortification Retreat Application</h1>
        <p>Apply for the six-day Caribbean Wellness Fortification Retreat, 12–17 October 2026, at Mount Kailash Rejuvenation Centre in Soufrière, Saint Lucia.</p>
        <p>Retreat participation is application only. Every application is reviewed personally by the Mount Kailash team, who then contact you to discuss your goals, confirm availability, arrange your stay and walk you through payment.</p>
        <p><a href="/wce-2026">Read the full Caribbean Wellness Saint Lucia 2026 programme</a></p>
      </main>
    `;
}

const STATIC_ROUTES: Array<Omit<RouteMeta, "bodyHtml"> & { bodyHtml?: string }> = [

  {
    path: "/shop",
    title: "Herbal Tinctures & Sea Moss Apothecary | Mount Kailash",
    description: "Herbal tinctures, sea moss, capsules, teas and raw Caribbean herbs from the Mount Kailash apothecary in Soufriere, Saint Lucia.",
    jsonLd: [
      wceBreadcrumb("/shop", "Apothecary"),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Mount Kailash Rejuvenation Centre Apothecary",
        url: `${BASE_URL}/shop`,
        about: "Caribbean herbal tinctures, sea moss and wellness medicine from Soufriere, Saint Lucia",
      },
    ] as unknown as Record<string, unknown>,
  },
  {
    path: "/the-answer",
    title: "The Answer Tincture — Anamu & Soursop | Mount Kailash",
    description: "The Answer is the flagship tincture of Mount Kailash, Saint Lucia: Anamu, Vervain and Soursop leaf, wildcrafted and steeped in small batches.",
    jsonLd: [
      wceBreadcrumb("/the-answer", "The Answer"),
      faqPageSchema(theAnswerFaqs) as unknown as Record<string, unknown>,
    ] as unknown as Record<string, unknown>,
  },
  {
    path: "/webinars",
    title: "Free Herbal Medicine Webinars | Mount Kailash",
    description: "Free live and on-demand webinars on Caribbean clinical wellness medicine and herbal protocols with Rt Hon Priest Kailash K Leonce, Saint Lucia.",
    jsonLd: wceBreadcrumb("/webinars", "Webinars"),
  },
  {
    path: "/retreats",
    title: "7-Day Wellness Retreats in Saint Lucia | Mount Kailash",
    description: "Seven-day wellness retreats in the volcanic highlands of Soufriere, Saint Lucia: herbal feasts, bush-medicine protocols and a consultation.",
    jsonLd: [
      wceBreadcrumb("/retreats", "Retreats"),
      faqPageSchema(retreatFaqs) as unknown as Record<string, unknown>,
    ] as unknown as Record<string, unknown>,
  },
  {
    path: "/school/herbal-physician",
    title: "Herbal Physician Certification | Mount Kailash School",
    description: "Train as a Clinical Herbal Physician in Saint Lucia with Rt Hon Priest Kailash K Leonce. Limited cohorts, 500+ graduates practising worldwide.",
    jsonLd: [
      wceBreadcrumb("/school/herbal-physician", "School of Wellness Medicine"),
      {
        "@context": "https://schema.org",
        "@type": "Course",
        name: "Clinical Herbal Physician Certification",
        description:
          "Certification programme in Caribbean clinical wellness medicine: materia medica, clinical assessment, formulation, detoxification protocols and practice building.",
        url: `${BASE_URL}/school/herbal-physician`,
        inLanguage: "en",
        provider: {
          "@type": "Organization",
          name: "Mount Kailash Rejuvenation Centre",
          url: BASE_URL,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Soufriere",
            addressRegion: "Saint Lucia",
            addressCountry: "LC",
          },
        },
      },
    ] as unknown as Record<string, unknown>,
  },
  {
    path: "/wholesale",
    title: "Wholesale Caribbean Botanicals | Mount Kailash",
    description: "Single-origin Saint Lucia botanicals, tinctures and sea moss for clinics and practitioners. Batch documentation, bulk pricing, 3-day US delivery.",
    jsonLd: [
      wceBreadcrumb("/wholesale", "Wholesale"),
      faqPageSchema(wholesaleFaqs) as unknown as Record<string, unknown>,
    ] as unknown as Record<string, unknown>,
  },
  {
    path: "/learn",
    title: "Caribbean Herbal Medicine Articles | Mount Kailash",
    description: "Articles and guides on Caribbean wellness medicine, clinical herbal protocols and traditional formulations from Mount Kailash, Saint Lucia.",
    jsonLd: [
      wceBreadcrumb("/learn", "Learn"),
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Mount Kailash Rejuvenation Centre — Learn",
        url: `${BASE_URL}/learn`,
        inLanguage: "en",
        publisher: { "@type": "Organization", name: "Mount Kailash Rejuvenation Centre", url: BASE_URL },
      },
    ] as unknown as Record<string, unknown>,
  },
  {
    path: "/consultations",
    title: "Private Herbal Consultations | Mount Kailash",
    description: "Private wellness medicine consultations with Rt Hon Priest Kailash K Leonce and the Mount Kailash team, in Saint Lucia or by video worldwide.",
    jsonLd: [
      wceBreadcrumb("/consultations", "Consultations"),
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Wellness medicine consultation",
        serviceType: "Traditional Caribbean wellness medicine consultation",
        url: `${BASE_URL}/consultations`,
        areaServed: ["Saint Lucia", "Caribbean", "United States", "United Kingdom", "Canada"],
        provider: {
          "@type": "Organization",
          name: "Mount Kailash Rejuvenation Centre",
          url: BASE_URL,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Soufriere",
            addressRegion: "Saint Lucia",
            addressCountry: "LC",
          },
        },
      },
    ] as unknown as Record<string, unknown>,
  },
];


/** Route-specific static bodies, so no two routes ship the same HTML body. */
function staticBodyFor(path: string, products: ProductRow[]): string | undefined {
  switch (path) {
    case "/retreats":
      return retreatsBody();
    case "/the-answer":
      return theAnswerBody();
    case "/wholesale":
      return wholesaleBody();
    case "/school/herbal-physician":
      return schoolBody();
    case "/webinars":
      return webinarsBody();
    case "/learn":
      return learnBody();
    case "/consultations":
      return consultationsBody();

    case "/shop":
      return shopBody(
        products.map((p) => ({
          slug: p.slug as string,
          name: p.name,
          blurb: clip(stripHtml(p.short_description || p.description), 140),
          price: p.price_usd,
        })),
      );
    default:
      return undefined;
  }
}

async function main() {
  if (!existsSync(SHELL_PATH)) {
    console.warn(`[prerender] ${SHELL_PATH} missing — did vite build run? Skipping.`);
    return;
  }
  const shell = readFileSync(SHELL_PATH, "utf8");

  const [products, retreats] = await Promise.all([loadProducts(), loadRetreats()]);
  const speakers = await loadSpeakers();
  const wce = await loadWceData();
  let count = 0;

  // WCE 2026 — the landing page and the focused application page, both with the
  // full event text and Event/Breadcrumb schema in the raw HTML.
  const wceRoutes: RouteMeta[] = [
    {
      path: "/wce-2026",
      title: "Caribbean Wellness Experience Saint Lucia 2026",
      description:
        "11–17 October 2026 in Soufriere, Saint Lucia. Attend the wellness symposium in person or online, or apply for the six-day fortification retreat.",
      ogImage: `${BASE_URL}/og/wce-2026.jpg`,

      ogImageAlt:
        "Caribbean Wellness Saint Lucia 2026, 11–17 October, Mount Kailash Rejuvenation Centre",
      tailHead: WCE_TAIL_HEAD,
      jsonLd: [
        wceEventSchema(wce.pathways),
        wceBreadcrumb("/wce-2026", "Caribbean Wellness Saint Lucia 2026"),
      ] as unknown as Record<string, unknown>,
      bodyHtml: wceBodyHtml(wce.pathways, speakers, wce.faqs, wce.itinerary),
    },
    {
      path: "/wce-2026/apply",
      title: "Fortification Retreat Application 2026 | Mount Kailash",
      description:
        "Apply for the six-day Caribbean Wellness Fortification Retreat, 12–17 October 2026 at Mount Kailash, Saint Lucia. Application only.",

      ogImage: `${BASE_URL}/og/wce-2026.jpg`,
      ogImageAlt: "Caribbean Wellness Fortification Retreat, 12–17 October 2026, Saint Lucia",
      jsonLd: wceBreadcrumb("/wce-2026/apply", "Retreat Application"),
      bodyHtml: wceApplyBodyHtml(),
    },
  ];
  for (const r of wceRoutes) {
    writeRoute(r.path, buildShellTransform(shell, r));
    count++;
  }

  // Static marketing pages — replace head only, keep existing body fallback.

  for (const r of STATIC_ROUTES) {
    const meta: RouteMeta = {
      path: r.path,
      title: r.title,
      description: r.description,
      ogImage: r.ogImage,
      ogImageAlt: r.ogImageAlt,
      jsonLd: r.jsonLd,
      extraHead: r.extraHead,
      tailHead: r.tailHead,
      bodyHtml: r.bodyHtml ?? staticBodyFor(r.path, products) ?? extractDefaultFallback(shell),
    };
    writeRoute(r.path, buildShellTransform(shell, meta));
    count++;
  }

  // Shareable speaker routes — each needs its own OG tags in the raw HTML,
  // because WhatsApp and Facebook never execute JavaScript.
  for (const s of speakers) {
    const path = `/wce-2026/speakers/${s.slug}`;
    const image = s.og_image_url
      ? (s.og_image_url.startsWith("http") ? s.og_image_url : `${BASE_URL}${s.og_image_url}`)
      : `${BASE_URL}/og/wce-2026.jpg`;
    const title = speakerOgTitle(s);
    const description = speakerOgDescription(s);
    const meta: RouteMeta = {
      path,
      title,
      description,
      ogImage: image,
      ogImageAlt: title,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Person",
        name: s.name,
        honorificPrefix: (s.prefix || "").trim() || undefined,
        jobTitle: (s.title || "").trim() || undefined,
        description: stripHtml(s.bio) || description,
        image,
        url: `${BASE_URL}${path}`,
      },
      bodyHtml: `
        <header>
          <a href="/" rel="home">Mount Kailash Rejuvenation Centre</a>
          <nav aria-label="Breadcrumb"><a href="/wce-2026">Caribbean Wellness Saint Lucia 2026</a> · ${esc(s.name)}</nav>
        </header>
        <main>
          <h1>${esc(title)}</h1>
          ${s.theme ? `<p><strong>${esc(s.theme)}</strong></p>` : ""}
          ${s.session_title ? `<p>${esc(s.session_title)}${s.session_time ? ` · ${esc(s.session_time)}` : ""}</p>` : ""}
          ${s.bio ? `<p>${esc(stripHtml(s.bio))}</p>` : ""}
          <p>11–17 October 2026 at Mount Kailash Rejuvenation Centre, Saint Lucia.</p>
          <p><a href="/wce-2026#speakers">See the full line-up</a> · <a href="/wce-2026#pathways">Reserve your place</a></p>
        </main>
      `,
    };
    writeRoute(path, buildShellTransform(shell, meta));
    count++;
  }

  // Products
  for (const p of products) {
    const title = clip(`${p.name} | Mount Kailash Apothecary`, 60);
    const description = clip(stripHtml(p.short_description || p.description || `${p.name} — Caribbean herbal formulation from Mount Kailash, Saint Lucia.`), 155);
    const meta: RouteMeta = {
      path: `/shop/${p.slug}`,
      title,
      description,
      ogImage: p.image_url || undefined,
      bodyHtml: productBody(p),
      // /shop/the-answer and /the-answer are the same product — the dedicated
      // page is the primary URL.
      canonical: p.slug === "the-answer" ? `${BASE_URL}/the-answer` : undefined,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        description: stripHtml(p.description || p.short_description || ""),
        image: p.image_url || undefined,
        brand: { "@type": "Brand", name: "Mount Kailash Rejuvenation Centre" },
        url: p.slug === "the-answer" ? `${BASE_URL}/the-answer` : `${BASE_URL}/shop/${p.slug}`,
        offers: p.price_usd
          ? {
              "@type": "Offer",
              priceCurrency: "USD",
              price: Number(p.price_usd).toFixed(2),
              availability:
                (p.stock_status || "").toLowerCase() === "out_of_stock"
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/InStock",
              url: `${BASE_URL}/shop/${p.slug}`,
            }
          : undefined,
      },
    };
    writeRoute(`/shop/${p.slug}`, buildShellTransform(shell, meta));
    count++;
  }

  // Retreats — booking forms, not indexable content.
  for (const r of retreats) {
    const description = clip(stripHtml(r.description || `${r.name} — wellness retreat with Mount Kailash in Saint Lucia.`), 155);
    const meta: RouteMeta = {
      path: `/retreats/book/${r.slug}`,
      title: clip(`Book ${r.name} | Mount Kailash`, 60),
      description,
      noindex: true,
      bodyHtml: `
        <header><a href="/" rel="home">Mount Kailash Rejuvenation Centre</a></header>
        <main>
          <h1>${esc(r.name)}</h1>
          ${r.description ? `<p>${esc(stripHtml(r.description))}</p>` : ""}
          <p><a href="/retreats">See all healing retreats</a></p>
        </main>
      `,
    };
    writeRoute(`/retreats/book/${r.slug}`, buildShellTransform(shell, meta));
    count++;
  }


  // Catch-all 404 document. Static hosting serves this with an HTTP 404 status
  // for any path that does not match a known route, so unknown URLs no longer
  // return the homepage with a 200.
  const notFound = buildShellTransform(shell, {
    path: "/404",
    title: "Page not found (404) | Mount Kailash Rejuvenation Centre",
    description:
      "This page does not exist. Find the Mount Kailash apothecary, healing retreats, school of wellness medicine and consultations in Saint Lucia.",
    noindex: true,
    canonical: `${BASE_URL}/404`,
    bodyHtml: notFoundBody(),
  });
  writeFileSync(resolve(DIST, "404.html"), notFound);
  count++;

  console.log(`[prerender] wrote ${count} static HTML files into dist/`);
}

function extractDefaultFallback(shell: string): string {
  const m = shell.match(/<div id="seo-static-fallback"[^>]*>([\s\S]*?)<\/div>\s*<noscript>/);
  return m?.[1] ?? "";
}

main().catch((err) => {
  console.error("[prerender] failed:", err);
  // Don't fail the build — SPA fallback still works.
  process.exit(0);
});
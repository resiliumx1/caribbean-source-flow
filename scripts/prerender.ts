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

/** Two-level Home › page breadcrumb for static routes. */
function pageBreadcrumb(path: string, name: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name, item: `${BASE_URL}${path}` },
    ],
  };
}

const STATIC_ROUTES: Array<Omit<RouteMeta, "bodyHtml"> & { bodyHtml?: string }> = [

  {
    path: "/shop",
    title: "Herbal Tinctures & Sea Moss Apothecary | Mount Kailash",
    description: "Herbal tinctures, sea moss, capsules, teas and raw Caribbean herbs from the Mount Kailash apothecary in Soufriere, Saint Lucia.",
    jsonLd: [
      pageBreadcrumb("/shop", "Apothecary"),
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
      pageBreadcrumb("/the-answer", "The Answer"),
      faqPageSchema(theAnswerFaqs) as unknown as Record<string, unknown>,
    ] as unknown as Record<string, unknown>,
  },
  {
    path: "/webinars",
    title: "Free Herbal Medicine Webinars | Mount Kailash",
    description: "Free live and on-demand webinars on Caribbean clinical wellness medicine and herbal protocols with Rt Hon Priest Kailash K Leonce, Saint Lucia.",
    jsonLd: pageBreadcrumb("/webinars", "Webinars"),
  },
  {
    path: "/retreats",
    title: "7-Day Wellness Retreats in Saint Lucia | Mount Kailash",
    description: "Seven-day wellness retreats in the volcanic highlands of Soufriere, Saint Lucia: herbal feasts, bush-medicine protocols and a consultation.",
    jsonLd: [
      pageBreadcrumb("/retreats", "Retreats"),
      faqPageSchema(retreatFaqs) as unknown as Record<string, unknown>,
    ] as unknown as Record<string, unknown>,
  },
  {
    path: "/school/herbal-physician",
    title: "Herbal Physician Certification | Mount Kailash School",
    description: "Train as a Clinical Herbal Physician in Saint Lucia with Rt Hon Priest Kailash K Leonce. Limited cohorts, 500+ graduates practising worldwide.",
    jsonLd: [
      pageBreadcrumb("/school/herbal-physician", "School of Wellness Medicine"),
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
      pageBreadcrumb("/wholesale", "Wholesale"),
      faqPageSchema(wholesaleFaqs) as unknown as Record<string, unknown>,
    ] as unknown as Record<string, unknown>,
  },
  {
    path: "/learn",
    title: "Caribbean Herbal Medicine Articles | Mount Kailash",
    description: "Articles and guides on Caribbean wellness medicine, clinical herbal protocols and traditional formulations from Mount Kailash, Saint Lucia.",
    jsonLd: [
      pageBreadcrumb("/learn", "Learn"),
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
      pageBreadcrumb("/consultations", "Consultations"),
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
  let count = 0;

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
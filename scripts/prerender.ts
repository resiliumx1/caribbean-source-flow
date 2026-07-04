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
  jsonLd?: Record<string, unknown>;
  bodyHtml: string;      // goes into #seo-static-fallback
}

function buildShellTransform(shell: string, m: RouteMeta): string {
  const url = `${BASE_URL}${m.path}`;
  const title = esc(m.title);
  const desc = esc(m.description);
  const image = m.ogImage ? esc(m.ogImage) : null;

  let html = shell;

  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);

  // meta name="description"
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${desc}" />`,
  );

  // canonical — insert or replace
  if (/<link\s+rel="canonical"/i.test(html)) {
    html = html.replace(
      /<link\s+rel="canonical"[^>]*>/i,
      `<link rel="canonical" href="${url}" />`,
    );
  } else {
    html = html.replace(
      /<\/head>/i,
      `  <link rel="canonical" href="${url}" />\n</head>`,
    );
  }

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
      `<meta property="og:image:alt" content="${title}" />`,
    );
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
      <h1>${esc(p.name)}</h1>
      ${p.short_description ? `<p>${esc(stripHtml(p.short_description))}</p>` : ""}
      ${priceLine}
      ${p.description ? `<section><h2>Description</h2><p>${esc(stripHtml(p.description))}</p></section>` : ""}
      ${p.ingredients ? `<section><h2>Ingredients</h2><p>${esc(stripHtml(p.ingredients))}</p></section>` : ""}
      ${p.traditional_use ? `<section><h2>Traditional Use</h2><p>${esc(stripHtml(p.traditional_use))}</p></section>` : ""}
      ${p.dosage_instructions ? `<section><h2>Dosage</h2><p>${esc(stripHtml(p.dosage_instructions))}</p></section>` : ""}
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

const STATIC_ROUTES: Array<Omit<RouteMeta, "bodyHtml"> & { bodyHtml?: string }> = [
  {
    path: "/shop",
    title: "Shop — Mount Kailash Apothecary | Caribbean Herbal Tinctures, Sea Moss & Wellness Medicine",
    description: "Browse the Mount Kailash apothecary: herbal tinctures, sea moss, capsules, teas, and traditional Caribbean wellness medicine, hand-formulated in Saint Lucia.",
  },
  {
    path: "/the-answer",
    title: "The Answer Tincture — Foy Duran, Vervain & Soursop Leaves | Mount Kailash",
    description: "The Answer is Mount Kailash's flagship botanical formulation: Foy Duran, Vervain, and Soursop Leaves steeped 21 days in oak barrels for cellular detox and rejuvenation.",
  },
  {
    path: "/webinars",
    title: "Webinars — Live & On-Demand Wellness Medicine with Priest Kailash | Mount Kailash",
    description: "Free and paid webinars on clinical wellness medicine, herbal protocols, and healing practices led by Rt. Hon. Priest Kailash K. Leonce.",
  },
  {
    path: "/retreats",
    title: "Healing Retreats in Saint Lucia — 7-Day Cellular Detox & Wellness Immersion | Mount Kailash",
    description: "7-day immersive wellness retreats in the volcanic highlands of Saint Lucia. Daily herbal feasts, wellness medicine protocols, and clinical consultations with Priest Kailash.",
  },
  {
    path: "/school/herbal-physician",
    title: "School of Wellness Medicine — Clinical Herbal Physician Certification | Mount Kailash",
    description: "Train as a Clinical Herbal Physician with Mount Kailash. Cohorts up to 50 students, 500+ graduates worldwide. Apply to the next intake.",
  },
  {
    path: "/wholesale",
    title: "Wholesale Caribbean Botanicals — Practitioner Supply, Miami Warehouse, 3-Day US Delivery",
    description: "Premium Caribbean botanicals for clinics, retailers, and wellness brands. COA documentation, Miami warehouse, 3-day US delivery. Request a wholesale conversation.",
  },
  {
    path: "/learn",
    title: "Learn — Caribbean Herbal Medicine Library | Mount Kailash",
    description: "Articles and guides on Caribbean wellness medicine, clinical herbal protocols, and traditional formulations from Mount Kailash Rejuvenation Centre.",
  },
];

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
      bodyHtml: r.bodyHtml ?? extractDefaultFallback(shell),
    };
    writeRoute(r.path, buildShellTransform(shell, meta));
    count++;
  }

  // Products
  for (const p of products) {
    const title = `${p.name} — Mount Kailash Apothecary`;
    const description = clip(stripHtml(p.short_description || p.description || `${p.name} — Caribbean herbal formulation from Mount Kailash, Saint Lucia.`), 155);
    const meta: RouteMeta = {
      path: `/shop/${p.slug}`,
      title,
      description,
      ogImage: p.image_url || undefined,
      bodyHtml: productBody(p),
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        description: stripHtml(p.description || p.short_description || ""),
        image: p.image_url || undefined,
        brand: { "@type": "Brand", name: "Mount Kailash Rejuvenation Centre" },
        url: `${BASE_URL}/shop/${p.slug}`,
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

  // Retreats
  for (const r of retreats) {
    const description = clip(stripHtml(r.description || `${r.name} — wellness retreat with Mount Kailash in Saint Lucia.`), 155);
    const meta: RouteMeta = {
      path: `/retreats/book/${r.slug}`,
      title: `${r.name} — Healing Retreat in Saint Lucia | Mount Kailash`,
      description,
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
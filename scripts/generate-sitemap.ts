// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml, public/robots.txt, and public/llms.txt.

import { writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://mountkailashslu.com";

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

interface Entry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const today = new Date().toISOString().slice(0, 10);

const staticEntries: Entry[] = [
  { loc: "/",                          changefreq: "weekly",  priority: "1.0", lastmod: today },
  { loc: "/shop",                      changefreq: "weekly",  priority: "0.9", lastmod: today },
  { loc: "/the-answer",                changefreq: "weekly",  priority: "0.9", lastmod: today },
  { loc: "/webinars",                  changefreq: "weekly",  priority: "0.8", lastmod: today },
  { loc: "/retreats",                  changefreq: "weekly",  priority: "0.8", lastmod: today },
  { loc: "/school/herbal-physician",   changefreq: "monthly", priority: "0.8", lastmod: today },
  { loc: "/wholesale",                 changefreq: "monthly", priority: "0.8", lastmod: today },
];

async function fetchDynamic(): Promise<Entry[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[sitemap] Supabase env vars missing — skipping dynamic entries.");
    return [];
  }
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

  const out: Entry[] = [];

  const { data: products, error: pErr } = await sb
    .from("products")
    .select("slug, updated_at")
    .eq("is_active", true)
    .not("slug", "is", null);
  if (pErr) console.warn("[sitemap] products error:", pErr.message);
  for (const p of products || []) {
    if (!p.slug) continue;
    out.push({
      loc: `/shop/${p.slug}`,
      lastmod: (p.updated_at || today).toString().slice(0, 10),
      changefreq: "weekly",
      priority: "0.7",
    });
  }

  const { data: retreats, error: rErr } = await sb
    .from("retreat_types")
    .select("slug, updated_at")
    .eq("is_active", true)
    .not("slug", "is", null);
  if (rErr) console.warn("[sitemap] retreats error:", rErr.message);
  for (const r of retreats || []) {
    if (!r.slug) continue;
    out.push({
      loc: `/retreats/book/${r.slug}`,
      lastmod: (r.updated_at || today).toString().slice(0, 10),
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  return out;
}

function renderSitemap(entries: Entry[]): string {
  const urls = entries.map((e) =>
    [
      "  <url>",
      `    <loc>${BASE_URL}${e.loc}</loc>`,
      e.lastmod    ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority   ? `    <priority>${e.priority}</priority>` : null,
      "  </url>",
    ].filter(Boolean).join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
    "",
  ].join("\n");
}

const ROBOTS = `User-agent: *
Allow: /
Disallow: /account
Disallow: /customer-portal

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Bytespider
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;

const LLMS = `# Mount Kailash Rejuvenation Centre

> Caribbean clinical bush medicine from Soufrière, Saint Lucia, led by Rt. Hon. Priest Kailash K. Leonce. 21+ years of practice, 500+ herbal physicians trained, 43,000+ bottles formulated annually, 3-day US delivery.

## Pages

- [Home](${BASE_URL}/): Overview of Mount Kailash and its four pillars — apothecary, retreats, school, wholesale.
- [Apothecary / Shop](${BASE_URL}/shop): Wildcrafted herbal tinctures, capsules, teas, and raw herbs from Saint Lucia.
- [The Answer](${BASE_URL}/the-answer): Signature immune tincture with Anamu, Vervain, and Soursop leaves — steeped 21 days in oak barrels.
- [Webinars](${BASE_URL}/webinars): Free live and on-demand herbal medicine webinars with Priest Kailash Leonce.
- [Healing Retreats](${BASE_URL}/retreats): 7-day immersive cellular detox and wellness retreats in the volcanic highlands of Saint Lucia.
- [School of Bush Medicine](${BASE_URL}/school/herbal-physician): Clinical bush medicine training program; 500+ graduates worldwide.
- [Wholesale](${BASE_URL}/wholesale): Bulk botanical supply for clinics, retailers, and wellness brands; Miami warehouse, 3-day US delivery.
`;

async function main() {
  const dynamic = await fetchDynamic();
  const all = [...staticEntries, ...dynamic];
  writeFileSync(resolve("public/sitemap.xml"), renderSitemap(all));
  writeFileSync(resolve("public/robots.txt"), ROBOTS);
  writeFileSync(resolve("public/llms.txt"), LLMS);
  console.log(
    `[sitemap] wrote sitemap.xml (${all.length} urls = ${staticEntries.length} static + ${dynamic.length} dynamic), robots.txt, llms.txt`,
  );
}

main().catch((err) => {
  console.error("[sitemap] failed:", err);
  // Don't fail the build — keep last good static files in place.
  process.exit(0);
});
## Is the claim true?

**Partially yes.** The shop is a Vite SPA — `index.html` ships an empty `<div id="root">` and React Router renders `/shop` and `/shop/:slug` client-side. Implications:

- **Modern search engines (Google, Bing)** *do* execute JS and can index SPA pages. We already help them: `react-helmet-async` injects per-route `<title>`, description, canonical, OG tags, and JSON-LD via `SEOHead`, and `public/sitemap.xml` is regenerated at build time with one entry per active product (`/shop/<slug>`).
- **Non-JS fetchers** — ChatGPT's URL fetch tool, Perplexity's crawler in lite mode, Slack/LinkedIn/Facebook link unfurlers, many AI agents — see only the static `index.html`. Right now that file has a generic title/description and **no product-specific metadata**, so they get nothing useful for any product page. That matches exactly what the user reported.
- "The Answer" and a couple of others appear to work because they're cached on third-party sites or were scraped when JS-rendered.

So the user's diagnosis is correct for the AI/non-JS-crawler audience. The fix is to serve real HTML for product (and other key) pages instead of an empty shell.

## Proposed fix: prerender product + key marketing pages at build time

Add `vite-plugin-prerender-spa` (or `react-snap`) to the build. At `vite build` time, after the normal SPA bundle is produced, Puppeteer loads each listed route against the built output, waits for React + Helmet to hydrate, then writes the fully-rendered HTML to `dist/<route>/index.html`. Lovable hosting's SPA fallback keeps working for everything else; for prerendered routes the static HTML is served first, so non-JS crawlers see the real title, description, OG image, JSON-LD, product name, price, and description — while users still get the live React app once JS loads.

### Routes to prerender

Pull the list dynamically in `scripts/generate-prerender-routes.ts` (mirrors `scripts/generate-sitemap.ts`):

- `/`, `/shop`, `/the-answer`, `/webinars`, `/retreats`, `/school/herbal-physician`, `/wholesale`, `/learn`
- `/shop/<slug>` for every active product
- `/retreats/book/<slug>` for every active retreat
- `/learn/<slug>` for every published article

(Skip `/cart`, `/checkout`, `/account/*`, `/admin/*`, `/login`, `/pay/*` — already `noindex` or auth-gated.)

### Wire-up

```text
package.json
  "prebuild": "bunx tsx scripts/generate-sitemap.ts && bunx tsx scripts/generate-prerender-routes.ts"
  "build": "vite build"
  "postbuild": "bunx tsx scripts/prerender.ts"   # runs Puppeteer over dist/
```

`scripts/prerender.ts` serves `dist/` on a local port, visits each route headlessly with a 1s settle for Helmet, and writes `dist/<route>/index.html`. Build still falls back to SPA for anything not prerendered.

### What this fixes

- ChatGPT/Claude/Perplexity URL fetchers can read every product page.
- Slack/LinkedIn/Facebook/WhatsApp link previews show the correct product image + description (today they all show the generic OG default).
- Search engines get instant HTML instead of waiting for the JS-rendering queue — faster, more reliable indexing.
- No runtime cost, no server needed — pure build-time output. Hosting stays static.

### What this doesn't change

- Lovable Cloud, Supabase, RLS, product data, admin flows, styling — untouched.
- SPA behavior in the browser is identical post-hydration.

### Risks / caveats

- Build time goes up (~5–10s per prerendered route × ~50 products = roughly 5 extra minutes). Acceptable for the SEO/AI-visibility gain; can be parallelized.
- If a product is added/edited, the change appears to crawlers only after the next publish. The live site is unaffected.
- Prices fetched client-side from Supabase won't be in the prerendered HTML unless we also fetch them at build time. Worth doing for product pages — we already query products in the sitemap script and can extend it to seed initial HTML.

## Out of scope (ask if you want any)

- Switching to full SSR (Next.js / Remix) — much bigger lift, not needed for this problem.
- Image OG generation per product (currently uses one site-wide OG image).
- Pre-rendering admin or account pages.

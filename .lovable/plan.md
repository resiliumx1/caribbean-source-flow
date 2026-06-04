# Improve Crawler & LLM Readability (A + C)

Goal: cut the 3706% rendered-content gap so search engines and AI crawlers (ChatGPT, Perplexity, Claude, Googlebot) see real content instead of an empty `<div id="root">`.

## What changes

### Part A — Prerender all public routes at build time

Add a prerender step that runs after `vite build`, spins up a headless browser, visits every public route, and writes the fully-rendered HTML back into `dist/<route>/index.html`. React still hydrates normally for live users.

- Install `puppeteer` (dev dep) + small custom prerender script (no plugin lock-in, works cleanly with our strict whitelist router).
- Route whitelist (mirrors current router): `/`, `/shop`, `/shop/[per category page]`, `/the-answer`, `/webinars`, `/retreats`, `/school`, `/wholesale`, `/about`, `/contact`, `/customer-portal`, plus key product detail routes if statically known. Dynamic product slugs are skipped (handled by React at runtime + Helmet meta).
- Hook into `package.json` as `"build": "vite build && node scripts/prerender.mjs"`.
- Preserves Helmet-injected `<title>`, meta, JSON-LD per route — they get baked into each snapshot.
- Gate Entrance: prerender waits for `networkidle0` + a short delay so hero/nav/footer render before snapshot. Gate animation still plays on real load (it's GSAP, runs on hydration).

### Part C — Enrich `<noscript>` fallback in index.html

Hand-write a static fallback inside `<div id="root">` and `<noscript>` containing:

- H1 "Mount Kailash Rejuvenation Centre"
- Tagline + 2–3 sentence description (mineral rich soil, clinical bush medicine, Saint Lucia)
- Primary nav links as plain `<a href>` (Shop, The Answer, Webinars, Retreats, School, Wholesale, Contact)
- Official contact numbers + address
- Link to sitemap

React replaces the `<div id="root">` content on hydration — zero visual impact for real users. `<noscript>` is invisible unless JS is disabled.

## Files touched

- `package.json` — add `puppeteer` devDep, update `build` script
- `scripts/prerender.mjs` — new prerender runner (route list + puppeteer loop)
- `index.html` — enrich fallback markup inside `#root` and `<noscript>`
- `vite.config.ts` — no change expected

## Risk / safety

- Zero runtime impact: prerender is build-time only; noscript is invisible with JS on.
- Build time increases ~30–90s depending on route count.
- If prerender fails for a route, script logs + skips (doesn't fail the build).
- Gate Entrance, GSAP, framer-motion all still run on hydration exactly as today.

## Verification

After republish, test with:
- `curl https://mountkailashslu.com/` → should return real HTML with headings/nav, not empty `#root`
- Re-run the SEO checker — rendered-content % should drop dramatically (target <300%)

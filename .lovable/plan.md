## SEO Checker findings — diagnosis

Validated against the live source. Five of seven items are real and fixable in `index.html` + the homepage; one is a duplicate that resolves automatically; one is a tip.

| # | Finding | Cause in code | Fix |
|---|---|---|---|
| 1 | **Only provide one canonical link** (Error) | `index.html` line 11 has `<link rel="canonical">` AND `TrinityHomepage.tsx` Helmet adds another → two canonicals in rendered HTML | Remove the static canonical from `index.html`. Per-route Helmet owns it (head-meta rule: `<link>` tags don't dedupe). |
| 2 | **Remove duplicate meta description** (Error) | `index.html` ships one description; `TrinityHomepage.tsx` Helmet sets an identical one. Helmet *should* dedupe by `name`, but the scanner still flags two descriptions at scan time. | Drop the duplicate `<meta name="description">` from the homepage Helmet (keep `og:description` / `twitter:description`). The static one in `index.html` stays as the sitewide fallback. |
| 3 | **Use only one H1** (Error) | Two `<h1>` elements render on `/`: `GateEntrance.tsx:179` ("Mount Kailash") and `HeroSection.tsx:303` (the real page headline). | Demote the gate's `<h1 class="h-title">` to a `<div class="h-title">` (or `<p>`). It's a decorative brand mark on the entrance overlay, not the page heading. CSS targets `.h-title` so styling is unaffected. |
| 4 | **Remove duplicate heading texts** (Warning) | Resolves with #3 — the gate's "Mount Kailash" repeats brand text already shown elsewhere on the page. Once it's no longer a heading, the duplicate-heading warning clears. | No additional change. |
| 5 | **Improve meta description text** (Warning) | Current description (157 chars) is fine length-wise but starts with a fragment ("Caribbean clinical bush medicine…") with no verb. Scanner wants a more action-oriented sentence. | Rewrite description in `index.html` to a clearer benefit-led sentence including the brand name, e.g. *"Mount Kailash Rejuvenation Centre offers Caribbean bush medicine from Saint Lucia — shop herbal tinctures, book a healing retreat, or train as an herbal physician with Priest Kailash."* |
| 6 | **Make page title match content** (Warning) | Title is "Mount Kailash Rejuvenation Centre \| Bush Medicine SLU"; the visible hero copy emphasizes *clinical herbal medicine, retreats, school*. The bridge word "Bush Medicine SLU" reads like a slug. | Refine to *"Mount Kailash Rejuvenation Centre — Clinical Bush Medicine, Retreats & Herbal School, Saint Lucia"* so the title matches the hero/services content the scanner reads. |
| 7 | **Add favicon markup** (Tip) | `public/favicon.ico` exists but `index.html` never declares `<link rel="icon">`. Browsers auto-discover, but the scanner wants explicit markup. | Add `<link rel="icon" type="image/x-icon" href="/favicon.ico" />` to `<head>`. |

## Files to edit

- **`index.html`** — remove `<link rel="canonical">`; rewrite `<meta name="description">` (and the matching `og:description` / `twitter:description`); add `<link rel="icon">`; refine `<title>` (and matching `og:title` / `twitter:title`).
- **`src/pages/TrinityHomepage.tsx`** — remove the duplicate `<meta name="description">` line from Helmet; keep canonical, og:*, title.
- **`src/components/gate-entrance/GateEntrance.tsx`** — change `<h1 className="h-title">Mount Kailash</h1>` to `<div className="h-title">Mount Kailash</div>`. The visible `<h1>` becomes the one in `HeroSection.tsx` ("Clinical Bush Medicine…"), which is the correct page H1.

## Out of scope / not changing

- The `<h1>` inside `<noscript>` in `index.html` — only renders for JS-disabled crawlers, doesn't conflict.
- Other route pages (Shop, Retreats, Webinars, etc.) — scan was against `/` only; their Helmet metadata is already per-route.
- Sitemap, robots, structured data — already correct from prior SEO passes.

After approval I'll mark the relevant `seo_chat` findings fixed and remind you to republish so the changes hit the public URL.
## Why Google is showing the bottles illustration

Google currently picks the apothecary-bottles illustration off the homepage because the site's declared `og:image` (the KHALASH LOGO JPEG hosted on `storage.googleapis.com`) is small, off-brand, and squashed into a square — so Google's image picker overrides it with a body image it likes better.

To take control, we need to give Google a clearly better, properly-sized social/preview image and reinforce it per page.

## What I'll change

### 1. Promote a flagship social image
- Upload `src/assets/the-answer-chronixx-bottle.webp` (the bottle product shot) to the Lovable Assets CDN.
- Re-export it at proper 1200×630 OG dimensions as `og-default.jpg` (centered bottle, brand-green padding) using the imagegen edit tool, then upload that to the CDN. This becomes the new sitewide preview image.

### 2. Replace the sitewide OG image
- In `index.html`, swap the `og:image` (currently the Google Cloud Storage KHALASH LOGO URL) for the new CDN URL.
- Add `og:image:width` / `og:image:height` / `og:image:alt` and `twitter:image` so crawlers see a fully-formed card.
- Add `twitter:card = summary_large_image`.

### 3. Replace the default in `SEOHead.tsx`
- Change `DEFAULT_OG` in `src/components/SEOHead.tsx` to the same new CDN URL so every page that doesn't pass its own `ogImage` inherits The Answer bottle instead of the logo.

### 4. Per-page preview images (the part the user asked for)
Pass a tailored `ogImage` from each major route's `<SEOHead />`:

| Route | Image |
|---|---|
| `/` (TrinityHomepage) | The Answer bottle (new default) |
| `/the-answer` | `the-answer-chronixx-studio.webp` (Chronixx + bottle) |
| `/shop` | `mkrc-answer-tincture.webp` or storefront lineup |
| `/retreats` | retreat / grounds photo if one exists in `src/assets`; otherwise keep default |
| `/herbal-physician-course` | school hero image already in that page |
| `/webinars` | webinar/teaching still |
| `/product/:slug` (ProductDetail) | the product's own featured image — already has product context, just ensure `ogImage` is wired |

I'll audit `src/assets` for each route and pick the best existing photo — no new image generation beyond the one OG export above unless something is missing.

### 5. Keep Google honest
- Confirm every `<Helmet>` keeps `canonical` and `og:url` pointing at the route itself (already true in `SEOHead`).
- Re-submit `https://mountkailashslu.com/sitemap.xml` in Google Search Console (now connected) so Google re-crawls faster.

## What the user should expect
Google's image picker caches aggressively. Even after deploy, the bottles illustration can stick in Search results for **2–6 weeks** until Googlebot recrawls and re-renders preview cards. To speed it up I'll:
- Submit the sitemap via the connected Search Console.
- Recommend the user open Search Console → URL Inspection → "Request indexing" on `/` and `/the-answer` once we publish.

## Files I'll touch
- `index.html` — replace `og:image`, add dimensions/twitter card.
- `src/components/SEOHead.tsx` — new `DEFAULT_OG`.
- `src/pages/TrinityHomepage.tsx`, `TheAnswer.tsx`, `Shop.tsx`, `Retreats.tsx`, `HerbalPhysicianCourse.tsx`, `Webinars.tsx`, `ProductDetail.tsx` — pass `ogImage` prop.
- `src/assets/og-default.jpg.asset.json` (new CDN pointer) and possibly `src/assets/og-the-answer.jpg.asset.json`.

No business logic, routing, or layout changes.

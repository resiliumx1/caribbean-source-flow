

## SEO & Performance Fix Plan

### Current State
- **Meta tags**: Already present in `index.html` (title, description, OG, Twitter, robots, canonical)
- **JSON-LD**: Missing entirely
- **Prerendering**: Not possible in Lovable (Vite SPA) — but we can add `<noscript>` fallback content and prerender hints
- **Counters**: `ByTheNumbers` and `CounterAnimation` start at 0, showing "0+" to crawlers
- **Heading hierarchy**: Only one `h1` exists (HeroSection) — need to audit `h2`/`h3` usage across homepage sections
- **CLS**: Stat containers lack reserved dimensions

### Changes

#### 1. `index.html` — Meta tags, JSON-LD, noscript fallback

- Update `<title>` to "Clinical Bush Medicine & Wellness Retreats | Mount Kailash"
- Update `meta description` to the provided copy
- Update `og:url` and `canonical` to `https://caribbean-source-flow.lovable.app/`
- Add JSON-LD `MedicalBusiness` schema before `</body>`
- Add `<noscript>` block inside `<div id="root">` with key text content for crawlers that don't execute JS
- Remove duplicate/conflicting OG tags (consolidate)

#### 2. `src/components/trinity/ByTheNumbers.tsx` — Fix "0+" issue

- Initialize `AnimatedCounter` state to `target` instead of `0`, so the static HTML shows the real number
- Animation still runs on viewport entry but the initial render shows the correct value
- Add `min-height: 60px` and `min-width: 100px` to stat number containers for CLS prevention

#### 3. `src/components/mkrc/CounterAnimation.tsx` — Same fix

- Initialize `count` state to `target` instead of `0`
- The IntersectionObserver animation resets to 0 and animates up, but the initial SSR/render shows the real number

#### 4. `src/components/homepage/HeroSection.tsx` — Alt text for pillar cards

- Add descriptive `alt` text to pillar card images instead of `alt=""`
- These are decorative but contain meaningful illustrations, so provide brief alt text

#### 5. `src/components/homepage/SourceStory.tsx` — Heading hierarchy audit

- Verify `h2` tags are used for section headings (not `h1` or skipping to `h4`)
- This is likely already correct based on the code structure

#### 6. `src/index.css` — CLS prevention

- Add `.stat-container` and `.stat-number` utility classes with reserved dimensions

### Files to modify
1. `index.html` — meta tags, JSON-LD, noscript
2. `src/components/trinity/ByTheNumbers.tsx` — counter initial value + CLS
3. `src/components/mkrc/CounterAnimation.tsx` — counter initial value
4. `src/components/homepage/HeroSection.tsx` — alt text
5. `src/index.css` — CLS utility classes

### What this does NOT solve
- **True SSR/prerendering**: Lovable is a Vite SPA; we cannot generate server-rendered HTML. The `<noscript>` fallback and JSON-LD give crawlers content to index. Google's crawler does execute JS for SPAs, so the React content will be indexed.
- **Image compression**: Per user request, handled manually.


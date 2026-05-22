# Plan — Footer Legal, Checkout Consent, Cookie Banner, FDA Disclaimers

## 1. Footer — Legal column

Current state: all five footers (`HomepageFooter`, `MKRCFooter`, `UnifiedFooter`, `StoreFooter`, `wholesale/Footer`) already link to `/terms-and-conditions` and `/privacy-policy` from Prompt 4.

Refine to a clearly-labeled grouping:
- `StoreFooter.tsx` and `wholesale/Footer.tsx` already use multi-column layouts. Add a dedicated **"Legal"** column heading (matching sibling column styles) containing both links.
- `HomepageFooter.tsx`, `MKRCFooter.tsx`, `UnifiedFooter.tsx` use a single inline row — keep inline, but prefix with a small "Legal:" label so the section is identifiable.

## 2. Checkout — required consent checkbox

In `src/pages/Checkout.tsx`:
- Add `agreedToTerms` state (default `false`).
- Insert a checkbox row directly above the "Place Order" button:
  > ☐ I have read and agree to the [Terms & Conditions](/terms-and-conditions) and [Privacy Policy](/privacy-policy).
- Both links use `target="_blank" rel="noopener noreferrer"`.
- Disable the submit button when `!agreedToTerms || isSubmitting`.
- Also guard the form `onSubmit` handler with an early `toast` error if unchecked, as a safety net.

## 3. Cookie consent banner (global, first-visit)

Create `src/components/CookieConsent.tsx`:
- Reads `localStorage.getItem("mkrc-cookie-consent")` on mount; if absent, renders a slim fixed-bottom banner.
- Copy: "We use cookies to improve your experience. See our Privacy Policy for details."
- Actions: **Accept** button (sets `localStorage` and hides) and **Learn More** link → `/privacy-policy`.
- Styling: dark forest green background (`#1a3c2a` family per Green Hierarchy memory) with gold (`#c9a84c`) accent on the Accept button and link, white/cream text, subtle top shadow. Min 44px touch targets per Core memory.
- Animate in with a small fade/slide using framer-motion (already in repo).
- Mount once in `src/App.tsx` inside the layout wrapper (after `<Routes>`), so it appears on every page.

## 4. FDA / medical disclaimer — sitewide

Create one reusable component `src/components/FDADisclaimer.tsx`:
- Text: *"* These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease."*
- Variant prop: `compact` (small italic, subtle border, muted background — for PDP/checkout) and `banner` (full-width strip — for Shop top).
- Uses semantic tokens (`bg-muted/30`, `border-border`, `text-muted-foreground`, italic). No raw hex.

Placement:
- **`src/pages/ProductDetail.tsx`** — render `<FDADisclaimer variant="compact" />` immediately after the Product Label section (after the `<ImageLightbox>` block, before the variant selector). Always render, not gated on `label_image_url`, so every PDP shows it.
- **`src/pages/Shop.tsx`** — render `<FDADisclaimer variant="banner" />` at the top of `<main>` (line 287, before the search-results indicator) so it sits above all grids.
- **`src/pages/Checkout.tsx`** — render `<FDADisclaimer variant="compact" />` once, directly above the order summary card.

## Files touched
- `src/App.tsx` — mount `<CookieConsent />`.
- `src/components/CookieConsent.tsx` (new).
- `src/components/FDADisclaimer.tsx` (new).
- `src/pages/Checkout.tsx` — disclaimer + consent checkbox + submit guard.
- `src/pages/ProductDetail.tsx` — disclaimer after label section.
- `src/pages/Shop.tsx` — disclaimer banner above grids.
- 5 footer files — add "Legal" column heading / inline label.

No DB or schema changes. No new dependencies.

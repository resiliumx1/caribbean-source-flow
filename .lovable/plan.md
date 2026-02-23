

# MKRC Marketing Pages: The Answer + Webinars

Two new premium marketing pages added as `/the-answer` and `/webinars` routes alongside the existing site. The current homepage remains at `/`. Full-stack features (reviews, product comparison, video footer) will be built in a follow-up after these pages are complete.

---

## Scope

- **New route:** `/the-answer` -- Premium product landing page for "The Answer" tincture (Chronixx endorsement)
- **New route:** `/webinars` -- Free wellness webinar hub with upcoming + archive + host bio + email signup
- **Shared components:** New MKRC-specific header, footer, theme toggle, and scroll-reveal utility
- **Design system:** New CSS custom properties layer for the MKRC dark/light theme (coexists with existing Tailwind theme)
- **Google Fonts:** DM Serif Display, Plus Jakarta Sans, Space Grotesk (added to index.html)
- **No backend changes** -- All content is static; email signup shows a success message client-side only

---

## New Files

### Pages
1. `src/pages/TheAnswer.tsx` -- Full product landing page with 7 sections (Hero, Chronixx, Ingredients, Craft, Benefits, How To Use, Final CTA)
2. `src/pages/Webinars.tsx` -- Webinar hub with 7 sections (Hero, Featured, Archive with filter, Why Attend, Host Bio, Email Signup, Final CTA)

### Shared Components (src/components/mkrc/)
3. `src/components/mkrc/MKRCHeader.tsx` -- Fixed header with nav links (Shop, The Answer, Webinars, Programs, Retreats), theme toggle (moon/sun), mobile hamburger overlay
4. `src/components/mkrc/MKRCFooter.tsx` -- 4-column footer (Brand, Shop, Learn, Connect) with social icons and copyright
5. `src/components/mkrc/MKRCThemeToggle.tsx` -- Circular button toggling `data-mkrc-theme` attribute on `<html>` and persisting to localStorage key `mkrc-theme`
6. `src/components/mkrc/ScrollReveal.tsx` -- Wrapper component using IntersectionObserver to fade-in + slide-up children; respects `prefers-reduced-motion`
7. `src/components/mkrc/SectionLabel.tsx` -- Reusable small uppercase label with optional gold line (Space Grotesk, gold color)
8. `src/components/mkrc/CounterAnimation.tsx` -- Animated number counter (0 to target) triggered on viewport entry

### Styles
9. `src/styles/mkrc-theme.css` -- All CSS custom properties for both dark/light themes, imported into `index.css`

### Updated Files
10. `src/App.tsx` -- Add `/the-answer` and `/webinars` routes; conditionally render `MKRCHeader` on those routes instead of `StoreHeader`
11. `src/index.css` -- Import `mkrc-theme.css` and add the Google Fonts import for DM Serif Display + Plus Jakarta Sans
12. `index.html` -- FOUC prevention script for `mkrc-theme` localStorage key

---

## Design System (mkrc-theme.css)

A scoped CSS layer using `[data-mkrc-theme="dark"]` and `[data-mkrc-theme="light"]` selectors so it does not conflict with the existing Tailwind dark mode. Default is dark.

All colors from the spec will be defined as CSS custom properties (--bg-primary, --accent-gold, --text-primary, etc.) and consumed via inline styles or utility classes within the MKRC components only.

Typography classes:
- `.mkrc-display` -- DM Serif Display for headlines
- `.mkrc-body` -- Plus Jakarta Sans for body text
- `.mkrc-label` -- Space Grotesk, uppercase, letter-spacing for badges/CTAs

---

## Page 1: The Answer (/the-answer)

Seven sections, all static content:

1. **Hero** -- Full-viewport, background image with low-opacity overlay + radial gradients. Two-column layout (text left, product bottle right with gold glow). Badge "Nature's Booster Shot", H1 "The Answer.", subtitle, Chronixx endorsement line, two CTAs ("Get The Answer" links to WooCommerce add-to-cart, "What's Inside" smooth-scrolls to #ingredients), certification pills.

2. **Chronixx Endorsement** -- Background --bg-secondary. Large decorative "Chronixx" text, blockquote, attribution, bio paragraph, 3 animated stat counters (3.4M listeners, #1 Billboard, 2x Tonight Show).

3. **Ingredients (#ingredients)** -- 3-card grid (Anamu, Vervain, Soursop Leaves). Each card: icon, herb name, Latin name italic, description, property tags. Hover: lift + gold top border.

4. **The Craft** -- 5-step horizontal timeline (Selection, Cleaning, Steeping, 21 Days in Oak, The Answer). Mobile: vertical stack. Each step: icon, number, title, description.

5. **Benefits** -- 6 cards in 3x2 grid. Below: certification strip (Vegan, Non-GMO, etc.).

6. **How To Use** -- 3 simple steps + product image on right.

7. **Final CTA (#purchase)** -- Centered. Product image, "Add to Cart" (external WooCommerce link), "Explore All Products" (external shop link), 5-star social proof line.

---

## Page 2: Webinars (/webinars)

Seven sections:

1. **Hero** -- Centered. Badge "Free Wellness Education", H1, subtitle, two scroll-to CTAs, 3 animated stat counters.

2. **Featured Upcoming (#featured)** -- Two-column. Left: webinar image with "Upcoming Live" + "Free" badges. Right: meta info, title, description, bullet list, "Register Free on Zoom" (green button, external link), "Get Reminded" (scrolls to #signup).

3. **Archive (#archive)** -- Category filter buttons (All Topics, Women's Health, Men's Health, Nutrition, Herbal Medicine, Detox, Mental Wellness). 6 webinar cards in filterable grid. Each card: replay tag, category label, title, description, duration, "Watch Replay" button.

4. **Why Attend** -- 4 cards: Expert-Led, 100% Free, Interactive, Actionable.

5. **About the Host (#host)** -- Two-column. Placeholder photo + bio for Honorable Priest Kailash. Credential pills.

6. **Email Signup (#signup)** -- Name + email form fields. Client-side only: on submit shows "Subscribed!" message. Privacy line.

7. **Final CTA** -- 4 link cards (Herbal Physician Course, Group Retreats, Personalised Retreats, Consultations) linking to external URLs.

---

## Routing Changes (App.tsx)

```text
/the-answer  -->  TheAnswer page (MKRCHeader + MKRCFooter)
/webinars     -->  Webinars page (MKRCHeader + MKRCFooter)
```

The `AppContent` component will check if the current path starts with `/the-answer` or `/webinars` and render `MKRCHeader` instead of `StoreHeader`. The MKRC pages will include their own `MKRCFooter` at the bottom.

Add both paths to `pagesWithoutHeader` so the existing `StoreHeader` is suppressed on these routes.

---

## Accessibility and Responsiveness

- All interactive elements have visible focus states (gold outline)
- Theme toggle and hamburger have aria-labels
- Images have descriptive alt text
- `ScrollReveal` respects `prefers-reduced-motion: reduce`
- Breakpoints: desktop 1200px+, tablet 768-1199px, mobile less than 768px
- Hero becomes single column on mobile, grids collapse (3 to 2 to 1), footer stacks
- Mobile nav: full-screen overlay with close button
- Touch targets minimum 44px

---

## Technical Notes

- No database changes needed -- all content is hardcoded
- No new dependencies needed -- uses existing framer-motion for animations, lucide-react for icons, react-router-dom for routing
- The MKRC theme system is isolated from the existing next-themes dark mode via a separate `data-mkrc-theme` attribute
- External links use `target="_blank" rel="noopener noreferrer"`
- Internal nav links use React Router `Link` components
- "Add to Cart" / "Get The Answer" buttons link to `https://mountkailashslu.com/?add-to-cart=90` (WooCommerce)


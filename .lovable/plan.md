
# Light/Dark Mode + UI/UX Improvements Implementation Plan

## Overview
This plan implements a complete light/dark mode theme system with a beautiful sky toggle component, plus UI/UX improvements for the Retreats and Wholesale pages. All changes prioritize readability and contrast in both modes using shadcn tokens.

---

## Part A: Theme System Implementation

### A1. Configure ThemeProvider in App.tsx
**File:** `src/App.tsx`

Add the `ThemeProvider` from `next-themes` (already installed) to wrap the entire application:
- Set `attribute="class"` to use the Tailwind class strategy
- Set `defaultTheme="system"` to respect system preference on first visit
- Set `enableSystem={true}` for system preference detection
- Set `storageKey="theme"` for localStorage persistence

### A2. Update HTML Element for Theme Class
**File:** `index.html`

Add script to prevent FOUC (Flash of Unstyled Content):
- Inline script before body content that reads localStorage and applies the correct class to `<html>` immediately

### A3. Create Sky Toggle Component
**File:** `src/components/ui/sky-toggle.tsx` (new file)

Build an accessible, animated day/night toggle with:
- Sky background that transitions from blue (day) to dark purple (night)
- Animated clouds that fade out in dark mode
- Animated stars that fade in during dark mode
- Sun/Moon icon transition with smooth animation
- Full keyboard accessibility (Space/Enter to toggle)
- Proper `aria-label` for screen readers
- All styling using Tailwind classes (no styled-components)

**Visual Specifications:**
- Day: Light blue gradient sky, white clouds, yellow sun
- Night: Dark indigo/purple sky, twinkling stars, pale moon
- Transition: 300ms smooth ease for all elements

### A4. Integrate Toggle into Header
**File:** `src/components/store/StoreHeader.tsx`

Add the sky toggle:
- Position in header actions area (before cart icon on desktop)
- Include in mobile slide-out menu
- Consistent placement across all screen sizes

---

## Part B: Dark Mode CSS Token Updates

### B1. Verify/Enhance Dark Mode Variables
**File:** `src/index.css`

The dark mode variables are already defined (lines 145-199). Verify and enhance:
- Ensure all color tokens have appropriate dark mode counterparts
- Add any missing dark-mode-specific gradient overlays
- Verify shadow variables work in dark mode

### B2. Update Hero CTA Cards for Dark Mode
**File:** `src/components/HeroCtas.tsx`

Current issue: Cards use hardcoded `bg-white/95` and `text-gray-900` which won't adapt.

Fix:
- Replace `bg-white/95` with `bg-card/95`
- Replace `text-gray-900` with `text-card-foreground`
- Replace `text-gray-600` with `text-muted-foreground`
- Adjust border colors to use `border-border`

### B3. Update Product Card for Dark Mode
**File:** `src/components/store/ProductCard.tsx`

Current issue: Uses hardcoded `text-[#0B0B0B]` which won't adapt.

Fix:
- Replace `text-[#0B0B0B]` with `text-foreground`
- Replace `text-[#0B0B0B]/60` and `text-[#0B0B0B]/70` with `text-muted-foreground`

### B4. Update Product Detail Page for Dark Mode
**File:** `src/pages/ProductDetail.tsx`

Current issue: Uses hardcoded color values throughout.

Fix:
- Replace all `text-[#0B0B0B]` with `text-foreground`
- Replace all `text-[#3A3A3A]` with `text-muted-foreground`
- Replace `style={{ backgroundColor: '#1F3A2E' }}` with dynamic class that adapts
- Update divider colors to use `border-border`

---

## Part C: Retreats Page - Practical Matters Section

### C1. Redesign RetreatFAQ Component
**File:** `src/components/retreats/RetreatFAQ.tsx`

**Current State:** Single-column accordion layout

**New Design:**
- Convert to 2-column card grid on desktop, 1-column on mobile
- Each practical topic becomes a standalone card with:
  - Icon in top-left corner (using lucide-react)
  - Bold heading (H3)
  - Bullet list of key points
  - Optional helper text

**Typography Updates:**
- Body text: 16-18px desktop, 15-16px mobile
- Line-height: 1.6-1.75
- Text color: `text-foreground` for headings, `text-muted-foreground` for body

**Cards:**
1. Location & Getting There (MapPin icon)
2. What to Pack (Backpack icon)
3. Dietary Information (Utensils icon)
4. Medical Considerations (Stethoscope icon)
5. Travel Requirements (Plane icon)
6. Cancellation Policy (Calendar icon)

**Styling:**
- Background: `bg-card`
- Border: `border-border`
- Padding: `p-6` desktop, `p-5` mobile
- Rounded corners: `rounded-xl`

---

## Part D: Retreats Page - Your Guide Section

### D1. Enhance PriestKailashBio Component
**File:** `src/components/retreats/PriestKailashBio.tsx`

**Current State:** Uses `bg-secondary` which is good, but needs visual distinction

**Enhancements:**
- Add subtle gradient background panel that adapts to dark mode
- Use herbalist color accents: sage (#98A869), deep green (#1F3A2E), warm sand
- Add "What You'll Experience" bullets section (3-6 items)
- Improve credential cards with better contrast
- Add subtle background tint behind content area

**Structure Updates:**
- Section heading: "Meet Your Guide" or "Your Guide"
- Photo/avatar with improved placeholder styling
- Credentials row with icon chips
- Quote block with accent border
- Experience bullets with checkmarks
- CTA button with gold accent

**Dark Mode Considerations:**
- Ensure sage/green colors remain readable
- Quote border uses `border-accent`
- Background adapts properly

---

## Part E: Wholesale Page - Product Catalog Section

### E1. Redesign ProductGrid Component
**File:** `src/components/wholesale/ProductGrid.tsx`

**Current State:** 2-column grid with basic icon styling

**New Design:**
- 3-column grid on desktop, 1-column on mobile
- Professional category cards with:
  - Icon chip with category-specific colors
  - Category title (bold, high contrast)
  - 1-line category description
  - Product list in clean bullet format
  - "Request Price List" link

**Icon Color Scheme:**
- Ocean Botanicals: Deep green (#1F3A2E) - using Waves icon
- Traditional Bush Medicine: Forest green (#2E7D32) - using Leaf icon
- Clinical Formulations: Slate/neutral (#64748B) - using FlaskConical icon
- Single Herbs & Teas: Warm amber (#B28735) - using Coffee icon

**Card Styling:**
- Background: `bg-card`
- Border: `border-border`
- Shadow: subtle (`shadow-soft`)
- Hover: slight elevation, border darkens
- Typography: titles `text-foreground`, descriptions `text-muted-foreground`

**Dark Mode:**
- Icon backgrounds adjust (lighter in dark mode)
- Text maintains proper contrast
- Borders and shadows adapt

---

## Part F: Global Contrast Audit

### F1. Sections to Verify
After implementing the above, manually verify contrast for:

1. **Hero sections** - headline/subheadline legible with gradient overlay
2. **Hero CTA cards** - titles and descriptions readable in both modes
3. **Navigation links** - visible and hover states work
4. **Product cards** - title, price, benefits all clear
5. **Review cards/ratings** - stars and text visible
6. **Footer** - all links and text readable
7. **Accordion items** - questions and answers have good contrast

### F2. Hero Overlay Adjustments
**File:** `src/components/trinity/TrinityHero.tsx`

Current gradient overlay is good for light mode. For dark mode:
- The overlay can remain the same (dark gradients work for both)
- Text uses explicit cream/gold colors which work in both modes

---

## Technical Details

### Files to Create:
1. `src/components/ui/sky-toggle.tsx`

### Files to Modify:
1. `src/App.tsx` - Add ThemeProvider wrapper
2. `index.html` - Add FOUC prevention script
3. `src/components/store/StoreHeader.tsx` - Add sky toggle
4. `src/components/HeroCtas.tsx` - Dark mode tokens
5. `src/components/store/ProductCard.tsx` - Dark mode tokens
6. `src/pages/ProductDetail.tsx` - Dark mode tokens
7. `src/components/retreats/RetreatFAQ.tsx` - Complete redesign to card grid
8. `src/components/retreats/PriestKailashBio.tsx` - Enhanced styling
9. `src/components/wholesale/ProductGrid.tsx` - 3-column layout with colored icons

### Dependencies:
- `next-themes` (already installed)
- `framer-motion` (already installed)
- `lucide-react` (already installed)

### No New Dependencies Required

---

## Acceptance Checklist

After implementation, verify:

**Theme System:**
- [ ] Theme persists after page refresh
- [ ] First visit uses system preference (prefers-color-scheme)
- [ ] Sky toggle animates smoothly
- [ ] Toggle is keyboard accessible
- [ ] No layout shift when switching themes

**Contrast in Light Mode:**
- [ ] Hero headline/subheadline readable
- [ ] Hero CTA cards - titles and descriptions clear
- [ ] Nav links visible
- [ ] Product titles, prices, benefits readable
- [ ] Footer text/links readable

**Contrast in Dark Mode:**
- [ ] Hero headline/subheadline readable
- [ ] Hero CTA cards - titles and descriptions clear
- [ ] Nav links visible
- [ ] Product titles, prices, benefits readable
- [ ] Footer text/links readable

**Retreats - Practical Matters:**
- [ ] Font size 16-18px desktop, 15-16px mobile
- [ ] Deeper black text in light mode
- [ ] 2-column card layout on desktop
- [ ] Readable in both modes

**Retreats - Your Guide:**
- [ ] Standout section with calm herbalist palette
- [ ] Structure updated with credentials + bullets
- [ ] Readable in both modes

**Wholesale - Product Catalog:**
- [ ] Professional icons with correct colors
- [ ] 3-column responsive grid
- [ ] Clear typography hierarchy
- [ ] Readable in both modes

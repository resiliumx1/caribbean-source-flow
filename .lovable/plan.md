

# Homepage Hero and UX Redesign Plan

## Overview
This plan redesigns the homepage to create a masterful, trust-building experience. The visitor should feel: "This is the source. Everything I need is here." The implementation follows quiet authority over hype, with elegant glass-morphism CTA cards, interactive testimonial carousels, and an unobtrusive AI assistant.

---

## Section 1: Global Header Enforcement

### Current State
- Header exists in `StoreHeader.tsx` with sticky positioning
- Contains: Home, Shop, Retreats, Wholesale, Consult
- Missing: About link

### Changes Required
**File: `src/components/store/StoreHeader.tsx`**
- Add "About" link to desktop and mobile navigation
- Add subtle background + shadow transition on scroll using a scroll listener
- Ensure no "Bundles" or dock navigation exists (already removed)

---

## Section 2: Hero Section Redesign

### Current State
- Background video with dark gradient overlay
- Headline: "Medicine from the Volcanic Soil of St. Lucia"
- Three door cards (Wholesale, Shop, Retreats)

### New Design Specification

**File: `src/components/trinity/TrinityHero.tsx`**

**A) Hero Copy Update**
```text
H1: "Where Natural Wellness Finds Its Source"
H2: "Crafted in Saint Lucia using herbs grown in mineral-rich volcanic soil, Mt. Kailash delivers natural formulations, immersive retreats, and trusted wholesale supply—designed to restore balance at every level."
```

**B) Three Glass CTA Cards**
Replace current door cards with elegant glass-morphism cards:

| Card | Icon | Title | Descriptor | CTA Text |
|------|------|-------|------------|----------|
| Retail | Leaf/Droplet | Shop Natural Formulations | Daily remedies crafted for balance, vitality, and long-term wellness. | Explore Products → |
| Wholesale | Package/Handshake | Wholesale & Practitioners | Bulk herbs and formulations trusted by clinics, retailers, and wellness brands. | Access Wholesale → |
| Retreats | Mountain | Healing Retreats in Saint Lucia | Immersive experiences designed for deep restoration and clarity. | View Retreats → |

**C) Card Styling**
- Soft glass/translucent background: `bg-white/10 backdrop-blur-xl`
- Rounded corners: `rounded-2xl`
- Subtle shadow and border glow on hover
- Entire card clickable with Link wrapper
- Icon animations on hover: scale + rotation + pulse using framer-motion
- Text shifts upward slightly on hover
- Border glows with gold/sage color

**D) Trust Bar**
Keep existing trust bar but ensure no dock navigation

---

## Section 3: Reviews/Transformation Stories Carousel

### Current State
- `SocialProofMatrix.tsx` displays static 3-column grid of testimonials
- No carousel, no photos, no auto-scroll

### New Design

**File: `src/components/trinity/SocialProofMatrix.tsx` (complete rewrite)**

**A) Section Title**
```text
"Trusted by People on Their Wellness Journey"
```

**B) Interactive Carousel**
- Horizontal carousel using Embla Carousel (already installed)
- Auto-scroll slowly (every 5 seconds)
- Hover pauses motion
- Active card slightly enlarges with scale transform

**C) Testimonial Card Design**
Each card includes:
- Small circular photo avatar (40px)
- Name + location
- Short quote
- Colorful, fluid icons (gold, sage, ocean blue)
- Slight motion on hover
- Background: subtle gradient, not flat white

---

## Section 4: "By The Numbers" Redesign

### Current State
- `ByTheNumbers.tsx` has animated counters
- Static grid layout with rigid boxes

### New Design

**File: `src/components/trinity/ByTheNumbers.tsx`**

**A) Section Title Change**
```text
"Rooted in Real Results"
```

**B) Visual Improvements**
- Replace rigid grid with flowing organic layout
- Add curved SVG dividers between stats
- Icons morph/pulse gently on visibility
- Numbers animate upward with stagger effect
- Use gradient backgrounds for stat circles

---

## Section 5: "Choose Your Path" Section Redesign

### Current State
- `ReSegmentation.tsx` has three path cards
- Standard card layout with features list

### New Design

**File: `src/components/trinity/ReSegmentation.tsx`**

**A) Paths**
| Path | Title | For |
|------|-------|-----|
| Retail | Retail Wellness | Wellness Seekers |
| Wholesale | Professional Supply | Practitioners & Retailers |
| Retreats | Immersive Retreats | Transformation Seekers |

**B) Visual Enhancements**
- Organic shapes with soft blob backgrounds
- Soft shadows with depth
- Subtle parallax effect on scroll using framer-motion
- Entire cards clickable
- Icon hover animations matching hero CTAs
- Remove "bush medicine" wording as per memory

---

## Section 6: AI Chat Assistant

### Current State
- `ConciergeButton.tsx` renders a floating button
- `ConciergePanel.tsx` renders a slide-in panel
- Already context-aware via edge function

### Changes Required

**File: `src/components/concierge/ConciergeButton.tsx`**

**A) Icon Style Update**
- Change from text button to minimal icon-only design
- Use Sparkles or Leaf icon
- Add gentle pulse animation to indicate availability
- Position: bottom-right, offset from WhatsApp button

**B) Behavior Verification**
- Already answers products, dosage, retreats, wholesale questions
- Already routes to relevant contact paths
- Ensure never intrusive (icon only, no auto-open)

**File: `src/pages/TrinityHomepage.tsx`**
- Add `ConciergeButton` to homepage

---

## Section 7: Performance & SEO

### Changes Required

**File: `index.html`**
- Update meta title: "Natural Wellness from Saint Lucia | Mt. Kailash Rejuvenation Centre"
- Update meta description to match new hero copy
- Ensure clean H1 structure (only one per page)

**File: `src/components/trinity/TrinityHero.tsx`**
- Add `loading="lazy"` to non-critical images
- Ensure video has proper compression attributes
- Add descriptive alt text to all images

---

## Technical Implementation Details

### New Dependencies
None required - all needed packages already installed:
- framer-motion (for animations)
- embla-carousel-react (for testimonial carousel)
- lucide-react (for icons)

### Animation Specifications

**Icon Hover Animation (framer-motion)**
```tsx
const iconVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: { 
    scale: 1.15, 
    rotate: 5,
    transition: { type: "spring", stiffness: 400 }
  }
};
```

**Card Hover Animation**
```tsx
const cardVariants = {
  initial: { y: 0 },
  hover: { 
    y: -8,
    boxShadow: "0 20px 40px -12px rgba(178,135,53,0.3)",
    borderColor: "rgba(178,135,53,0.6)"
  }
};
```

**Pulse Animation for AI Button**
```css
@keyframes gentle-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}
```

### Color Mapping
| Element | Color | CSS Variable |
|---------|-------|--------------|
| Card glow | Gold | `hsl(var(--gold))` |
| Border glow | Sage | `hsl(var(--sage))` |
| Icon accent | Gold | `#B28735` |
| Glass bg | White 10% | `rgba(255,255,255,0.1)` |

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/trinity/TrinityHero.tsx` | Modify | New hero copy + glass CTA cards |
| `src/components/trinity/SocialProofMatrix.tsx` | Rewrite | Interactive testimonial carousel |
| `src/components/trinity/ByTheNumbers.tsx` | Modify | Organic flowing layout |
| `src/components/trinity/ReSegmentation.tsx` | Modify | Elevated path cards with parallax |
| `src/components/concierge/ConciergeButton.tsx` | Modify | Icon-only with pulse animation |
| `src/components/store/StoreHeader.tsx` | Modify | Add About link + scroll shadow |
| `src/pages/TrinityHomepage.tsx` | Modify | Add ConciergeButton |
| `index.html` | Modify | SEO meta updates |
| `src/index.css` | Modify | Add glass-morphism utilities |

---

## Acceptance Criteria

After implementation, verify each item:

- [ ] **Header**: Sticky on all pages, includes About, smooth scroll shadow
- [ ] **Hero H1/H2**: Exact copy as specified
- [ ] **Hero CTAs**: Three glass cards with icon animations
- [ ] **Reviews**: Horizontal carousel with photos, auto-scroll, pause on hover
- [ ] **By The Numbers**: Animated counters, organic flowing design
- [ ] **Choose Your Path**: Parallax cards, clickable, icon animations
- [ ] **AI Assistant**: Icon-only floating button with pulse
- [ ] **SEO**: One H1 per page, updated meta tags
- [ ] **Performance**: Lazy loading, no heavy JS on initial load
- [ ] **No Dock**: Dock navigation completely removed
- [ ] **No Bundles**: Bundles removed from navigation


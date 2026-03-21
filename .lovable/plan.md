

## Plan: Product Image Sizing + Shop Formula Strip

### 1. ProductCard Image Fix
**File:** `src/components/store/ProductCard.tsx` (line 53)

Change `className` from `"max-w-full max-h-full object-contain..."` to `"w-4/5 h-4/5 object-contain transition-transform duration-500 group-hover:scale-105"`. One line change.

### 2. Product Preview Strip in Shop
**File:** `src/pages/Shop.tsx`

Insert a new `<section>` between `<ShopHero />` and `<ShopFilterNav />`:

- Filter `products` to first 10 with `image_url`, only render if ≥3 match
- "OUR FORMULAS" label: small caps, `var(--site-gold)`, centered, `DM Sans` 11px weight 600, `letter-spacing: 0.15em`
- Marquee container: `overflow: hidden`, `var(--site-bg-secondary)` background, `py-4`, top/bottom border `var(--site-border)`
- Inner track: `display: flex`, `width: max-content`, `animation: marquee-scroll 30s linear infinite` (reuses existing keyframe)
- Items duplicated 2× for seamless loop
- Each item: `<Link to={/shop/${slug}}>` containing a 72×72 circle (`rounded-full`, `var(--site-green-dark)` bg) with `object-contain` image, product name below in 11px DM Sans

### Files Changed
1. `src/components/store/ProductCard.tsx` — 1 line
2. `src/pages/Shop.tsx` — ~30 lines inserted


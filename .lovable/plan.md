

# Enhanced Product & Retreat Experience

## Overview

This plan covers six interconnected features to improve the shopping and retreat experience:

1. **Full-width product photos** on the product detail page
2. **Retreat image management** - admin backend for retreat photos
3. **Retreat gallery** on the public retreats page
4. **Bundle promotions** - special badges/callouts for bundles
5. **Herb size variants** with quantity discounts up to 1lb
6. **Image zoom** - beautiful lightbox-style zoom on product photos

---

## Feature 1: Full-Width Product Photos

Currently the product detail page uses a 50/50 grid. We will make the image column larger and more prominent.

### Changes

| File | Description |
|------|-------------|
| `src/pages/ProductDetail.tsx` | Change grid from `md:grid-cols-2` to asymmetric layout |
| `src/components/store/ProductGallery.tsx` | Make images larger with sticky positioning |

### Layout Change

```text
Current:        New:
+------+------+ +--------+----+
| 50%  | 50%  | |  60%   |40% |
|      |      | |        |    |
| IMG  | INFO | |  IMG   |INFO|
|      |      | |(sticky)|    |
+------+------+ +--------+----+
```

The image will:
- Take 60% of the width on desktop
- Be sticky (stays visible while scrolling product details)
- Have larger thumbnails positioned vertically on the left side

---

## Feature 2: Retreat Image Management (Admin Backend)

Create an admin page similar to product image management for uploading retreat photos.

### Database Changes

Create new table `retreat_gallery`:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Optional caption |
| description | text | Optional description |
| image_url | text | Storage URL |
| category | text | "experience", "accommodation", "nature", "ceremony" |
| display_order | integer | Sorting |
| is_featured | boolean | Show in hero section |
| created_at | timestamp | Auto |

### New Files

| File | Purpose |
|------|---------|
| `src/pages/AdminRetreats.tsx` | Admin page for retreat gallery management |
| `src/components/admin/RetreatImageUpload.tsx` | Upload component for retreat images |
| `src/hooks/use-retreat-gallery.ts` | Query hooks for retreat gallery |

### Admin Route

Add `/admin/retreats` to the admin layout navigation.

---

## Feature 3: Retreat Gallery (Public Page)

Add a visual gallery section to the Retreats page showcasing the retreat experience.

### New Component

| File | Purpose |
|------|---------|
| `src/components/retreats/RetreatGallery.tsx` | Masonry/grid gallery with lightbox |

### Features
- Masonry-style grid layout
- Categories: Experience, Accommodation, Nature, Ceremony
- Clickable images open in lightbox with zoom
- Caption/description overlay on hover

### Integration

Add `<RetreatGallery />` to `src/pages/Retreats.tsx` between existing sections.

---

## Feature 4: Bundle Promotions

Add special promotional callouts for bundle products.

### Database Changes

Add columns to `products` table:

| Column | Type | Description |
|--------|------|-------------|
| promotion_text | text | "Save $25!" or "Best Value" |
| promotion_badge | text | "savings", "popular", "limited" |
| original_price_usd | numeric | For showing crossed-out price |
| original_price_xcd | numeric | For showing crossed-out price |

### UI Changes

| File | Changes |
|------|---------|
| `src/components/store/ProductCard.tsx` | Show promotion badge, strikethrough pricing |
| `src/pages/ProductDetail.tsx` | Display bundle savings prominently |

### Visual Design

```text
+---------------------------+
| [HOT DEAL] Save $25!      |
|                           |
| ~~$75~~ $50               |
| Bundle & Save             |
+---------------------------+
```

---

## Feature 5: Herb Size Variants with Discounts

Allow raw herbs to be ordered in multiple sizes (1oz, 2oz, 4oz, 8oz, 1lb) with volume discounts.

### Database Changes

Create new table `product_variants`:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| product_id | uuid | FK to products |
| size_label | text | "1 oz", "2 oz", "4 oz", "8 oz", "1 lb" |
| size_oz | integer | Size in ounces (1, 2, 4, 8, 16) |
| price_usd | numeric | Price for this size |
| price_xcd | numeric | Price for this size |
| discount_percent | integer | Discount applied (0, 5, 10, 15, 20) |
| stock_status | text | Stock for this variant |
| is_default | boolean | Default selected size |

### New Hook

| File | Purpose |
|------|---------|
| `src/hooks/use-product-variants.ts` | Fetch variants for a product |

### UI Changes

| File | Changes |
|------|---------|
| `src/pages/ProductDetail.tsx` | Add size selector with pricing table |
| `src/components/store/ProductCard.tsx` | Show "From $X" pricing for herbs |

### Size Selector UI

```text
Select Size:
+-------+  +-------+  +-------+  +-------+  +--------+
| 1 oz  |  | 2 oz  |  | 4 oz  |  | 8 oz  |  |  1 lb  |
| $8    |  | $15   |  | $28   |  | $50   |  |  $90   |
|       |  | -5%   |  | -10%  |  | -15%  |  |  -20%  |
+-------+  +-------+  +-------+  +-------+  +--------+
```

### Cart Integration

Update cart to store selected variant:
- Add `variant_id` column to `cart_items` table
- Update `use-cart.ts` to pass variant

---

## Feature 6: Image Zoom (Lightbox)

Add a beautiful zoom feature when clicking product images.

### New Component

| File | Purpose |
|------|---------|
| `src/components/ui/image-lightbox.tsx` | Reusable lightbox with zoom |

### Features
- Click image to open fullscreen overlay
- Pinch-to-zoom on mobile
- Click-and-drag to pan zoomed image
- Smooth animations
- Close on backdrop click or escape key
- Navigation arrows for multiple images

### Integration

| File | Changes |
|------|---------|
| `src/components/store/ProductGallery.tsx` | Open lightbox on click |
| `src/components/retreats/RetreatGallery.tsx` | Open lightbox on click |

### Design

```text
+----------------------------------+
|                             [X]  |
|   +-------------------------+    |
|   |                         |    |
| < |    ZOOMED IMAGE         | >  |
|   |                         |    |
|   +-------------------------+    |
|         o  o  o  o               |
+----------------------------------+
```

---

## Implementation Order

### Phase 1: Database & Backend
1. Create `retreat_gallery` table with RLS policies
2. Add `promotion_text`, `promotion_badge`, `original_price_usd/xcd` to products
3. Create `product_variants` table with RLS policies
4. Add `variant_id` to `cart_items`
5. Create storage bucket for retreat images

### Phase 2: Core Components
6. Build `ImageLightbox` component (shared)
7. Update `ProductGallery` with zoom trigger
8. Create full-width product detail layout

### Phase 3: Herb Variants
9. Create `use-product-variants` hook
10. Build size selector component
11. Update cart logic for variants

### Phase 4: Bundle Promotions
12. Update `ProductCard` with promotion badges
13. Update `ProductDetail` with savings display

### Phase 5: Retreat Gallery
14. Create `RetreatGallery` component
15. Add to Retreats page
16. Build admin page for retreat images
17. Create `RetreatImageUpload` component

---

## Technical Notes

### Storage
- Create `retreat-images` bucket (public)
- Reuse existing `product-images` bucket

### RLS Policies

All new tables will have:
- Public SELECT for active/published items
- Admin-only INSERT, UPDATE, DELETE

### Type Updates

The Supabase types file will auto-update after migrations.

### Mobile Considerations
- Size selector should be horizontal scrollable on mobile
- Lightbox needs touch gesture support
- Gallery should stack to single column


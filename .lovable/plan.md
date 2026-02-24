

# Full Implementation Plan -- 9 Features + Performance Optimization

This plan implements all 9 approved features in the most credit-efficient way, batching related changes together. Image compression is added to all upload flows for fast loading.

---

## Database Migrations (1 migration, run first)

Two columns added:
- `retreat_dates.promo_label` (TEXT, nullable) -- admin-set promotional labels
- `retreat_gallery.custom_category_label` (TEXT, nullable) -- custom label for "Other" category

Plus: Insert 10 monthly group retreat dates for 2026 (March-December) for the "Bush Medicine Immersion" retreat type.

---

## Batch 1: Retreat Reordering + Group Dates + WhatsApp Button (5 files)

**RetreatCalendar.tsx:**
- Change default `selectedType` from `"group"` to `"solo"`
- Swap button order: Solo first, Group second

**RetreatPathSplit.tsx:**
- Swap card positions: Solo/Private card first (left), Group card second (right)  
- Change "View 2025 Dates" to "View 2026 Dates"

**Retreats.tsx:**
- Move `<RetreatCalendar />` above `<GroupRetreatsList />` in the page flow
- Replace `<ConciergeButton />` with a WhatsApp floating button for Goddess Itopia (phone: +1 305-942-9407)

**TrinityHomepage.tsx:**
- Replace `<ConciergeButton />` with the same WhatsApp floating button

**GroupRetreatsList.tsx:**
- Change heading from "2025" to "2026"
- Display `promo_label` from database as a badge when present (replaces hardcoded "Only X spots left" logic)

---

## Batch 2: Retreat Gallery Categories + Admin Retreat Dates (4 files)

**use-retreat-gallery.ts:**
- Replace categories: remove Accommodation, Nature, Ceremony; add Healing, Food, Other

**AdminRetreats.tsx:**
- Update category dropdown to match new categories
- Add text input for custom label when "Other" is selected

**RetreatGallery.tsx:**
- Display custom category label for "Other" category items

**New file -- AdminRetreatDates.tsx:**
- Full CRUD page for managing group retreat dates
- Add/edit/delete dates with date pickers, spot counts, price overrides
- Promotional label dropdown: "Few Slots Left", "Reserve Your Spot", "Early Bird", "Last Chance", "New", or custom text
- Table view of all dates with inline editing

**AdminLayout.tsx + App.tsx:**
- Add "Retreat Dates" nav link and `/admin/retreat-dates` route

---

## Batch 3: Product Card Ratings + Badges + Admin Product Form + Image Fix (4 files)

**ProductCard.tsx:**
- Change rating formula: minimum 4.5 (range 4.5-5.0 based on product ID hash)
- Change review count: minimum 120 (range 120-350)
- Add new badge types to `getBadgeLabel`/`getBadgeColor`: "low_stock" (amber), "recently_restocked" (green), "limited_edition" (purple), "100_natural" (green)

**AdminProducts.tsx:**
- Add "Add Product" dialog form with fields: name, slug (auto-generated), product_type dropdown, category dropdown, price_usd, price_xcd, short_description, badge selector, stock_status
- Add inline badge editor dropdown on each product card (updates badge column directly)

**ProductImageUpload.tsx:**
- Remove the invisible `<label>` overlay (lines ~356-365) that blocks X and Star button clicks
- Add a small "Replace" button in the hover overlay instead
- SEO filenames: generate as `{product-slug}-{slot}-{timestamp}.{ext}` instead of `{productId}-{slot}-{timestamp}`
- **Image compression**: Before uploading, use Canvas API to resize images to max 1200px width and compress to WebP format (quality 0.82). This reduces file sizes by 60-80% without visible quality loss, making the site load significantly faster.

---

## Batch 4: Image Compression for Retreat Gallery

**use-retreat-gallery.ts (uploadImage mutation):**
- Add the same Canvas-based compression before uploading retreat gallery images
- Max dimension 1600px, WebP output at quality 0.82

---

## Image Compression Utility (shared)

**New file -- src/lib/image-utils.ts:**
A shared utility function `compressImage(file: File, options?)` that:
1. Loads the image into an off-screen canvas
2. Scales to max width/height (default 1200px for products, 1600px for gallery)
3. Exports as WebP at 0.82 quality (falls back to JPEG 0.85 if WebP unsupported)
4. Returns a new File object ready for upload
5. Skips compression if file is already small (under 100KB)

This ensures every uploaded image is optimized for web delivery without manual intervention.

---

## Performance Notes

- All product and gallery images will be compressed client-side before upload (WebP, ~80% quality)
- Existing images already in storage are unaffected but new uploads will be much smaller
- Images already use `loading="lazy"` in the gallery
- Product images use `object-contain` which works well with compressed images
- No server-side processing needed -- compression happens in the browser before upload

---

## Summary of All Changes

| Area | Files Changed | New Files |
|------|--------------|-----------|
| DB Migration | 1 migration (2 columns + 10 retreat dates) | -- |
| Retreat reorder | RetreatCalendar, RetreatPathSplit, Retreats, GroupRetreatsList | -- |
| WhatsApp button | TrinityHomepage, Retreats | -- |
| Gallery categories | use-retreat-gallery, AdminRetreats, RetreatGallery | -- |
| Admin retreat dates | AdminLayout, App.tsx | AdminRetreatDates.tsx |
| Product ratings/badges | ProductCard | -- |
| Admin products | AdminProducts | -- |
| Image upload fix + SEO + compression | ProductImageUpload, use-retreat-gallery | image-utils.ts |

Total: ~12 modified files, 2 new files, 1 DB migration


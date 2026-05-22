# Plan — Product Renames + Product Label Images

## Part 1 — Product Renames

### Database updates (products table)
Rename + re-slug, keeping IDs intact:

| Old name | Old slug | New name | New slug |
|---|---|---|---|
| Blood Detox | blood-detox | Herbal Detox | herbal-detox |
| Dewormer | dewormer | Gut Balance | gut-balance |
| Fey Duvan Syrup | fey-duvan-syrup | Anamu Syrup | anamu-syrup |
| Fertility | fertility | Feminine Balance | feminine-balance |

Colax and Free Flow unchanged.

### Old-slug redirects
Add a small client-side redirect map in `src/pages/ProductDetail.tsx` (or in the route file) so `/shop/blood-detox`, `/shop/dewormer`, `/shop/fey-duvan-syrup`, `/shop/fertility` 301-style redirect to the new slugs via `<Navigate replace>`. This protects existing inbound links and SEO.

### Hardcoded string updates
Find-and-replace product-name + slug references in:
- `src/components/MountKailashChat.jsx` (PRODUCT_LINKS, PRODUCT_CATALOG, kit descriptions)
- `src/components/store/RecentSalesPopup.tsx` ("Dewormer" entry)
- `src/components/wholesale/ProductGrid.tsx` (specs list mentioning Fertility, Dewormer)
- `src/components/wholesale/PrivateLabel.tsx` (alt text mentioning Fey Duvan, Blood Detox)
- `src/pages/TheAnswer.tsx` ("Fey Duvan (Anamu)" → "Anamu Syrup")

Descriptive uses of the word "fertility" (webinar topics, SEO copy, testimonials) are NOT product references and will be left alone.

### Note — "Male Balance"
The prompt lists `male-balance-isolated.webp` but there is no standalone "Male Balance" product. Closest match is `Virility Male Balance Capsules` (slug `virility-male-balance-capsules`). I'll assign the label there. Flag for confirmation if wrong.

---

## Part 2 — Product Label Images

### Storage
Upload the 11 `.webp` files from the uploaded zip to the existing public `product-images` Supabase bucket under a `labels/` prefix, e.g. `labels/herbal-detox-isolated.webp`. Public URLs are stable and CDN-cached.

### Schema
Add nullable `label_image_url text` column to `products`. (Cleaner than reusing `additional_images`, and won't collide with the gallery.)

### Data
Populate `label_image_url` for the 11 products (matched by slug after the rename):

prosperity, pure-gold, pure-green, the-answer, anamu-syrup, colax, feminine-balance, free-flow, gut-balance, herbal-detox, virility-male-balance-capsules.

### UI — ProductDetail.tsx
Add a new `ProductLabel` section in `src/pages/ProductDetail.tsx`, rendered only when `label_image_url` is set. Placement: **after** the "About This Formulation" description block, **before** the variant selector / quantity / Add to Cart controls (matches the prompt's "below description, above add to cart").

Structure:
- Heading: "Product Label & Supplement Facts" (matches existing `text-lg font-semibold` heading style used in the page).
- Clickable thumbnail using the existing `src/components/ui/image-lightbox.tsx` component (already in the project) → opens a full-size zoomable modal.
- `alt="{product.name} supplement facts label"`.
- `loading="lazy"`, `decoding="async"`.
- Followed by the existing `h-px bg-border` divider used between sections.

No changes needed to product cards, cart, checkout, or admin — label is PDP-only.

---

## Technical execution order

1. **Migration**: add `label_image_url` column to `products`.
2. **Storage upload**: 11 webp files → `product-images/labels/`.
3. **Data updates**: rename products + slugs; set `label_image_url` for all 11.
4. **Code**: redirect map in router, string replacements in the 5 hardcoded files, new label section in `ProductDetail.tsx`.
5. **Verify**: visit `/shop/blood-detox` → redirects to `/shop/herbal-detox`; label appears + opens lightbox.

## Confirmations needed before build

1. OK to assign `male-balance-isolated.webp` to the existing `Virility Male Balance Capsules` product?
2. Slug `anamu-syrup` for the renamed "Fey Duvan Syrup" — confirm (vs `anamu` alone).



## Implementation Plan: Complete Shop UI Overhaul

### Overview
This plan addresses all 6 requirements in your original request:
1. Product images fitting the view window properly
2. Scraping dosage info from mountkailashslu.com and updating the database
3. Product cards matching the screenshot design
4. Product detail page with right-side data format (per video)
5. Removing the "request dosage guide" prompt
6. Adding bulk order callout for raw herbs

---

### Phase 1: Fix Product Image Display (Fitting View Window)

**Problem**: Images may have excessive padding causing them to appear too small.

**Changes**:
- **ProductCard.tsx**: Reduce the `p-8` padding to `p-4` in the image container so products fill more of the card
- **ProductGallery.tsx**: Adjust the main image container to use less padding (`p-2` instead of `p-4`) so the image takes up more visual space
- Keep `object-contain` to maintain aspect ratio without cropping

---

### Phase 2: Scrape and Update Dosage Instructions

**Products needing dosage data** (currently missing):
- Queenly Tea Bundle
- Kingly Tea Bundle  
- Detox Bundle
- Virility Male Balance Tonic

**Data source**: mountkailashslu.com product pages

**Database update** with scraped dosage instructions:
- **Queenly Tea Bundle**: Bundle protocol (steep 1 bag, 8oz water, 7-10 min, 2-3 cups daily)
- **Kingly Tea Bundle**: Bundle protocol for men's wellness teas
- **Detox Bundle**: Week 1-2 Colax protocol, then add other products
- **Virility Male Balance Tonic**: Adults - 30 drops in water, 3 times daily

---

### Phase 3: Product Card Redesign (Match Screenshot)

Based on the screenshot analysis, the target design includes:
- Uppercase category label (already implemented)
- Product name (already implemented)
- Short tagline/description (already implemented)
- Star rating with review count in parentheses (already implemented)
- Benefit checkmarks from traditional_use (already implemented)
- Dual pricing (primary large, secondary small) - implemented but needs verification
- "Add to Cart" button - already present

**Key fixes needed**:
- Ensure benefits are properly extracted (comma-separated from `traditional_use`)
- Remove any lingering "Subscribe & Save" references (already removed per last diff)
- Confirm the card layout renders correctly in the preview

---

### Phase 4: Product Detail Page Layout (Right-Side Data Format)

Based on the video reference, the PDP should show:
- **Left side (60%)**: Large product image gallery with thumbnails
- **Right side (40%)**: Product info in vertical stack:
  - Category link
  - Product name
  - Short description
  - Trust badges
  - Price display
  - Quantity selector
  - Add to Bag button
  - Educational accordions (Traditional Use, The Science, How to Use, Ingredients)

**Current status**: Most of this is already implemented in ProductDetail.tsx. Need to verify:
- Grid is `lg:grid-cols-[1fr_450px]` (roughly 60/40 split) - DONE
- Accordions are present for Traditional Use, Science, How to Use, Ingredients - DONE
- "Request dosage guide" button removed - DONE

---

### Phase 5: Remove "Request Dosage Guide" Prompt

**Status**: Already completed in previous work. The ProductDetail.tsx no longer contains any dosage guide request button - verified by code review (lines 267-279 show only the "Add to Bag" button).

---

### Phase 6: Raw Herbs Bulk Order Callout

**Status**: Already implemented. Lines 281-303 in ProductDetail.tsx show:
- Check for `isRawHerb` (product_type === "raw_herb")
- Display callout box with "Each order is 1 lb"
- Contact info for 4-10 lb bulk pricing
- WhatsApp link for bulk inquiries

---

### Technical Implementation Summary

**Files to modify**:

| File | Changes |
|------|---------|
| `src/components/store/ProductCard.tsx` | Reduce image container padding from `p-8` to `p-4` |
| `src/components/store/ProductGallery.tsx` | Reduce main image padding from `p-4` to `p-2` |
| Database migration | Update dosage_instructions for 4 products |

**Database updates** (SQL migration):
```text
UPDATE products SET dosage_instructions = '...' WHERE slug = 'queenly-tea-bundle';
UPDATE products SET dosage_instructions = '...' WHERE slug = 'kingly-tea-bundle';
UPDATE products SET dosage_instructions = '...' WHERE slug = 'detox-bundle';
UPDATE products SET dosage_instructions = '...' WHERE slug = 'virility-male-balance-tonic';
```

---

### Why the Shop Might "Look the Same"

Possible reasons the preview isn't showing changes:
1. **Browser caching**: The preview might be serving cached CSS/JS
2. **Build not refreshing**: The changes may not have been hot-reloaded
3. **Inspecting wrong URL**: Ensure you're on `/shop` in the preview panel

**Verification steps** after implementation:
1. Hard refresh the preview (Ctrl+Shift+R or Cmd+Shift+R)
2. Navigate to `/shop` and verify product cards
3. Click into a product and verify the right-side format
4. Check a raw herb product (like Soursop Leaves) for the bulk order notice


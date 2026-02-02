

## Complete Products Experience Overhaul Implementation Plan

### Overview
This plan comprehensively addresses the shop/products experience to match the video reference, while also implementing site-wide content changes including logo addition, FDA removal, and wildcrafted replacement.

---

### Phase 1: Add Mt Kailash Logo to Project

**Action**: Copy the uploaded logo to project assets and integrate it into the header and footer.

**File**: Copy `user-uploads://KHALASH_LOGO.jpeg` to `src/assets/mt-kailash-logo.jpeg`

**Changes Required**:
- **StoreHeader.tsx**: Replace the `M` placeholder circle with the actual logo image (sized appropriately for header, ~40px height)
- **StoreFooter.tsx**: Add smaller logo in the brand column
- **UnifiedFooter.tsx**: Replace placeholder with logo image

---

### Phase 2: Product Card Redesign (Match Video)

**File**: `src/components/store/ProductCard.tsx`

**Current Issues**:
- Missing "Quick View" hover overlay
- Badge color should be orange for Best Seller
- Layout needs minor refinements

**Changes**:
| Element | Current | Target |
|---------|---------|--------|
| Badge color | `bg-forest text-cream` | `bg-orange-500 text-white` for Best Seller |
| Quick View | Missing | Add hover overlay button |
| Image container | `p-4` | Keep but ensure clean background |
| Benefits list | Uses `Check` icon | Keep (matches video) |
| Price + Add to Cart | Side by side | Keep (matches video) |

**Add Quick View Overlay**:
```text
On hover, show a "Quick View" button overlay on the image area
that calls the existing onQuickView prop
```

---

### Phase 3: Category Filter Pills Enhancement

**File**: `src/components/store/CategoryNav.tsx`

**Current State**: Already has rounded pill filters with "All" and category options

**Changes**:
- Add subtle shadow to pills (`shadow-sm`)
- Ensure active state is clearly highlighted
- Current implementation is close to target; minor styling tweaks

---

### Phase 4: Quick View Modal Enhancement

**File**: `src/components/store/QuickViewModal.tsx`

**Current State**: Has most elements needed

**Enhancements**:
- Add "Key Benefits" checklist section explicitly (currently shows `traditional_use` as bullets with Leaf icons)
- Change icon from `Leaf` to `Check` for consistency with ProductCard
- Ensure quantity selector and Add to Cart are prominent

---

### Phase 5: Product Detail Page - Key Benefits Section

**File**: `src/pages/ProductDetail.tsx`

**Current Layout**: Already has 60/40 split with accordions

**Changes Required**:
1. Add a dedicated "Key Benefits" section above the accordions with check icons
2. Extract benefits from `traditional_use` field (comma-separated)
3. Display as checklist similar to ProductCard

**New Section** (above accordions):
```text
Key Benefits
[Check] Benefit 1
[Check] Benefit 2
[Check] Benefit 3
```

---

### Phase 6: Remove FDA Wording Everywhere

**Files to Update**:

| File | Change |
|------|--------|
| `src/pages/ProductDetail.tsx` (lines 402-410) | Remove entire FDA disclaimer section |
| `src/components/store/StoreFooter.tsx` (lines 163-166) | Remove FDA disclaimer text |
| `src/components/trinity/UnifiedFooter.tsx` (lines 199-202) | Remove FDA disclaimer |
| `src/components/wholesale/Footer.tsx` (lines 97-99) | Remove FDA disclaimer line |
| `src/components/trinity/TrinityHero.tsx` (line 154) | Change "FDA-Registered Facility" to different trust badge |

**Replacement for TrinityHero Trust Badge**:
- Change "FDA-Registered Facility" to "Certified Processing Facility" or similar

---

### Phase 7: Replace "Wildcrafted" Wording

**Replacement phrase**: `100% Natural • Made in Saint Lucia • Non-GMO • Vegan`

**Files to Update**:

| File | Line(s) | Current Text | New Text |
|------|---------|--------------|----------|
| `src/components/store/StoreFooter.tsx` | 24 | "Wildcrafted herbal remedies..." | "100% natural herbal remedies from the rainforests of St. Lucia. Non-GMO, vegan formulations. 21+ years of bush medicine tradition." |
| `src/components/store/ShopHero.tsx` | 62 | `<span>Wildcrafted</span>` | `<span>100% Natural</span>` |
| `src/components/store/ShopHero.tsx` (alternate file) | 29 | "Wildcrafted from Mount Kailash..." | "100% natural • Made in Saint Lucia • Non-GMO • Vegan" |
| `src/components/wholesale/Hero.tsx` | 33 | "St. Lucian wildcrafted herbs..." | "St. Lucian natural herbs..." |
| `src/components/trinity/TrinityHero.tsx` | 48 | "Wildcrafted bulk herbs" | "100% natural bulk herbs" |
| `src/components/trinity/ReSegmentation.tsx` | 24 | "wildcrafted herbs" | "natural herbs" |
| `src/components/wholesale/ProductGrid.tsx` | 84 | "wildcrafted and processed" | "naturally harvested and processed" |
| `src/pages/Cart.tsx` | 56 | "wildcrafted St. Lucian botanicals" | "natural St. Lucian botanicals" |
| `src/components/retreats/ProtocolTimeline.tsx` | 14 | "wildcrafted herbs" | "natural herbs" |
| ProductCard.tsx, QuickViewModal.tsx, ProductDetail.tsx | Badge cases | Keep "wildcrafted" as database badge but display as "100% Natural" |

---

### Phase 8: Products Ordering - Images First + Best Seller Badge

**File**: `src/hooks/use-products.ts`

**Change**: Modify the products query to order by:
1. Products with `image_url` first (not null)
2. Then by `display_order`

**Add client-side logic** in `Shop.tsx`:
- For products with images that appear first, automatically show "Best Seller" badge

**Alternative Approach**: Keep server ordering simple, add client-side sorting:
```text
Sort products so those with image_url come first
Mark those products with a "Best Seller" badge visually
```

---

### Phase 9: Header Consistency Check

**Current State**: StoreHeader is used on Shop and ProductDetail pages. Other pages use different headers.

**Files Using Headers**:
- TrinityHomepage: No header (video background with doors)
- Wholesale: Uses `<Header />` from wholesale folder
- Retreats: Uses `<StoreHeader />`
- Cart: Uses `<StoreHeader />`

**Action**: The StoreHeader will be updated with the logo. The Wholesale `Header` component should also get the logo for consistency.

---

### Technical Implementation Summary

**Files to Create**:
- Copy logo: `src/assets/mt-kailash-logo.jpeg`

**Files to Modify**:

| File | Priority | Type of Change |
|------|----------|----------------|
| `src/components/store/ProductCard.tsx` | High | Add Quick View overlay, change badge color |
| `src/components/store/StoreHeader.tsx` | High | Add logo image |
| `src/components/store/StoreFooter.tsx` | High | Add logo, remove FDA, update wildcrafted text |
| `src/pages/ProductDetail.tsx` | High | Add Key Benefits section, remove FDA |
| `src/components/store/QuickViewModal.tsx` | Medium | Change Leaf to Check icons |
| `src/components/trinity/UnifiedFooter.tsx` | Medium | Add logo, remove FDA |
| `src/components/trinity/TrinityHero.tsx` | Medium | Remove FDA badge, update wildcrafted text |
| `src/components/wholesale/Footer.tsx` | Medium | Remove FDA disclaimer |
| `src/components/wholesale/Hero.tsx` | Medium | Update wildcrafted text |
| `src/components/wholesale/Header.tsx` | Medium | Add logo |
| `src/components/store/ShopHero.tsx` | Medium | Update wildcrafted badge |
| `src/hooks/use-products.ts` | Medium | Sort products with images first |
| `src/pages/Shop.tsx` | Low | Add Best Seller logic for products with images |
| `src/components/store/CategoryNav.tsx` | Low | Add subtle shadow to pills |
| `src/components/trinity/ReSegmentation.tsx` | Low | Update wildcrafted text |
| `src/components/wholesale/ProductGrid.tsx` | Low | Update wildcrafted text |
| `src/pages/Cart.tsx` | Low | Update wildcrafted text |
| `src/components/retreats/ProtocolTimeline.tsx` | Low | Update wildcrafted text |

---

### Database Considerations

No database changes required. The badge display logic will map existing database values to new display text:
- `wildcrafted` badge will display as "100% Natural"
- Products with `image_url` not null will receive visual "Best Seller" treatment

---

### Visual Reference Alignment

Based on the video/screenshot analysis:

**Product Card Requirements** (matching reference):
- Badge top-left (orange for Best Seller)
- Product image centered, clean background
- Category label (small, muted)
- Product name
- Star rating row
- Key Benefits checklist (3-5 bullets with checkmarks)
- Price on left, Add to Cart button on right
- "Quick View" appears on hover over image

**Product Detail Page Requirements**:
- Two-column layout (image left, details right)
- Key Benefits section with checklist icons
- Accordions for: Description, Traditional Use, Usage Instructions, Ingredients

---

### Verification Steps After Implementation

1. Navigate to `/shop` and verify:
   - Product cards show Quick View on hover
   - Best Seller badges are orange
   - Products with images appear first
   - Key benefits checklist appears on cards

2. Click Quick View and verify:
   - Modal shows product image, name, rating, price
   - Key Benefits checklist is visible
   - Quantity selector works
   - Add to Cart button functions

3. Click into a product and verify:
   - Key Benefits section appears on right side
   - No FDA disclaimer anywhere
   - Accordions present for educational content

4. Check header on all pages:
   - Mt Kailash logo appears in header
   - Clicking logo navigates to home

5. Search for text across site:
   - "FDA" should not appear anywhere
   - "Wildcrafted" should be replaced with natural/St. Lucia messaging


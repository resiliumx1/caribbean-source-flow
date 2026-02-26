

# Plan: Badge Categories, Price Corrections, and Arrow Verification

## 1. Add "Bulk" and "Popular" Badge Options

**Files:** `src/pages/AdminProducts.tsx`, `src/components/store/ProductCard.tsx`, `src/components/store/QuickViewModal.tsx`

Add two new badge options to the `BADGE_OPTIONS` array and their corresponding display labels/colors:
- `bulk` -- label: "Bulk", color: teal/cyan
- `popular` -- label: "Popular", color: blue

Update `getBadgeLabel()` and `getBadgeColor()` in ProductCard and QuickViewModal to handle these new values.

---

## 2. Navigation Arrows -- Already Implemented (Explanation)

The chevron arrows and image counter (e.g., "1/3") ARE already coded in both:
- **QuickViewModal** (lines 77-96): Left/right arrows + counter badge
- **ProductGallery** (lines 59-82): Left/right arrows on hover + counter badge

They only render when `allImages.length > 1`. Most products currently have only 1 uploaded image, so the arrows are hidden. Products with multiple images (The Answer, Virility Capsules, Dewormer, Fertility, Super Male Vitality Package, Nerve Tonic Capsules, Pure Green) should already show arrows.

**No code changes needed** -- the feature works. If arrows aren't appearing on a specific product, it means that product needs additional images uploaded via the admin panel.

---

## 3. Price Corrections from WooCommerce

Update all product prices to match the live WooCommerce store at mountkailashslu.com/shop/. XCD will be calculated as USD x 2.70.

Here is the full mapping (current price -> correct price):

| Product | Current USD | WooCommerce USD | Change |
|---------|------------|----------------|--------|
| The Answer | $35.00 | $50.00 | Yes |
| Pure Gold | $36.00 | $45.00 | Yes |
| Pure Green | $34.00 | $45.00 | Yes |
| Prosperity | $42.00 | $45.00 | Yes |
| Dewormer | $32.00 | $42.00 | Yes |
| Fey Duvan Syrup | $38.00 | $45.00 | Yes |
| Blood Detox | $34.00 | $45.00 | Yes |
| Tranquility | $35.00 | $60.00 | Yes |
| Fertility | $38.00 | $45.00 | Yes |
| Hemp Syrup | $40.00 | $90.00 | Yes |
| Free Flow | $32.00 | $40.00 | Yes |
| Colax | $28.00 | $45.00 | Yes |
| Nerve Tonic Capsules | $45.00 | $100.00 | Yes |
| Virility Male Tonic | $45.00 | $45.00 | No |
| Virility Male Balance Capsules | $65.00 | $45.00 | Yes |
| Virility Male Balance Tonic | $150.00 | $150.00 | No |
| Male Vitality Package | $185.00 | $240.00 | Yes |
| Super Male Vitality Package | $225.00 | $290.00 | Yes |
| Super Female Wellness Package | $220.00 | $290.00 | Yes |
| Male Potency Kit | $105.00 | $130.00 | Yes |
| Feminine Balance Kit | $95.00 | $130.00 | Yes |
| Immunity Kit | $90.00 | $140.00 | Yes |
| Prostate Health Bundle | $140.00 | $150.00 | Yes |
| Digestive Bundle | $85.00 | $155.00 | Yes |
| Detox Bundle | $147.00 | $147.00 | No |
| Queenly Tea Bundle | $99.00 | $99.00 | No |
| Kingly Tea Bundle | $99.00 | $99.00 | No |
| Virili-Tea | $22.00 | $33.00 | Yes |
| Medina Tea | $16.00 | $35.00 | Yes |
| Digestive Rescue Tea | $18.00 | $33.00 | Yes |
| Urinary Cleanse Tea | $22.00 | $35.00 | Yes |
| Restful Tea | $18.00 | $35.00 | Yes |
| Moon Cycle Tea | $20.00 | $35.00 | Yes |
| Soursop Leaves | $18.00 | $20.00 | Yes |
| Blue Vervain | $16.00 | $20.00 | Yes |
| St. John's Bush | $20.00 | $20.00 | No |
| Cassia Alata | $18.00 | $20.00 | Yes |
| Red Raspberry Leaf | $16.00 | $20.00 | Yes |
| I Can | $40.00 | -- | Not on WC |
| Digestive Rescue | $42.00 | -- | Not on WC |
| Balance Moon Cycle System | $85.00 | -- | Not on WC |
| Slim Now Powder | $48.00 | -- | Not on WC |
| Bladderwrack Powder | $22.00 | -- | Not on WC |
| Carpenter Bush | $18.00 | -- | Not on WC |
| Cerasee | $15.00 | -- | Not on WC |
| Dandelion Root | $14.00 | -- | Not on WC |
| Patchouli | $14.00 | $115.00 (bulk/lb) | See note |
| Stinging Nettle | $15.00 | -- | Not on WC |
| Spanish Needle | $14.00 | -- | Not on WC |

**Notes on discrepancies:**
- Products marked "Not on WC" may be new additions or have different names on WooCommerce. Prices will be left as-is.
- **Patchouli**: WooCommerce lists it at $115/lb (bulk). Our DB has it at $14 which appears to be a retail small-quantity price. Will update to $115 to match WooCommerce.
- WooCommerce has products NOT yet in our database (Seamoss Soaps, Sea Capsules, The Rising of the Gods book, Herbal Manual, Priest Kailash Consultation, Gully Root products, Bay Leaf bulk, Female Wellness Package). These would need to be created separately -- flagging for your awareness.

---

## Technical Implementation

### Badge options (code change)
Add to `BADGE_OPTIONS` in AdminProducts.tsx:
```typescript
{ value: "bulk", label: "Bulk" },
{ value: "popular", label: "Popular" },
```

Add to `getBadgeLabel` and `getBadgeColor` in ProductCard.tsx and QuickViewModal.tsx.

### Price updates (database)
Execute SQL UPDATE statements for each product using the slug as identifier. Each update sets both `price_usd` and `price_xcd` (USD x 2.70).

### No database migration needed
All changes use existing columns and schema.


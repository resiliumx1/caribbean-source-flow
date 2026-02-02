

# Product Catalog Enhancement & Navigation Update

## Overview

This plan addresses three key areas:
1. Add missing tea products, tea bundles, and the Virility Male Balance Tonic
2. Reclassify "Liquid Tinctures" category to "Tonics"
3. Highlight the Bundles link in navigation to entice customers

---

## Part 1: Missing Products to Add

Based on scraping the live website, the following products are missing from the database:

### Missing Teas (2 products)

| Product | Price USD | Description |
|---------|-----------|-------------|
| Virili-Tea | $33 | Potent herbal blend with Sensitive, Sarsaparilla, Medina, Anamu, Chaney Roots, Sea Moss, Stinging Nettle, Bay Leaf, and Cinnamon Leaf for energy, stamina, and libido |
| Urinary Cleanse Tea | $35 | Blend of Stinging Nettle, Seed Under Leaf, and Spanish Needle for urinary tract health and detoxification |

### Missing Tea Bundles (2 bundles)

| Bundle | Price USD | Contents |
|--------|-----------|----------|
| Queenly Tea Bundle | $99 | Moon Cycle Tea + Digestive Rescue Tea + Restful Tea (feminine wellness) |
| Kingly Tea Bundle | $99 | Urinary Cleanse + Medina Tea + Virili-Tea (male reproductive health) |

### Missing Bundles (2 bundles)

| Bundle | Price USD | Contents |
|--------|-----------|----------|
| Detox Bundle | $147 | Cassia Alata + Colax + Dewormer + Blood Detox (deep cleansing) |
| Super Male Vitality Package | $290 | Full body detox and vital rebalancing for men, includes Prosperity |

### Missing Tonic Product (1 product)

| Product | Price USD | Description |
|---------|-----------|-------------|
| Virility Male Balance Tonic | $150 | Proprietary herbal blend with Sensitiva, Sarsaparilla, Medina, Anamu, Chaney Roots, Sea Moss, Stinging Nettle, Caribbean Bay Leaf for male vitality and endurance (PRE-ORDER) |

---

## Part 2: Category Reclassification

### Current State
- Category name: "Liquid Tinctures"
- Category slug: "liquid-tinctures"

### After Update
- Category name: "Tonics"
- Category slug: "tonics"

### Database Changes Required
1. Update `product_categories` table: change name and slug for the liquid tinctures category
2. All products currently in this category will automatically be reclassified

---

## Part 3: Bundles Navigation Highlight

### Design Approach
Make the "Bundles" link visually stand out to attract clicks. This will use a gradient background, subtle animation, and a sparkle/gift icon.

### Visual Design

Desktop navigation:
```
+-------+  +------------------------+  +---------+  +-----------+
| Shop  |  | [sparkle] Bundles [%]  |  | Retreats |  | Wholesale |
+-------+  +------------------------+  +---------+  +-----------+
                     ^
            Gradient background (gold/earth tones)
            Subtle pulse animation
            "Save" or sparkle icon
```

Mobile menu: Same treatment with eye-catching styling

### Styling Details
- Background: Gradient from gold to earth tones (matches brand)
- Border: Golden border with subtle glow
- Icon: Sparkles or Gift icon
- Text: "Bundles" with optional "Save" badge
- Animation: Subtle pulse on hover, gentle glow effect

---

## Implementation Steps

### Step 1: Database Updates
1. Insert the 7 missing products into the `products` table
2. Update the "Liquid Tinctures" category to "Tonics" in `product_categories`
3. Set promotional badges on the new bundles (they should display savings)

### Step 2: Update StoreHeader Component
Modify `src/components/store/StoreHeader.tsx` to:
- Add special styling for the Bundles navigation link
- Include a sparkle icon and gradient background
- Add subtle hover animation

### Step 3: Update CategoryNav Component
Modify `src/components/store/CategoryNav.tsx` to:
- Add visual distinction for the Bundles category pill
- Include special styling that makes it stand out from other categories

### Step 4: Update Mobile Menu
Enhance the Bundles link in the mobile sheet menu with the same eye-catching treatment

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/store/StoreHeader.tsx` | Add highlighted Bundles link with gradient, icon, animation |
| `src/components/store/CategoryNav.tsx` | Add special styling for Bundles category pill |

### Database Operations
- INSERT 7 new products with full details (descriptions, pricing, images from source)
- UPDATE product_categories to rename "Liquid Tinctures" to "Tonics"

---

## New Products Detail

### Virili-Tea
- **Type**: tea
- **Category**: Traditional Teas
- **Price**: $33 USD / $89.10 XCD
- **Short Description**: Potent blend for energy, stamina, and libido
- **Traditional Use**: Male vitality, sexual health, energy boost
- **Ingredients**: Sensitive, Sarsaparilla, Medina, Anamu, Chaney Roots, Sea Moss, Stinging Nettle, Bay Leaf, Cinnamon Leaf

### Urinary Cleanse Tea
- **Type**: tea
- **Category**: Traditional Teas
- **Price**: $35 USD / $94.50 XCD
- **Short Description**: Supports urinary tract health and detox
- **Traditional Use**: Urinary health, kidney support, inflammation relief
- **Ingredients**: Stinging Nettle, Seed Under Leaf, Spanish Needle

### Queenly Tea Bundle
- **Type**: bundle
- **Category**: Curated Bundles
- **Price**: $99 USD / $267.30 XCD
- **Original Price**: $103 (saves $4)
- **Short Description**: Feminine wellness trio for hormonal balance, digestion, and rest
- **Promotion Badge**: popular
- **Promotion Text**: Complete feminine wellness

### Kingly Tea Bundle
- **Type**: bundle
- **Category**: Curated Bundles
- **Price**: $99 USD / $267.30 XCD
- **Original Price**: $103 (saves $4)
- **Short Description**: Male wellness trio for vitality, urinary health, and energy
- **Promotion Badge**: popular
- **Promotion Text**: Complete male wellness

### Detox Bundle
- **Type**: bundle
- **Category**: Curated Bundles
- **Price**: $147 USD / $396.90 XCD
- **Short Description**: Deep cleansing for digestion, elimination, and blood purification
- **Promotion Badge**: savings
- **Promotion Text**: Ultimate detox system

### Super Male Vitality Package
- **Type**: bundle
- **Category**: Curated Bundles
- **Price**: $290 USD / $783 XCD
- **Short Description**: Ultimate full body detox and vital rebalancing for men
- **Promotion Badge**: popular
- **Promotion Text**: Best value for men
- **Badge**: best_seller (5-star rated)

### Virility Male Balance Tonic
- **Type**: tonic (new product type, will use the renamed Tonics category)
- **Category**: Tonics (formerly Liquid Tinctures)
- **Price**: $150 USD / $405 XCD
- **Stock Status**: pre_order
- **Short Description**: Proprietary herbal blend for male resilience, stamina, and vitality
- **Traditional Use**: Male performance, hormone balance, stress management, endurance
- **Ingredients**: Sensitiva (Mimosa pudica), Sarsaparilla, Medina, Anamu, Chaney Roots, Sea Moss, Stinging Nettle, Caribbean Bay Leaf

---

## Navigation Highlight CSS Approach

```css
/* Bundles link special styling */
.bundles-highlight {
  background: linear-gradient(135deg, #d4a574 0%, #8b7355 100%);
  color: #fef6e4;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(212, 165, 116, 0.5);
  box-shadow: 0 0 12px rgba(212, 165, 116, 0.3);
  animation: subtle-pulse 3s ease-in-out infinite;
}

@keyframes subtle-pulse {
  0%, 100% { box-shadow: 0 0 12px rgba(212, 165, 116, 0.3); }
  50% { box-shadow: 0 0 20px rgba(212, 165, 116, 0.5); }
}
```

This creates an elegant, eye-catching effect that draws attention without being garish, fitting the natural/wellness brand aesthetic.


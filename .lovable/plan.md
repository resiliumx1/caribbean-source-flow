

# Implementation Plan

## Overview
This plan covers 7 changes across admin backend, shop frontend, and product detail pages.

---

## 1. Editable Product Names (Admin)
Add inline name editing to each product card in `/admin/products`. An edit (pencil) icon next to the product name opens an input field. On blur or Enter, save the updated name and regenerate the slug.

**Files:** `src/pages/AdminProducts.tsx`
- Add an `updateProduct` mutation for name changes
- Add inline edit state per product (click pencil icon to toggle input)
- On save, update both `name` and `slug` in the database

---

## 2. Editable Product Pricing (Admin)
Add inline price editing (USD and XCD) to each product card in the admin grid.

**Files:** `src/pages/AdminProducts.tsx`
- Show current USD/XCD prices below the product name
- Click to edit with small input fields
- Save via the same `updateProduct` mutation

---

## 3. Editable Retreat Gallery Titles/Descriptions (Admin)
Enable editing titles and descriptions of uploaded retreat images and videos after upload.

**Files:** `src/pages/AdminRetreats.tsx`
- Add an edit button in the hover overlay on each gallery image
- Opens a small dialog or inline edit for title/description fields
- Save via `updateImage` mutation (already exists)

---

## 4. Editable Retreat Date Pricing (Admin)
Add inline price editing to the retreat dates table.

**Files:** `src/pages/AdminRetreatDates.tsx`
- Make the Price column cells editable (click to toggle input)
- Add an `updatePrice` mutation to update `price_override_usd`

---

## 5. Bulk Category Assignment (Admin + Frontend)
Add ability to select multiple products and assign them to a category in bulk.

**Files:** `src/pages/AdminProducts.tsx`
- Add checkboxes to each product card
- Add a bulk action bar that appears when products are selected
- Include a category dropdown and "Apply" button
- Mutation updates `category_id` for all selected product IDs

---

## 6. Navigation Arrows for Multiple Photos

### Quick View Modal
**Files:** `src/components/store/QuickViewModal.tsx`
- Track `selectedImageIndex` state
- Combine `image_url` + `additional_images` into an array
- Add left/right ChevronLeft/ChevronRight arrow buttons over the image
- Show image counter dots or "1/3" indicator

### Product Detail Gallery
**Files:** `src/components/store/ProductGallery.tsx`
- Add left/right navigation arrows overlaying the main image (in addition to existing thumbnails)
- Arrows appear on hover when multiple images exist

---

## 7. Remove Hover Circle on Product Cards
The "Quick View" button overlay on product cards includes a semi-transparent background. The request is to remove the circular zoom indicator that appears on hover.

**Files:** `src/components/store/ProductCard.tsx`
- The hover overlay (`bg-foreground/0 group-hover:bg-foreground/20`) with the "Quick View" button is fine to keep
- No separate circle exists in ProductCard -- the circle is actually in `ProductGallery.tsx` (the ZoomIn icon in a white rounded-full container). But since ProductCard doesn't use ProductGallery, the "circle" is the Quick View button overlay effect. Will remove the darkening overlay background on product cards so only the button appears without the circle effect.

---

## 8. Shipping Information Update
Update international shipping text from current wording to "3-5 day shipping from U.S."

**Files:** `src/pages/ProductDetail.tsx`
- Line 429: Change "Ships worldwide from St. Lucia within 3-5 business days via courier." to "3-5 day shipping from U.S. for all international orders."

---

## Technical Details

### Mutations to add in `AdminProducts.tsx`:
```typescript
const updateProduct = useMutation({
  mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
    const { error } = await supabase.from("products").update(updates).eq("id", id);
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
});
```

### Bulk category update:
```typescript
const bulkUpdateCategory = useMutation({
  mutationFn: async ({ ids, category_id }: { ids: string[]; category_id: string }) => {
    const { error } = await supabase.from("products").update({ category_id }).in("id", ids);
    if (error) throw error;
  },
});
```

### QuickView image navigation:
- Build `allImages` array from `product.image_url` + `(product as any).additional_images`
- Add `selectedImageIndex` state with ChevronLeft/ChevronRight arrows
- Show arrow indicators only when `allImages.length > 1`

### No database migrations needed -- all changes use existing schema.




# Multi-Image Product Gallery (Up to 4 Photos)

## Overview

Enhance the product image system to support up to 4 images per product, with a clear indicator showing which image is the "primary" one used as the main product photo across the store.

## What Will Be Built

### 1. Database Changes
- Add new `additional_images` column to the `products` table to store an array of image URLs
- Keep `image_url` as the primary/main image (displayed on product cards, search results, etc.)
- Store up to 3 additional images in the array

### 2. Updated Admin Upload Interface
- Display a grid of 4 image slots
- First slot marked as "Primary" with a visual indicator (star/badge)
- Each slot allows upload, preview, and delete
- Drag-and-drop reordering to change which image is primary
- Click any secondary image to promote it to primary

### 3. Updated Product Detail Page
- Add image gallery/carousel with thumbnails
- Show primary image large, with thumbnail navigation below
- Click thumbnails to switch the main view

---

## Technical Details

### Database Schema Change

```text
products table
+----------------------+----------------+
| image_url            | Primary image  |
| additional_images    | text[] (new)   |
+----------------------+----------------+
```

SQL migration:
- Add `additional_images` column as `text[] DEFAULT '{}'`
- This stores up to 3 additional image URLs

### Component Architecture

```text
ProductImageUpload (updated)
+------------------------------------------+
|  +--------+   +--------+   +--------+   +--------+
|  |   1    |   |   2    |   |   3    |   |   4    |
|  |PRIMARY |   |        |   |        |   |        |
|  |  [*]   |   |  [ ]   |   |  [ ]   |   |  [ ]   |
|  +--------+   +--------+   +--------+   +--------+
|                                                  |
|  * Click slot to upload                          |
|  * Click image to set as primary                 |
|  * Hover to delete                               |
+------------------------------------------+
```

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/ProductImageUpload.tsx` | Complete rewrite for 4-slot grid with primary indicator |
| `src/pages/AdminProducts.tsx` | Pass additional_images prop, update stats |
| `src/pages/ProductDetail.tsx` | Add image gallery with thumbnails |
| `src/components/store/ProductCard.tsx` | No changes needed (already uses image_url as primary) |
| `src/hooks/use-products.ts` | Type already includes the new column after migration |

### New Component

| File | Purpose |
|------|---------|
| `src/components/store/ProductGallery.tsx` | Image gallery with thumbnails for product detail page |

---

## Implementation Steps

### Phase 1: Database
1. Create migration to add `additional_images text[] DEFAULT '{}'` column to products table

### Phase 2: Admin Interface
2. Rewrite `ProductImageUpload.tsx`:
   - Display 4 image slots in a 2x2 grid
   - Slot 1 shows "Primary" badge
   - Each slot can upload/delete independently
   - Clicking a secondary image makes it the primary (swaps with slot 1)
   - Upload to slot 2-4 adds to `additional_images` array
   - Visual feedback: checkered background for empty slots, hover state for delete

3. Update `AdminProducts.tsx`:
   - Update query to include additional_images
   - Update stats to show "Complete" (has primary) vs "Full gallery" (has 4 images)
   - Pass additional_images to upload component

### Phase 3: Storefront
4. Create `ProductGallery.tsx` component:
   - Large main image display
   - Row of thumbnail images below
   - Click thumbnail to switch main image
   - Smooth transitions between images

5. Update `ProductDetail.tsx`:
   - Replace single image with ProductGallery
   - Combine image_url + additional_images into gallery array

---

## User Experience

**In Admin Dashboard:**
- See 4 slots for each product
- First slot clearly marked "PRIMARY" 
- Empty slots show "+" upload icon
- Filled slots show the image with delete button on hover
- Click any non-primary image to make it the new primary

**On Product Page:**
- Main product image displays prominently
- Thumbnail strip below shows all available images (1-4)
- Current image highlighted in thumbnails
- Click thumbnail to view that image large

---

## Visual Design

Admin slot states:
- Empty: Dashed border, "+" icon, "Add Photo" text
- Filled: Image preview, delete "X" on hover
- Primary: Star icon badge, "Primary" label, green border accent
- Uploading: Progress bar overlay

Gallery thumbnails:
- Small squares with rounded corners
- Active thumbnail has border/ring indicator
- Smooth opacity transition on hover


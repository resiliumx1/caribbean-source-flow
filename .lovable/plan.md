

## Fix WooCommerce Sync to Preserve Custom Images

### Problem
The `woo-sync` function unconditionally overwrites `image_url` and `additional_images` on every sync run. This replaced your custom-uploaded images (stored in Lovable Cloud storage) with WooCommerce stock photos.

### What Will Change

**One file modified: `supabase/functions/woo-sync/index.ts`**

1. Update the existing product lookup (line 201) to also fetch `image_url`:
   - Change `.select("id")` to `.select("id, image_url")`

2. When updating an existing product, check if it already has a custom image (URL contains `supabase.co`). If so, skip overwriting the image fields:
   - Build `productData` without `image_url` and `additional_images` when a custom image exists
   - Only set images from WooCommerce for new products or products that don't have custom images

3. Add a `images_preserved` counter to the response so you can see how many products kept their custom images after each sync.

### What This Does NOT Do
- It cannot automatically restore the images that were already overwritten -- those database references are gone. You will need to re-upload images for affected products via the Admin Products page.
- It does not change any frontend code or database schema.

### After Implementation
- Future syncs will update prices, descriptions, stock status, and categories without touching your custom photos.
- Products that still have WooCommerce images (or no images) will continue to receive WooCommerce images on sync.
- I will re-deploy and run a test sync to confirm images are preserved.


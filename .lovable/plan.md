

## Fix WooCommerce Sync and Prevent Future Data Loss

### The Situation
The sync overwrote names, descriptions, short descriptions, and images for 97 products. Fields like ingredients, dosage instructions, traditional use, and badges were NOT touched (they're still intact). Your 26 original products without WooCommerce matches are completely untouched.

**The overwritten data (custom names, descriptions, images) cannot be automatically restored** -- there is no database history or backup accessible to roll back to. You will need to manually re-enter custom content for affected products via the Admin panel.

### What This Plan Will Do

#### 1. Make the sync safe going forward (woo-sync/index.ts)
Restructure the sync so it ONLY updates the fields you actually want from WooCommerce:
- **Prices** (USD and XCD with sale price logic)
- **Stock status** (in stock, out of stock, pre-order)
- **WooCommerce product ID** (for order mapping)

It will NEVER overwrite:
- Product name
- Description or short description
- Images (image_url, additional_images)
- Product type
- Category assignment
- Any custom fields (ingredients, traditional use, etc.)

For **new products** (slug not found in DB), it will still create them with full WooCommerce data as a starting point.

#### 2. Add a "full sync" option
Add a request body parameter `{ "mode": "full" }` that can optionally do the old behavior (overwrite everything) -- but default to safe/prices-only mode. This way you have control.

#### 3. Add an admin indicator for products needing attention
On the Admin Products page, show a visual badge on products that currently have WooCommerce images (URL contains `mountkailashslu.com` or `wp-content`) so you can easily identify which ones need custom image re-uploads.

### Technical Details

**File: `supabase/functions/woo-sync/index.ts`**
- Parse request body for optional `mode` parameter (default: `"safe"`)
- In safe mode, the `productData` for existing product updates will only contain: `woo_product_id`, `price_usd`, `price_xcd`, `original_price_usd`, `original_price_xcd`, `stock_status`, `updated_at`
- In full mode, behave as current (with image preservation logic)
- New products (insert path) always get full WooCommerce data

**File: `src/pages/AdminProducts.tsx`**
- Add a small indicator icon/badge next to products whose `image_url` contains `wp-content` or `mountkailashslu.com`, making it easy to spot which ones need re-uploading

### What You Will Need to Do Manually
- Re-upload custom images for the ~90 products now showing WooCommerce photos
- Re-enter any custom names or descriptions that differ from what WooCommerce has
- The admin indicator will help you track which products still need attention

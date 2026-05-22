## Goal
Make the WooCommerce sync update-only. It should never create new products in the shop — only update prices, stock, and `woo_product_id` on products that already exist (matched by slug).

## Change
**File:** `supabase/functions/woo-sync/index.ts`

In the product loop, replace the "NEW PRODUCT: insert" branch with a skip:
- When no existing product matches the Woo slug, increment a new `skipped` counter and `continue` instead of inserting.
- Add `skipped` to the JSON response so the admin toast can surface it.

No changes to safe-mode update behavior, category resolution, or the admin button. Existing products keep being updated safely (price, stock, woo_product_id only in safe mode).

## Result
- Clicking "Sync from WooCommerce" in `/admin/products` will only refresh existing products. Any new products in Woo are ignored.
- To add a product to the shop, it must be created manually via the admin.

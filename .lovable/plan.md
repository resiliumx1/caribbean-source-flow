## Goal

Make the WooCommerce sync reliably link Supabase products to their WooCommerce IDs, even when slugs don't match exactly between the two stores.

## Change

**File:** `supabase/functions/woo-sync/index.ts`

Before the product loop, fetch all existing Supabase products once and build two lookup maps:
- `bySlug`: `slug → product`
- `byName`: `normalize(name) → product` where `normalize` lowercases, decodes HTML entities, strips punctuation, and collapses whitespace.

For each WooCommerce product, replace the current slug-only `maybeSingle()` lookup with:
1. Try `bySlug.get(woo.slug)` first.
2. If no hit, try `byName.get(normalize(woo.name))`.
3. If still no hit → increment `skipped`, continue (unchanged behavior — sync never inserts new products).

When a match is found via either path, write `woo_product_id`, prices, and stock exactly as today (safe mode) or the full payload (full mode).

Add a new counter `matched_by_name` to the JSON response so the admin toast can show how many products were linked through the fallback.

## Notes

- No DB schema change; `woo_product_id` already exists on `products`.
- No change to safe-mode field whitelist, category resolution, custom-image preservation, or the admin button.
- Name normalization handles common drift: `"The Answer"` vs `"The Answer "`, `"Soursop Leaves"` vs `"Soursop leaves"`, `&amp;` vs `&`.
- If two Supabase products normalize to the same name, the first one wins and a warning is pushed to `errors[]` so you can resolve the collision manually.

## Result

Clicking "Sync from WooCommerce" in `/admin/products` will populate `woo_product_id` on every Supabase product that has either a matching slug *or* a matching name in WooCommerce — unblocking checkout for items whose slugs diverged.
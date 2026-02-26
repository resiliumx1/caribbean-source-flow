
Goal: Fix WooCommerce authentication from our side so your integration uses Basic Auth headers (the method your server accepts), then verify sync works end-to-end.

What I confirmed in your current code:
1. `woo-sync` currently sends credentials in query params:
   - `.../products?consumer_key=...&consumer_secret=...`
2. `woo-order` also sends credentials in query params:
   - `.../orders?consumer_key=...&consumer_secret=...`
3. Your latest backend test still returns:
   - `woocommerce_rest_cannot_view` (401)
4. Database check confirms sync has not succeeded yet:
   - `products` total: 49
   - `woo_product_id` populated: 0

So yes — right now it is still using query-string auth in code, and that is the likely blocker.

Implementation plan (on my side):
1. Replace Woo auth mechanism in both backend functions
   - Update `supabase/functions/woo-sync/index.ts`
   - Update `supabase/functions/woo-order/index.ts`
   - Build `Authorization: Basic <base64(ck_xxx:cs_xxx)>` header
   - Remove `consumer_key` / `consumer_secret` from URLs entirely
   - Keep HTTPS endpoint usage unchanged

2. Harden URL handling to avoid formatting pitfalls
   - Normalize `WOO_STORE_URL` before building endpoint:
     - trim spaces
     - remove trailing slash
     - strip accidental `/wp-json` or `/wc/v3` suffixes if present
   - Always derive API root internally as:
     - `<normalized-domain>/wp-json/wc/v3`

3. Improve diagnostics safely
   - Keep debug logging without exposing secrets
   - Log:
     - normalized base API URL
     - auth mode used (`basic_header`)
     - Woo status code and response body on failure
   - Ensure no raw key/secret is logged

4. Verify the fix immediately after update
   - Call `woo-sync` endpoint as admin
   - Success criteria:
     - no 401 from Woo
     - response returns `synced/created/updated`
   - Validate database outcome:
     - `woo_product_id` is populated for synced products
     - sample rows include name/slug/woo_product_id/image/prices

5. Validate checkout integration path after sync
   - Run a controlled `woo-order` backend test with a valid synced product
   - Confirm Woo order creation returns `order_id`, `order_number`, `payment_url`
   - If needed, use a non-production test item/customer details and report exact result

Expected outcome:
- Sync and order creation will authenticate the same way Postman does (Basic Auth header), eliminating the query-auth mismatch that is causing your current 401.

Technical notes:
- No database schema changes required.
- No frontend route changes required.
- The fix is isolated to backend function request construction + URL normalization + safer logging.

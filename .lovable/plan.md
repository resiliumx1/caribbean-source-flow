

# WooCommerce Integration — Implementation Plan

## Step 1: Store WooCommerce Secrets
Save three secrets securely in the backend:
- `WOO_CONSUMER_KEY` — your consumer key (provided)
- `WOO_CONSUMER_SECRET` — your consumer secret (provided)
- `WOO_STORE_URL` — `https://mountkailashslu.com`

## Step 2: Create `woo-sync` Edge Function
A backend function that:
- Connects to `https://mountkailashslu.com/wp-json/wc/v3/products` using your API credentials
- Fetches all WooCommerce products (paginated, 100 per page)
- For each product, upserts into your existing `products` table:
  - Name, description, short description, images
  - USD price from WooCommerce, XCD auto-calculated at 2.70x
  - Stock status mapping (publish/draft to in_stock/out_of_stock)
  - Category matching (creates categories if needed)
- Uses the service role key to bypass RLS for admin-level writes
- Protected so only admins can trigger it

## Step 3: Create `woo-order` Edge Function
A backend function that:
- Accepts cart items and customer info from your Lovable checkout
- Creates a corresponding order in WooCommerce via the REST API
- Returns the WooCommerce order ID and checkout/payment URL
- Customer gets redirected to WooCommerce for payment processing

## Step 4: Add "Sync from WooCommerce" Button
Update the Admin Products page (`/admin/products`) to include a sync button in the header area that:
- Calls the `woo-sync` function
- Shows a loading spinner while syncing
- Displays a success/error toast with count of products synced
- Sits next to the existing "Add Product" button

## Technical Notes
- Both edge functions use `verify_jwt = false` in config.toml with in-code auth validation
- The sync function uses WooCommerce Basic Auth (consumer key/secret as query params for HTTPS)
- Product slug matching prevents duplicates during sync
- No database schema changes needed — the existing `products` table has all required fields


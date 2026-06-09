## Goal
Give admins a way to view historical orders that were placed on the old WooCommerce store (last 2 months), without importing them into the Lovable database.

## What you'll see
- On `/admin/orders`, two tabs at the top:
  - **Lovable Orders** (current default view, unchanged)
  - **WooCommerce (legacy)** — new
- The Woo tab shows a table with: order #, date, customer name, email, status, payment method, total, and an "View details" expand that reveals line items, billing address, and customer note.
- Filters: status dropdown (any / processing / completed / on-hold / cancelled / refunded), search by email or order #, and a date range (defaulting to the last 2 months).
- Pagination (50 per page) with prev/next.
- A small "Refresh" button to re-pull from WooCommerce.

## How it works (technical)
1. **New edge function `woo-orders-list`** (`supabase/functions/woo-orders-list/index.ts`)
   - Requires an authenticated admin caller (verifies the JWT and checks `profiles.is_admin = true` using the service role client). Non-admins get 403.
   - Accepts query params: `after` (ISO date, defaults to now − 60 days), `before`, `status`, `search`, `page`, `per_page` (max 100).
   - Calls `GET {WOO_STORE_URL}/wp-json/wc/v3/orders` using `WOO_CONSUMER_KEY` / `WOO_CONSUMER_SECRET` (basic auth), forwarding the params.
   - Returns `{ orders, totalPages, totalCount }` with only the fields the UI needs (id, number, date_created, status, total, currency, payment_method_title, billing, line_items, customer_note).
   - CORS headers included.

2. **UI changes in `src/pages/AdminOrders.tsx`**
   - Wrap existing content in a shadcn `Tabs` component with `lovable` and `woo` tabs.
   - New component `src/components/admin/WooLegacyOrders.tsx` handles fetching via `supabase.functions.invoke('woo-orders-list', ...)`, table rendering, filters, pagination, and a details drawer/dialog.
   - Reuse existing table/badge/button primitives so it matches the current admin styling.

3. **No DB migration required.** Nothing is written — data is read live from WooCommerce each time.

## Out of scope
- Importing Woo orders into the `orders` table.
- Editing, refunding, or fulfilling Woo orders from the admin (Woo remains the source of truth for those).
- Exporting to CSV (can be added later if useful).

## Risks / notes
- If the Woo store is slow or rate-limited, the tab will show a loading state and surface the upstream error message.
- The 2-month default keeps the first page fast; admins can widen the date range manually.

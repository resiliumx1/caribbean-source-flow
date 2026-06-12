## Plan

### 1. Hide the Hemp Syrup product now
- Find the Hemp Syrup product in the `products` table by name/slug and set `is_active = false` so it stops appearing in the shop, search, featured carousel, and related lists (all queries already filter by `is_active = true`).

### 2. Add a "Hide / Show" toggle in the Shop Admin
- In `src/pages/AdminProducts.tsx`, add a visibility toggle on each product row (eye / eye-off icon button, or a small switch in the actions column) that flips `is_active` for that product.
- Show a clear visual state for hidden products in the admin list (e.g. dimmed row + "Hidden" badge) so admins can see what's currently off the storefront.
- Wire it to a Supabase `update` on `products` and invalidate the products query so the UI refreshes.
- No schema changes — `products.is_active` already exists and is what the storefront filters on.

### Technical notes
- Storefront queries (`useProducts`, `useFeaturedProducts`, `RotatingApothecary`, search, related) all already filter `is_active = true`, so flipping the flag is sufficient.
- Hemp Syrup will be flipped via a data update (insert tool), not a schema migration.
- Admin write is gated by existing RLS policies on `products` (admin-only updates).

Want me to use an eye icon button inline on each row, or a labeled switch in an "Actions" area?
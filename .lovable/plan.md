

## Add Per-Product Category Selector

**What**: Add an inline category dropdown on each product card in the admin products page, similar to the existing badge selector, so admins can reassign any product's category directly.

### Implementation

**File: `src/pages/AdminProducts.tsx`**

1. Add a `updateCategory` mutation (similar to existing `updateBadge`) that updates `category_id` on the products table and invalidates the query cache.

2. Replace the static category text on line 453 (`<p className="text-sm text-muted-foreground">{product.product_categories?.name ?? "Uncategorized"}</p>`) with a `<Select>` dropdown populated from the existing `categories` query. Include an "Uncategorized" option that sets `category_id` to `null`.

3. Style it consistently with the badge selector already on each card -- small trigger (`h-7 text-xs`), full width.

No database changes needed -- the `category_id` column and categories table already exist with proper RLS policies.


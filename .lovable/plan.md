

# Full-Stack Features: Reviews, Related Products, Video Footer, Product Comparison

Four integrated features added to the existing MKRC store, using the current database and admin infrastructure.

---

## Phase 1: Database Setup

### New Tables

**`reviews`**
- id (uuid, PK)
- product_id (uuid, FK to products)
- user_name (text, not null)
- user_email (text, not null)
- rating (integer, 1-5, not null)
- title (text, not null)
- content (text, not null)
- images (jsonb, default '[]')
- status (text, default 'pending' -- values: pending/approved/rejected)
- helpful_count (integer, default 0)
- is_verified_purchase (boolean, default false)
- created_at (timestamptz, default now())

**`review_helpfulness`**
- id (uuid, PK)
- review_id (uuid, FK to reviews ON DELETE CASCADE)
- session_id (text, not null)
- created_at (timestamptz, default now())
- UNIQUE(review_id, session_id)

### Storage

- Create `review-images` public bucket for review image uploads

### RLS Policies

- **reviews SELECT**: Anyone can read where `status = 'approved'` OR `is_admin()`
- **reviews INSERT**: Anyone can insert (public review submission) with status forced to 'pending'
- **reviews UPDATE/DELETE**: Only `is_admin()`
- **review_helpfulness INSERT**: Anyone can insert (public voting)
- **review_helpfulness SELECT**: Anyone can read
- **review-images storage**: Public read; authenticated upload with 2MB file size limit

### Verified Purchase Check

- Create a database function `check_verified_purchase(p_email text, p_product_id uuid)` that returns boolean by checking if an order exists in the `orders` table with matching email and an `order_items` entry for that product_id.

---

## Phase 2: Review System Frontend

### New Files

1. **`src/hooks/use-reviews.ts`** -- React Query hooks:
   - `useProductReviews(productId, page)` -- fetch approved reviews with pagination (10 per page)
   - `useReviewStats(productId)` -- fetch average rating, total count, and star distribution
   - `useSubmitReview()` -- mutation to insert review + upload images to storage
   - `useMarkHelpful(reviewId)` -- mutation to increment helpful count (checks session_id in localStorage to prevent duplicates)

2. **`src/components/reviews/StarRating.tsx`** -- Reusable star display (read-only) and interactive star input component

3. **`src/components/reviews/ReviewSection.tsx`** -- Full review section for product pages:
   - Average rating with large star display
   - Total review count
   - 5-star to 1-star distribution bars (visual percentage bars)
   - "Write a Review" button opening ReviewForm modal
   - Paginated review list (10 per page, load more button)
   - Each review card: stars, title, content, user name, date, "Verified Purchase" badge, image gallery (horizontal scroll on mobile), "Helpful?" thumbs-up button with count

4. **`src/components/reviews/ReviewForm.tsx`** -- Modal form:
   - Interactive star rating selector
   - Name, email, title, content fields (validated with zod)
   - Image upload (max 3, 2MB each, client-side compression via canvas resize before upload)
   - Honeypot hidden field for spam protection
   - Submit button with loading state
   - Success message: "Thank you! Your review is pending approval."

5. **`src/components/reviews/ReviewCard.tsx`** -- Individual review display card with image gallery grid

### Integration Point

- Add `<ReviewSection productId={product.id} />` to `src/pages/ProductDetail.tsx` below the existing accordion section, above the bundle items section.

---

## Phase 3: Admin Reviews Dashboard

### New Files

1. **`src/pages/AdminReviews.tsx`** -- Protected admin page:
   - Filter tabs: Pending (default) | Approved | Rejected | All
   - Sort dropdown: Newest first, Rating high-low, Rating low-high
   - Table view: checkbox, product name (joined from products table), user name, rating (stars), status badge (color-coded), date, action buttons
   - Bulk actions bar (appears when checkboxes selected): Approve, Reject, Delete buttons
   - Quick preview modal: full review text, images, user info, approve/reject/delete actions
   - Empty state per tab

### Updated Files

- **`src/App.tsx`** -- Add `<Route path="reviews" element={<AdminReviews />} />` inside the admin layout
- **`src/components/admin/AdminLayout.tsx`** -- Add "Reviews" link to admin nav bar

---

## Phase 4: Related Products

### New Files

1. **`src/components/store/RelatedProducts.tsx`** -- "You May Also Need" section:
   - Query: products in same category, exclude current product, limit 3
   - If fewer than 3, fill with featured products from other categories
   - Desktop: 3-column grid
   - Mobile: horizontal scroll with snap points
   - Each card: image, name, price, category badge, "View Details" link
   - Lazy loaded (only renders when scrolled into view)

### Integration Point

- Add `<RelatedProducts productId={product.id} categoryId={product.category_id} />` to `src/pages/ProductDetail.tsx` above `<StoreFooter />`

---

## Phase 5: Video Footer

### New Files

1. **`src/components/store/VideoFooter.tsx`** -- Looping background video section:
   - Video element: autoplay, muted, loop, playsinline, preload="metadata"
   - Uses `public/videos/hero-background.mp4` (already exists in project) as placeholder; includes ffmpeg compression command in comments
   - 40% dark overlay gradient for text readability
   - IntersectionObserver: pause video when off-screen
   - Mobile (under 768px): static poster image only, no video (saves data/battery)
   - Content overlay: "Begin Your Sacred Journey" heading + CTA button linking to `/retreats`
   - Respects prefers-reduced-motion

### Integration Point

- Add `<VideoFooter />` to product detail page and optionally the main homepage, placed above the regular footer

---

## Phase 6: Product Comparison

### New Files

1. **`src/lib/comparison-context.tsx`** -- React Context provider:
   - State: array of product IDs (max 3)
   - Persist to localStorage key `kailash_compare` with 24-hour expiry
   - Actions: addToCompare, removeFromCompare, clearAll, isInCompare
   - Toast notifications via sonner

2. **`src/components/store/CompareButton.tsx`** -- Toggle button for product cards and detail page:
   - Shows "Compare" / "Remove" state
   - Disabled with tooltip when 3 items already selected
   - Count badge showing number of items in compare list

3. **`src/components/store/CompareBar.tsx`** -- Fixed bottom bar:
   - Only visible when compare list has items
   - Shows product thumbnail images (max 3)
   - "Compare Now" button linking to `/compare`
   - "Clear All" link
   - Dismissible (hide bar without clearing list)

4. **`src/pages/ComparePage.tsx`** -- Full comparison page at `/compare`:
   - Desktop: side-by-side columns (max 3)
   - Sticky header row with product images, names, remove buttons
   - Comparison rows: Price (USD/XCD), Category, Product Type, Size, Key Benefits, Stock Status
   - Mobile: horizontal scroll table with sticky first column
   - Empty state: illustration with "Select products to compare" + link to shop
   - Deep link support: reads `?compare=id1,id2,id3` from URL params
   - Print-friendly CSS (@media print)

### Updated Files

- **`src/App.tsx`** -- Add `/compare` route, wrap app in `ComparisonProvider`
- **`src/components/store/ProductCard.tsx`** -- Add `<CompareButton>` to each card
- **`src/pages/ProductDetail.tsx`** -- Add `<CompareButton>` next to "Add to Bag"

---

## Technical Details

### Existing Patterns Followed

- Admin auth uses the existing `useAdmin()` hook and `is_admin()` database function -- no changes to auth system needed
- RLS policies use the existing `is_admin()` security definer function
- React Query for all data fetching (consistent with existing hooks)
- Tailwind CSS for styling (matches existing product cards, admin pages)
- Sonner for toast notifications (already in project)

### No New Dependencies

All features built with existing packages: React, react-router-dom, @tanstack/react-query, lucide-react, @supabase/supabase-js, sonner, zod, Tailwind CSS.

### Image Compression (Review Uploads)

Client-side compression using HTML Canvas API before uploading to storage -- resize images to max 1200px width, convert to JPEG at 80% quality. No additional library needed.

### File Count Summary

- New files: ~12 files
- Modified files: ~5 files (App.tsx, ProductDetail.tsx, ProductCard.tsx, AdminLayout.tsx, index.css)
- New database tables: 2 (reviews, review_helpfulness)
- New storage bucket: 1 (review-images)


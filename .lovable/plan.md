

## Multi-Feature Update Plan

### 1. Fix product name edit box (too small)

**Problem**: The inline name edit Input has `className="h-7 text-sm"` which is too narrow to see what you're typing.

**Fix**: When editing, replace the tiny inline input with a wider input that spans the full card width. Remove the fixed `h-7` height constraint and let it breathe. Add `w-full` so it takes the full available width instead of being squeezed next to action buttons.

**File**: `src/pages/AdminProducts.tsx` (lines 413-423)

---

### 2. Product image "Change" label on hover

**Problem**: When hovering a product image in the admin product list, there's no clear "Change" indicator. The existing `ProductImageUpload` component has a "Replace" label on hover but it's small and at `text-[10px]`.

**Fix**: Update `src/components/admin/ProductImageUpload.tsx` to show a more prominent "Change" label at the bottom-right corner of each image slot on hover. Increase the font size, make it more visible with better contrast styling.

**File**: `src/components/admin/ProductImageUpload.tsx` (the "Replace" label section around line 260)

---

### 3. Delete duplicate products

**Problem**: 14 products have exact duplicate names in the database.

**Fix**: Run a database migration that keeps only the oldest entry (by `created_at`) for each duplicate name and deletes the newer copies. The duplicates are: Bay Leaf, Blood Detox, Bulk Cassia Alata, Colax, Fertility, Free Flow, Gully Root Leaves, Gully Root Roots, Seamoss Soaps, Pure Gold, Red Raspberry Leaf, St John's Bush, Super Female Package, The Answer.

**Action**: SQL migration to delete duplicates keeping the first created.

---

### 4. Enable retreat video uploads with tagging

**Problem**: The retreat admin (`/admin/retreats`) only manages gallery images, not videos. The `retreat_videos` table exists but there's no upload interface in the admin.

**Fix**: Add a "Videos" tab to the AdminRetreats page (or create a dedicated section) that allows:
- Uploading videos (YouTube URL or direct file reference)
- Tagging videos with retreat type: "Special Retreat", "Solo Retreat", "Group Retreat" (in addition to existing Experience/Healing/Food/Other categories)
- Update the `retreat_videos` table category options to include these new tags

**Files**: `src/pages/AdminRetreats.tsx` -- add video management section with upload form and category selector including the new retreat type tags.

---

### 5. Admin dashboard with website statistics

**Problem**: No analytics/visitor stats visible in the admin dashboard.

**Fix**: Create a new admin page at `/admin/analytics` that uses the Lovable analytics API to display:
- Visitor count (daily/weekly)  
- Page views
- Top pages
- Basic traffic trends chart using Recharts (already installed)

Add an "Analytics" link to the admin navigation header.

**Files**: 
- Create `src/pages/AdminAnalytics.tsx` with analytics dashboard
- Update `src/components/admin/AdminLayout.tsx` to add nav link
- Update `src/App.tsx` to add route

---

### 6. Replace The Answer hero background with uploaded photo

**Problem**: The hero currently uses `mkrc-hero-bg.jpg` as background.

**Fix**: Copy the uploaded image (`user-uploads://mount_kailash_theanswerproductimages_12.JPG`) to `src/assets/the-answer-hero-chronixx.jpg` and update the import in `src/pages/TheAnswer.tsx` to use it as the hero background.

**Files**: 
- Copy uploaded image to `src/assets/`
- Update `src/pages/TheAnswer.tsx` line 12 to import new image

---

### 7. Remove hovering animated bottle from The Answer hero

**Problem**: The hero section has a floating/bobbing bottle image with `animation: answer-float 6s ease-in-out infinite`.

**Fix**: Remove the entire bottle column from the hero section (lines 125-133 in TheAnswer.tsx) and update the CSS grid to be single-column (`grid-template-columns: 1fr`) so the text content takes center stage.

**Files**:
- `src/pages/TheAnswer.tsx` -- remove the bottle `ScrollReveal` block
- `src/pages/TheAnswer.css` -- change `.answer-hero__inner` grid to `1fr`, remove float animation, remove bottle-related styles

---

### 8. Show background photo more clearly

**Problem**: The hero background has `opacity: 0.12` (barely visible) and gradient overlays that obscure it.

**Fix**: Increase the background opacity from `0.12` to `0.45` and adjust the gradient overlays to be more transparent so the new product photo is clearly visible behind the text content. Also reduce the radial gradient intensity.

**File**: `src/pages/TheAnswer.css` -- update `.answer-hero__bg` opacity and `.answer-hero__gradients`

---

### Summary of all files to modify

| File | Changes |
|---|---|
| `src/pages/AdminProducts.tsx` | Expand name edit input width |
| `src/components/admin/ProductImageUpload.tsx` | Change "Replace" to "Change" with better visibility |
| Database migration | Delete 14 duplicate products |
| `src/pages/AdminRetreats.tsx` | Add video upload section with retreat type tags |
| `src/pages/AdminAnalytics.tsx` | New file -- analytics dashboard |
| `src/components/admin/AdminLayout.tsx` | Add Analytics nav link |
| `src/App.tsx` | Add analytics route |
| `src/pages/TheAnswer.tsx` | Replace hero bg import, remove bottle section |
| `src/pages/TheAnswer.css` | Increase bg opacity, remove float animation, single-column hero |


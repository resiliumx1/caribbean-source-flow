## Goal

Apply the rename table and rename Virility tincture → Male Balance, then sync all references in code + backend.

## Current state (already done in backend)

Database already reflects most of the table:
- Herbal Detox ✅ (formerly Blood Detox)
- Gut Balance ✅ (formerly Dewormer)
- Anamu Syrup ✅ (formerly Fey Duvan)
- Feminine Balance ✅ (formerly Fertility)
- Colax, Free Flow — unchanged

What's missing:
- Product still named **"Virility"** (slug `virility-herbal-virility-supplement`) needs to become **"Male Balance"**.
- Several places in code/edge functions still mention the old names (Blood Detox, Dewormer, Fey Duvan, Fertility, Virility) as product references.

Note: There's also a separate product "Virility Male Balance Capsules" (capsules) — that one stays as-is unless you want it renamed too.

## Plan

### 1. Database migration

- Rename `products` row id `057353cd…` → name `Male Balance`, slug `male-balance` (keep old slug working via the redirect map in `ProductDetail.tsx`).
- Update bundle / kit names that embed old terms:
  - `Feminine Balance Kit` — already correct.
  - Check for any kit/bundle whose name still says "Virility" / "Fertility" / "Dewormer" / "Blood Detox" / "Fey Duvan" and rename.

### 2. Frontend code

- `src/pages/ProductDetail.tsx` — add `"virility-herbal-virility-supplement": "male-balance"` redirect alongside existing dewormer/fey-duvan/fertility redirects.
- `src/components/MountKailashChat.jsx` — replace product entries "Virility" → "Male Balance", update slug, update bundle copy (Male Potency Kit, Prostate Health Bundle product lists).
- `src/components/wholesale/PrivateLabel.tsx` — update alt text lineup ("…Colax, Male Balance, Anamu Syrup, Herbal Detox").

### 3. Edge function

- `supabase/functions/concierge-chat/index.ts` — replace product blocks: Dewormer → Gut Balance, Blood Detox → Herbal Detox, Fey Duvan Syrup → Anamu Syrup, Fertility → Feminine Balance, Virility → Male Balance. Update bundle compositions accordingly.

### 4. Leave generic concept words alone

- Words like "fertility", "detox" used as health concerns/topics in webinar copy, SEO descriptions, and school sections stay (they describe the concern, not the product). Only product-name references change.

## Out of scope

- "Virility Male Balance Capsules" capsule product is untouched (let me know if it should also be renamed to just "Male Balance Capsules").
- Image filenames in old migration files (`dewormer-main.webp`, etc.) — historic, not user-visible.

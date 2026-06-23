## Problem

Google indexed product URLs as `/product/:slug` (e.g. `/product/moon-cycle-tea`), but the app serves products at `/shop/:slug`. Every click from search hits the SPA's `*` route and renders 404.

## Fix

Add a catch-all redirect in `src/App.tsx` so any legacy `/product/...` URL forwards to the matching `/shop/...` URL, preserving the slug. Works for all products automatically.

### Routes to add (just above the `*` NotFound route)

```tsx
<Route path="/product/:slug" element={<RedirectProductToShop />} />
<Route path="/product" element={<Navigate to="/shop" replace />} />
```

`RedirectProductToShop` is a tiny inline component:
```tsx
const RedirectProductToShop = () => {
  const { slug } = useParams();
  return <Navigate to={`/shop/${slug}`} replace />;
};
```

### Sitemap check

Inspect `public/sitemap.xml` (or `scripts/generate-sitemap.ts` if present). If any entries still use `/product/...`, rewrite them to `/shop/...` so future crawls index the canonical path.

### Why not a hosting-level redirect

Lovable hosting falls back to `index.html` for unknown paths and lets the SPA router handle them. A `_redirects` file would be ignored. Client-side `<Navigate replace />` is the correct mechanism and issues a proper in-app redirect; Google will follow it and update the index.

## Out of scope

No changes to product data, shop UI, admin flows, or styling.
## Goal

Fix admin navigation so it works on every screen size, lands on Orders by default, and never traps the user inside a view. Styling (warm cream, deep green, terracotta) is preserved.

## Part 1 — Default landing tab & order

In `src/App.tsx`:
- Change the `/admin` index redirect from `/admin/products` to `/admin/orders`.

In `src/components/admin/AdminLayout.tsx`:
- Reorder the nav array to: Orders, Products, Retreats, Retreat Dates, Reviews, Webinars, Analytics, Notifications.
- Active highlight logic already keys off `location.pathname`, so Orders will appear active on first load.

## Part 2 — Responsive admin nav (hamburger under ~1024px)

In `src/components/admin/AdminLayout.tsx`:
- Keep the existing desktop row, but gate it with `hidden lg:flex` instead of `md:flex`.
- Add a hamburger button visible `lg:hidden`, placed to the left of the bell so logo / hamburger / bell / theme toggle stay in a single non-overflowing row at 375px and 768px (small icon-only buttons, tighter gaps on mobile).
- Tapping the hamburger opens a slide-in `Sheet` (left side, full height, scrollable `overflow-y-auto`) containing:
  - Every nav item (Orders → Notifications) with active state highlighted and the same unread badge on Notifications.
  - A divider, then: account email, dark-mode toggle, Back to Site link, Sign Out button.
  - The bell stays in the header (already responsive), but the mobile menu also includes a "Notifications" entry.
- Selecting any item calls `navigate(...)` and closes the sheet. Sheet already closes on outside click and Escape via Radix.
- Ensure header layout on small widths: logo shrinks to icon only, email hidden below `lg`, no overlap.

## Part 3 — Back navigation / escape hatches

Order detail drawer (`src/pages/AdminOrders.tsx`):
- Add a visible close (X) button in the sticky header of the side panel.
- Clicking the backdrop already closes it; confirm and keep.
- Add an Escape key listener that closes the drawer (and exits edit mode first if active).
- Add a `history.pushState` when the drawer opens and a `popstate` listener that intercepts the browser Back button to close the drawer instead of leaving the admin. Only after the drawer is closed does Back navigate normally. Same treatment for the edit modal: Back closes edit first, then the drawer, then the page.

Mobile nav sheet:
- Radix Sheet already handles Escape and outside-click; no extra work.

Sub-pages reached from a tab:
- The admin uses tabs only (no nested detail routes today besides the Orders drawer, which is covered above). No additional Back buttons needed unless a tab grows a sub-route later.

## Technical notes

- Files touched: `src/App.tsx`, `src/components/admin/AdminLayout.tsx`, `src/pages/AdminOrders.tsx`.
- New imports: `Menu` icon from `lucide-react`; `Sheet`, `SheetContent`, `SheetTrigger` from `@/components/ui/sheet` in `AdminLayout`.
- Breakpoint: Tailwind `lg` (1024px) — desktop row above, hamburger below.
- No backend, schema, or tab-content changes.
- No styling token changes; reuse existing cream/green/terracotta classes already used in the header.

# Plan — Terms & Conditions + Privacy Policy pages

## Routes
Add two canonical legal routes in `src/App.tsx`:
- `/terms-and-conditions` → new `TermsAndConditions` page
- `/privacy-policy` → new `PrivacyPolicy` page

Keep existing `/terms` and `/privacy` routes as redirects (`<Navigate replace>`) to the new canonical URLs so any existing inbound links or current footer references keep working until rolled out.

## Pages
Create `src/pages/TermsAndConditions.tsx` and `src/pages/PrivacyPolicy.tsx`. Both share the same layout:
- White (`bg-background`) page, MKRC brand fonts (DM Sans body, Cormorant Garamond display per Core memory).
- `<SEOHead>` with title + description + path.
- Container: `max-w-3xl mx-auto px-4 py-16` (prose width).
- Top: page title (Cormorant Garamond display) + "Effective Date: May 19, 2026" in muted text.
- Body: numbered sections (1–16 for T&C, 1–15 for Privacy) using semantic `<h2>` per section, `<h3>` for sub-headings (Personal Information, Technical Information, etc.), and `<ul>` for bullet lists. Use `prose prose-neutral max-w-none` typography helpers where appropriate, but ensure brand font tokens win.
- Trailing horizontal rule + small back-to-shop link.

Content is pasted verbatim from the supplied PDF — all 16 T&C sections and all 15 Privacy sections, with company info, contact details (Marc, Bexon, Castries, Saint Lucia / info@mountkailashslu.com / mountkailashslu.com), the Mount Kailash LLC distribution note, and section ordering preserved exactly.

## Footers — add "Legal" column
Update the existing legal links in all five footers (`StoreFooter.tsx`, `HomepageFooter.tsx`, `MKRCFooter.tsx`, `UnifiedFooter.tsx`, `wholesale/Footer.tsx`) to:
- Point to `/terms-and-conditions` and `/privacy-policy` (instead of `/terms` and `/privacy`).
- Use the labels "Terms & Conditions" and "Privacy Policy".
- Where the footer has explicit column structure (Store, Wholesale), surface a dedicated "Legal" column with both links. Where it's a single inline row (Homepage, MKRC, Trinity), keep the inline pair but update labels + targets.

## Technical notes
- No DB or schema work.
- No new dependencies.
- Strict-whitelist routing pattern in `App.tsx` is respected (per Core memory) — both new paths get explicit `<Route>` entries.
- Pages use `useLayoutEffect` scroll-to-top to match site convention.

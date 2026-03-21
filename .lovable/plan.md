

## Plan: Dark Mode Fix, Typography Consolidation & Webinar Brand Alignment

### Prompt 1 — Fix Dark Mode Leak

**Files:** `src/pages/Webinars.tsx`, `src/pages/TheAnswer.tsx`

Add cleanup `return () => document.documentElement.classList.remove("dark")` to the `useEffect` in both files. TheAnswer already has an empty `return () => {}` — replace it with the real cleanup.

---

### Prompt 2 — Typography Consolidation to DM Sans

**Scope:** ~58 component/page files with inline `fontFamily` styles + 3 CSS files with `font-family` rules. All get replaced with `'DM Sans', sans-serif`.

**CSS files (3):**
- `src/styles/webinar.css` — `.font-cormorant` and `.font-jost` classes
- `src/styles/mkrc-theme.css` — `.mkrc-display`, `.mkrc-body`, `.mkrc-label`, `.mkrc-page`, button classes
- `src/styles/gate-entrance.css` — `.h-eyebrow`, `.h-sub`, `.h-tagline`, sidebar font

**Component/Page files (~58):** Every inline `fontFamily` reference to Cormorant Garamond, Playfair Display, Jost, Inter, Plus Jakarta Sans, Space Grotesk, or DM Serif Display gets replaced with `'DM Sans', sans-serif`. Font weights, sizes, line heights, letter spacing, and colors remain untouched.

**index.css:** `--font-serif` variable kept as fallback but unused. Body/heading rules already reference DM Sans — confirmed.

---

### Prompt 3 — Webinar Page Brand Alignment

**`src/pages/Webinars.tsx`:**
- Outer div: replace hardcoded `backgroundColor: "#090909"` / `color: "#f2ead8"` with `var(--site-bg-primary)` / `var(--site-text-primary)`
- Dialog: replace `#111111` bg and `#f2ead8` text with site tokens

**`src/styles/webinar.css`:**
- Replace `#090909` → `var(--site-bg-primary)`
- Replace `#0d1a0f` → `var(--site-bg-secondary)`
- Replace `#0f0a00` → `var(--site-bg-deep)`
- Replace `#f2ead8` → `var(--site-text-primary)`
- Replace `#c9a84c` → `var(--site-gold)`
- Replace `#0F281E` → `var(--site-green-dark)`

**Webinar component files (9 files in `src/components/webinar/`):**
- Same hex-to-variable replacements across WebinarHero, WebinarSignup, WebinarShowcase, WebinarCommunity, WebinarTrust, WebinarHost, WebinarExplore, WebinarFeatured, WebinarFooter

---

### Technical Notes
- No layout, animation, sizing, or structural changes
- Font weight values preserved (just family swapped)
- CSS class names like `.font-cormorant` and `.font-jost` kept but their underlying family changed to DM Sans — this avoids breaking class references in JSX


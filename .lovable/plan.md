

## Plan: Build Error Fix + Prompts 4–8

### 0. Critical Build Fix — MKRCChatWidget.tsx Smart Quotes

The file `src/components/concierge/MKRCChatWidget.tsx` has **curly/typographic quotes** (`'` and `'`) inside `fontFamily` strings instead of straight single quotes (`'`). This causes TS1005 errors on lines 92, 144, 165, 210, 245, 267, 311, and 350.

**Fix:** Replace all instances of `'DM Sans'` (smart quotes) with `'DM Sans'` (straight quotes) across the file (~8 occurrences).

---

### Prompt 4 — Shop Hero Font Fix

**File:** `src/components/store/ShopHero.tsx`

Already done — the file already uses `fontFamily: "'DM Sans', sans-serif"` on all elements (h1 and both p tags). No changes needed.

---

### Prompt 5 — Standardise Gold Colour Token

**`src/index.css`:** Gold tokens already set correctly (`--site-gold: #BC8A5F` light / `#D4A373` dark). No changes needed there.

**`src/styles/mkrc-theme.css`:**
- `--mkrc-accent-gold: #C9A84C` → `var(--site-gold, #BC8A5F)`
- `--mkrc-accent-gold-bright: #D4AF37` → `var(--site-gold, #D4A373)`
- Same for light mode block: `--mkrc-accent-gold: #B8942F` → `var(--site-gold, #BC8A5F)`, `--mkrc-accent-gold-bright: #C9A84C` → `var(--site-gold, #D4A373)`

**`src/styles/webinar.css`:** Replace `#a07830` with `var(--site-gold-dark)` (line 43 shimmer gradient).

**Webinar components (6 files):** Replace all hardcoded `#c9a84c` with `var(--site-gold)`:
- `WebinarSignup.tsx` — 2 instances
- `WebinarFeatured.tsx` — 1 instance
- `WebinarHero.tsx` — 2 instances (border class + backgroundColor)
- `WebinarExplore.tsx` — 1 instance
- `WebinarTrust.tsx` — 1 instance
- `WebinarHost.tsx` — 1 instance
- `WebinarCommunity.tsx` — 1 instance
- `WebinarShowcase.tsx` — 6 instances

Keep `rgba(201,168,76,...)` values as-is (too complex for CSS variable replacement) — will flag these as remaining hardcoded.

---

### Prompt 6 — mkrc-theme.css Cleanup

Update both `[data-mkrc-theme="dark"]` and `[data-mkrc-theme="light"]` blocks to reference `--site-*` tokens for the 10 properties listed. Keep `--mkrc-bg-elevated`, `--mkrc-bg-surface`, `--mkrc-text-tertiary`, `--mkrc-text-inverse`, `--mkrc-glow-gold`, `--mkrc-glow-green`, `--mkrc-border-medium`, `--mkrc-accent-gold-dim` as standalone values.

---

### Prompt 7 — Hero Typography Refinement

**File:** `src/components/homepage/HeroSection.tsx`

- H1 (line 133): Add inline `style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: '#F4EFEA' }}`
- "Welcome to Mount Kailash" paragraph (line 138-142): Change `italic` class to normal, add `fontWeight: 300, letterSpacing: '0.05em', fontStyle: 'normal'`
- "21 years restoring..." paragraph (line 143-147): Remove `italic` and `font-serif` classes, add `fontWeight: 300, letterSpacing: '0.04em'`

---

### Prompt 8 — SEO Meta Update

**File:** `src/pages/TrinityHomepage.tsx` (lines 85-88)

- Title → `"Mount Kailash Rejuvenation Centre | Caribbean Bush Medicine & Wellness"`
- Meta description → the provided 200-char description about shop, retreats, school

---

### Files Modified (Total: ~12)
1. `src/components/concierge/MKRCChatWidget.tsx` — smart quote fix
2. `src/styles/mkrc-theme.css` — gold tokens + site token references
3. `src/styles/webinar.css` — gold standardization
4. `src/components/webinar/WebinarSignup.tsx`
5. `src/components/webinar/WebinarFeatured.tsx`
6. `src/components/webinar/WebinarHero.tsx`
7. `src/components/webinar/WebinarExplore.tsx`
8. `src/components/webinar/WebinarTrust.tsx`
9. `src/components/webinar/WebinarHost.tsx`
10. `src/components/webinar/WebinarCommunity.tsx`
11. `src/components/webinar/WebinarShowcase.tsx`
12. `src/components/homepage/HeroSection.tsx` — typography refinement
13. `src/pages/TrinityHomepage.tsx` — SEO update

### Flagged: Remaining Hardcoded Gold
`rgba(201,168,76,...)` values in webinar components and `TheAnswer.css` will remain as-is — CSS variables can't be used inside `rgba()` without `color-mix()` which has limited browser support.


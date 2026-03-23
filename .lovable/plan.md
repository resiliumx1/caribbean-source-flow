

## Plan: Webinar Hero Fix, Review Avatars, Chat z-index & Seal

### Prompt 1 — Webinar Hero Grey Fix

**`src/index.css`** (after line 243): Add exception rule:
```css
.webinar-hero-gradient.hero-section {
  background: unset !important;
}
```

**`src/components/webinar/WebinarHero.tsx`** (line 49): Remove `hero-section` from className, keeping `webinar-hero-gradient webinar-noise relative flex items-center justify-center text-center min-h-screen overflow-hidden`.

---

### Prompt 2 — Review Avatars

**`src/components/reviews/ReviewCard.tsx`**:
- Add `getAvatarUrl` helper using DiceBear notionists style
- Replace the plain `{review.user_name} · {date}` span (line 53-54) with a flex row containing a 28x28 avatar image + the text

---

### Prompt 3 — Chat z-index Fix

**`src/components/ChatWidget.tsx`**:
- Line 87-88: Change maximized style to `{ bottom: 16, right: 16, width: 600, height: 'calc(100vh - 88px)', borderRadius: 16, top: 'auto' }`
- Line 152: Change `z-[9999]` to `z-[9000]`

---

### Prompt 4 — Replace Bottom-Left Minimize with Star Seal

**`src/components/ChatWidget.tsx`** (lines 211-220): Replace the `<button>` with `<Minus>` icon with a star seal SVG image:
```tsx
<img src="/star-seal.svg" alt="Mount Kailash" style={{
  position: "absolute", bottom: 12, left: 12, zIndex: 210,
  width: 36, height: 36, pointerEvents: "none", opacity: 0.7,
}} />
```

Check if `Minus` is still used elsewhere in the file (line 183 header minimize button) — yes it is, so keep the import.

---

### Files Changed (4)
1. `src/index.css` — 3 lines added
2. `src/components/webinar/WebinarHero.tsx` — 1 line className change
3. `src/components/reviews/ReviewCard.tsx` — avatar helper + JSX update
4. `src/components/ChatWidget.tsx` — z-index, maximized style, seal replacement


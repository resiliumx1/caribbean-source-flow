
# GoddessCard — Refinements Plan

## What Needs Changing

### 1. QR Code — Fixed URL + Clickable Lightbox
**Problem:** `pageUrl = window.location.href` — in preview/development this points to the Lovable preview URL, not the published card URL. The QR should always encode the **published** URL: `https://caribbean-source-flow.lovable.app/goddess`.

**Fix:** Hardcode `const CARD_URL = "https://caribbean-source-flow.lovable.app/goddess"` and use it for both the QR `value` prop and the Share API `url`.

**Clickable QR:** Add a `[qrLightboxOpen, setQrLightboxOpen]` state. Wrap the QR div in a `<button>` that opens a new QR lightbox — a full-screen dark overlay displaying a much larger QR (280px) with the instruction "Point your camera here". Reuse the existing `Lightbox` overlay pattern with an `X` close button.

---

### 2. Bio Font — More Elegant & Professional
**Problem:** The current font is `'Cormorant Garamond', 'Georgia', serif` at `text-[15px]` — this renders well but the sizing and weight feel generic.

**Fix:**
- Increase font size to `text-[17px]` for better elegance
- Add `font-light` (300 weight) to all paragraphs — Cormorant Garamond at light weight reads beautifully
- Increase `leading-relaxed` to `leading-[1.85]` for more breathing room between lines
- The pull-quote ("She does not simply lead…") bumps to `text-[19px]`, italic, with a left gold border accent (`border-l-2 border-[#C8A84E] pl-4`) instead of just color styling
- Add `letter-spacing: 0.01em` via inline style for subtle refinement

---

### 3. Contact Links — Verify & Fix
**Review of current state:**
- Phone rows use `href="tel:+13059429407"` and `href="tel:+17582855195"` ✓
- Email rows use `href="mailto:..."` ✓
- Website uses `href="https://mountkailashslu.com"` ✓
- WhatsApp quick action uses `href="https://wa.me/13059429407"` ✓

**One issue:** The `ContactRow` component has `target={href.startsWith("http") ? "_blank" : undefined}` — this correctly opens the website in a new tab. Tel and mailto links do NOT get `target="_blank"` (correct). These are already properly wired.

**No code change needed here** — all contact links already route correctly.

---

### 4. WhatsApp — Business Number
**Current:** Both the quick-action button and the bottom CTA WhatsApp button point to `wa.me/13059429407` (US number).

**Fix:** Change WhatsApp links to use the business's primary WhatsApp number `+1 (305) 942-9407` — this is already the US/main number, so it's already correct. No change needed.

---

### 5. Share Card Button — Color + Full Share Sheet
**Problem:** The "Share Card" button is currently a plain border outline with no color — it blends in and doesn't draw attention.

**Fix — Color the Share Card button:**
- Replace the colorless bordered style with a warm gold gradient: `background: linear-gradient(135deg, #C8A84E, #E67E22)` — white text, no border
- This makes it visually distinct and inviting

**Fix — Share functionality already uses Web Share API:**
The current `handleShare` already calls `navigator.share()` which opens the native device share sheet (iOS/Android share modal with all installed apps, AirDrop, Messages, etc.). If not available (desktop), it copies to clipboard. This is already correct.

**Improvement:** Add a more robust fallback chain:
```
1. navigator.share() → native share sheet (iOS/Android — opens WhatsApp, Messages, Email, etc.)
2. Fallback: navigator.clipboard.writeText(CARD_URL) → show "Link Copied!" feedback
```

---

### 6. Quick Action Bar — Call/Email/WhatsApp color treatment
All three already have correct `href` values. We will ensure the icon background pill gets a subtle colored tint to reinforce each action visually:
- Call: soft emerald tint behind phone icon `bg-emerald-500/10`
- Email: soft gold tint `bg-[#C8A84E]/10`
- WhatsApp: soft green tint `bg-green-500/10`
- Share: soft orange tint `bg-[#E67E22]/10`

---

## Summary of File Changes

**`src/pages/GoddessCard.tsx`** — single file edit covering:

1. **`CARD_URL` constant** — hardcode published URL, replace `pageUrl` references
2. **`handleShare`** — use `CARD_URL` instead of `window.location.href`
3. **QR Lightbox state** — add `qrLightboxOpen` state + a `QRLightbox` component that renders full-screen with a 280px QR
4. **QR section** — wrap QR display in a clickable button → opens QR lightbox; QR `value` uses `CARD_URL`
5. **Bio section** — refined font sizing, weight, leading, pull-quote border treatment
6. **Share Card CTA button** — replace outline style with gold/orange gradient + white text
7. **Quick Action icons** — add colored background tints to icon containers

No new files, no new dependencies, no routing changes needed.

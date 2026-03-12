

## Plan: Organic Green Color System Overhaul

This is a comprehensive theme token update — replacing the current warm cream/forest palette with the specified organic green tones while maintaining WCAG AA compliance.

### What Changes

**1. Update CSS custom properties in `src/index.css`**

Replace the `:root` (light) and `.dark` site-wide tokens with the new green palette:

- **Light mode tokens:**
  - `--site-bg-primary`: `#F5F8F5` (Mint Cream)
  - `--site-bg-secondary`: `#E8F0E9` (Pale Sage)
  - `--site-bg-card`: `#FFFFFF`
  - `--site-bg-deep`: `#E8F0E9`
  - `--site-text-primary`: `#1A1A1A`
  - `--site-text-secondary`: `#4A5D4F` (Muted Forest)
  - `--site-gold` → `--site-accent`: `#2D5A3F` (Deep Forest Green) — replaces gold as primary accent
  - `--site-border`: `#7D9B76`
  - `--site-border-subtle`: `rgba(125,155,118,0.15)`
  - `--site-nav-bg`: `rgba(245,248,245,0.95)`
  - `--site-footer-bg`: `#2D5A3F`
  - `--site-footer-text`: `#E8F0E9`
  - `--site-footer-muted`: `#A8C4A0`

- **Dark mode tokens (`.dark`):**
  - `--site-bg-primary`: `#0F1A15` (Near-Black Green)
  - `--site-bg-secondary`: `#1A2F24` (Deep Hunter)
  - `--site-bg-card`: `#1A2F24`
  - `--site-text-primary`: `#F5F5F0`
  - `--site-text-secondary`: `#B8C4B8` (Sage Gray)
  - `--site-accent`: `#4A8B6F`
  - `--site-border`: `#4A8B6F`
  - `--site-nav-bg`: `rgba(26,47,36,0.95)`
  - `--site-footer-bg`: `#0F1A15`
  - `--site-footer-text`: `#B8C4B8`

- Update Tailwind HSL variables (`--primary`, `--background`, `--foreground`, etc.) to match:
  - `:root` `--background`: HSL of `#F5F8F5` (~120 14% 96%)
  - `:root` `--primary`: HSL of `#2D5A3F` (~150 33% 26%)
  - `.dark` `--background`: HSL of `#0F1A15` (~150 26% 8%)
  - `.dark` `--primary`: HSL of `#4A8B6F` (~150 30% 42%)

- Update extended palette variables (`--forest`, `--sage`, `--gold`, etc.) to align with new greens
- Update `--success`, `--warning`, `--destructive` to specified status colors
- Update focus-visible outline from `#2e6e2e` to `#7D9B76`
- Update form focus outline from gold to `#2D5A3F`

**2. Update `src/styles/mkrc-theme.css`**

Align the MKRC scoped theme variables with the new green palette (replacing gold accents with green accents where appropriate).

**3. Component-level updates**

Scan and update hardcoded color values in key components:
- `StoreHeader.tsx` — nav background references
- `HomepageFooter.tsx`, `MKRCFooter.tsx`, `UnifiedFooter.tsx` — footer colors
- `StoreHero.tsx`, `ShopHero.tsx` — hero overlay colors
- Any component using hardcoded `#BC8A5F`, `#D4A373`, `#0F281E`, `#1B4332` hex values

**4. Button system alignment**

Update `src/components/ui/button.tsx` variants if they use hardcoded colors, ensuring:
- Primary: `#2D5A3F` bg / white text (light), `#4A8B6F` bg / `#0F1A15` text (dark)
- Secondary: `#7D9B76` border, transparent fill
- Ghost: no border, `#2D5A3F` text with `#E8F0E9` hover bg

### Technical Notes

- The SkyToggle (next-themes) drives `.dark` class — no changes needed to toggle logic
- The MKRC theme (`data-mkrc-theme`) is scoped separately and will be aligned but not merged
- All changes are CSS token-level; component structure stays intact
- Gold accent (`#D4A373`/`#BC8A5F`) is being replaced with green primary — this is the biggest visual shift

### Files to modify
- `src/index.css` (primary — all token definitions)
- `src/styles/mkrc-theme.css` (MKRC scoped tokens)
- `tailwind.config.ts` (extended color aliases if needed)
- Components with hardcoded hex colors (search & replace pass)


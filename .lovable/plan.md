
# Coming Soon Banner Implementation

## Overview
Add a full-screen "Coming Soon" overlay that completely blocks access to the main website content on the published site. Visitors will see only the coming soon page until you're ready to launch.

---

## Implementation Approach

### Create Coming Soon Component
**File:** `src/components/ComingSoon.tsx` (new file)

A full-screen overlay component featuring:
- Full viewport coverage (`fixed inset-0 z-[9999]`)
- Brand logo and name
- "Coming Soon" headline with elegant typography
- Brief teaser message about the wellness offerings
- Optional email signup for launch notifications
- WhatsApp contact link for inquiries
- Background with subtle gradient matching brand colors

### Add Environment-Based Toggle
**File:** `src/App.tsx`

Add a simple flag at the top of the App component:
- `const COMING_SOON = true;` - Toggle to control visibility
- When `true`, render only the `ComingSoon` component
- When `false`, render the normal site

This approach:
- Completely hides all routes and navigation
- Easy to toggle off when ready to launch
- No complex logic needed

---

## Visual Design

### Layout
- Centered content with ample whitespace
- Logo at top
- Large "Coming Soon" headline
- Subheadline describing what's coming
- Contact/inquiry option

### Colors (matching brand)
- Background: Deep forest green gradient (`#1F3A2E` to `#0B1510`)
- Text: Cream/white for readability
- Accent: Gold (`#B28735`) for highlights

### Features
- Fully responsive (mobile-friendly)
- Works in both light and dark mode (uses fixed dark overlay)
- Accessible with proper contrast

---

## Technical Details

### Files to Create:
1. `src/components/ComingSoon.tsx`

### Files to Modify:
1. `src/App.tsx` - Add coming soon flag and conditional render

### Dependencies:
- None (uses existing lucide-react icons and Tailwind)

---

## Launch Process

When you're ready to go live:
1. Change `COMING_SOON = false` in App.tsx
2. The full website will be visible

Alternatively, I can use an environment variable approach if you prefer to control it without code changes.

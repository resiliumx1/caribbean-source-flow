
# Fix Plan: 6 Issues

## 1. Product Card Layout Fix (Desktop)

The product name uses `line-clamp-1` which truncates long names, and the "Add" button row is cramped. Changes to `ProductCard.tsx`:
- Change product name from `text-xl` to `text-lg` and use `line-clamp-2` instead of `line-clamp-1` so names wrap properly
- Change "Add to Cart" button text from "Add" to just the cart icon (icon-only button) on smaller cards, keeping layout compact
- Reduce padding from `p-5` to `p-4` in the content section

## 2. WhatsApp Widget -- Icon Only (All Pages)

The current `whatsapp-float` CSS class renders a pill-shaped button with text. The user wants just a small circular icon button.

**`src/index.css`:** Change `.whatsapp-float` to be a small 56x56 circle with just the icon, no text. Remove the `gap`, `px-5 py-3` padding and replace with fixed dimensions.

**`src/pages/TrinityHomepage.tsx` and `src/pages/Retreats.tsx`:** Remove the `<span>` text from the GoddessWhatsApp component -- only render the `<MessageCircle />` icon.

**`src/components/wholesale/WhatsAppButton.tsx` and `src/components/store/WhatsAppFloat.tsx`:** Same -- remove the text span, keep icon only.

## 3. Retreat Dates: Add Description + Icons

**Database migration:** Add `description TEXT` column to `retreat_dates` table.

**`AdminRetreatDates.tsx`:** Add a description textarea field to the add/edit form.

**`GroupRetreatsList.tsx`:** When a retreat date is clicked, show its description in the booking dialog. Add retreat-type icons (Users icon for group, User icon for solo) next to each date card.

**`RetreatCalendar.tsx`:** Show retreat type icons (User for solo, Users for group) in the type toggle buttons (already done). When a group date is selected in the pricing panel, display the description if available.

## 4. Compare Bar -- Clear/Dismiss Persists Across Pages

The issue: `CompareBar` uses `useState(false)` for `dismissed`, which resets on every page navigation. And `clearAll()` empties items but the compare bar disappears naturally (items.length === 0). The real problem is that when you click "Clear" it calls `clearAll()` which empties localStorage, but next reload the bar is gone anyway. The issue is when clicking the X dismiss button -- `dismissed` is local state and resets on navigation.

**Fix in `comparison-context.tsx`:** Add a `dismissed` boolean to the localStorage data. When user clicks dismiss or clear, set `dismissed: true` in storage. When items become empty (after clear), also mark dismissed. Only show the bar if items > 0 AND not dismissed. Reset dismissed when a new item is added.

**`CompareBar.tsx`:** Remove local `dismissed` state -- use `isDismissed` from context instead. Add `dismiss()` function to context.

## 5. Retreat Booking Dates Extended to 2030

**`RetreatCalendar.tsx`:** Currently there's no year limit on the calendar navigation. The solo booking already allows any future date. No code change needed for the calendar itself since it uses `addMonths`/`subMonths` with no upper bound.

**`AdminRetreatDates.tsx`:** Ensure the date inputs accept dates up to 2030. The HTML date inputs have no max constraint currently, so this already works. Add a note in the UI: "Schedule retreats through 2030".

## 6. Replace "2026 Group Retreat Dates" Section with "Coming Soon"

**`GroupRetreatsList.tsx`:** Replace the entire section content with a simple "Coming Soon" message. Keep the section wrapper but show a centered card with a calendar icon, "Group Retreat Dates -- Coming Soon" heading, a brief message, and a WhatsApp link to inquire. Remove all the date listing and booking modal code.

---

## Technical Summary

### Database Migration
- `retreat_dates` -- add `description TEXT` column

### Modified Files (8 files)
| File | Change |
|------|--------|
| `ProductCard.tsx` | Smaller text, icon-only cart button, tighter spacing |
| `index.css` | WhatsApp float = small circle, icon only |
| `TrinityHomepage.tsx` | Remove text from WhatsApp button |
| `Retreats.tsx` | Remove text from WhatsApp button |
| `WhatsAppButton.tsx` | Remove text span |
| `WhatsAppFloat.tsx` | Remove text span |
| `GroupRetreatsList.tsx` | Replace with "Coming Soon" card |
| `comparison-context.tsx` | Persist dismissed state in localStorage |
| `CompareBar.tsx` | Use context dismissed state instead of local state |
| `AdminRetreatDates.tsx` | Add description field, note about 2030 |

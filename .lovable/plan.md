

# Fix Plan: Retreat Patron Count + Star Rating Display

## 1. Solo Retreat -- Add Patron/Guest Count

**`RetreatCalendar.tsx`:**
- The `guestCount` state already exists but is only shown for group retreats (line 371: `selectedType === "group"`)
- Show the guest count selector for BOTH solo and group retreats by removing the `selectedType === "group"` condition
- Update the solo pricing calculation to multiply by `guestCount`:
  - Change `total: calc.total` to `total: calc.total * guestCount`
  - Change `deposit: calc.total / 2` to `deposit: (calc.total * guestCount) / 2`
- Update the WhatsApp message to include guest count for solo retreats too
- Change the label from "Guests" to "Patrons" for both retreat types

## 2. Fix Star Rating Display

**`ProductCard.tsx`:**
The problem is the formula can produce 4.5 which renders as 4 filled + 1 half-opacity star (looks like ~4 stars). Two changes:

- **Raise the floor to 4.7:** Change the formula from `4.5 + (... % 6) / 10` to `4.7 + (... % 4) / 10` -- this produces ratings of 4.7, 4.8, 4.9, or 5.0 only
- **Fix the half-star rendering:** Change `fill-gold/50 text-gold` to `fill-gold text-gold` so partial stars appear fully gold (since all values are 4.7+ the 5th star should look nearly full, not faint)
- This ensures every product visually shows either 4 full + 1 bright partial star, or 5 full stars

## Technical Details

### Files Modified: 2

| File | Change |
|------|--------|
| `RetreatCalendar.tsx` | Remove group-only condition on guest count, multiply solo pricing by guestCount, update WhatsApp message |
| `ProductCard.tsx` | Raise minimum rating to 4.7, fix half-star opacity to full gold fill |

### No database changes needed


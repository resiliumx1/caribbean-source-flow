

## Remove Coming Soon Overlay

A single-line change in `src/App.tsx` to disable the Coming Soon gate and reveal the full website.

### Change
- Set `COMING_SOON = false` on line 26 of `src/App.tsx`

This will immediately expose all routes (Homepage, Shop, Retreats, Wholesale, etc.) and the site navigation header.


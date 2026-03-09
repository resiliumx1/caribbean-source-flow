
## Summary
The gate entrance currently has:
1. **Two extra half-wreaths** positioned on each gate panel that rotate — these need to be removed
2. **Botanical art (GateArtLeft/GateArtRight)** showing a vine/plant on the left gate and a bottle on the right gate — these need to be removed

The only wreath/rotating element should be the **CenterWreath** behind the star seal in the center.

## Changes

### 1. Remove half-wreaths from gate panels
**File:** `src/components/gate-entrance/GateEntrance.tsx`
- Delete lines 134-136 (wreath-half on left gate)
- Delete lines 144-146 (wreath-half on right gate)

### 2. Remove gate art (bottle + plant)
**File:** `src/components/gate-entrance/GateEntrance.tsx`
- Delete lines 137-139 (GateArtLeft on left gate)
- Delete lines 147-149 (GateArtRight on right gate)

After these changes, the gate divs will be empty, showing only the green gradient background with the gold seam line.

### 3. Clean up unused imports
- Remove the `GateArtLeft, GateArtRight` import from line 2
- Remove the `GateHalfWreath` function (lines 206-323) since it's no longer used

### Result
- Gates become clean solid green panels with just the glowing center seam
- Only one rotating wreath remains: the `CenterWreath` behind the star seal in the center

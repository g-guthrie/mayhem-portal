

# Plan: Reflow Layout on Room Open, Fix Mode Button Overflow, Normalize Border Radii

## 1. Layout Reflow When Room Is Open

**Current:** 3-column grid always — PlayCard | QuickJoin | RoomCard. When room opens, the room card is cramped.

**New behavior (when `room.isInRoom`):**
- Switch from `grid-cols-3` to a 2-column layout:
  - **Left column** (narrow, ~1fr): Stack PlayCard and QuickJoinCard vertically. Neither grows — they keep their natural size.
  - **Right column** (wider, ~2fr): RoomCardContent fills both card heights, giving room for team selection, player roster, etc.
- When `!room.isInRoom`: keep current 3-column grid as-is.

```text
── room closed ──────────────────
| PlayCard | QuickJoin | CreateBtn |
─────────────────────────────────

── room open ────────────────────
| PlayCard    |                  |
|─────────────|   Room Panel     |
| QuickJoin   |   (full height)  |
─────────────────────────────────
```

**Implementation** in `HomeScreen.tsx` layout section (~line 586-603):
- Conditional grid: `room.isInRoom ? 'grid-cols-[1fr_2fr]' : 'grid-cols-3'`
- When room is open, left column wraps PlayCard + QuickJoinCard in a `flex flex-col gap-3`, right column is RoomCardContent.

## 2. Fix Mode Button Overflow

The `game-modes-toggle-btn` (line 159-166) contains an icon + full mode label + chevron, which overflows its container on narrow widths.

Fix:
- Add `overflow-hidden text-ellipsis whitespace-nowrap` to the button or its text span.
- Add `min-w-0` to allow flex shrinking.
- Alternatively, truncate the label on small screens with `max-w-[120px] truncate` on the span.

## 3. Normalize Border Radii Across the Menu

Current inconsistency: mix of `!rounded-xl`, `!rounded-lg`, `!rounded-md`, `rounded-full` (pill-btn default), and `rounded-lg`. Need a single consistent radius strategy.

**Rule:** All interactive elements (buttons, inputs, cards) use `rounded-xl` consistently. Remove the `rounded-full` default from `pill-btn` in CSS and set it to `rounded-xl` instead. Then remove all the `!rounded-*` overrides scattered throughout components.

**Changes in `index.css`:**
- `.pill-btn`: change `rounded-full` → `rounded-xl`
- `.launch-btn`: change `rounded-full` → `rounded-xl`

**Changes in `HomeScreen.tsx`:**
- Remove all `!rounded-xl`, `!rounded-lg`, `!rounded-md` overrides from buttons/inputs since the base classes will now be consistent.

**Changes in `LoadoutBand.tsx`:**
- Same — remove `!rounded-xl` overrides from pill-btn usage.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/menu/screens/HomeScreen.tsx` | Conditional 2-col layout when room open, fix mode btn overflow, remove radius overrides |
| `src/index.css` | Normalize `pill-btn` and `launch-btn` to `rounded-xl` |
| `src/components/menu/LoadoutBand.tsx` | Remove `!rounded-xl` overrides |


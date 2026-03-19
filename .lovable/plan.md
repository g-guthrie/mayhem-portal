

## Plan: Fix Menu Shell Sizing + Teams Inner Card + Inline Room Actions

### Problem Summary
1. The menu shell grows unbounded — it should shrink-to-fit content but cap at a max height and scroll internally
2. The teams section needs its own scrollable inner card wrapper
3. The bottom room actions (player name input, invite, invite party, start match) wrap to 2 lines — they should all be inline on 1 line

### Changes

#### 1. Menu shell max-height cap (`src/pages/Index.tsx`)
- Replace `max-h-full` on `#menu-shell` with a specific max like `max-h-[85vh]` so it shrinks to content but caps before filling the viewport
- Ensure `overflow-hidden` stays on the shell and `overflow-y-auto` on `#menu-body`

#### 2. Teams scrollable inner card (`src/components/menu/screens/HomeScreen.tsx`)
- Wrap the "TEAMS" heading + team grid in a new `glass-card` (or styled inner card div) with `max-h-[300px] overflow-y-auto` so when teams grow large, only that section scrolls
- Same treatment for FFA player list

#### 3. Room actions all inline (`src/components/menu/screens/HomeScreen.tsx`)
- Merge the invite input row (line 682-701) and the room actions row (line 705-724) into a single `flex` row with `flex-wrap: nowrap`
- Make the input narrower (e.g. `w-32` or `max-w-[120px]`), shrink button text, and use `whitespace-nowrap` on buttons
- All 4 elements (input, INVITE btn, INVITE PARTY btn, START MATCH btn) sit on one line

### Technical Details

**Index.tsx line 49:** Change `max-h-full` → `max-h-[85vh]`

**HomeScreen.tsx lines 566-656 (teams section):** Wrap in:
```tsx
<div className="rounded-xl border border-border/20 bg-muted/5 p-2 max-h-[300px] overflow-y-auto">
  {/* TEAMS label + grid */}
</div>
```

**HomeScreen.tsx lines 680-724 (invite + actions):** Combine into single flex row:
```tsx
<div className="flex items-center gap-1.5">
  <input className="glass-input !py-1.5 !px-2 !text-xs min-w-0 w-28" ... />
  <button ...>INVITE</button>
  <button ...>INVITE PARTY</button>
  <button className="launch-btn ...">START MATCH</button>
</div>
```


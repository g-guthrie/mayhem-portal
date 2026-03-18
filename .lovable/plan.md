

# Plan: Revert Play Button, Restyle Loadout as Glass Cards, Fix Create Room Flow

## 3 Changes

### 1. Revert Play Button Text
In `HomeScreen.tsx`, change the play button back to just `PLAY` (remove the dynamic mode name that's making it wide/ugly). Keep the "CHANGE MODE" toggle button as-is since it already shows the current mode icon.

### 2. Restyle LoadoutBand as 3 Glass Cards
Currently the loadout footer has a flat `bg-background/40` background with all 3 sections (Arsenal, Tactical, Abilities) sitting on the same dark surface. Instead, each section should be its own `glass-card` with rounded edges and the same translucent style as the top row cards. Each card should be individually scrollable (via `overflow-y-auto` with a max-height) so they handle future inventory growth.

**LoadoutBand.tsx changes:**
- Remove the `bg-background/40` from the footer wrapper; make it transparent/minimal.
- Wrap each of the 3 panels (weapon, throwable, ability) in its own `glass-card` container with `p-3`, matching the top panels' dimensions and rounded edges.
- Add `overflow-y-auto max-h-[200px]` (or similar) to the item grids inside each card so they scroll when items overflow.
- Keep the collapse/expand toggle and collapsed summary row as-is.

### 3. Fix Create Room Flow — Inline in Third Panel
Current problem: clicking "Create Room" sets `roomExpanded = true` which spawns a whole new bottom row panel. Instead, the room setup should happen **inline in the third top-row card** (the one that currently just has the "CREATE ROOM" button).

**HomeScreen.tsx changes:**

**Solo/compact layout (3 columns):**
- Column 1: PlayCard (unchanged)
- Column 2: QuickJoinCard (unchanged)  
- Column 3: Currently just a "CREATE ROOM" button. After clicking, this same card expands in-place to show the room setup UI:
  - Room code display + copy button
  - Mode selector (FFA/TDM/LMS)
  - Team count selector (if applicable)
  - Lock/unlock toggle
  - Player roster (scrollable)
  - Invite input
  - "START MATCH" button (for host) / "READY UP" (for non-host)
  - The card gains `overflow-y-auto` so it scrolls if content overflows

- Remove the `roomExpanded` state and the entire bottom-row expansion logic. The room panel lives inside the third column card, toggled by `room.isInRoom`.
- When `room.isInRoom` is false: show the "CREATE ROOM" button.
- When `room.isInRoom` is true: show the full room setup panel inline.

**Expanded layout (when social panel is visible):**
- Same principle — the room panel replaces the Create Room button in the grid, not in a separate row.

This fixes the flow: Create Room -> get room code -> configure mode/teams -> invite players -> Start Match (sequential, all in one place).

### Files

| File | Change |
|------|--------|
| `src/components/menu/screens/HomeScreen.tsx` | Revert play button to `PLAY`, remove `roomExpanded` state, inline RoomPanel into the third grid column |
| `src/components/menu/LoadoutBand.tsx` | Wrap each of the 3 sections in its own `glass-card`, add scroll support to item grids |


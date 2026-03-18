

# Plan: Pause Menu Redesign + Party Cap + Stats

## Changes

### 1. Party cap → 16
In `useRoom.tsx`, change `MAX_PLAYERS` from 8 to 16.

### 2. Add mock match stats to `useRoom.tsx`
Add a `matchStats` object to room state with mock data: `{ kills: 7, deaths: 3, assists: 4 }`. Expose via context.

### 3. Redesign `PauseMenu.tsx` — stats-focused layout
Remove the current 4-card vertical layout. New structure:

```text
┌──────────────────────────────────┐
│  PAUSED          [Invite ___] [→]│  ← header row: title + inline invite input
│──────────────────────────────────│
│                                  │
│   KILLS    DEATHS    K/D RATIO   │  ← 3 stat cards replacing the old buttons
│    7         3         2.33      │
│                                  │
│──────────────────────────────────│
│  [RESUME]  [SETTINGS]  [LEAVE]   │  ← bottom action row (compact)
└──────────────────────────────────┘
```

- **Header**: "PAUSED" title on the left. Invite friend input + send button inline on the right (replaces the old separate invite sub-view).
- **Body**: 3 glass stat cards in a row — Kills, Deaths, K/D Ratio. Large numbers, orbitron font.
- **Footer**: 3 compact buttons — Resume, Settings, Leave Match. Settings and Leave still open their respective sub-views.
- Remove the dedicated "Invite Friend" card from the main menu buttons.

### 4. Files

| File | Change |
|------|--------|
| `src/hooks/useRoom.tsx` | `MAX_PLAYERS = 16`, add `matchStats` to state and context |
| `src/components/menu/PauseMenu.tsx` | Full redesign: header with inline invite, stat cards body, compact action footer |


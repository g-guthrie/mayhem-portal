

# Plan: Fix Remaining Corner Cases + Post-Match Screen

## Overview
Fix the stubbed leadership transfer, add nav reset on leave, enforce room lock on join, and build a post-match results screen with winner celebration and "Continue" routing.

---

## 1. Fix Leadership Transfer in `leaveRoom` (`useRoom.tsx`)
The current `leaveRoom` has a stubbed comment but always wipes state. Fix it:
- If `isCreator` and `players.length > 1`: remove self, set next player's `isCreator = true`, update teams, keep room alive. Only reset `isInRoom`/`isCreator` for the leaving user.
- If last player: dissolve room entirely (current behavior).

## 2. Nav Reset on Leave (`useRoom.tsx`)
`leaveRoom` currently doesn't reset navigation. Two options:
- **Option A**: Accept a `resetNav` callback in `leaveRoom` (passed from component level).
- **Option B** (simpler): Handle it at the component level — in `MatchOverlay` and `RoomScreen`, call `menuNav.reset()` after `leaveRoom()`.

Going with **Option B** — no context coupling needed.

## 3. Enforce Room Lock on Join (`useRoom.tsx`)
`joinRoom` currently ignores `isLocked`. Add a check: if room is locked, show a toast and return early.

## 4. Add Match End State + Post-Match Screen

### State changes (`useRoom.tsx`)
- Add `'post-match'` to the `matchState` union type.
- Add `endMatch()` action that transitions from `in-match` → `post-match`.
- Add `matchResult` state: `{ isWinner: boolean; placement: number }` (mock data).
- Add `returnToLobby()` — resets match state to `idle`, keeps room intact if `isInRoom`.
- Add `returnToMenu()` — calls `leaveRoom()` entirely.
- Auto-trigger `endMatch()` after ~15s of `in-match` for demo purposes.

### New component: `PostMatchScreen.tsx`
Rendered by `MatchOverlay` when `matchState === 'post-match'`. Two variants:

**Winner view:**
```text
┌──────────────────────────┐
│       🏆 VICTORY          │
│                           │
│   KILLS  DEATHS  K/D     │
│    7       3     2.33    │
│                           │
│  [BACK TO LOBBY]  [MENU] │
└──────────────────────────┘
```

**Standard view (non-winner / FFA placement):**
```text
┌──────────────────────────┐
│    MATCH COMPLETE         │
│    #2 of 8                │
│                           │
│   KILLS  DEATHS  K/D     │
│    7       3     2.33    │
│                           │
│  [BACK TO LOBBY]  [MENU] │
└──────────────────────────┘
```

- Winner gets a glowing primary-colored celebration header with a trophy icon.
- Stats displayed in the same 3-column glass card layout as the pause menu.
- Two buttons:
  - **BACK TO LOBBY** — if `isInRoom`, returns to room screen with match state reset to `idle`.
  - **MAIN MENU** — leaves room entirely, resets nav to home.

## 5. Files to Create/Modify

| File | Change |
|------|--------|
| `src/hooks/useRoom.tsx` | Fix `leaveRoom` leadership transfer, add `isLocked` check in

<lov-plan>

# Plan: Fix Remaining Corner Cases + Post-Match Screen

## Overview
Fix stubbed leadership transfer, add nav reset on leave, enforce room lock, and build a post-match results screen with winner celebration.

---

## 1. Fix Leadership Transfer (`useRoom.tsx`)
Current `leaveRoom` has a stubbed comment but always wipes state. Fix:
- If `isCreator` and `players.length > 1`: remove self, promote next player to creator, keep room alive.
- If last player: dissolve room entirely.

## 2. Nav Reset on Leave
Handle at the component level — in `MatchOverlay` and `PauseMenu`, call `menuNav.reset()` after `leaveRoom()`. No context coupling needed.

## 3. Enforce Room Lock (`useRoom.tsx`)
`joinRoom` currently ignores `isLocked`. Add check: if locked, show toast and return early.

## 4. Post-Match State + Screen

### State changes (`useRoom.tsx`)
- Add `'post-match'` to `matchState` union.
- Add `matchResult: { isWinner: boolean; placement: number }` state (mock).
- Add `endMatch()` — transitions `in-match` → `post-match`.
- Add `returnToLobby()` — resets match to `idle`, keeps room intact.
- Add `returnToMenu()` — leaves room entirely.
- Auto-trigger `endMatch()` after ~15s of `in-match` for demo.

### New component: `PostMatchScreen.tsx`
Rendered by `MatchOverlay` when `matchState === 'post-match'`:

**Winner variant:** Trophy icon, glowing "VICTORY" header, primary color treatment.
**Standard variant:** "MATCH COMPLETE" with placement (#2 of 8).

Both show:
- 3-column stat cards (Kills, Deaths, K/D) — same glass style as pause menu.
- Two buttons: **BACK TO LOBBY** (returns to room, idle state) and **MAIN MENU** (leaves room, resets nav to home).

## 5. Files

| File | Change |
|------|--------|
| `src/hooks/useRoom.tsx` | Fix `leaveRoom` leadership transfer, `isLocked` check in `joinRoom`, add `post-match` state + `endMatch`/`returnToLobby`/`returnToMenu`, auto-end timer |
| `src/components/menu/PostMatchScreen.tsx` | **New** — winner/standard variants, stats, two continue buttons |
| `src/components/menu/MatchOverlay.tsx` | Render `PostMatchScreen` for `post-match` state, call `menuNav.reset()` on leave |
| `src/components/menu/PauseMenu.tsx` | Call `menuNav.reset()` on leave confirm |


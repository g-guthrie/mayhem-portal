

# Plan: Corner Cases, State Handoffs, and In-Match Pause Menu

## Overview

Address remaining corner cases in the room/match flow and build a stripped-down pause menu for in-match state. Party and room remain separate concepts (option 1).

---

## 1. Corner Case Handling in `useRoom.tsx`

### Creator leaves → Leadership transfer
- When the creator calls `leaveRoom`, instead of dissolving the room, pass `isCreator` to the next player in the `players` array.
- If the last player leaves, the room dissolves.
- Add a `transferLeadership` internal function.

### Disconnect/rejoin (mock)
- Add a `disconnectedPlayers` state (Map of playerId → timestamp).
- Mock: when a non-creator bot "disconnects" (we can add a kick button or simulate it), they get a 60s grace window shown in the UI as a dimmed row with a countdown badge.
- After 60s, auto-remove. No real networking needed — just the UI pattern.

### Full room / max players
- Add a `MAX_PLAYERS` constant (8).
- `invitePlayer` and `joinRoom` check against this cap. If full, surface a toast or inline message.
- Locked room: `joinRoom` by code is blocked; only direct invites from members work.

### Room → Home transition on leave
- `leaveRoom` should also call `menuNav.reset()` to snap back to home if the user was on the room view. Pass `reset` from `useMenuNav` into the room context or handle it at the component level.

### Mid-match join
- For now, players invited mid-match join immediately (no spectate). Add them to the smallest team or unassigned pool.
- The match overlay shows a brief "X joined" toast.

---

## 2. In-Match Pause Menu

### New component: `PauseMenu.tsx`
A minimal overlay that appears when `matchState === 'in-match'` and the user presses ESC or taps a pause button. Four items only:

```text
┌─────────────────────┐
│    ≡ PAUSED          │
│                      │
│   [ RESUME       ]   │
│   [ INVITE FRIEND ]  │
│   [ SETTINGS     ]   │
│   [ LEAVE MATCH  ]   │
│                      │
└─────────────────────┘
```

- **Resume**: Closes the pause overlay, returns to the "MATCH IN PROGRESS" view.
- **Invite Friend**: Opens a compact invite input (player name/ID). Uses `room.invitePlayer()` for mid-match invites.
- **Settings**: Opens the existing `SettingsScreen` inline within the pause menu (or navigates to it — but since we're in an overlay, embed a simplified version with audio/video/controls toggles).
- **Leave Match**: Confirmation dialog → calls `leaveRoom()`, transitions back to home.

### State changes
- Add `isPaused` boolean to `useRoom` (or local state in the overlay component).
- The existing `MatchOverlay.tsx` "MATCH IN PROGRESS" screen gets a pause/menu button.
- Keyboard listener for ESC to toggle pause.

### Implementation approach
- Modify `MatchOverlay.tsx` to include a pause button on the "in-match" state screen.
- Create `PauseMenu.tsx` as a sub-overlay rendered within `MatchOverlay` when paused.
- The pause menu does NOT show: social tab, loadout, manual, or full nav header. Just the four actions.
- Leave Match shows a confirmation step: "Are you sure? You won't be able to rejoin." with LEAVE / CANCEL buttons.

---

## 3. Match Transition Cleanup

### Party → Match flow
- When starting a match from a party (no room), auto-create a temporary room with party members, then trigger the same ready-check → countdown flow.
- Add a `startPartyMatch()` action to `useRoom` that takes the party member list, creates an ephemeral room, and begins the ready-check.

### Non-creator "Ready Up" button
- Currently the bottom bar shows "READY UP" for non-creators. This should call `toggleReady(actorId)` and toggle between "READY UP" / "READY ✓" states visually before the match overlay appears.
- The match overlay ready-check already handles this; ensure the pre-overlay button state is consistent.

---

## 4. Files to Create/Modify

| File | Action |
|------|--------|
| `src/hooks/useRoom.tsx` | Add leadership transfer, max players, disconnect tracking, `isPaused`, `startPartyMatch` |
| `src/components/menu/MatchOverlay.tsx` | Add pause button to in-match view, render PauseMenu when paused, ESC listener |
| `src/components/menu/PauseMenu.tsx` | **New** — Resume, Invite Friend, Settings, Leave Match (with confirm) |
| `src/components/menu/screens/HomeScreen.tsx` | Handle leave-room → reset nav, wire up party-to-match flow, max-player feedback |

---

## 5. Summary of Decisions

- **Creator leaves** → leadership transfers to next player
- **Disconnect** → 60s grace period (mock), then auto-kick
- **Max 8 players** per room
- **Mid-match joins** → immediate, no spectate
- **Pause menu** → 4 items only: Resume, Invite Friend, Settings, Leave Match
- **Party → Match** → auto-creates ephemeral room, same ready-check flow


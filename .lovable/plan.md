

## Home Screen Redesign: Compact Two-Column Layout

### Problem
1. **Play button hover bug**: `launch-btn:hover` uses `transform: scale(1.05)` which makes it grow into the adjacent chevron button.
2. **Hero card too large**: The game mode selection card takes excessive vertical space for what it does.
3. **Quick Join card spans full width** and is oversized — wastes horizontal space on desktop.
4. **Social and Room are separate screens** navigated to via small buttons, but the user wants their functionality visible on the home screen directly.

### Solution: Two-Column Home Layout

Restructure HomeScreen into a **2-column grid** on desktop (single column on mobile):

```text
┌─────────────────────┬──────────────────────┐
│  PLAY CARD (compact)│  QUICK JOIN (compact) │
│  [PLAY FFA ▼]       │  [Friend ID] [+] [→] │
│  (mode grid if open)│  [Room Code] [→]      │
├─────────────────────┴──────────────────────┤
│  SOCIAL (inline)        │  PRIVATE ROOM      │
│  Party members          │  Code: 7F3A [copy] │
│  Friends list           │  Mode: FFA/TDM/LMS │
│  Invite banner          │  Lock/Randomize     │
│                         │  Team roster (d&d)  │
│                         │  [INVITE] [START]   │
└─────────────────────────┴────────────────────┘
```

### Changes

**1. `src/components/menu/screens/HomeScreen.tsx`** — Complete rewrite:
- **Top row** (`grid grid-cols-2 gap-3`): Left = compact play card (smaller title, tighter padding, no "READY TO DEPLOY" kicker), Right = compact quick join card.
- **Bottom row** (`grid grid-cols-2 gap-3 flex-1`): Left = Social panel (inline party + friends list from SocialScreen), Right = Room panel (inline room config + team drag-and-drop from RoomScreen).
- Import and inline the content currently in `SocialScreen` and `RoomScreen` directly, so everything lives on one screen.
- Remove the "Quick Actions Row" buttons that navigated to social/room screens.

**2. `src/index.css`** — Fix the hover bug:
- Change `.launch-btn:hover` from `transform: scale(1.05)` to `filter: brightness(1.15)` only (remove the scale). This prevents encroachment on adjacent elements.

**3. Compact Play Card specifics:**
- Remove the large `MAYHEM` title and `READY TO DEPLOY` kicker — just show the play button and mode toggle.
- Reduce padding to `p-3 sm:p-4`.
- Mode grid appears below inline when toggled.

**4. Social panel (left bottom):**
- Shows invite banner (`#social-direct-invite-banner`), friend ID input row, party members, friends list — all from current SocialScreen content.
- Scrollable within its card via `overflow-y-auto`.

**5. Room panel (right bottom):**
- Shows room code + copy, mode selector (FFA/TDM/LMS), team count, lock/randomize, drag-and-drop team roster, and start/invite buttons — all from current RoomScreen content.
- Scrollable within its card.

**6. Mobile behavior** (`< 640px`):
- Grid falls to single column. Cards stack vertically. Menu body scrolls.

This eliminates the need to navigate to separate Social and Room screens for core functionality — everything is accessible from the home screen in a space-efficient layout.


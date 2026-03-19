

## Plan: Add INVITE pill to Party header, remove top-level invite input

### What Changes

1. **Remove** the player ID input + INVITE button from the action row (lines 725-745). Keep INVITE PARTY and START MATCH buttons.

2. **Add an INVITE pill** next to LEAVE in the Party section header (line 776-784), mirroring how ADD works for Friends:
   - Small pill with `UserPlus` icon + "INVITE" text
   - Clicking toggles `invitePartyOpen` state
   - When open, shows an inline input row (same pattern as `addFriendOpen`) below the header with a player ID input + SEND button
   - SEND invites the player to the room via `room.invitePlayer()`, clears input, closes the row

3. **New state**: `invitePartyOpen` boolean, reuse existing `inviteInput` for the input value.

### Changes in `HomeScreen.tsx`

- **Lines 724-745**: Remove the `<input>` and INVITE `<button>` (keep the `<>` wrapper content for INVITE PARTY and START MATCH)
- **Lines 771-784**: Add INVITE pill next to LEAVE in the party header's button group
- **After line 785**: Insert the collapsible invite input row (same animation pattern as friends ADD)


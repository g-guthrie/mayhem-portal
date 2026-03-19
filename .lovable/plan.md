

## Plan: Merge Friends & Party into Private Room Card

### What Changes

When in a room, the separate Social Panel disappears entirely. Instead, two side-by-side sub-panels appear **below** the action pill row inside the room card:

- **Left: PARTY** — scrollable list of party members
- **Right: FRIENDS** — scrollable list with ADD/REMOVE controls

Each sub-panel is a borderless container with its own `max-h` and `overflow-y-auto`.

### Party Member Actions (up to 4 inline pills per row)

For each non-leader party member, show these action pills in order:
1. **Crown** (make leader) — only if you are the current leader
2. **Add Friend** — `UserPlus` pill, only if that person is NOT already in your friends list
3. **Invite to Room** — green `UserPlus` pill, only if that person is NOT already in the room's player list
4. **Remove from Party** — red `UserMinus` pill

### Changes in `HomeScreen.tsx`

**1. Add Friends+Party sub-panels inside `RoomCardContent`** (after the action row, lines ~784-825)

Insert a new section below the START MATCH row:

```
{/* Sub-panels: Party + Friends */}
{isLoggedIn && (
  <div className="grid grid-cols-2 gap-2.5 mt-1">
    {/* Party panel */}
    <div className="flex flex-col gap-1.5 min-h-0">
      <div className="flex items-center justify-between">
        <span className="section-label ...">PARTY</span>
        <button ... LEAVE />
      </div>
      <div className="flex flex-col gap-0.5 max-h-[160px] overflow-y-auto">
        {partyMembers.map(m => (
          // Row with: name, leader badge, then action pills:
          // Crown | AddFriend (if not in friends) | InviteToRoom (if not in room) | Remove
        ))}
      </div>
    </div>

    {/* Friends panel */}
    <div className="flex flex-col gap-1.5 min-h-0">
      <div className="flex items-center justify-between">
        <span className="section-label ...">FRIENDS</span>
        <div>ADD | REMOVE pills</div>
      </div>
      {addFriendOpen && <input row />}
      <div className="flex flex-col gap-0.5 max-h-[160px] overflow-y-auto">
        {friends list with existing remove confirmation logic}
      </div>
    </div>
  </div>
)}
```

**2. Remove the separate Party column from the room's 2-column grid** (lines 600-781)

Remove the right-side party panel (`!isSolo && <div>...PARTY...</div>`) from the grid. The room roster becomes full-width (remove the `grid-cols-[1fr,200px]` conditional).

**3. Conditionally hide SocialPanel when in a room** (lines 1048-1055)

Change `showSocialPanel` condition: only show when logged in AND **not** in a room. The social content is now inside the room card.

**4. Party member action pills logic**

For each non-leader member `m`:
- `isInFriendsList = friends.some(f => f.name === m.name)` — hide "Add Friend" if true
- `isInRoom = room.players.some(p => p.name === m.name)` — hide "Invite to Room" if true

### Technical Details

- Both sub-panels use `max-h-[160px] overflow-y-auto` for independent scrolling
- No glass-card styling on sub-panels — they're "invisible" containers within the room card
- The `socialPanelRef` click-outside handler remains for the add/remove friend interactions, but ref moves to the friends sub-panel inside the room card
- When not in a room, the existing SocialPanel renders below as before (no change)


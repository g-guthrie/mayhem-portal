

## Plan: Replace Persistent Game Mode Pills with Inline Dropdown

### What Changes

Remove the always-visible 3 game mode pills (FFA/TDM/LMS) and team count pills from the private room card. Instead, add a single compact pill inline with the "PRIVATE ROOM" title and "HOST" badge that shows the current mode icon + label + chevron. Clicking it opens a small dropdown with the 3 mode options (+ team count if applicable). Clicking a mode selects it and closes. Clicking anywhere outside closes it.

### Changes in `src/components/menu/screens/HomeScreen.tsx`

**1. Add state for mode dropdown**
- Add `const [roomModeDropdownOpen, setRoomModeDropdownOpen] = useState(false)` alongside existing state
- Add a ref for the dropdown to detect outside clicks
- Add a `useEffect` for click-outside-to-close behavior

**2. Replace the mode selector block (lines 492-521)**
- Remove the `<>` block containing the persistent `ROOM_MODES` pills and `TEAM_COUNTS` pills
- Replace with a single pill button placed in the header row (line 458-465), next to the HOST badge:
```tsx
{room.isCreator && (
  <div className="relative" ref={modeDropdownRef}>
    <button
      className="pill-btn gap-1 !text-[9px] !px-2 !py-1"
      onClick={() => setRoomModeDropdownOpen(!roomModeDropdownOpen)}
    >
      {currentRoomMode.icon} {currentRoomMode.label}
      <ChevronDown className={`w-2.5 h-2.5 transition-transform ${roomModeDropdownOpen ? 'rotate-180' : ''}`} />
    </button>
    {roomModeDropdownOpen && (
      <div className="absolute top-full left-0 mt-1 z-50 flex flex-col gap-1 bg-card border border-border/30 rounded-xl p-1.5 shadow-lg animate-fade-in-up min-w-[120px]">
        {ROOM_MODES.map(mode => (
          <button key={mode.id} className={`pill-btn ...`}
            onClick={() => { room.setMode(mode.id); setRoomModeDropdownOpen(false); }}>
            {mode.icon} {mode.label}
          </button>
        ))}
        {/* Team count row if not FFA */}
        {room.mode !== 'ffa' && (
          <div className="flex gap-1 mt-1 border-t border-border/20 pt-1">
            {TEAM_COUNTS.map(n => (...))}
          </div>
        )}
      </div>
    )}
  </div>
)}
```

**3. Move pill into the header row**
- The mode pill sits after the HOST badge in the left side of the header, keeping the room code + copy + leave on the right

**4. Non-creator display**
- Replace the current non-creator mode display block (lines 524-534) with a similar inline pill (without chevron/click), placed in the header row

### Technical Details

- Click-outside detection via a `ref` on the dropdown wrapper + `useEffect` with `mousedown` listener
- `animationDuration: '0.15s'` on the dropdown for snappy appearance
- The dropdown is absolutely positioned below the trigger pill
- Team count options appear as a sub-row inside the dropdown when mode is TDM or LMS


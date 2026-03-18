

## Plan: Shotgun Icon + Edge Case Fixes + Friend Remove Action

### 1. Shotgun icon — use `Aperture` from lucide-react
Replace the custom `ShotgunSpread` SVG with the `Aperture` icon in `LoadoutBand.tsx`.

### 2. Fix 4 edge cases in `MenuHeader.tsx`
- **Clipboard try/catch**: Wrap `navigator.clipboard.writeText` calls in try/catch with a fallback error toast.
- **Empty actorId guard**: Don't attempt copy if `actorId` is empty/undefined.
- **Copy always works for logged-in users too**: The copy button (stopPropagation one) should always copy regardless of login state — currently it does, just needs the try/catch.
- **Login logic is backwards**: Currently when logged in it pushes to auth, when logged out it copies. This seems intentional per the previous conversation — logged-in click goes to account, copy icon always copies. Just needs robustness.

### 3. Friend click-to-remove in both `SocialHero.tsx` and `SocialScreen.tsx`
- Add `expandedFriend` state tracking which friend name is "expanded"
- Clicking a friend row toggles that friend's expanded state
- When expanded, show an inline `UserMinus` remove button (styled like the existing add-friend pill button but with destructive styling)
- Clicking the remove button removes that friend from the list (local state with `useState`)
- Make the friends list use state so removals actually work

### Files to modify
- `src/components/menu/LoadoutBand.tsx` — swap `ShotgunSpread` for `Aperture`
- `src/components/menu/MenuHeader.tsx` — add try/catch to clipboard calls
- `src/components/menu/SocialHero.tsx` — add expandable friend row with remove
- `src/components/menu/screens/SocialScreen.tsx` — same expandable friend row with remove


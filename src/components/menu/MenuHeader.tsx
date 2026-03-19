import React, { useState } from 'react';
import { Settings, ChevronLeft, Copy, LogIn, UserPlus, ArrowRight, Globe } from 'lucide-react';
import { useMenuNav, type MenuScreen } from '@/hooks/useMenuNav';
import { useAuth } from '@/hooks/useAuth';
import { useRoom } from '@/hooks/useRoom';
import { toast } from '@/hooks/use-toast';

const SCREEN_TITLES: Record<MenuScreen, string> = {
  home: 'MAYHEM',
  social: 'SOCIAL',
  settings: 'SETTINGS',
  auth: 'ACCOUNT',
  manual: 'FIELD MANUAL',
  controls: 'CONTROLS',
};

const MenuHeader: React.FC = () => {
  const { current, history, pop, push } = useMenuNav();
  const { isLoggedIn, actorId, displayName } = useAuth();
  const room = useRoom();
  const canGoBack = history.length > 1;

  /* Quick join state */
  const [friendId, setFriendId] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');

  const isMatchActive = room.matchState !== 'idle';

  const handleJoinFriend = () => {
    if (!friendId.trim()) return;
    toast({ title: 'Joining friend...', description: friendId });
    setFriendId('');
  };

  const handleJoinRoom = () => {
    if (roomCodeInput.trim().length < 4) return;
    if (room.isInRoom) {
      toast({ title: 'Already in a room', description: 'Leave your current room first.', variant: 'destructive' });
      return;
    }
    if (isMatchActive) {
      toast({ title: 'Match in progress', variant: 'destructive' });
      return;
    }
    room.joinRoom(roomCodeInput.trim(), displayName, actorId);
    setRoomCodeInput('');
  };

  return (
    <header id="menu-header" className="px-4 sm:px-5 py-3 flex-shrink-0">
      <div id="menu-header-main" className="flex items-center justify-between">
        <div id="menu-header-leading" className="flex items-center gap-2.5">
          {canGoBack && (
            <button
              id="menu-return-btn"
              className="pill-btn w-8 h-8 !p-0 flex items-center justify-center"
              onClick={pop}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <span className="font-orbitron text-xs font-bold tracking-wider text-foreground">
            {SCREEN_TITLES[current]}
          </span>
          {current === 'home' && (
            <div
              id="menu-party-id-btn"
              className="pill-btn gap-1.5 cursor-pointer group ml-2"
              onClick={() => {
                if (isLoggedIn) {
                  push('auth');
                } else if (actorId) {
                  try {
                    navigator.clipboard.writeText(actorId);
                    toast({ title: 'Copied to clipboard', description: actorId });
                  } catch {
                    toast({ title: 'Failed to copy', description: 'Clipboard not available', variant: 'destructive' });
                  }
                }
              }}
            >
              <span id="menu-party-id-label" className="text-muted-foreground group-hover:text-foreground transition-colors text-[10px]">
                {isLoggedIn ? displayName : 'GUEST ID'}
              </span>
              <span id="menu-party-id-value" className="text-primary font-bold text-[10px] font-mono">{actorId?.slice(0, 12)}</span>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!actorId) return;
                  try {
                    navigator.clipboard.writeText(actorId);
                    toast({ title: 'Copied to clipboard', description: actorId });
                  } catch {
                    toast({ title: 'Failed to copy', description: 'Clipboard not available', variant: 'destructive' });
                  }
                }}
              >
                <Copy className="w-2.5 h-2.5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          )}
          {/* Login button — guest only, next to ID pill */}
          {!isLoggedIn && current === 'home' && (
            <button
              id="menu-login-btn"
              className="pill-btn active gap-1"
              onClick={() => push('auth')}
            >
              <LogIn className="w-3 h-3" />
              <span className="text-[10px]">LOGIN</span>
            </button>
          )}
        </div>
        <div id="menu-header-actions" className="flex items-center gap-2">
          {/* Quick join — home screen only */}
          {current === 'home' && (
            <div className="flex items-center gap-1.5">
              <input
                className="glass-input !py-0.5 !px-2 !text-[10px] w-20"
                placeholder="Friend ID"
                value={friendId}
                onChange={e => setFriendId(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleJoinFriend(); }}
              />
              <button
                className="pill-btn !px-1 !py-0.5"
                title="Invite friend"
                onClick={() => {
                  if (!friendId.trim()) return;
                  toast({ title: 'Invite sent', description: `Invited ${friendId} to your party` });
                  setFriendId('');
                }}
              >
                <UserPlus className="w-2.5 h-2.5" />
              </button>
              <button
                className="pill-btn !px-1 !py-0.5"
                title="Join friend"
                onClick={handleJoinFriend}
              >
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
              <div className="w-px h-4 bg-border/30" />
              <input
                className="glass-input !py-0.5 !px-2 !text-[10px] w-20"
                placeholder="Room Code"
                value={roomCodeInput}
                onChange={e => setRoomCodeInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleJoinRoom(); }}
              />
              <button
                className="pill-btn !px-1 !py-0.5"
                title="Join room"
                onClick={handleJoinRoom}
              >
                <Globe className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
          {/* Login button — guest only, visible on home */}
          {!isLoggedIn && current === 'home' && (
            <button
              id="menu-login-btn"
              className="pill-btn active gap-1.5"
              onClick={() => push('auth')}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="text-[10px]">LOGIN</span>
            </button>
          )}
          {current !== 'settings' && (
            <button
              id="utility-toggle-btn"
              className="pill-btn gap-1.5"
              onClick={() => push('settings')}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">SETTINGS</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default MenuHeader;

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Crosshair, ChevronDown, Swords, Target, Dumbbell,
  UserPlus, ArrowRight, Globe, Users, UserMinus,
  Copy, Lock, Unlock, Shuffle, Play, GripVertical,
  DoorOpen, X, LogOut, Bell, Check, Shield, Crown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMenuNav } from '@/hooks/useMenuNav';
import { useRoom, type RoomPlayer, MAX_PLAYERS } from '@/hooks/useRoom';
import { toast } from '@/hooks/use-toast';

/* ─── Game Modes ─── */
interface GameMode { id: string; label: string; icon: React.ReactNode }
const GAME_MODES: GameMode[] = [
  { id: 'ffa', label: 'FREE FOR ALL', icon: <Crosshair className="w-3.5 h-3.5" /> },
  { id: 'tdm', label: 'TEAM DEATHMATCH', icon: <Swords className="w-3.5 h-3.5" /> },
  { id: 'lms', label: 'LAST MAN STANDING', icon: <Target className="w-3.5 h-3.5" /> },
  { id: 'practice', label: 'PRACTICE', icon: <Dumbbell className="w-3.5 h-3.5" /> },
];

/* ─── Room mode config ─── */
const ROOM_MODES = [
  { id: 'ffa' as const, label: 'FREE FOR ALL', icon: <Crosshair className="w-3 h-3" /> },
  { id: 'tdm' as const, label: 'TEAM DEATHMATCH', icon: <Swords className="w-3 h-3" /> },
  { id: 'lms' as const, label: 'LAST MAN STANDING', icon: <Target className="w-3 h-3" /> },
];
const TEAM_COUNTS = [2, 3, 4];

interface FakeFriend {
  name: string;
  status: 'online' | 'away' | 'offline';
  inGame: boolean;
}
const INITIAL_FRIENDS: FakeFriend[] = [
  { name: 'xVortex', status: 'online', inGame: true },
  { name: 'NightOwl', status: 'online', inGame: false },
  { name: 'BlazeFury', status: 'away', inGame: false },
  { name: 'ShadowKnight', status: 'offline', inGame: false },
];

const TEAM_STYLES = [
  { color: 'rgb(34, 211, 238)', borderColor: 'rgba(34, 211, 238, 0.3)', bgColor: 'rgba(34, 211, 238, 0.05)' },
  { color: 'rgb(251, 113, 133)', borderColor: 'rgba(251, 113, 133, 0.3)', bgColor: 'rgba(251, 113, 133, 0.05)' },
  { color: 'rgb(251, 191, 36)', borderColor: 'rgba(251, 191, 36, 0.3)', bgColor: 'rgba(251, 191, 36, 0.05)' },
  { color: 'rgb(52, 211, 153)', borderColor: 'rgba(52, 211, 153, 0.3)', bgColor: 'rgba(52, 211, 153, 0.05)' },
];

const HomeScreen: React.FC = () => {
  const { isLoggedIn, displayName, actorId } = useAuth();
  const { push } = useMenuNav();
  const room = useRoom();

  /* Play state */
  const [selectedMode, setSelectedMode] = useState('ffa');
  const [modesOpen, setModesOpen] = useState(false);
  const currentMode = GAME_MODES.find(m => m.id === selectedMode)!;

  /* Quick join */
  const [friendId, setFriendId] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');

  /* Add/remove friend */
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [addFriendId, setAddFriendId] = useState('');
  const [friends, setFriends] = useState<FakeFriend[]>(INITIAL_FRIENDS);
  const [removeMode, setRemoveMode] = useState(false);
  const [confirmingFriend, setConfirmingFriend] = useState<string | null>(null);

  const removeFriend = (name: string) => {
    setFriends(prev => prev.filter(f => f.name !== name));
    setConfirmingFriend(null);
    if (friends.length <= 1) setRemoveMode(false);
  };

  /* Click outside to close add/remove */
  const socialPanelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (socialPanelRef.current && !socialPanelRef.current.contains(e.target as Node)) {
        setAddFriendOpen(false);
        setRemoveMode(false);
        setConfirmingFriend(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Join confirmation for party members */
  const [joinConfirm, setJoinConfirm] = useState<'friend' | 'room' | null>(null);

  /* Invite player input */
  const [inviteInput, setInviteInput] = useState('');
  const [invitePartyOpen, setInvitePartyOpen] = useState(false);

  /* Room mode dropdown */
  const [roomModeDropdownOpen, setRoomModeDropdownOpen] = useState(false);
  const [teamCountDropdownOpen, setTeamCountDropdownOpen] = useState(false);
  const modeDropdownRef = useRef<HTMLDivElement>(null);
  const teamDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target as Node)) {
        setRoomModeDropdownOpen(false);
      }
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(e.target as Node)) {
        setTeamCountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Party state — sync leader name with displayName */
  const [partyMembers, setPartyMembers] = useState<{ name: string; isLeader: boolean }[]>([
    { name: displayName, isLeader: true },
    { name: 'xVortex', isLeader: false },
  ]);



  useEffect(() => {
    setPartyMembers(prev => {
      const selfIdx = prev.findIndex(m => m.isLeader && (m.name !== displayName));
      if (selfIdx === -1) return prev;
      const next = [...prev];
      next[selfIdx] = { ...next[selfIdx], name: displayName };
      return next;
    });
  }, [displayName]);

  // Logout cleanup: leave room and reset party to solo
  const prevLoggedIn = useRef(isLoggedIn);
  useEffect(() => {
    if (prevLoggedIn.current && !isLoggedIn) {
      // User just logged out
      if (room.isInRoom) room.leaveRoom();
      setPartyMembers([{ name: displayName, isLeader: true }]);
      setRemoveMode(false);
      setConfirmingFriend(null);
      setAddFriendOpen(false);
      setFriends(INITIAL_FRIENDS);
    }
    prevLoggedIn.current = isLoggedIn;
  }, [isLoggedIn, displayName, room]);

  const transferLeader = (name: string) => {
    setPartyMembers(prev => prev.map(m => ({
      ...m,
      isLeader: m.name === name,
    })));
  };

  /* Drag state for desktop */
  const [dragItem, setDragItem] = useState<{ playerId: string; fromTeam: number } | null>(null);
  const [dragOverTeam, setDragOverTeam] = useState<number | null>(null);

  const isSolo = partyMembers.length <= 1;
  const isPartyLeader = partyMembers.find(m => m.isLeader)?.name === displayName;
  const showSocialPanel = isLoggedIn || !isSolo;

  /* ─── Drag & Drop handlers ─── */
  const handleDragStart = (playerId: string, fromTeam: number) => {
    setDragItem({ playerId, fromTeam });
  };
  const handleDragOver = (e: React.DragEvent, teamIdx: number) => {
    e.preventDefault();
    setDragOverTeam(teamIdx);
  };
  const handleDragLeave = () => setDragOverTeam(null);
  const handleDrop = (targetTeam: number) => {
    if (dragItem) {
      room.movePlayer(dragItem.playerId, dragItem.fromTeam, targetTeam);
    }
    setDragItem(null);
    setDragOverTeam(null);
  };

  /* ─── Click-to-assign handler ─── */
  const handlePlayerClick = (player: RoomPlayer) => {
    if (room.selectedPlayer?.id === player.id) {
      room.selectPlayer(null);
    } else {
      room.selectPlayer(player);
    }
  };
  const handleTeamClick = (teamIdx: number) => {
    if (room.selectedPlayer) {
      room.assignToTeam(teamIdx);
    }
  };

  /* ─── Guards ─── */
  const isMatchActive = room.matchState !== 'idle';

  /* ─── Create room ─── */
  const handleCreateRoom = () => {
    if (room.isInRoom) {
      toast({ title: 'Already in a room', description: 'Leave your current room first.', variant: 'destructive' });
      return;
    }
    if (isMatchActive) {
      toast({ title: 'Match in progress', description: 'Wait for the current match to end.', variant: 'destructive' });
      return;
    }
    room.createRoom(displayName, actorId);
    window.dispatchEvent(new Event('loadout:collapse'));
  };

  /* ─── Join room by code ─── */
  const handleJoinRoom = () => {
    if (roomCodeInput.trim().length < 4) return;
    if (room.isInRoom) {
      toast({ title: 'Already in a room', description: 'Leave your current room first.', variant: 'destructive' });
      return;
    }
    if (isMatchActive) {
      toast({ title: 'Match in progress', description: 'Wait for the current match to end.', variant: 'destructive' });
      return;
    }
    room.joinRoom(roomCodeInput.trim(), displayName, actorId);
    setRoomCodeInput('');
  };

  /* ─── Play Card ─── */
  const PlayCard = (
    <div id="menu-home-hero" className="glass-card p-3 flex flex-col gap-2">
      <span className="section-label !mb-0">GAME MODE</span>
      <div id="play-mode-toolbar" className="flex items-center gap-2">
        <button
          id="primary-launch-btn"
          className="launch-btn flex-1 !py-2 !text-[10px] animate-pulse-glow"
          onClick={() => {
            if (room.isInRoom) {
              toast({ title: 'Already in a room', description: 'Leave your current room or start the match from the room panel.', variant: 'destructive' });
              return;
            }
            toast({ title: `Searching for ${currentMode.label}...`, description: 'Finding the best match for you.' });
          }}
        >
          <Play className="w-3.5 h-3.5" /> START MATCH
        </button>
        <button
          id="game-modes-toggle-btn"
          className={`pill-btn !px-2 !py-2 gap-1.5 min-w-0 transition-transform ${modesOpen ? 'active' : ''}`}
          onClick={() => setModesOpen(!modesOpen)}
        >
          {currentMode.icon}
          <span className="font-orbitron text-[9px] font-bold tracking-wider truncate max-w-[100px]">{currentMode.label}</span>
          <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${modesOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {modesOpen && (
        <div id="play-mode-options" className="grid grid-cols-2 gap-1.5 max-h-[120px] overflow-y-auto animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
          {GAME_MODES.map(mode => (
            <button
              key={mode.id}
              id={mode.id === 'practice' ? 'practice-mode-btn' : `play-mode-${mode.id}-btn`}
              className={`item-grid-btn !p-2 text-left !min-h-0 ${selectedMode === mode.id ? 'selected' : ''}`}
              onClick={() => { setSelectedMode(mode.id); setModesOpen(false); }}
            >
              <div className="flex items-center gap-1.5 w-full">
                <span className={selectedMode === mode.id ? 'text-primary' : ''}>{mode.icon}</span>
                <span className="font-orbitron text-[9px] font-bold tracking-wider">{mode.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  /* ─── Quick Join Card ─── */
  const QuickJoinCard = (
    <div className="glass-card p-3 flex flex-col gap-2">
      <span className="section-label !mb-0">QUICK JOIN</span>

      {/* Friend ID row */}
      {joinConfirm === 'friend' ? (
        <div className="flex items-center gap-1.5 animate-fade-in-up" style={{ animationDuration: '0.15s' }}>
          <span className="text-[9px] font-orbitron text-foreground tracking-wider">
            {isPartyLeader ? 'BRING PARTY?' : 'LEAVE PARTY & JOIN?'}
          </span>
          <button
            className="pill-btn active !px-2 !py-1.5 !text-[9px]"
            onClick={() => {
              if (room.isInRoom) {
                toast({ title: 'Already in a room', variant: 'destructive' });
                setJoinConfirm(null);
                return;
              }
              if (!isPartyLeader) {
                setPartyMembers([{ name: displayName, isLeader: true }]);
              }
              toast({ title: isPartyLeader ? 'Joining with party...' : 'Left party, joining friend...' });
              setJoinConfirm(null);
              setFriendId('');
            }}
          >
            YES
          </button>
          <button
            className="pill-btn !px-2 !py-1.5 !text-[9px]"
            onClick={() => setJoinConfirm(null)}
          >
            NO
          </button>
        </div>
      ) : (
        <div id="social-friend-id-stack" className="flex gap-1.5">
          <input
            id="party-id-input"
            className="glass-input flex-1 !py-1.5 !px-2.5 !text-xs"
            placeholder="Friend ID"
            value={friendId}
            onChange={e => setFriendId(e.target.value)}
          />
          <button
            id="invite-friend-btn"
            className="pill-btn active !px-2 !py-1.5"
            title="Invite"
            onClick={() => {
              if (!friendId.trim()) return;
              toast({ title: 'Invite sent', description: `Invited ${friendId} to your party` });
              setFriendId('');
            }}
          >
            <UserPlus className="w-3 h-3" />
          </button>
          <button
            id="join-friend-btn"
            className="pill-btn !px-2 !py-1.5"
            title="Join"
            onClick={() => {
              if (!friendId.trim()) return;
              if (!isSolo) {
                setJoinConfirm('friend');
              } else {
                toast({ title: 'Joining friend...', description: friendId });
                setFriendId('');
              }
            }}
          >
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Room code row */}
      {joinConfirm === 'room' ? (
        <div className="flex items-center gap-1.5 animate-fade-in-up" style={{ animationDuration: '0.15s' }}>
          <span className="text-[9px] font-orbitron text-foreground tracking-wider">
            {isPartyLeader ? 'BRING PARTY?' : 'LEAVE PARTY & JOIN?'}
          </span>
          <button
            className="pill-btn active !px-2 !py-1.5 !text-[9px]"
            onClick={() => {
              if (room.isInRoom) {
                toast({ title: 'Already in a room', description: 'Leave your current room first.', variant: 'destructive' });
                setJoinConfirm(null);
                return;
              }
              if (isMatchActive) {
                toast({ title: 'Match in progress', variant: 'destructive' });
                setJoinConfirm(null);
                return;
              }
              if (isPartyLeader) {
                room.joinRoom(roomCodeInput.trim(), displayName, actorId);
              } else {
                setPartyMembers([{ name: displayName, isLeader: true }]);
                room.joinRoom(roomCodeInput.trim(), displayName, actorId);
              }
              toast({ title: isPartyLeader ? 'Joining room with party...' : 'Left party, joining room...' });
              setJoinConfirm(null);
              setRoomCodeInput('');
            }}
          >
            YES
          </button>
          <button
            className="pill-btn !px-2 !py-1.5 !text-[9px]"
            onClick={() => setJoinConfirm(null)}
          >
            NO
          </button>
        </div>
      ) : (
        <div id="social-room-join-stack" className="flex gap-1.5">
          <input
            id="room-code-input"
            className="glass-input flex-1 !py-1.5 !px-2.5 !text-xs"
            placeholder="Room Code"
            value={roomCodeInput}
            onChange={e => setRoomCodeInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (!isSolo) {
                  setJoinConfirm('room');
                } else {
                  handleJoinRoom();
                }
              }
            }}
          />
          <button
            id="join-room-btn"
            className="pill-btn !px-2 !py-1.5"
            title="Join Room"
            onClick={() => {
              if (!roomCodeInput.trim()) return;
              if (!isSolo) {
                setJoinConfirm('room');
              } else {
                handleJoinRoom();
              }
            }}
          >
            <Globe className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );

  /* ─── Pending Invites ─── */
  const InviteBanner = room.pendingInvites.length > 0 ? (
    <div className="glass-card p-3 flex flex-col gap-2 border-primary/20 animate-fade-in-up max-h-[150px] overflow-y-auto" style={{ animationDuration: '0.2s' }}>
      <span className="section-label !mb-0 flex items-center gap-1.5">
        <Bell className="w-3 h-3 text-primary" /> ROOM INVITES
      </span>
      {room.pendingInvites.map(inv => (
        <div key={inv.roomCode} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/20">
          <div className="flex flex-col">
            <span className="font-rajdhani font-semibold text-xs text-foreground">{inv.from}</span>
            <span className="font-orbitron text-[8px] text-muted-foreground tracking-wider">Room {inv.roomCode}</span>
          </div>
          <div className="flex gap-1">
            <button
              className="pill-btn active !px-2 !py-1 !text-[8px]"
              onClick={() => room.acceptInvite(inv.roomCode)}
            >
              <Check className="w-2.5 h-2.5" /> JOIN
            </button>
            <button
              className="pill-btn !px-1.5 !py-1"
              onClick={() => room.dismissInvite(inv.roomCode)}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  ) : null;

  /* ─── Room Panel (inline in third column) ─── */
  const RoomCardContent = room.isInRoom ? (
    <div className="glass-card p-3 flex flex-col gap-2.5 flex-1 min-h-0">
      {/* Room header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="section-label !mb-0">PRIVATE ROOM <span className="text-muted-foreground">ID:</span> <span className="text-primary">{room.roomCode}</span></span>
          <button
            className="pill-btn !px-1 !py-0.5"
            title="Copy"
            onClick={() => {
              try {
                navigator.clipboard.writeText(room.roomCode);
                toast({ title: 'Copied room code', description: room.roomCode });
              } catch {
                toast({ title: 'Failed to copy', variant: 'destructive' });
              }
            }}
          >
            <Copy className="w-2.5 h-2.5" />
          </button>
          {/* Inline mode pill */}
          {room.isCreator ? (
            <div className="relative" ref={modeDropdownRef}>
              <button
                className="pill-btn active gap-1 !text-[9px] !px-2 !py-1"
                onClick={() => { setRoomModeDropdownOpen(!roomModeDropdownOpen); setTeamCountDropdownOpen(false); }}
              >
                {ROOM_MODES.find(m => m.id === room.mode)?.icon}
                <span className="font-orbitron text-[9px] font-bold tracking-wider">
                  {ROOM_MODES.find(m => m.id === room.mode)?.label}
                </span>
                <ChevronDown className={`w-2.5 h-2.5 transition-transform ${roomModeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {roomModeDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 z-50 flex flex-col gap-1 bg-card border border-border/30 rounded-xl p-1.5 shadow-lg animate-fade-in-up min-w-[120px]" style={{ animationDuration: '0.15s' }}>
                  {ROOM_MODES.map(mode => (
                    <button
                      key={mode.id}
                      className={`pill-btn justify-start gap-1.5 !text-[9px] !px-2.5 !py-1.5 w-full ${room.mode === mode.id ? 'active' : ''}`}
                      onClick={() => { room.setMode(mode.id); setRoomModeDropdownOpen(false); }}
                    >
                      {mode.icon} {mode.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="pill-btn gap-1 !text-[9px] !px-2 !py-1 cursor-default opacity-80">
              {ROOM_MODES.find(m => m.id === room.mode)?.icon}
              <span className="font-orbitron text-[9px] font-bold tracking-wider">
                {ROOM_MODES.find(m => m.id === room.mode)?.label}
              </span>
            </span>
          )}
          {/* Inline team count pill — only for team modes */}
          {room.mode !== 'ffa' && (
            room.isCreator ? (
              <div className="relative" ref={teamDropdownRef}>
                <button
                  className="pill-btn active gap-1 !text-[9px] !px-2 !py-1"
                  onClick={() => { setTeamCountDropdownOpen(!teamCountDropdownOpen); setRoomModeDropdownOpen(false); }}
                >
                  <Users className="w-2.5 h-2.5" />
                  <span className="font-orbitron text-[9px] font-bold tracking-wider">{room.teamCount} TEAMS</span>
                  <ChevronDown className={`w-2.5 h-2.5 transition-transform ${teamCountDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {teamCountDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 z-50 flex flex-col gap-1 bg-card border border-border/30 rounded-xl p-1.5 shadow-lg animate-fade-in-up min-w-[90px]" style={{ animationDuration: '0.15s' }}>
                    {TEAM_COUNTS.map(n => (
                      <button
                        key={n}
                        className={`pill-btn justify-start gap-1.5 !text-[9px] !px-2.5 !py-1.5 w-full ${room.teamCount === n ? 'active' : ''}`}
                        onClick={() => { room.setTeamCount(n); setTeamCountDropdownOpen(false); }}
                      >
                        {n} TEAMS
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span className="pill-btn gap-1 !text-[9px] !px-2 !py-1 cursor-default opacity-80">
                <Users className="w-2.5 h-2.5" />
                <span className="font-orbitron text-[9px] font-bold tracking-wider">{room.teamCount} TEAMS</span>
              </span>
            )
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {room.isCreator && (
            <button className="pill-btn !py-1 !px-2 !text-[9px] gap-1 whitespace-nowrap" onClick={room.inviteParty}>
              <Users className="w-2.5 h-2.5" /> INVITE PARTY
            </button>
          )}
          {room.isCreator && (
            <span className="font-orbitron text-[7px] text-primary tracking-wider px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
              <Shield className="w-2 h-2 inline mr-0.5" />HOST
            </span>
          )}
          {room.isCreator ? (
            <button
              className={`pill-btn !px-1.5 !py-1 ${room.isLocked ? 'text-destructive border-destructive/30 bg-destructive/10' : 'text-green-400 border-green-400/30 bg-green-400/10'}`}
              onClick={room.toggleLock}
              title={room.isLocked ? 'Unlock Room' : 'Lock Room'}
            >
              {room.isLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
            </button>
          ) : room.isLocked ? (
            <span className="pill-btn !px-1.5 !py-1 opacity-60 cursor-default" title="Room Locked">
              <Lock className="w-2.5 h-2.5" />
            </span>
          ) : null}
          <button className="pill-btn !px-1.5 !py-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={room.leaveRoom} title="Leave Room">
            <LogOut className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>


      {/* Player roster — full width */}
      <div className="flex flex-col gap-2 min-w-0 flex-1 min-h-0">
        {room.selectedPlayer && (
          <div className="text-[9px] font-orbitron text-primary tracking-wider text-center animate-fade-in-up" style={{ animationDuration: '0.15s' }}>
            TAP A TEAM TO ASSIGN {room.selectedPlayer.name.toUpperCase()}
          </div>
        )}

        {room.mode !== 'ffa' ? (
          <div className="rounded-xl border border-border/20 bg-muted/5 p-2 flex-1 min-h-0 overflow-y-auto">
            <span className="section-label flex items-center gap-1 !mb-1.5">
              <Users className="w-3 h-3 text-primary" /> TEAMS
              {room.isCreator && (
                <button className="pill-btn !px-1.5 !py-0.5 ml-1" onClick={room.randomizeTeams} title="Randomize Teams">
                  <Shuffle className="w-2.5 h-2.5" />
                </button>
              )}
            </span>
            <div className={`grid gap-2 pr-1 ${
              room.teamCount === 1 ? 'grid-cols-1' :
              room.teamCount === 2 ? 'grid-cols-2' :
              room.teamCount === 3 ? 'grid-cols-3' :
              'grid-cols-2'
            }`}>
              {Array.from({ length: room.teamCount }).map((_, tIdx) => {
                const isDropTarget = dragOverTeam === tIdx;
                const isAssignTarget = room.selectedPlayer != null;
                const teamMembers = room.teams[tIdx] || [];
                const ts = TEAM_STYLES[tIdx];

                const activeStyle = (isDropTarget || isAssignTarget) ? {
                  borderColor: ts.borderColor,
                  backgroundColor: ts.bgColor,
                } : {};

                return (
                  <div
                    key={tIdx}
                    className={`rounded-xl border-2 border-dashed p-2.5 min-h-[70px] flex flex-col transition-all duration-200 ${
                      isDropTarget ? 'scale-[1.03] shadow-lg' :
                      isAssignTarget ? 'hover:scale-[1.01] cursor-pointer' :
                      'border-border/30 bg-muted/5 hover:bg-muted/10'
                    }`}
                    style={activeStyle}
                    onDragOver={e => { e.preventDefault(); handleDragOver(e, tIdx); }}
                    onDragLeave={handleDragLeave}
                    onDrop={() => handleDrop(tIdx)}
                    onClick={() => handleTeamClick(tIdx)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-orbitron text-[9px] font-bold tracking-wider" style={{ color: ts.color }}>
                        TEAM {tIdx + 1}
                      </span>
                      <span className="font-rajdhani text-[9px] text-muted-foreground font-semibold">
                        {teamMembers.length}
                      </span>
                    </div>

                    {teamMembers.length === 0 ? (
                      <div
                        className="flex items-center justify-center py-6 rounded-lg border border-dashed transition-colors"
                        style={{ borderColor: isDropTarget ? ts.borderColor : undefined }}
                      >
                        <span className="font-orbitron text-[8px] text-muted-foreground/50 tracking-wider">
                          {isDropTarget ? 'DROP HERE' : 'DRAG PLAYER'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {teamMembers.map(member => {
                          const isSelected = room.selectedPlayer?.id === member.id;
                          const isBeingDragged = dragItem?.playerId === member.id;

                          return (
                            <div
                              key={member.id}
                              draggable
                              onDragStart={() => handleDragStart(member.id, tIdx)}
                              onDragEnd={() => { setDragItem(null); setDragOverTeam(null); }}
                              onClick={e => { e.stopPropagation(); handlePlayerClick(member); }}
                              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-150 group ${
                                isBeingDragged
                                  ? 'opacity-40 scale-95'
                                  : isSelected
                                    ? 'bg-primary/20 border border-primary/40 ring-1 ring-primary/20 shadow-sm'
                                    : 'bg-muted/20 cursor-grab active:cursor-grabbing hover:bg-primary/10 border border-transparent hover:border-primary/20'
                              }`}
                            >
                              <GripVertical className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0" />
                              <span className="font-rajdhani font-semibold text-[11px] text-foreground flex-1 truncate">{member.name}</span>
                              {member.isCreator && <Shield className="w-2.5 h-2.5 text-primary shrink-0" />}
                              {room.readyPlayers.has(member.id) && (
                                <Check className="w-2.5 h-2.5 text-green-500 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              className="launch-btn w-full !py-1.5 !text-[9px] gap-1 mt-2"
              onClick={() => {
                if (room.isCreator) {
                  room.startMatch();
                } else {
                  room.toggleReady(actorId);
                  toast({ title: room.readyPlayers.has(actorId) ? 'Unreadied' : 'Readied up!' });
                }
              }}
            >
              <Play className="w-2.5 h-2.5" /> {room.isCreator ? 'START MATCH' : (room.readyPlayers.has(actorId) ? 'UNREADY' : 'READY UP')}
            </button>
          </div>
        ) : (
          /* FFA player list */
          <div className="rounded-xl border border-border/20 bg-muted/5 p-2 flex-1 min-h-0 overflow-y-auto">
            <span className="section-label flex items-center gap-1 !mb-1.5">
              <Users className="w-3 h-3 text-primary" /> PLAYERS ({room.players.length}/{MAX_PLAYERS})
            </span>
            <div className="flex flex-col gap-0.5 pr-1">
              {room.players.map(p => (
                <div key={p.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="font-rajdhani font-semibold text-xs text-foreground">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.isCreator && <Shield className="w-2.5 h-2.5 text-primary" />}
                    {room.readyPlayers.has(p.id) && <Check className="w-2.5 h-2.5 text-green-500" />}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="launch-btn w-full !py-1.5 !text-[9px] gap-1 mt-2"
              onClick={() => {
                if (room.isCreator) {
                  room.startMatch();
                } else {
                  room.toggleReady(actorId);
                  toast({ title: room.readyPlayers.has(actorId) ? 'Unreadied' : 'Readied up!' });
                }
              }}
            >
              <Play className="w-2.5 h-2.5" /> {room.isCreator ? 'START MATCH' : (room.readyPlayers.has(actorId) ? 'UNREADY' : 'READY UP')}
            </button>
          </div>
        )}
      </div>


      {/* ─── Inline Party + Friends sub-panels ─── */}
      {isLoggedIn && (
        <div ref={socialPanelRef} className="grid grid-cols-2 gap-2.5 mt-1">
          {/* Party panel */}
          <div className="flex flex-col gap-1.5 min-h-0">
            <div className="flex items-center justify-between">
              <span className="section-label flex items-center gap-1 !mb-0 !text-[9px]">
                <Users className="w-3 h-3 text-primary" /> PARTY ({partyMembers.length})
              </span>
              <div className="flex items-center gap-1">
                {(!room.isLocked || room.isCreator) && (
                  <button
                    className="pill-btn !px-1.5 !py-0.5 text-[8px] gap-0.5"
                    onClick={() => setInvitePartyOpen(!invitePartyOpen)}
                    title="Invite to Party"
                  >
                    <UserPlus className="w-2.5 h-2.5" />
                    <span className="hidden sm:inline">INVITE</span>
                  </button>
                )}
                {!isSolo && (
                  <button
                    className="pill-btn !px-1.5 !py-0.5 text-[8px] gap-0.5"
                    onClick={() => { setPartyMembers([{ name: displayName, isLeader: true }]); toast({ title: 'Left party' }); }}
                  >
                    <LogOut className="w-2.5 h-2.5" />
                    <span className="hidden sm:inline">LEAVE</span>
                  </button>
                )}
              </div>
            </div>

            {invitePartyOpen && (
              <div className="flex gap-1.5 animate-fade-in-up" style={{ animationDuration: '0.15s' }}>
                <input
                  className="glass-input flex-1 !py-1 !px-2 !text-xs"
                  placeholder="Enter player ID..."
                  value={inviteInput}
                  onChange={e => setInviteInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && inviteInput.trim()) {
                      room.invitePlayer(inviteInput.trim());
                      setInviteInput('');
                      setInvitePartyOpen(false);
                    }
                  }}
                  autoFocus
                />
                <button
                  className="pill-btn active !px-2 !py-1 !text-[9px]"
                  onClick={() => {
                    if (!inviteInput.trim()) return;
                    room.invitePlayer(inviteInput.trim());
                    setInviteInput('');
                    setInvitePartyOpen(false);
                  }}
                >
                  SEND
                </button>
              </div>
            )}

            <div className="flex flex-col gap-0.5 max-h-[160px] overflow-y-auto">
              {partyMembers.map(m => {
                const isInFriendsList = friends.some(f => f.name === m.name);
                const isInRoom = room.players.some(p => p.name === m.name);
                return (
                  <div key={m.name} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                      <span className="font-rajdhani font-semibold text-[11px] text-foreground truncate">{m.name}</span>
                      {m.isLeader && <span className="text-[7px] font-orbitron text-primary tracking-wider shrink-0">LEADER</span>}
                    </div>
                    {!m.isLeader && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        {isPartyLeader && (
                          <button
                            className="pill-btn !px-1 !py-0.5 text-[8px]"
                            title="Make Leader"
                            onClick={() => { transferLeader(m.name); toast({ title: `${m.name} is now party leader` }); }}
                          >
                            <Crown className="w-2.5 h-2.5 text-primary" />
                          </button>
                        )}
                        {!isInFriendsList && (
                          <button
                            className="pill-btn !px-1 !py-0.5 text-[8px]"
                            title="Add as friend"
                            onClick={() => {
                              setFriends(prev => [...prev, { name: m.name, status: 'online', inGame: false }]);
                              toast({ title: `Added ${m.name} as friend` });
                            }}
                          >
                            <UserPlus className="w-2.5 h-2.5" />
                          </button>
                        )}
                        {!isInRoom && (
                          <button
                            className="pill-btn !px-1 !py-0.5 text-[8px] border-green-500/30 hover:bg-green-500/10"
                            title="Invite to room"
                            onClick={() => { room.invitePlayer(m.name); toast({ title: `Invited ${m.name} to room` }); }}
                          >
                            <UserPlus className="w-2.5 h-2.5 text-green-500" />
                          </button>
                        )}
                        <button
                          className="pill-btn !px-1 !py-0.5 text-[8px] text-destructive border-destructive/30 hover:bg-destructive/10"
                          title="Remove from party"
                          onClick={() => { setPartyMembers(prev => prev.filter(p => p.name !== m.name)); toast({ title: `Kicked ${m.name}` }); }}
                        >
                          <UserMinus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Friends panel */}
          <div className="flex flex-col gap-1.5 min-h-0">
            <div className="flex items-center justify-between">
              <span className="section-label flex items-center gap-1 !mb-0 !text-[9px]">
                <Users className="w-3 h-3 text-primary" /> FRIENDS
              </span>
              <div className="flex items-center gap-1">
                <button
                  className="pill-btn !px-1.5 !py-0.5 text-[8px] gap-0.5"
                  onClick={() => setAddFriendOpen(!addFriendOpen)}
                  title="Add Friend"
                >
                  <UserPlus className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">ADD</span>
                </button>
                <button
                  className={`pill-btn !px-1.5 !py-0.5 text-[8px] gap-0.5 ${removeMode ? 'active' : ''}`}
                  onClick={() => { setRemoveMode(!removeMode); setConfirmingFriend(null); }}
                  title="Remove Friend"
                >
                  <UserMinus className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">REMOVE</span>
                </button>
              </div>
            </div>

            {addFriendOpen && (
              <div className="flex gap-1.5 animate-fade-in-up" style={{ animationDuration: '0.15s' }}>
                <input
                  className="glass-input flex-1 !py-1 !px-2 !text-xs"
                  placeholder="Enter player ID..."
                  value={addFriendId}
                  onChange={e => setAddFriendId(e.target.value)}
                  autoFocus
                />
                <button
                  className="pill-btn active !px-2 !py-1 !text-[9px]"
                  onClick={() => {
                    if (!addFriendId.trim()) return;
                    toast({ title: 'Friend request sent', description: `Sent to ${addFriendId}` });
                    setAddFriendId('');
                    setAddFriendOpen(false);
                  }}
                >
                  SEND
                </button>
              </div>
            )}

            <div className="flex flex-col gap-0.5 max-h-[160px] overflow-y-auto">
              {friends.length === 0 && (
                <div className="text-center py-4 text-muted-foreground font-orbitron text-[9px] tracking-wider">
                  NO FRIENDS YET — ADD SOMEONE!
                </div>
              )}
              {friends.map(f => (
                <div
                  key={f.name}
                  className={`flex items-center px-2 py-1.5 rounded-lg transition-colors cursor-pointer group ${
                    removeMode ? 'hover:bg-destructive/10 border border-transparent hover:border-destructive/20' : 'hover:bg-muted/30'
                  } ${confirmingFriend === f.name ? 'bg-destructive/10 border border-destructive/20' : ''}`}
                  onClick={() => {
                    if (removeMode) {
                      setConfirmingFriend(confirmingFriend === f.name ? null : f.name);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      f.status === 'online' ? 'bg-green-400' :
                      f.status === 'away' ? 'bg-yellow-500' : 'bg-muted-foreground/40'
                    }`} />
                    <span className="font-rajdhani font-semibold text-xs text-foreground">{f.name}</span>
                    {confirmingFriend === f.name ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-orbitron text-destructive tracking-wider">REMOVE?</span>
                        <button
                          className="pill-btn !px-1.5 !py-0.5 text-[8px] text-destructive border-destructive/30 bg-destructive/10 hover:bg-destructive/20"
                          onClick={(e) => { e.stopPropagation(); removeFriend(f.name); }}
                        >
                          YES
                        </button>
                        <button
                          className="pill-btn !px-1.5 !py-0.5 text-[8px]"
                          onClick={(e) => { e.stopPropagation(); setConfirmingFriend(null); }}
                        >
                          NO
                        </button>
                      </div>
                    ) : (
                      <>
                        {f.inGame && <span className="text-[8px] font-orbitron text-primary tracking-wider ml-1">IN GAME</span>}
                        {!removeMode && (
                          <button
                            className="pill-btn !px-1.5 !py-0.5 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                            title="Invite to party"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPartyMembers(prev => {
                                if (prev.find(m => m.name === f.name)) {
                                  toast({ title: `${f.name} is already in your party` });
                                  return prev;
                                }
                                if (prev.length >= MAX_PLAYERS) {
                                  toast({ title: 'Party full', variant: 'destructive' });
                                  return prev;
                                }
                                toast({ title: `${f.name} joined your party` });
                                return [...prev, { name: f.name, isLeader: false }];
                              });
                            }}
                          >
                            <UserPlus className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="glass-card p-3 flex flex-col items-center justify-center gap-2">
      <button
        className="launch-btn w-full !py-2.5 !text-[10px] gap-1.5"
        onClick={handleCreateRoom}
      >
        <DoorOpen className="w-3.5 h-3.5" /> CREATE ROOM
      </button>
    </div>
  );

  /* ─── Social Panel ─── */
  const SocialPanel = (
    <div ref={socialPanelRef} className="glass-card p-3 sm:p-4 flex flex-col gap-2.5 overflow-y-auto min-h-0">

      {/* Party — only show here when NOT in a room (party moves into room card) */}
      {!isSolo && !room.isInRoom && (
        <div id="menu-party-hero">
          <div className="flex items-center justify-between mb-1.5">
            <span className="section-label flex items-center gap-1 !mb-0">
              <Users className="w-3 h-3 text-primary" /> YOUR PARTY
            </span>
            <button
              id="party-hero-leave-btn"
              className="pill-btn !px-1.5 !py-0.5 text-[8px] gap-0.5"
              onClick={() => {
                setPartyMembers([{ name: displayName, isLeader: true }]);
                toast({ title: 'Left party' });
              }}
            >
              <LogOut className="w-2.5 h-2.5" />
              <span className="hidden sm:inline">LEAVE</span>
            </button>
          </div>
          <div id="party-hero-members" className="flex flex-col gap-1 max-h-[120px] overflow-y-auto">
            {partyMembers.map(m => (
              <div key={m.name} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/20">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="font-rajdhani font-semibold text-xs text-foreground">{m.name}</span>
                  {m.isLeader && <span className="text-[8px] font-orbitron text-primary tracking-wider">LEADER</span>}
                </div>
                <div className="flex items-center gap-1">
                  {!m.isLeader && partyMembers.find(p => p.isLeader)?.name === displayName && (
                    <button
                      className="pill-btn !px-1.5 !py-0.5 text-[8px] gap-0.5"
                      title="Make Leader"
                      onClick={() => {
                        transferLeader(m.name);
                        toast({ title: `${m.name} is now party leader` });
                      }}
                    >
                      <Crown className="w-2.5 h-2.5 text-primary" />
                    </button>
                  )}
                  {!m.isLeader && (
                    <button
                      className="pill-btn !px-1.5 !py-0.5 text-[8px] text-destructive border-destructive/30 hover:bg-destructive/10"
                      title="Remove"
                      onClick={() => {
                        setPartyMembers(prev => prev.filter(p => p.name !== m.name));
                        toast({ title: `Kicked ${m.name}`, description: 'Removed from party' });
                      }}
                    >
                      <UserMinus className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      {isLoggedIn && (
        <div id="menu-social-friends-pane" className="flex-1 min-h-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="section-label flex items-center gap-1 !mb-0">
              <Users className="w-3 h-3 text-primary" /> FRIENDS
            </span>
            <div className="flex items-center gap-1">
              <button
                className="pill-btn !px-1.5 !py-0.5 text-[8px] gap-0.5"
                onClick={() => setAddFriendOpen(!addFriendOpen)}
                title="Add Friend"
              >
                <UserPlus className="w-2.5 h-2.5" />
                <span className="hidden sm:inline">ADD</span>
              </button>
              <button
                className={`pill-btn !px-1.5 !py-0.5 text-[8px] gap-0.5 ${removeMode ? 'active' : ''}`}
                onClick={() => { setRemoveMode(!removeMode); setConfirmingFriend(null); }}
                title="Remove Friend"
              >
                <UserMinus className="w-2.5 h-2.5" />
                <span className="hidden sm:inline">REMOVE</span>
              </button>
            </div>
          </div>

          {addFriendOpen && (
            <div className="flex gap-1.5 mb-1.5 animate-fade-in-up" style={{ animationDuration: '0.15s' }}>
              <input
                className="glass-input flex-1 !py-1 !px-2 !text-xs"
                placeholder="Enter player ID..."
                value={addFriendId}
                onChange={e => setAddFriendId(e.target.value)}
                autoFocus
              />
              <button
                className="pill-btn active !px-2 !py-1 !text-[9px]"
                onClick={() => {
                  if (!addFriendId.trim()) return;
                  toast({ title: 'Friend request sent', description: `Sent to ${addFriendId}` });
                  setAddFriendId('');
                  setAddFriendOpen(false);
                }}
              >
                SEND
              </button>
            </div>
          )}

          <div id="social-friends-list" className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto">
          {friends.length === 0 && (
            <div className="text-center py-4 text-muted-foreground font-orbitron text-[9px] tracking-wider">
              NO FRIENDS YET — ADD SOMEONE!
            </div>
          )}
          {friends.map(f => (
              <div
                key={f.name}
                className={`flex items-center px-2 py-1.5 rounded-lg transition-colors cursor-pointer group ${
                  removeMode ? 'hover:bg-destructive/10 border border-transparent hover:border-destructive/20' : 'hover:bg-muted/30'
                } ${confirmingFriend === f.name ? 'bg-destructive/10 border border-destructive/20' : ''}`}
                onClick={() => {
                  if (removeMode) {
                    setConfirmingFriend(confirmingFriend === f.name ? null : f.name);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    f.status === 'online' ? 'bg-green-400' :
                    f.status === 'away' ? 'bg-yellow-500' : 'bg-muted-foreground/40'
                  }`} />
                  <span className="font-rajdhani font-semibold text-xs text-foreground">{f.name}</span>
                  {confirmingFriend === f.name ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-orbitron text-destructive tracking-wider">REMOVE?</span>
                      <button
                        className="pill-btn !px-1.5 !py-0.5 text-[8px] text-destructive border-destructive/30 bg-destructive/10 hover:bg-destructive/20"
                        onClick={(e) => { e.stopPropagation(); removeFriend(f.name); }}
                      >
                        YES
                      </button>
                      <button
                        className="pill-btn !px-1.5 !py-0.5 text-[8px]"
                        onClick={(e) => { e.stopPropagation(); setConfirmingFriend(null); }}
                      >
                        NO
                      </button>
                    </div>
                  ) : (
                    <>
                      {f.inGame && <span className="text-[8px] font-orbitron text-primary tracking-wider ml-1">IN GAME</span>}
                      {!removeMode && (
                        <button
                          className="pill-btn !px-1.5 !py-0.5 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                          title="Invite to party"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPartyMembers(prev => {
                              if (prev.find(m => m.name === f.name)) {
                                toast({ title: `${f.name} is already in your party` });
                                return prev;
                              }
                              if (prev.length >= MAX_PLAYERS) {
                                toast({ title: 'Party full', description: `Maximum ${MAX_PLAYERS} members.`, variant: 'destructive' });
                                return prev;
                              }
                              toast({ title: `${f.name} joined your party` });
                              return [...prev, { name: f.name, isLeader: false }];
                            });
                          }}
                        >
                          <UserPlus className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════
     LAYOUT — conditional 2-col when room open
     ═══════════════════════════════════════════ */

  return (
    <div className="flex flex-col gap-3 min-h-full flex-1">
      {InviteBanner}
      {/* Main content area */}
      <div className={room.isInRoom ? 'flex flex-col flex-1 min-h-0' : 'grid gap-3 grid-cols-1 sm:grid-cols-3'}>
        {room.isInRoom ? (
          RoomCardContent
        ) : (
          <>
            {PlayCard}
            {QuickJoinCard}
            {RoomCardContent}
          </>
        )}
      </div>

      {/* Social panel below — only when NOT in a room */}
      {showSocialPanel && !room.isInRoom && (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <div className="sm:col-span-1">
            {SocialPanel}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;

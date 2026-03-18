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
  { id: 'ffa' as const, label: 'FFA', icon: <Crosshair className="w-3 h-3" /> },
  { id: 'tdm' as const, label: 'TDM', icon: <Swords className="w-3 h-3" /> },
  { id: 'lms' as const, label: 'LMS', icon: <Target className="w-3 h-3" /> },
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

const TEAM_COLORS = [
  'text-cyan-400',
  'text-rose-400',
  'text-amber-400',
  'text-emerald-400',
];
const TEAM_BORDER_COLORS = [
  'border-cyan-400/30',
  'border-rose-400/30',
  'border-amber-400/30',
  'border-emerald-400/30',
];
const TEAM_BG_COLORS = [
  'bg-cyan-400/5',
  'bg-rose-400/5',
  'bg-amber-400/5',
  'bg-emerald-400/5',
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

  /* Party state */
  const [partyMembers, setPartyMembers] = useState<{ name: string; isLeader: boolean }[]>([
    { name: displayName, isLeader: true },
    { name: 'xVortex', isLeader: false },
  ]);

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

  /* ─── Create room ─── */
  const handleCreateRoom = () => {
    room.createRoom(displayName, actorId);
  };

  /* ─── Join room by code ─── */
  const handleJoinRoom = () => {
    if (roomCodeInput.trim().length >= 4) {
      room.joinRoom(roomCodeInput.trim(), displayName, actorId);
      setRoomCodeInput('');
    }
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
              if (isPartyLeader) {
                room.joinRoom(roomCodeInput.trim(), displayName, actorId);
              } else {
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
    <div className="glass-card p-3 flex flex-col gap-2.5 overflow-y-auto max-h-[400px]">
      {/* Room header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="section-label !mb-0">PRIVATE ROOM</span>
          {room.isCreator && (
            <span className="font-orbitron text-[7px] text-primary tracking-wider px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
              <Shield className="w-2 h-2 inline mr-0.5" />HOST
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div id="room-share-panel" className="flex items-center gap-1.5">
            <span id="room-share-code" className="font-orbitron text-xs font-bold text-primary tracking-wider">{room.roomCode}</span>
            <button
              id="copy-room-code-btn"
              className="pill-btn !px-1.5 !py-1"
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
          </div>
          <button className="pill-btn !px-1.5 !py-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={room.leaveRoom} title="Leave Room">
            <LogOut className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Mode selector — creator only */}
      {room.isCreator && (
        <>
          <div className="flex gap-1.5">
            {ROOM_MODES.map(mode => (
              <button
                key={mode.id}
                id={`private-room-mode-${mode.id}-btn`}
                className={`pill-btn flex-1 justify-center gap-1 !text-[9px] !px-2 !py-1.5 ${room.mode === mode.id ? 'active' : ''}`}
                onClick={() => room.setMode(mode.id)}
              >
                {mode.icon} {mode.label}
              </button>
            ))}
          </div>

          {room.mode !== 'ffa' && (
            <div className="flex gap-1.5">
              {TEAM_COUNTS.map(n => (
                <button
                  key={n}
                  className={`pill-btn flex-1 justify-center !text-[9px] !px-2 !py-1.5 ${room.teamCount === n ? 'active' : ''}`}
                  onClick={() => room.setTeamCount(n)}
                >
                  {n} TEAMS
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Non-creator mode display */}
      {!room.isCreator && (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/10">
          <span className="font-orbitron text-[9px] text-muted-foreground tracking-wider">MODE</span>
          <span className="font-orbitron text-[9px] font-bold text-foreground tracking-wider">
            {ROOM_MODES.find(m => m.id === room.mode)?.label || room.mode.toUpperCase()}
          </span>
          {room.mode !== 'ffa' && (
            <span className="font-orbitron text-[9px] text-muted-foreground tracking-wider ml-2">{room.teamCount} TEAMS</span>
          )}
        </div>
      )}

      {/* Lock + Randomize — creator controls */}
      <div className="flex gap-1.5">
        {room.isCreator && (
          <button
            className={`pill-btn flex-1 justify-center gap-1 !text-[9px] !px-2 !py-1.5 ${room.isLocked ? 'active' : ''}`}
            onClick={room.toggleLock}
          >
            {room.isLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
            {room.isLocked ? 'LOCKED' : 'OPEN'}
          </button>
        )}
        {!room.isCreator && room.isLocked && (
          <div className="pill-btn flex-1 justify-center gap-1 !text-[9px] !px-2 !py-1.5 opacity-60 cursor-default">
            <Lock className="w-2.5 h-2.5" /> ROOM LOCKED
          </div>
        )}
        {room.isCreator && room.mode !== 'ffa' && (
          <button className="pill-btn flex-1 justify-center gap-1 !text-[9px] !px-2 !py-1.5" onClick={room.randomizeTeams}>
            <Shuffle className="w-2.5 h-2.5" /> RANDOMIZE
          </button>
        )}
      </div>

      {/* Player roster with hint */}
      {room.selectedPlayer && (
        <div className="text-[9px] font-orbitron text-primary tracking-wider text-center animate-fade-in-up" style={{ animationDuration: '0.15s' }}>
          TAP A TEAM TO ASSIGN {room.selectedPlayer.name.toUpperCase()}
        </div>
      )}

      {/* Team Roster — Hybrid: click + drag */}
      {room.mode !== 'ffa' ? (
        <div className="min-h-0">
          <span className="section-label flex items-center gap-1 !mb-1.5">
            <Users className="w-3 h-3 text-primary" /> TEAMS
          </span>
          <div className={`grid gap-2 max-h-[160px] overflow-y-auto ${room.teamCount <= 2 ? 'grid-cols-2' : room.teamCount === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
            {Array.from({ length: room.teamCount }).map((_, tIdx) => (
              <div
                key={tIdx}
                className={`rounded-lg border p-2 min-h-[60px] transition-all cursor-pointer ${
                  dragOverTeam === tIdx
                    ? `${TEAM_BORDER_COLORS[tIdx]} ${TEAM_BG_COLORS[tIdx]} scale-[1.02]`
                    : room.selectedPlayer
                      ? `${TEAM_BORDER_COLORS[tIdx]} ${TEAM_BG_COLORS[tIdx]} hover:scale-[1.01]`
                      : 'border-border/50 bg-muted/10 hover:bg-muted/20'
                }`}
                onDragOver={e => handleDragOver(e, tIdx)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(tIdx)}
                onClick={() => handleTeamClick(tIdx)}
              >
                <span className={`font-orbitron text-[8px] font-bold tracking-wider mb-1.5 block ${TEAM_COLORS[tIdx]}`}>
                  TEAM {tIdx + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  {(room.teams[tIdx] || []).map(member => (
                    <div
                      key={member.id}
                      draggable
                      onDragStart={() => handleDragStart(member.id, tIdx)}
                      onClick={e => { e.stopPropagation(); handlePlayerClick(member); }}
                      className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md transition-all group ${
                        room.selectedPlayer?.id === member.id
                          ? 'bg-primary/20 border border-primary/40 ring-1 ring-primary/20'
                          : 'bg-muted/20 cursor-grab active:cursor-grabbing hover:bg-primary/10 border border-transparent'
                      }`}
                    >
                      <GripVertical className="w-2.5 h-2.5 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
                      <span className="font-rajdhani font-semibold text-[10px] text-foreground flex-1">{member.name}</span>
                      {member.isCreator && <Shield className="w-2 h-2 text-primary" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* FFA player list */
        <div className="min-h-0">
          <span className="section-label flex items-center gap-1 !mb-1.5">
            <Users className="w-3 h-3 text-primary" /> PLAYERS ({room.players.length}/{MAX_PLAYERS})
          </span>
          <div className="flex flex-col gap-0.5 max-h-[120px] overflow-y-auto">
            {room.players.map(p => (
              <div key={p.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="font-rajdhani font-semibold text-xs text-foreground">{p.name}</span>
                </div>
                {p.isCreator && <Shield className="w-2.5 h-2.5 text-primary" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite controls */}
      {(!room.isLocked || room.isCreator) && (
        <div className="flex gap-1.5">
          <input
            className="glass-input flex-1 !py-1.5 !px-2.5 !text-xs"
            placeholder="Player name..."
            value={inviteInput}
            onChange={e => setInviteInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && inviteInput.trim()) {
                room.invitePlayer(inviteInput.trim());
                setInviteInput('');
              }
            }}
          />
          <button
            className="pill-btn !px-2 !py-1.5 !text-[9px] gap-1"
            onClick={() => { if (inviteInput.trim()) { room.invitePlayer(inviteInput.trim()); setInviteInput(''); } }}
          >
            <UserPlus className="w-2.5 h-2.5" /> INVITE
          </button>
        </div>
      )}

      {/* Room Actions */}
      <div className="flex gap-2 pt-1">
        {room.isCreator && (
          <button className="pill-btn flex-1 justify-center !py-2 !text-[9px] gap-1" onClick={room.inviteParty}>
            <Users className="w-3 h-3" /> INVITE PARTY
          </button>
        )}
        <button
          className="launch-btn flex-1 !py-2 !text-[9px] gap-1"
          onClick={room.startMatch}
        >
          <Play className="w-3 h-3" /> {room.isCreator ? 'START PRIVATE MATCH' : 'READY UP'}
        </button>
      </div>
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
      {/* Invite banner */}
      <div id="social-direct-invite-banner" className="hidden border-primary/30">
        <div id="social-direct-invite-copy" className="text-xs font-rajdhani text-foreground mb-1.5" />
        <div id="social-direct-invite-actions" className="flex gap-1.5">
          <button id="social-direct-invite-accept-btn" className="pill-btn active flex-1 !text-[9px] !py-1.5">ACCEPT</button>
          <button id="social-direct-invite-dismiss-btn" className="pill-btn flex-1 !text-[9px] !py-1.5">DISMISS</button>
        </div>
      </div>

      {/* Party */}
      {!isSolo && (
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
                      className="pill-btn !px-1.5 !py-0.5 text-[8px]"
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
                              if (prev.find(m => m.name === f.name)) return prev;
                              return [...prev, { name: f.name, isLeader: false }];
                            });
                            toast({ title: `${f.name} joined your party` });
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
    <div className="flex flex-col gap-3 h-full min-h-0">
      {InviteBanner}
      {/* Top row: 3-col default, 2-col when room is open */}
      <div className={`grid gap-3 ${room.isInRoom ? 'grid-cols-1 sm:grid-cols-[minmax(250px,1fr)_2fr]' : 'grid-cols-1 sm:grid-cols-3'}`}>
        {room.isInRoom ? (
          <>
            <div className="flex flex-col justify-between h-full gap-3">
              {PlayCard}
              {QuickJoinCard}
            </div>
            {RoomCardContent}
          </>
        ) : (
          <>
            {PlayCard}
            {QuickJoinCard}
            {RoomCardContent}
          </>
        )}
      </div>

      {/* Social panel below if applicable */}
      {showSocialPanel && (
        <div className="grid grid-cols-1 gap-3 flex-1 min-h-0">
          {SocialPanel}
        </div>
      )}
    </div>
  );
};

export default HomeScreen;

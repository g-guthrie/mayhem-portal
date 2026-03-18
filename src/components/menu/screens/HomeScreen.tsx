import React, { useState, useCallback } from 'react';
import {
  Crosshair, ChevronDown, Swords, Target, Dumbbell,
  UserPlus, ArrowRight, Globe, Users, UserMinus,
  Copy, Lock, Unlock, Shuffle, Play, GripVertical,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMenuNav } from '@/hooks/useMenuNav';

/* ─── Game Modes ─── */
interface GameMode { id: string; label: string; icon: React.ReactNode; description: string }
const GAME_MODES: GameMode[] = [
  { id: 'ffa', label: 'FREE FOR ALL', icon: <Crosshair className="w-3.5 h-3.5" />, description: 'Every player for themselves' },
  { id: 'tdm', label: 'TEAM DEATHMATCH', icon: <Swords className="w-3.5 h-3.5" />, description: 'Team-based combat' },
  { id: 'lms', label: 'LAST MAN STANDING', icon: <Target className="w-3.5 h-3.5" />, description: 'Survive to win' },
  { id: 'practice', label: 'PRACTICE', icon: <Dumbbell className="w-3.5 h-3.5" />, description: 'Hone your skills' },
];

/* ─── Room config ─── */
const ROOM_MODES = [
  { id: 'ffa', label: 'FFA', icon: <Crosshair className="w-3 h-3" /> },
  { id: 'tdm', label: 'TDM', icon: <Swords className="w-3 h-3" /> },
  { id: 'lms', label: 'LMS', icon: <Target className="w-3 h-3" /> },
];
const TEAM_COUNTS = [2, 3, 4];

interface TeamMember { id: string; name: string }

/* ─── Fake data (shown when logged in) ─── */
const FAKE_FRIENDS = [
  { name: 'xVortex', status: 'online' as const, inGame: true },
  { name: 'NightOwl', status: 'online' as const, inGame: false },
  { name: 'BlazeFury', status: 'away' as const, inGame: false },
  { name: 'ShadowKnight', status: 'offline' as const, inGame: false },
];

const HomeScreen: React.FC = () => {
  const { isLoggedIn, displayName, actorId } = useAuth();
  const { push } = useMenuNav();

  /* Play state */
  const [selectedMode, setSelectedMode] = useState('ffa');
  const [modesOpen, setModesOpen] = useState(false);
  const currentMode = GAME_MODES.find(m => m.id === selectedMode)!;

  /* Quick join */
  const [friendId, setFriendId] = useState('');
  const [roomCode, setRoomCode] = useState('');

  /* Add friend */
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [addFriendId, setAddFriendId] = useState('');

  /* Party state - solo when alone */
  const [partyMembers, setPartyMembers] = useState<{ name: string; isLeader: boolean }[]>([
    { name: displayName, isLeader: true },
  ]);

  /* Room state */
  const [roomShareCode] = useState('7F3A');
  const [roomMode, setRoomMode] = useState('ffa');
  const [teamCount, setTeamCount] = useState(2);
  const [isLocked, setIsLocked] = useState(false);
  const [teams, setTeams] = useState<Record<number, TeamMember[]>>({
    0: [{ id: '1', name: 'You' }],
    1: [],
  });
  const [dragItem, setDragItem] = useState<{ teamIdx: number; memberIdx: number } | null>(null);

  const handleDragStart = (teamIdx: number, memberIdx: number) => setDragItem({ teamIdx, memberIdx });
  const handleDrop = useCallback((targetTeamIdx: number) => {
    if (!dragItem) return;
    const { teamIdx: srcTeam, memberIdx: srcIdx } = dragItem;
    if (srcTeam === targetTeamIdx) return;
    setTeams(prev => {
      const next = { ...prev };
      const srcMembers = [...(next[srcTeam] || [])];
      const targetMembers = [...(next[targetTeamIdx] || [])];
      const [moved] = srcMembers.splice(srcIdx, 1);
      targetMembers.push(moved);
      next[srcTeam] = srcMembers;
      next[targetTeamIdx] = targetMembers;
      return next;
    });
    setDragItem(null);
  }, [dragItem]);

  const randomizeTeams = () => {
    const all = Object.values(teams).flat();
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    const newTeams: Record<number, TeamMember[]> = {};
    for (let i = 0; i < teamCount; i++) newTeams[i] = [];
    shuffled.forEach((m, i) => newTeams[i % teamCount].push(m));
    setTeams(newTeams);
  };

  const isSolo = partyMembers.length <= 1;

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      {/* ═══ TOP ROW: Play + Quick Join ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Play Card */}
        <div id="menu-home-hero" className="glass-card p-3 sm:p-4 flex flex-col gap-3">
          <div id="play-mode-toolbar" className="flex items-center gap-2">
            <button id="primary-launch-btn" className="launch-btn flex-1 !py-3 !text-xs animate-pulse-glow">
              PLAY {currentMode.label}
            </button>
            <button
              id="game-modes-toggle-btn"
              className={`pill-btn !rounded-xl !px-2.5 !py-2.5 transition-transform ${modesOpen ? 'rotate-180 active' : ''}`}
              onClick={() => setModesOpen(!modesOpen)}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
          {modesOpen && (
            <div id="play-mode-options" className="grid grid-cols-2 gap-1.5 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
              {GAME_MODES.map(mode => (
                <button
                  key={mode.id}
                  id={mode.id === 'practice' ? 'practice-mode-btn' : `play-mode-${mode.id}-btn`}
                  className={`item-grid-btn !rounded-lg !p-2 text-left !min-h-0 ${selectedMode === mode.id ? 'selected' : ''}`}
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

        {/* Quick Join Card */}
        <div className="glass-card p-3 sm:p-4 flex flex-col gap-2">
          <span className="section-label !mb-0">QUICK JOIN</span>
          <div id="social-friend-id-stack" className="flex gap-1.5">
            <input
              id="party-id-input"
              className="glass-input flex-1 !py-1.5 !px-2.5 !text-xs !rounded-lg"
              placeholder="Friend ID"
              value={friendId}
              onChange={e => setFriendId(e.target.value)}
            />
            <button id="invite-friend-btn" className="pill-btn active !rounded-lg !px-2 !py-1.5" title="Invite">
              <UserPlus className="w-3 h-3" />
            </button>
            <button id="join-friend-btn" className="pill-btn !rounded-lg !px-2 !py-1.5" title="Join">
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div id="social-room-join-stack" className="flex gap-1.5">
            <input
              id="room-code-input"
              className="glass-input flex-1 !py-1.5 !px-2.5 !text-xs !rounded-lg"
              placeholder="Room Code"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value)}
            />
            <button id="join-room-btn" className="pill-btn !rounded-lg !px-2 !py-1.5" title="Join Room">
              <Globe className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM ROW: Social + Room ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-0">
        {/* Social Panel */}
        <div className="glass-card p-3 sm:p-4 flex flex-col gap-2.5 overflow-y-auto min-h-0">
          {/* Invite banner */}
          <div id="social-direct-invite-banner" className="hidden border-primary/30">
            <div id="social-direct-invite-copy" className="text-xs font-rajdhani text-foreground mb-1.5" />
            <div id="social-direct-invite-actions" className="flex gap-1.5">
              <button id="social-direct-invite-accept-btn" className="pill-btn active !rounded-lg flex-1 !text-[9px] !py-1.5">ACCEPT</button>
              <button id="social-direct-invite-dismiss-btn" className="pill-btn !rounded-lg flex-1 !text-[9px] !py-1.5">DISMISS</button>
            </div>
          </div>

          {/* Party */}
          <div id="menu-party-hero">
            <span className="section-label flex items-center gap-1 !mb-1.5">
              <Users className="w-3 h-3 text-primary" /> YOUR PARTY
            </span>

            {isSolo ? (
              /* ─── Solo / Empty Party State ─── */
              <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/10 border border-border/30">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="font-rajdhani font-semibold text-xs text-foreground">{displayName}</span>
                  <span className="text-[8px] font-orbitron text-muted-foreground tracking-wider">SOLO</span>
                </div>
                <button className="pill-btn !rounded-md !px-1.5 !py-0.5 text-[8px] gap-0.5">
                  <UserPlus className="w-2.5 h-2.5" /> INVITE
                </button>
              </div>
            ) : (
              /* ─── Party with members ─── */
              <>
                <div id="party-hero-members" className="flex flex-col gap-1">
                  {partyMembers.map(m => (
                    <div key={m.name} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/20">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="font-rajdhani font-semibold text-xs text-foreground">{m.name}</span>
                        {m.isLeader && <span className="text-[8px] font-orbitron text-primary tracking-wider">LEADER</span>}
                      </div>
                      {!m.isLeader && (
                        <button className="pill-btn !rounded-md !px-1.5 !py-0.5 text-[8px]" title="Remove">
                          <UserMinus className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div id="menu-party-actions" className="mt-1.5">
                  <button id="party-hero-leave-btn" className="pill-btn !rounded-lg w-full justify-center !py-1.5 !text-[9px] text-destructive border-destructive/30 hover:bg-destructive/10">
                    LEAVE PARTY
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Friends List — logged-in only */}
          {isLoggedIn && (
            <div id="menu-social-friends-pane" className="flex-1 min-h-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="section-label flex items-center gap-1 !mb-0">
                  <Users className="w-3 h-3 text-primary" /> FRIENDS
                </span>
                <button
                  className="pill-btn !rounded-md !px-1.5 !py-0.5 text-[8px] gap-0.5"
                  onClick={() => setAddFriendOpen(!addFriendOpen)}
                  title="Add Friend"
                >
                  <UserPlus className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">ADD</span>
                </button>
              </div>

              {/* Add friend inline input */}
              {addFriendOpen && (
                <div className="flex gap-1.5 mb-1.5 animate-fade-in-up" style={{ animationDuration: '0.15s' }}>
                  <input
                    className="glass-input flex-1 !py-1 !px-2 !text-xs !rounded-lg"
                    placeholder="Enter player ID..."
                    value={addFriendId}
                    onChange={e => setAddFriendId(e.target.value)}
                    autoFocus
                  />
                  <button className="pill-btn active !rounded-lg !px-2 !py-1 !text-[9px]">
                    SEND
                  </button>
                </div>
              )}

              <div id="social-friends-list" className="flex flex-col gap-0.5">
                {FAKE_FRIENDS.map(f => (
                  <div key={f.name} className="flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors hover:bg-muted/30 cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        f.status === 'online' ? 'bg-green-400' :
                        f.status === 'away' ? 'bg-yellow-500' : 'bg-muted-foreground/40'
                      }`} />
                      <span className="font-rajdhani font-semibold text-xs text-foreground">{f.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {f.inGame && <span className="text-[8px] font-orbitron text-primary tracking-wider">IN GAME</span>}
                      <button className="pill-btn !rounded-md !px-1.5 !py-0.5 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity" title="Invite to party">
                        <UserPlus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Room Panel */}
        <div className="glass-card p-3 sm:p-4 flex flex-col gap-2.5 overflow-y-auto min-h-0">
          {/* Room header */}
          <div className="flex items-center justify-between">
            <span className="section-label !mb-0">PRIVATE ROOM</span>
            <div id="room-share-panel" className="flex items-center gap-1.5">
              <span id="room-share-code" className="font-orbitron text-xs font-bold text-primary tracking-wider">{roomShareCode}</span>
              <button id="copy-room-code-btn" className="pill-btn !rounded-md !px-1.5 !py-1" title="Copy">
                <Copy className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Room invite banner */}
          <div id="room-social-invite-banner" className="hidden">
            <div id="room-social-invite-copy" />
            <div className="flex gap-1.5 mt-1">
              <button id="room-social-invite-accept-btn" className="pill-btn active !rounded-lg flex-1 !text-[9px]">ACCEPT</button>
              <button id="room-social-invite-dismiss-btn" className="pill-btn !rounded-lg flex-1 !text-[9px]">DISMISS</button>
            </div>
          </div>

          {/* Mode selector */}
          <div className="flex gap-1.5">
            {ROOM_MODES.map(mode => (
              <button
                key={mode.id}
                id={`private-room-mode-${mode.id}-btn`}
                className={`pill-btn !rounded-lg flex-1 justify-center gap-1 !text-[9px] !px-2 !py-1.5 ${roomMode === mode.id ? 'active' : ''}`}
                onClick={() => setRoomMode(mode.id)}
              >
                {mode.icon} {mode.label}
              </button>
            ))}
          </div>

          {roomMode !== 'ffa' && (
            <div className="flex gap-1.5">
              {TEAM_COUNTS.map(n => (
                <button
                  key={n}
                  className={`pill-btn !rounded-lg flex-1 justify-center !text-[9px] !px-2 !py-1.5 ${teamCount === n ? 'active' : ''}`}
                  onClick={() => setTeamCount(n)}
                >
                  {n} TEAMS
                </button>
              ))}
            </div>
          )}

          {/* Lock + Randomize */}
          <div className="flex gap-1.5">
            <button
              className={`pill-btn !rounded-lg flex-1 justify-center gap-1 !text-[9px] !px-2 !py-1.5 ${isLocked ? 'active' : ''}`}
              onClick={() => setIsLocked(!isLocked)}
            >
              {isLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
              {isLocked ? 'LOCKED' : 'OPEN'}
            </button>
            <button className="pill-btn !rounded-lg flex-1 justify-center gap-1 !text-[9px] !px-2 !py-1.5" onClick={randomizeTeams}>
              <Shuffle className="w-2.5 h-2.5" /> RANDOMIZE
            </button>
          </div>

          {/* Team Roster - Drag & Drop */}
          {roomMode !== 'ffa' && (
            <div className="flex-1 min-h-0">
              <span className="section-label flex items-center gap-1 !mb-1.5">
                <Users className="w-3 h-3 text-primary" /> TEAMS
              </span>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: teamCount }).map((_, tIdx) => (
                  <div
                    key={tIdx}
                    className="rounded-lg border border-border/50 p-2 min-h-[60px] transition-colors bg-muted/10 hover:bg-muted/20"
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => handleDrop(tIdx)}
                  >
                    <span className="font-orbitron text-[8px] font-bold text-primary tracking-wider mb-1 block">
                      TEAM {tIdx + 1}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      {(teams[tIdx] || []).map((member, mIdx) => (
                        <div
                          key={member.id}
                          draggable
                          onDragStart={() => handleDragStart(tIdx, mIdx)}
                          className="flex items-center gap-1.5 px-1.5 py-1 rounded-md bg-muted/20 cursor-grab active:cursor-grabbing hover:bg-primary/10 transition-colors group"
                        >
                          <GripVertical className="w-2.5 h-2.5 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="font-rajdhani font-semibold text-[10px] text-foreground">{member.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Room Actions */}
          <div className="flex gap-2 mt-auto pt-1">
            <button className="pill-btn !rounded-lg flex-1 justify-center !py-2 !text-[9px] gap-1">
              <Users className="w-3 h-3" /> INVITE
            </button>
            <button className="launch-btn flex-1 !py-2 !text-[9px] gap-1 !rounded-xl">
              <Play className="w-3 h-3" /> START
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;

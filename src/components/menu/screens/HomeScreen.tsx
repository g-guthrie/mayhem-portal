import React, { useState } from 'react';
import { Crosshair, ChevronDown, Zap, Swords, Target, Dumbbell, Users, Globe, UserPlus, ArrowRight } from 'lucide-react';
import { useMenuNav } from '@/hooks/useMenuNav';

interface GameMode {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const GAME_MODES: GameMode[] = [
  { id: 'ffa', label: 'FREE FOR ALL', icon: <Crosshair className="w-4 h-4" />, description: 'Every player for themselves' },
  { id: 'tdm', label: 'TEAM DEATHMATCH', icon: <Swords className="w-4 h-4" />, description: 'Team-based combat' },
  { id: 'lms', label: 'LAST MAN STANDING', icon: <Target className="w-4 h-4" />, description: 'Survive to win' },
  { id: 'practice', label: 'PRACTICE', icon: <Dumbbell className="w-4 h-4" />, description: 'Hone your skills' },
];

const HomeScreen: React.FC = () => {
  const { push } = useMenuNav();
  const [selectedMode, setSelectedMode] = useState('ffa');
  const [modesOpen, setModesOpen] = useState(false);
  const [friendId, setFriendId] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const currentMode = GAME_MODES.find(m => m.id === selectedMode)!;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Hero / Launch */}
      <div id="menu-home-hero" className="glass-card p-5 sm:p-6 flex flex-col gap-4">
        <div>
          <p id="mode-screen-kicker" className="section-label text-primary !mb-1">
            <Zap className="w-3 h-3 inline mr-1" />
            READY TO DEPLOY
          </p>
          <h1 id="mode-screen-title" className="font-orbitron text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            MAYHEM
          </h1>
        </div>

        <div id="play-mode-group" className="flex flex-col gap-3">
          <div id="play-mode-toolbar" className="flex items-center gap-3">
            <button id="primary-launch-btn" className="launch-btn flex-1 animate-pulse-glow">
              PLAY {currentMode.label}
            </button>
            <button
              id="game-modes-toggle-btn"
              className={`pill-btn !rounded-xl !px-3 !py-3 transition-transform ${modesOpen ? 'rotate-180 active' : ''}`}
              onClick={() => setModesOpen(!modesOpen)}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {modesOpen && (
            <div id="play-mode-options" className="grid grid-cols-2 gap-2 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
              {GAME_MODES.map(mode => (
                <button
                  key={mode.id}
                  id={mode.id === 'practice' ? 'practice-mode-btn' : `play-mode-${mode.id}-btn`}
                  className={`item-grid-btn !rounded-xl !p-3 text-left ${selectedMode === mode.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedMode(mode.id); setModesOpen(false); }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className={selectedMode === mode.id ? 'text-primary' : ''}>{mode.icon}</span>
                    <span className="font-orbitron text-[10px] font-bold tracking-wider">{mode.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-rajdhani">{mode.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div id="room-access-status" className="text-xs text-muted-foreground font-rajdhani font-medium" />
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Social Quick Card */}
        <button
          className="glass-card p-4 flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => push('social')}
        >
          <Users className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-orbitron text-[10px] font-bold tracking-wider text-foreground">SOCIAL</span>
          <span className="text-[10px] text-muted-foreground font-rajdhani">Friends & Party</span>
        </button>

        {/* Room Quick Card */}
        <button
          className="glass-card p-4 flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => push('room')}
        >
          <Globe className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-orbitron text-[10px] font-bold tracking-wider text-foreground">PRIVATE ROOM</span>
          <span className="text-[10px] text-muted-foreground font-rajdhani">Create & Join</span>
        </button>
      </div>

      {/* Inline Quick Join */}
      <div className="glass-card p-4 flex flex-col gap-3">
        <span className="section-label">QUICK JOIN</span>
        <div id="social-friend-id-stack" className="flex gap-2">
          <input
            id="party-id-input"
            className="glass-input flex-1 !py-2 !text-xs"
            placeholder="Friend ID"
            value={friendId}
            onChange={e => setFriendId(e.target.value)}
          />
          <button id="invite-friend-btn" className="pill-btn active !rounded-xl !px-3" title="Invite">
            <UserPlus className="w-3.5 h-3.5" />
          </button>
          <button id="join-friend-btn" className="pill-btn !rounded-xl !px-3" title="Join">
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div id="social-room-join-stack" className="flex gap-2">
          <input
            id="room-code-input"
            className="glass-input flex-1 !py-2 !text-xs"
            placeholder="Room Code"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value)}
          />
          <button id="join-room-btn" className="pill-btn !rounded-xl !px-3" title="Join Room">
            <Globe className="w-3.5 h-3.5" />
          </button>
        </div>
        <div id="social-hero-status" className="text-xs text-muted-foreground font-rajdhani" />
      </div>
    </div>
  );
};

export default HomeScreen;

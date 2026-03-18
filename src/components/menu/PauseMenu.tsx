import React, { useState, useEffect } from 'react';
import { Play, UserPlus, Settings, LogOut, X, AlertTriangle } from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';

const PauseMenu: React.FC = () => {
  const { togglePause, invitePlayer, leaveRoom, isPaused } = useRoom();
  const [view, setView] = useState<'main' | 'invite' | 'settings' | 'confirm-leave'>('main');
  const [inviteInput, setInviteInput] = useState('');

  // Reset view when pause menu opens
  useEffect(() => {
    if (isPaused) setView('main');
  }, [isPaused]);

  // ESC to close sub-views or resume
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (view !== 'main') {
          setView('main');
        } else {
          togglePause();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [view, togglePause]);

  if (!isPaused) return null;

  const handleInvite = () => {
    if (inviteInput.trim()) {
      invitePlayer(inviteInput.trim());
      setInviteInput('');
      setView('main');
    }
  };

  /* ─── Sub-views ─── */
  if (view === 'invite') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-md">
        <div className="glass-surface p-5 rounded-2xl max-w-xs w-full mx-4 animate-fade-in-up" style={{ borderRadius: 'var(--radius-xl)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-orbitron text-xs font-bold text-foreground tracking-wider">INVITE FRIEND</h3>
            <button className="pill-btn !rounded-lg !px-1.5 !py-1" onClick={() => setView('main')}>
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-1.5">
            <input
              className="glass-input flex-1 !py-2 !px-3 !text-xs !rounded-lg"
              placeholder="Player name..."
              value={inviteInput}
              onChange={e => setInviteInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
              autoFocus
            />
            <button className="pill-btn active !rounded-lg !px-3 !py-2 !text-[9px]" onClick={handleInvite}>
              INVITE
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'settings') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-md">
        <div className="glass-surface p-5 rounded-2xl max-w-xs w-full mx-4 animate-fade-in-up" style={{ borderRadius: 'var(--radius-xl)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-orbitron text-xs font-bold text-foreground tracking-wider">SETTINGS</h3>
            <button className="pill-btn !rounded-lg !px-1.5 !py-1" onClick={() => setView('main')}>
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {/* Compact in-game settings */}
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/20">
              <span className="font-rajdhani font-semibold text-xs text-foreground">Master Volume</span>
              <div className="w-20 h-1.5 rounded-full bg-muted/40 relative">
                <div className="absolute left-0 top-0 h-full w-3/4 rounded-full bg-primary" />
              </div>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/20">
              <span className="font-rajdhani font-semibold text-xs text-foreground">SFX Volume</span>
              <div className="w-20 h-1.5 rounded-full bg-muted/40 relative">
                <div className="absolute left-0 top-0 h-full w-1/2 rounded-full bg-primary" />
              </div>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/20">
              <span className="font-rajdhani font-semibold text-xs text-foreground">Mouse Sensitivity</span>
              <div className="w-20 h-1.5 rounded-full bg-muted/40 relative">
                <div className="absolute left-0 top-0 h-full w-2/3 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'confirm-leave') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-md">
        <div className="glass-surface p-5 rounded-2xl max-w-xs w-full mx-4 animate-fade-in-up" style={{ borderRadius: 'var(--radius-xl)' }}>
          <div className="flex flex-col items-center text-center gap-3">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <h3 className="font-orbitron text-xs font-bold text-foreground tracking-wider">LEAVE MATCH?</h3>
            <p className="font-rajdhani text-xs text-muted-foreground">You won't be able to rejoin this match.</p>
            <div className="flex gap-2 w-full mt-1">
              <button
                className="pill-btn !rounded-xl flex-1 justify-center !py-2.5 !text-[9px]"
                onClick={() => setView('main')}
              >
                CANCEL
              </button>
              <button
                className="pill-btn !rounded-xl flex-1 justify-center !py-2.5 !text-[9px] text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={leaveRoom}
              >
                LEAVE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Main pause menu ─── */
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="glass-surface p-5 rounded-2xl max-w-xs w-full mx-4 animate-fade-in-up" style={{ borderRadius: 'var(--radius-xl)' }}>
        <h3 className="font-orbitron text-sm font-bold text-foreground text-center mb-5 tracking-wider">PAUSED</h3>
        <div className="flex flex-col gap-2">
          <button
            className="glass-card p-3.5 flex items-center gap-3 cursor-pointer group text-left w-full"
            onClick={togglePause}
          >
            <Play className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-orbitron text-[10px] font-bold tracking-wider text-foreground">RESUME</span>
          </button>
          <button
            className="glass-card p-3.5 flex items-center gap-3 cursor-pointer group text-left w-full"
            onClick={() => setView('invite')}
          >
            <UserPlus className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-orbitron text-[10px] font-bold tracking-wider text-foreground">INVITE FRIEND</span>
          </button>
          <button
            className="glass-card p-3.5 flex items-center gap-3 cursor-pointer group text-left w-full"
            onClick={() => setView('settings')}
          >
            <Settings className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-orbitron text-[10px] font-bold tracking-wider text-foreground">SETTINGS</span>
          </button>
          <button
            className="glass-card p-3.5 flex items-center gap-3 cursor-pointer group text-left w-full border-destructive/10 hover:border-destructive/30"
            onClick={() => setView('confirm-leave')}
          >
            <LogOut className="w-4 h-4 text-destructive group-hover:scale-110 transition-transform" />
            <span className="font-orbitron text-[10px] font-bold tracking-wider text-destructive">LEAVE MATCH</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;

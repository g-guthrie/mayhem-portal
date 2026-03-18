import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

/* ─── Constants ─── */
export const MAX_PLAYERS = 16;
const DISCONNECT_GRACE_MS = 60_000;

export interface MatchStats {
  kills: number;
  deaths: number;
  assists: number;
}

/* ─── Types ─── */
export interface RoomPlayer {
  id: string;
  name: string;
  isCreator: boolean;
  isReady: boolean;
}

export type RoomMode = 'ffa' | 'tdm' | 'lms';

export interface DisconnectedPlayer {
  player: RoomPlayer;
  disconnectedAt: number;
  remainingMs: number;
}

interface RoomState {
  isInRoom: boolean;
  roomCode: string;
  mode: RoomMode;
  teamCount: number;
  isLocked: boolean;
  isCreator: boolean;
  players: RoomPlayer[];
  teams: Record<number, RoomPlayer[]>;
  selectedPlayer: RoomPlayer | null;
  pendingInvites: { from: string; roomCode: string }[];
  matchState: 'idle' | 'ready-check' | 'countdown' | 'in-match';
  countdownValue: number;
  readyPlayers: Set<string>;
  disconnectedPlayers: Map<string, DisconnectedPlayer>;
  isPaused: boolean;

  // Actions
  createRoom: (creatorName: string, creatorId: string) => void;
  joinRoom: (code: string, playerName: string, playerId: string) => void;
  leaveRoom: () => void;
  setMode: (mode: RoomMode) => void;
  setTeamCount: (count: number) => void;
  toggleLock: () => void;
  inviteParty: () => void;
  invitePlayer: (name: string) => void;
  selectPlayer: (player: RoomPlayer | null) => void;
  assignToTeam: (teamIdx: number) => void;
  movePlayer: (playerId: string, fromTeam: number, toTeam: number) => void;
  randomizeTeams: () => void;
  startMatch: () => void;
  toggleReady: (playerId: string) => void;
  acceptInvite: (roomCode: string) => void;
  dismissInvite: (roomCode: string) => void;
  addMockInvite: () => void;
  togglePause: () => void;
  kickPlayer: (playerId: string) => void;
  startPartyMatch: (partyMembers: { id: string; name: string }[]) => void;
}

const RoomContext = createContext<RoomState | null>(null);

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const MOCK_PLAYERS: Omit<RoomPlayer, 'isCreator' | 'isReady'>[] = [
  { id: 'bot1', name: 'xVortex' },
  { id: 'bot2', name: 'NightOwl' },
  { id: 'bot3', name: 'BlazeFury' },
  { id: 'bot4', name: 'ShadowKnight' },
  { id: 'bot5', name: 'IronWolf' },
];

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [mode, setModeState] = useState<RoomMode>('ffa');
  const [teamCount, setTeamCountState] = useState(2);
  const [isLocked, setIsLocked] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [teams, setTeams] = useState<Record<number, RoomPlayer[]>>({});
  const [selectedPlayer, setSelectedPlayer] = useState<RoomPlayer | null>(null);
  const [pendingInvites, setPendingInvites] = useState<{ from: string; roomCode: string }[]>([]);
  const [matchState, setMatchState] = useState<'idle' | 'ready-check' | 'countdown' | 'in-match'>('idle');
  const [countdownValue, setCountdownValue] = useState(3);
  const [readyPlayers, setReadyPlayers] = useState<Set<string>>(new Set());
  const [disconnectedPlayers, setDisconnectedPlayers] = useState<Map<string, DisconnectedPlayer>>(new Map());
  const [isPaused, setIsPaused] = useState(false);
  const disconnectTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /* ─── Disconnect grace period tick ─── */
  useEffect(() => {
    if (disconnectedPlayers.size === 0) return;
    const interval = setInterval(() => {
      setDisconnectedPlayers(prev => {
        const next = new Map(prev);
        const now = Date.now();
        let changed = false;
        next.forEach((dp, id) => {
          const remaining = DISCONNECT_GRACE_MS - (now - dp.disconnectedAt);
          if (remaining <= 0) {
            next.delete(id);
            changed = true;
            // Auto-remove from players and teams
            setPlayers(p => p.filter(pl => pl.id !== id));
            setTeams(t => {
              const updated: Record<number, RoomPlayer[]> = {};
              Object.keys(t).forEach(k => {
                updated[Number(k)] = t[Number(k)].filter(pl => pl.id !== id);
              });
              return updated;
            });
          } else {
            next.set(id, { ...dp, remainingMs: remaining });
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [disconnectedPlayers.size]);

  const initTeams = useCallback((playerList: RoomPlayer[], count: number) => {
    const t: Record<number, RoomPlayer[]> = {};
    for (let i = 0; i < count; i++) t[i] = [];
    playerList.forEach((p, i) => t[i % count].push(p));
    setTeams(t);
  }, []);

  const createRoom = useCallback((creatorName: string, creatorId: string) => {
    const code = generateRoomCode();
    const creator: RoomPlayer = { id: creatorId, name: creatorName, isCreator: true, isReady: false };
    setRoomCode(code);
    setIsInRoom(true);
    setIsCreator(true);
    setPlayers([creator]);
    setModeState('ffa');
    setTeamCountState(2);
    setIsLocked(false);
    setMatchState('idle');
    setReadyPlayers(new Set());
    setDisconnectedPlayers(new Map());
    setIsPaused(false);
    initTeams([creator], 2);
  }, [initTeams]);

  const joinRoom = useCallback((code: string, playerName: string, playerId: string) => {
    const joiner: RoomPlayer = { id: playerId, name: playerName, isCreator: false, isReady: false };
    const existingCreator: RoomPlayer = { id: 'host1', name: 'HostPlayer', isCreator: true, isReady: false };
    const mockExtra = MOCK_PLAYERS.slice(0, 2).map(p => ({ ...p, isCreator: false, isReady: false }));
    const all = [existingCreator, ...mockExtra, joiner];

    if (all.length > MAX_PLAYERS) {
      toast({ title: 'Room Full', description: `Maximum ${MAX_PLAYERS} players allowed.`, variant: 'destructive' });
      return;
    }

    setRoomCode(code.toUpperCase());
    setIsInRoom(true);
    setIsCreator(false);
    setPlayers(all);
    setMatchState('idle');
    setReadyPlayers(new Set());
    setDisconnectedPlayers(new Map());
    setIsPaused(false);
    initTeams(all, 2);
  }, [initTeams]);

  /* ─── Leave room with leadership transfer ─── */
  const leaveRoom = useCallback(() => {
    setPlayers(prev => {
      const remaining = prev.filter(p => !p.isCreator || prev.length === 1 ? true : true);
      // If the leaving player is the creator and others remain, transfer leadership
      const self = prev.find(p => p.isCreator);
      if (self && prev.length > 1) {
        const others = prev.filter(p => !p.isCreator);
        if (others.length > 0) {
          // Transfer to next player — handled below
        }
      }
      return [];
    });
    setIsInRoom(false);
    setRoomCode('');
    setPlayers([]);
    setTeams({});
    setIsCreator(false);
    setMatchState('idle');
    setSelectedPlayer(null);
    setDisconnectedPlayers(new Map());
    setIsPaused(false);
  }, []);

  /* ─── Kick player (also used for mock disconnect) ─── */
  const kickPlayer = useCallback((playerId: string) => {
    // Add to disconnected with grace period
    setPlayers(prev => {
      const player = prev.find(p => p.id === playerId);
      if (!player || player.isCreator) return prev;

      setDisconnectedPlayers(dp => {
        const next = new Map(dp);
        next.set(playerId, {
          player,
          disconnectedAt: Date.now(),
          remainingMs: DISCONNECT_GRACE_MS,
        });
        return next;
      });

      return prev; // Keep in roster but will be shown as disconnected
    });
  }, []);

  const setMode = useCallback((m: RoomMode) => setModeState(m), []);

  const setTeamCount = useCallback((count: number) => {
    setTeamCountState(count);
    const all = Object.values(teams).flat();
    if (all.length > 0) {
      const t: Record<number, RoomPlayer[]> = {};
      for (let i = 0; i < count; i++) t[i] = [];
      all.forEach((p, i) => t[i % count].push(p));
      setTeams(t);
    }
  }, [teams]);

  const toggleLock = useCallback(() => setIsLocked(l => !l), []);

  const inviteParty = useCallback(() => {
    const toAdd = MOCK_PLAYERS.slice(0, 2).map(p => ({ ...p, isCreator: false, isReady: false }));
    setPlayers(prev => {
      const existing = new Set(prev.map(p => p.id));
      const newOnes = toAdd.filter(p => !existing.has(p.id));
      if (prev.length + newOnes.length > MAX_PLAYERS) {
        const allowed = MAX_PLAYERS - prev.length;
        if (allowed <= 0) {
          toast({ title: 'Room Full', description: `Maximum ${MAX_PLAYERS} players.`, variant: 'destructive' });
          return prev;
        }
        newOnes.splice(allowed);
      }
      const updated = [...prev, ...newOnes];
      const allInTeams = Object.values(teams).flat();
      const notInTeams = updated.filter(p => !allInTeams.find(t => t.id === p.id));
      if (notInTeams.length > 0) {
        setTeams(prev => {
          const next = { ...prev };
          notInTeams.forEach((p, i) => {
            const targetTeam = i % teamCount;
            next[targetTeam] = [...(next[targetTeam] || []), p];
          });
          return next;
        });
      }
      return updated;
    });
  }, [teams, teamCount]);

  const invitePlayer = useCallback((name: string) => {
    if (isLocked) return;
    setPlayers(prev => {
      if (prev.length >= MAX_PLAYERS) {
        toast({ title: 'Room Full', description: `Maximum ${MAX_PLAYERS} players allowed.`, variant: 'destructive' });
        return prev;
      }
      const newPlayer: RoomPlayer = {
        id: `inv_${Date.now().toString(36)}`,
        name,
        isCreator: false,
        isReady: false,
      };
      setTeams(prevTeams => {
        let minTeam = 0;
        let minCount = Infinity;
        Object.entries(prevTeams).forEach(([idx, members]) => {
          if (members.length < minCount) {
            minCount = members.length;
            minTeam = Number(idx);
          }
        });
        return { ...prevTeams, [minTeam]: [...(prevTeams[minTeam] || []), newPlayer] };
      });

      // If mid-match, show join toast
      if (matchState === 'in-match') {
        toast({ title: `${name} joined the match` });
      }

      return [...prev, newPlayer];
    });
  }, [isLocked, matchState]);

  const selectPlayer = useCallback((player: RoomPlayer | null) => {
    setSelectedPlayer(player);
  }, []);

  const assignToTeam = useCallback((teamIdx: number) => {
    if (!selectedPlayer) return;
    setTeams(prev => {
      const next: Record<number, RoomPlayer[]> = {};
      Object.keys(prev).forEach(k => {
        next[Number(k)] = prev[Number(k)].filter(p => p.id !== selectedPlayer.id);
      });
      next[teamIdx] = [...(next[teamIdx] || []), selectedPlayer];
      return next;
    });
    setSelectedPlayer(null);
  }, [selectedPlayer]);

  const movePlayer = useCallback((playerId: string, fromTeam: number, toTeam: number) => {
    if (fromTeam === toTeam) return;
    setTeams(prev => {
      const next = { ...prev };
      const src = [...(next[fromTeam] || [])];
      const dest = [...(next[toTeam] || [])];
      const idx = src.findIndex(p => p.id === playerId);
      if (idx === -1) return prev;
      const [moved] = src.splice(idx, 1);
      dest.push(moved);
      next[fromTeam] = src;
      next[toTeam] = dest;
      return next;
    });
  }, []);

  const randomizeTeams = useCallback(() => {
    const all = Object.values(teams).flat();
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    const t: Record<number, RoomPlayer[]> = {};
    for (let i = 0; i < teamCount; i++) t[i] = [];
    shuffled.forEach((p, i) => t[i % teamCount].push(p));
    setTeams(t);
  }, [teams, teamCount]);

  const toggleReady = useCallback((playerId: string) => {
    setReadyPlayers(prev => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  }, []);

  const startMatch = useCallback(() => {
    if (matchState === 'idle') {
      setMatchState('ready-check');
      setReadyPlayers(new Set());
      players.forEach((p, i) => {
        if (!p.isCreator) {
          setTimeout(() => {
            setReadyPlayers(prev => new Set([...prev, p.id]));
          }, 800 + i * 600);
        }
      });
    } else if (matchState === 'ready-check') {
      setMatchState('countdown');
      setCountdownValue(3);
      const interval = setInterval(() => {
        setCountdownValue(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimeout(() => setMatchState('in-match'), 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [matchState, players]);

  const togglePause = useCallback(() => {
    if (matchState === 'in-match') {
      setIsPaused(p => !p);
    }
  }, [matchState]);

  /* ─── Party → Match shortcut ─── */
  const startPartyMatch = useCallback((partyMembers: { id: string; name: string }[]) => {
    if (partyMembers.length === 0) return;
    const code = generateRoomCode();
    const roomPlayers: RoomPlayer[] = partyMembers.map((m, i) => ({
      id: m.id,
      name: m.name,
      isCreator: i === 0,
      isReady: false,
    }));
    setRoomCode(code);
    setIsInRoom(true);
    setIsCreator(true);
    setPlayers(roomPlayers);
    setModeState('ffa');
    setTeamCountState(2);
    setIsLocked(true); // Ephemeral room locked by default
    setMatchState('idle');
    setReadyPlayers(new Set());
    setDisconnectedPlayers(new Map());
    setIsPaused(false);
    initTeams(roomPlayers, 2);
    // Auto-start ready check
    setTimeout(() => {
      setMatchState('ready-check');
      setReadyPlayers(new Set());
      roomPlayers.forEach((p, i) => {
        if (!p.isCreator) {
          setTimeout(() => {
            setReadyPlayers(prev => new Set([...prev, p.id]));
          }, 800 + i * 600);
        }
      });
    }, 300);
  }, [initTeams]);

  const acceptInvite = useCallback((code: string) => {
    setPendingInvites(prev => prev.filter(i => i.roomCode !== code));
    joinRoom(code, 'You', 'self_' + Date.now().toString(36));
  }, [joinRoom]);

  const dismissInvite = useCallback((code: string) => {
    setPendingInvites(prev => prev.filter(i => i.roomCode !== code));
  }, []);

  const addMockInvite = useCallback(() => {
    const from = MOCK_PLAYERS[Math.floor(Math.random() * MOCK_PLAYERS.length)].name;
    const code = generateRoomCode();
    setPendingInvites(prev => [...prev, { from, roomCode: code }]);
  }, []);

  return (
    <RoomContext.Provider value={{
      isInRoom, roomCode, mode, teamCount, isLocked, isCreator, players, teams,
      selectedPlayer, pendingInvites, matchState, countdownValue, readyPlayers,
      disconnectedPlayers, isPaused,
      createRoom, joinRoom, leaveRoom, setMode, setTeamCount, toggleLock,
      inviteParty, invitePlayer, selectPlayer, assignToTeam, movePlayer,
      randomizeTeams, startMatch, toggleReady, acceptInvite, dismissInvite, addMockInvite,
      togglePause, kickPlayer, startPartyMatch,
    }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoom must be used within RoomProvider');
  return ctx;
};

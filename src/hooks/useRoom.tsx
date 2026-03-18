import React, { createContext, useContext, useState, useCallback } from 'react';

/* ─── Types ─── */
export interface RoomPlayer {
  id: string;
  name: string;
  isCreator: boolean;
  isReady: boolean;
}

export type RoomMode = 'ffa' | 'tdm' | 'lms';

interface RoomState {
  isInRoom: boolean;
  roomCode: string;
  mode: RoomMode;
  teamCount: number;
  isLocked: boolean;
  isCreator: boolean;
  players: RoomPlayer[];
  teams: Record<number, RoomPlayer[]>;
  /** Player selected for click-to-assign */
  selectedPlayer: RoomPlayer | null;
  /** Pending invites received */
  pendingInvites: { from: string; roomCode: string }[];
  /** Match state */
  matchState: 'idle' | 'ready-check' | 'countdown' | 'in-match';
  countdownValue: number;
  readyPlayers: Set<string>;

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
    initTeams([creator], 2);
  }, [initTeams]);

  const joinRoom = useCallback((code: string, playerName: string, playerId: string) => {
    const joiner: RoomPlayer = { id: playerId, name: playerName, isCreator: false, isReady: false };
    // Simulate joining with some existing players
    const existingCreator: RoomPlayer = { id: 'host1', name: 'HostPlayer', isCreator: true, isReady: false };
    const mockExtra = MOCK_PLAYERS.slice(0, 2).map(p => ({ ...p, isCreator: false, isReady: false }));
    const all = [existingCreator, ...mockExtra, joiner];
    setRoomCode(code.toUpperCase());
    setIsInRoom(true);
    setIsCreator(false);
    setPlayers(all);
    setMatchState('idle');
    setReadyPlayers(new Set());
    initTeams(all, 2);
  }, [initTeams]);

  const leaveRoom = useCallback(() => {
    setIsInRoom(false);
    setRoomCode('');
    setPlayers([]);
    setTeams({});
    setIsCreator(false);
    setMatchState('idle');
    setSelectedPlayer(null);
  }, []);

  const setMode = useCallback((m: RoomMode) => setModeState(m), []);

  const setTeamCount = useCallback((count: number) => {
    setTeamCountState(count);
    // Redistribute
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
    // Mock: add 2 mock players after a short delay to simulate acceptance
    const toAdd = MOCK_PLAYERS.slice(0, 2).map(p => ({ ...p, isCreator: false, isReady: false }));
    setPlayers(prev => {
      const existing = new Set(prev.map(p => p.id));
      const newOnes = toAdd.filter(p => !existing.has(p.id));
      const updated = [...prev, ...newOnes];
      // Also update teams
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
    const newPlayer: RoomPlayer = {
      id: `inv_${Date.now().toString(36)}`,
      name,
      isCreator: false,
      isReady: false,
    };
    setPlayers(prev => [...prev, newPlayer]);
    setTeams(prev => {
      // Find team with fewest members
      let minTeam = 0;
      let minCount = Infinity;
      Object.entries(prev).forEach(([idx, members]) => {
        if (members.length < minCount) {
          minCount = members.length;
          minTeam = Number(idx);
        }
      });
      return { ...prev, [minTeam]: [...(prev[minTeam] || []), newPlayer] };
    });
  }, [isLocked]);

  const selectPlayer = useCallback((player: RoomPlayer | null) => {
    setSelectedPlayer(player);
  }, []);

  const assignToTeam = useCallback((teamIdx: number) => {
    if (!selectedPlayer) return;
    setTeams(prev => {
      const next: Record<number, RoomPlayer[]> = {};
      // Remove from all teams
      Object.keys(prev).forEach(k => {
        next[Number(k)] = prev[Number(k)].filter(p => p.id !== selectedPlayer.id);
      });
      // Add to target
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
      // Creator initiates ready check
      setMatchState('ready-check');
      setReadyPlayers(new Set());
      // Mock: bots ready up after staggered delays
      players.forEach((p, i) => {
        if (!p.isCreator) {
          setTimeout(() => {
            setReadyPlayers(prev => new Set([...prev, p.id]));
          }, 800 + i * 600);
        }
      });
    } else if (matchState === 'ready-check') {
      // Force start countdown
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

  const acceptInvite = useCallback((code: string) => {
    setPendingInvites(prev => prev.filter(i => i.roomCode !== code));
    // Auto-join the room
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
      createRoom, joinRoom, leaveRoom, setMode, setTeamCount, toggleLock,
      inviteParty, invitePlayer, selectPlayer, assignToTeam, movePlayer,
      randomizeTeams, startMatch, toggleReady, acceptInvite, dismissInvite, addMockInvite,
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

/**
 * server-adapter.ts
 *
 * Defines the interface your WebSocket/networking layer must implement.
 * The menu hooks (useAuth, useRoom) call these methods — you provide the
 * real implementation that talks to your game server.
 *
 * Usage:
 *   import { setServerAdapter } from '@/lib/server-adapter';
 *   setServerAdapter(myColyseusAdapter);  // call once at boot
 */

/* ─── Auth ─── */
export interface ServerAuthAdapter {
  /** Attempt login — resolve with user data or reject */
  login(username: string, pin: string): Promise<{ id: string; username: string; displayName: string }>;
  /** Log out current user */
  logout(): Promise<void>;
  /** Restore session on page load (e.g. from token) — null if no session */
  restoreSession(): Promise<{ id: string; username: string; displayName: string } | null>;
}

/* ─── Room / Matchmaking ─── */
export interface RoomPlayer {
  id: string;
  name: string;
  isCreator: boolean;
  isReady: boolean;
}

export type RoomMode = 'ffa' | 'tdm' | 'lms';

export interface RoomInfo {
  code: string;
  mode: RoomMode;
  teamCount: number;
  isLocked: boolean;
  isCreator: boolean;
  players: RoomPlayer[];
  teams: Record<number, RoomPlayer[]>;
}

export interface MatchResult {
  isWinner: boolean;
  placement: number;
  totalPlayers: number;
}

export interface MatchStats {
  kills: number;
  deaths: number;
  assists: number;
}

export interface ServerRoomCallbacks {
  onPlayerJoin: (player: RoomPlayer) => void;
  onPlayerLeave: (playerId: string) => void;
  onPlayerReady: (playerId: string, ready: boolean) => void;
  onRoomUpdate: (info: Partial<RoomInfo>) => void;
  onMatchStateChange: (state: 'idle' | 'ready-check' | 'countdown' | 'in-match' | 'post-match') => void;
  onCountdown: (value: number) => void;
  onMatchEnd: (result: MatchResult, stats: MatchStats) => void;
  onPlayerDisconnect: (playerId: string) => void;
  onPlayerReconnect: (playerId: string) => void;
  onError: (msg: string) => void;
}

export interface ServerRoomAdapter {
  /** Create a new room, returns room info */
  createRoom(creatorName: string, creatorId: string): Promise<RoomInfo>;
  /** Join an existing room by code */
  joinRoom(code: string, playerName: string, playerId: string): Promise<RoomInfo>;
  /** Leave the current room */
  leaveRoom(): Promise<void>;
  /** Set game mode (creator only) */
  setMode(mode: RoomMode): Promise<void>;
  /** Set team count (creator only) */
  setTeamCount(count: number): Promise<void>;
  /** Toggle room lock (creator only) */
  toggleLock(): Promise<void>;
  /** Move a player between teams */
  movePlayer(playerId: string, fromTeam: number, toTeam: number): Promise<void>;
  /** Randomize team assignments */
  randomizeTeams(): Promise<void>;
  /** Toggle ready status */
  toggleReady(playerId: string): Promise<void>;
  /** Start the match (creator: triggers ready-check or countdown) */
  startMatch(): Promise<void>;
  /** Kick a player */
  kickPlayer(playerId: string): Promise<void>;
  /** Invite a player by name/id */
  invitePlayer(nameOrId: string): Promise<void>;
  /** Pause/unpause (if supported) */
  togglePause(): Promise<void>;
  /** Signal intent to return to lobby after post-match */
  returnToLobby(): Promise<void>;
  /** Register callbacks for server-pushed events */
  registerCallbacks(callbacks: ServerRoomCallbacks): void;
}

/* ─── Singleton ─── */
let authAdapter: ServerAuthAdapter | null = null;
let roomAdapter: ServerRoomAdapter | null = null;

export function setAuthAdapter(adapter: ServerAuthAdapter) {
  authAdapter = adapter;
}

export function setRoomAdapter(adapter: ServerRoomAdapter) {
  roomAdapter = adapter;
}

export function getAuthAdapter(): ServerAuthAdapter {
  if (!authAdapter) throw new Error('ServerAuthAdapter not set — call setAuthAdapter() at boot');
  return authAdapter;
}

export function getRoomAdapter(): ServerRoomAdapter {
  if (!roomAdapter) throw new Error('ServerRoomAdapter not set — call setRoomAdapter() at boot');
  return roomAdapter;
}

/* ─── Mock flag ─── */
let useMocks = true;

export function setUseMocks(value: boolean) {
  useMocks = value;
}

export function isUsingMocks(): boolean {
  return useMocks;
}

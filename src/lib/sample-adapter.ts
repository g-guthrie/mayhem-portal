/**
 * sample-adapter.ts
 *
 * Example implementation of ServerAuthAdapter and ServerRoomAdapter.
 * Replace the WebSocket/fetch calls with your actual game server protocol.
 *
 * Wire up at app boot:
 *   import { setAuthAdapter, setRoomAdapter, setUseMocks } from '@/lib/server-adapter';
 *   import { createAuthAdapter, createRoomAdapter } from '@/lib/sample-adapter';
 *   setUseMocks(false);
 *   setAuthAdapter(createAuthAdapter('wss://your-server.com'));
 *   setRoomAdapter(createRoomAdapter('wss://your-server.com'));
 */

import type { ServerAuthAdapter, ServerRoomAdapter, ServerRoomCallbacks, RoomInfo } from './server-adapter';

/* ─── Auth ─── */
export function createAuthAdapter(serverUrl: string): ServerAuthAdapter {
  return {
    async login(username, pin) {
      const res = await fetch(`${serverUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      sessionStorage.setItem('auth-token', data.token);
      return { id: data.id, username: data.username, displayName: data.displayName };
    },

    async logout() {
      sessionStorage.removeItem('auth-token');
    },

    async restoreSession() {
      const token = sessionStorage.getItem('auth-token');
      if (!token) return null;
      const res = await fetch(`${serverUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return { id: data.id, username: data.username, displayName: data.displayName };
    },
  };
}

/* ─── Room ─── */
export function createRoomAdapter(serverUrl: string): ServerRoomAdapter {
  let ws: WebSocket | null = null;
  let callbacks: ServerRoomCallbacks | null = null;

  function send(type: string, payload?: unknown) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, ...payload as object }));
    }
  }

  function connectWs(roomCode: string) {
    const wsUrl = serverUrl.replace(/^http/, 'ws');
    ws = new WebSocket(`${wsUrl}/room/${roomCode}`);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (!callbacks) return;
      switch (msg.type) {
        case 'player-join': callbacks.onPlayerJoin(msg.player); break;
        case 'player-leave': callbacks.onPlayerLeave(msg.playerId); break;
        case 'player-ready': callbacks.onPlayerReady(msg.playerId, msg.ready); break;
        case 'room-update': callbacks.onRoomUpdate(msg.info); break;
        case 'match-state': callbacks.onMatchStateChange(msg.state); break;
        case 'countdown': callbacks.onCountdown(msg.value); break;
        case 'match-end': callbacks.onMatchEnd(msg.result, msg.stats); break;
        case 'player-disconnect': callbacks.onPlayerDisconnect(msg.playerId); break;
        case 'player-reconnect': callbacks.onPlayerReconnect(msg.playerId); break;
        case 'error': callbacks.onError(msg.message); break;
      }
    };
    ws.onerror = () => callbacks?.onError('Connection lost');
    ws.onclose = () => { ws = null; };
  }

  return {
    async createRoom(creatorName, creatorId) {
      const token = sessionStorage.getItem('auth-token');
      const res = await fetch(`${serverUrl}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ creatorName, creatorId }),
      });
      if (!res.ok) throw new Error('Failed to create room');
      const info: RoomInfo = await res.json();
      connectWs(info.code);
      return info;
    },

    async joinRoom(code, playerName, playerId) {
      const token = sessionStorage.getItem('auth-token');
      const res = await fetch(`${serverUrl}/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ playerName, playerId }),
      });
      if (!res.ok) throw new Error('Failed to join room');
      const info: RoomInfo = await res.json();
      connectWs(info.code);
      return info;
    },

    async leaveRoom() { send('leave'); ws?.close(); ws = null; },
    async setMode(mode) { send('set-mode', { mode }); },
    async setTeamCount(count) { send('set-team-count', { count }); },
    async toggleLock() { send('toggle-lock'); },
    async movePlayer(playerId, fromTeam, toTeam) { send('move-player', { playerId, fromTeam, toTeam }); },
    async randomizeTeams() { send('randomize-teams'); },
    async toggleReady(playerId) { send('toggle-ready', { playerId }); },
    async startMatch() { send('start-match'); },
    async kickPlayer(playerId) { send('kick-player', { playerId }); },
    async invitePlayer(nameOrId) { send('invite-player', { nameOrId }); },
    async togglePause() { send('toggle-pause'); },
    async returnToLobby() { send('return-to-lobby'); },

    registerCallbacks(cbs) { callbacks = cbs; },
  };
}

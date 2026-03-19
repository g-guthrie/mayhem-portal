/**
 * bridge-listeners.js
 *
 * Wiring file — import from your runtime bootstrap to connect
 * gameBridge events to your Three.js game loop.
 *
 * Usage:
 *   import { initBridgeListeners, destroyBridgeListeners } from '../bridge-listeners.js';
 *   initBridgeListeners({ scene, gameLoop, world, hud });
 */

import { gameBridge } from '../src/lib/game-bridge';

/**
 * @param {object} deps
 * @param {object} deps.scene     - Three.js scene
 * @param {object} deps.gameLoop  - { start(), stop(), pause(), resume() }
 * @param {object} deps.world     - { spawn(players, mode), cleanup(), loadLobby(), addPlayer(data), removePlayer(data) }
 * @param {object} deps.hud       - { showCountdown(value), hideCountdown() }
 */
export function initBridgeListeners({ scene, gameLoop, world, hud }) {
  const overlay = document.getElementById('overlay');

  gameBridge.on('countdown', ({ value }) => {
    hud?.showCountdown?.(value);
  });

  gameBridge.on('match-start', ({ players, mode }) => {
    world?.spawn?.(players, mode);
    gameLoop?.start?.();
  });

  gameBridge.on('pause', () => {
    gameLoop?.pause?.();
  });

  gameBridge.on('unpause', () => {
    gameLoop?.resume?.();
  });

  gameBridge.on('match-end', () => {
    gameLoop?.stop?.();
    world?.cleanup?.();
  });

  gameBridge.on('match-cancelled', () => {
    hud?.hideCountdown?.();
  });

  gameBridge.on('return-to-lobby', () => {
    world?.loadLobby?.();
  });

  gameBridge.on('player-join', (data) => {
    world?.addPlayer?.(data);
  });

  gameBridge.on('player-leave', (data) => {
    world?.removePlayer?.(data);
  });
}

export function destroyBridgeListeners() {
  gameBridge.clear();
}

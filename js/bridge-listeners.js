/**
 * bridge-listeners.js
 * 
 * Sample wiring file — import this from your runtime bootstrap
 * (e.g. js/runtime/gameplay-runtime-bootstrap.js) to connect
 * all gameBridge events to your Three.js game loop.
 *
 * Usage:
 *   import { initBridgeListeners } from '../bridge-listeners.js';
 *   initBridgeListeners(scene, gameLoop);
 */

import { gameBridge } from '../src/lib/game-bridge';

/**
 * @param {object} deps - Your runtime dependencies
 * @param {object} deps.scene       - Three.js scene reference
 * @param {object} deps.gameLoop    - Your game loop controller (start/stop/pause)
 * @param {object} deps.world       - World manager (spawn/despawn)
 * @param {object} deps.hud         - HUD controller (countdown overlay, kill feed)
 */
export function initBridgeListeners({ scene, gameLoop, world, hud }) {
  const overlay = document.getElementById('overlay');

  // ─── Menu → Runtime events ───

  gameBridge.on('countdown', ({ value }) => {
    // Show countdown on the 3D canvas (3, 2, 1, GO!)
    if (hud?.showCountdown) {
      hud.showCountdown(value);
    }
    console.log(`[Bridge] Countdown: ${value}`);
  });

  gameBridge.on('match-start', ({ players, mode }) => {
    // 1. Hide menu overlay — let canvas receive input
    if (overlay) overlay.style.pointerEvents = 'none';

    // 2. Initialize the game world
    if (world?.spawn) {
      world.spawn(players, mode);
    }

    // 3. Start the game loop
    if (gameLoop?.start) {
      gameLoop.start();
    }

    console.log(`[Bridge] Match started — mode: ${mode}, players: ${players.length}`);
  });

  gameBridge.on('pause', () => {
    // Freeze game loop, re-enable menu overlay for pause menu
    if (gameLoop?.pause) gameLoop.pause();
    if (overlay) overlay.style.pointerEvents = 'auto';
    console.log('[Bridge] Game paused');
  });

  gameBridge.on('unpause', () => {
    // Resume game loop, hide menu overlay
    if (gameLoop?.resume) gameLoop.resume();
    if (overlay) overlay.style.pointerEvents = 'none';
    console.log('[Bridge] Game resumed');
  });

  gameBridge.on('match-end', () => {
    // Stop game loop, cleanup world
    if (gameLoop?.stop) gameLoop.stop();
    if (world?.cleanup) world.cleanup();
    console.log('[Bridge] Match ended');
  });

  gameBridge.on('match-cancelled', () => {
    // Ready-check or countdown was aborted — no cleanup needed
    // but reset any countdown UI on the canvas
    if (hud?.hideCountdown) hud.hideCountdown();
    console.log('[Bridge] Match cancelled');
  });

  gameBridge.on('return-to-lobby', () => {
    // Restore idle state — lobby camera, ambient scene
    if (overlay) overlay.style.pointerEvents = 'auto';
    if (world?.loadLobby) world.loadLobby();
    console.log('[Bridge] Returned to lobby');
  });

  gameBridge.on('player-join', (data) => {
    // Mid-match player join
    if (world?.addPlayer) world.addPlayer(data);
    console.log(`[Bridge] Player joined: ${data?.name}`);
  });

  gameBridge.on('player-leave', (data) => {
    // Mid-match player leave
    if (world?.removePlayer) world.removePlayer(data);
    console.log(`[Bridge] Player left: ${data?.id}`);
  });

  // ─── Runtime → Menu events (call these from your game code) ───

  /**
   * Example: when your server tells you the match is over:
   *   gameBridge.emit('runtime-match-end', { winner: 'player1' });
   *
   * Example: when a kill happens:
   *   gameBridge.emit('runtime-kill', { killer: 'p1', victim: 'p2', weapon: 'rifle' });
   *
   * React listens for these in GameBridgeSync or dedicated hooks.
   */

  console.log('[Bridge] All listeners initialized');
}

/**
 * Tear down all bridge listeners — call on full app cleanup
 */
export function destroyBridgeListeners() {
  gameBridge.clear();
  console.log('[Bridge] All listeners destroyed');
}

/* ─── Game Bridge ───
   Thin event bus connecting React menu state ↔ vanilla Three.js runtime.
   Import from either side: `import { gameBridge } from '@/lib/game-bridge'`
   or `import { gameBridge } from '../src/lib/game-bridge'` in vanilla JS.
*/

/* Events emitted by React → consumed by vanilla JS runtime */
export type MenuEvent =
  | 'match-start'
  | 'match-end'
  | 'match-cancelled'
  | 'pause'
  | 'unpause'
  | 'player-join'
  | 'player-leave'
  | 'countdown'
  | 'return-to-lobby';

/* Events emitted by vanilla JS runtime → consumed by React */
export type RuntimeEvent =
  | 'runtime-match-end'      // runtime signals match is over (e.g. server says so)
  | 'runtime-kill'           // player got a kill
  | 'runtime-death'          // player died
  | 'runtime-score-update'   // score/stat update
  | 'runtime-player-join'    // a player connected in-game
  | 'runtime-player-leave';  // a player disconnected in-game

export type GameEvent = MenuEvent | RuntimeEvent;

type Callback = (data?: any) => void;

const listeners = new Map<GameEvent, Set<Callback>>();

export const gameBridge = {
  emit(event: GameEvent, data?: unknown) {
    listeners.get(event)?.forEach((fn) => fn(data));
  },

  on(event: GameEvent, fn: Callback): () => void {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(fn);
    return () => {
      listeners.get(event)?.delete(fn);
    };
  },

  off(event: GameEvent, fn: Callback) {
    listeners.get(event)?.delete(fn);
  },

  /** Remove all listeners — useful for cleanup */
  clear() {
    listeners.clear();
  },
};

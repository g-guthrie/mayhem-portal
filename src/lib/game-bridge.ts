/* ─── Game Bridge ───
   Thin event bus connecting React menu state ↔ vanilla Three.js runtime.
   Import from either side: `import { gameBridge } from '@/lib/game-bridge'`
   or `import { gameBridge } from '../src/lib/game-bridge'` in vanilla JS.
*/

export type GameEvent =
  | 'match-start'
  | 'match-end'
  | 'pause'
  | 'unpause'
  | 'player-join'
  | 'player-leave'
  | 'countdown'
  | 'return-to-lobby';

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

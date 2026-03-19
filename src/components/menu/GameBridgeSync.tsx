import { useEffect, useRef } from 'react';
import { useRoom } from '@/hooks/useRoom';
import { gameBridge } from '@/lib/game-bridge';

/**
 * GameBridgeSync — headless component that emits game-bridge events
 * whenever React menu state changes, so the vanilla Three.js runtime
 * can react without importing React.
 *
 * Mount once inside RoomProvider. Renders nothing.
 */
export const GameBridgeSync: React.FC = () => {
  const { matchState, countdownValue, players, mode, isPaused } = useRoom();
  const prevMatchState = useRef(matchState);
  const prevPaused = useRef(isPaused);

  useEffect(() => {
    const prev = prevMatchState.current;
    prevMatchState.current = matchState;

    if (prev !== matchState) {
      // Cancelled from ready-check or countdown (player left / cancelled)
      if ((prev === 'ready-check' || prev === 'countdown') && matchState === 'idle') {
        gameBridge.emit('match-cancelled');
        return;
      }

      // Left mid-match → emit match-end + return-to-lobby
      if (prev === 'in-match' && matchState === 'idle') {
        gameBridge.emit('match-end');
        gameBridge.emit('return-to-lobby');
        return;
      }

      switch (matchState) {
        case 'countdown':
          gameBridge.emit('countdown', { value: countdownValue });
          break;
        case 'in-match':
          gameBridge.emit('match-start', {
            players: players.map((p) => ({ id: p.id, name: p.name })),
            mode,
          });
          break;
        case 'post-match':
          gameBridge.emit('match-end');
          break;
        case 'idle':
          if (prev === 'post-match') {
            gameBridge.emit('return-to-lobby');
          }
          break;
      }
    }
  }, [matchState, countdownValue, players, mode]);

  // Countdown tick
  useEffect(() => {
    if (matchState === 'countdown') {
      gameBridge.emit('countdown', { value: countdownValue });
    }
  }, [countdownValue, matchState]);

  // Pause / unpause
  useEffect(() => {
    if (prevPaused.current !== isPaused) {
      prevPaused.current = isPaused;
      gameBridge.emit(isPaused ? 'pause' : 'unpause');
    }
  }, [isPaused]);

  return null;
};

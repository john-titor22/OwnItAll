import { useEffect, useRef, useState } from 'react';
import { GameState } from '../game/types';

const BOARD_SIZE    = 28;
const STEP_MS       = 150;   // ms per tile step
const INITIAL_DELAY = 1300;  // wait for dice overlay to settle
const MAX_STEPS     = 12;    // teleport instead of animating longer paths (jail, etc.)

export function useTokenAnimation(
  gameState: GameState | null,
): Record<string, number> {
  const [displayPos, setDisplayPos] = useState<Record<string, number>>({});
  const prevPos     = useRef<Record<string, number>>({});
  const initialized = useRef(false);
  const timers      = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!gameState) return;

    const players = gameState.players;

    // First load — set positions instantly, no animation
    if (!initialized.current) {
      const init = Object.fromEntries(
        Object.entries(players).map(([id, p]) => [id, p.position]),
      );
      setDisplayPos(init);
      prevPos.current = { ...init };
      initialized.current = true;
      return;
    }

    Object.entries(players).forEach(([pid, player]) => {
      const from = prevPos.current[pid];
      const to   = player.position;

      if (from === undefined) {
        prevPos.current[pid] = to;
        setDisplayPos(prev => ({ ...prev, [pid]: to }));
        return;
      }
      if (from === to) return;

      // Build step path (circular)
      const steps: number[] = [];
      let cur = from;
      while (cur !== to) {
        cur = (cur + 1) % BOARD_SIZE;
        steps.push(cur);
      }

      prevPos.current[pid] = to;

      // Long jumps (jail teleport etc.) → instant
      if (steps.length > MAX_STEPS) {
        setDisplayPos(prev => ({ ...prev, [pid]: to }));
        return;
      }

      // Animate step-by-step after initial delay
      steps.forEach((stepPos, i) => {
        const t = setTimeout(() => {
          setDisplayPos(prev => ({ ...prev, [pid]: stepPos }));
        }, INITIAL_DELAY + i * STEP_MS);
        timers.current.push(t);
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(
    Object.fromEntries(
      Object.entries(gameState?.players ?? {}).map(([k, v]) => [k, v.position]),
    ),
  )]);

  // Clear all pending timers on unmount
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  return displayPos;
}

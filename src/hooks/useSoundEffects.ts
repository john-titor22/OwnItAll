import { useEffect, useRef, useState, useCallback } from 'react';
import { gameAudio } from '../audio/gameAudio';
import { GameState } from '../game/types';

export function useSoundEffects(gameState: GameState | null, myId: string) {
  const [muted, setMuted] = useState(false);

  const prevDice     = useRef<string>('');
  const prevCard     = useRef<number | undefined>(undefined);
  const prevLogLen   = useRef<number>(0);
  const prevBankrupt = useRef<boolean>(false);
  const prevStatus   = useRef<string>('');

  useEffect(() => {
    if (!gameState) return;

    const log = Array.isArray(gameState.log)
      ? gameState.log
      : (Object.values(gameState.log ?? {}) as string[]);

    // ── Dice rolled ──
    const diceKey = JSON.stringify(gameState.diceResult);
    if (gameState.diceResult && diceKey !== prevDice.current) {
      gameAudio.play('dice');
    }
    prevDice.current = diceKey;

    // ── Chance card appeared ──
    const cardId = gameState.lastChanceCard?.id;
    if (cardId !== undefined && cardId !== prevCard.current) {
      gameAudio.play('card');
    }
    prevCard.current = cardId;

    // ── Parse new log entries for semantic events ──
    const currentLen = log.length;
    if (currentLen > prevLogLen.current) {
      // Look at all new entries (usually 1-2 at once)
      for (let i = prevLogLen.current; i < currentLen; i++) {
        const entry = log[i] ?? '';

        if (entry.includes('built Riad')) {
          gameAudio.play('upgrade');
        } else if (entry.includes('bought ') && !entry.includes('paid')) {
          gameAudio.play('buy');
        } else if (
          entry.includes('passed Go') ||
          entry.includes('collected the parking pot') ||
          (entry.includes('collected') && entry.includes('MAD') && !entry.includes('paid'))
        ) {
          gameAudio.play('collect');
        } else if (
          entry.includes('paid') && (entry.includes('rent') || entry.includes('tax') || entry.includes('bail') || entry.includes('MAD to'))
        ) {
          if (entry.startsWith(gameState.players[myId]?.name ?? '\x00')) {
            gameAudio.play('rent');
          }
        } else if (entry.includes('sent to jail') || entry.includes('3 doubles in a row')) {
          gameAudio.play('jail');
        } else if (entry.includes('bankrupt')) {
          gameAudio.play('bankrupt');
        }
      }
    }
    prevLogLen.current = currentLen;

    // ── My player went bankrupt ──
    const isBankrupt = gameState.players[myId]?.isBankrupt ?? false;
    if (isBankrupt && !prevBankrupt.current) {
      gameAudio.play('bankrupt');
    }
    prevBankrupt.current = isBankrupt;

    // ── Game finished ──
    if (gameState.status === 'finished' && prevStatus.current !== 'finished') {
      if (gameState.winnerId === myId) {
        gameAudio.play('win');
      }
    }
    prevStatus.current = gameState.status;

  }, [gameState, myId]);

  const toggleMute = useCallback(() => {
    const next = !gameAudio.isMuted();
    gameAudio.setMuted(next);
    setMuted(next);
  }, []);

  return { muted, toggleMute };
}

import { useState, useEffect, useCallback } from 'react';
import { subscribeToGame, patchGame } from '../firebase/gameService';
import { GameState } from '../game/types';
import {
  rollDice, movePlayer, calculateRent, calculateStationRent,
  canBuyProperty, canUpgradeTile, getWinnerId,
} from '../game/gameEngine';
import { BOARD, BOARD_SIZE, GO_SALARY, JAIL_TILE } from '../game/boardData';

export function useGameState(gameId: string, playerId: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!gameId) return;
    const unsub = subscribeToGame(gameId, (state) => {
      setGameState(state);
      setLoading(false);
    });
    return unsub;
  }, [gameId]);

  const isMyTurn = !!gameState &&
    gameState.playerOrder[gameState.currentPlayerIndex] === playerId;

  const myPlayer = gameState?.players[playerId] ?? null;

  // ── Roll dice & move ────────────────────────────────────────────────────
  const handleRollDice = useCallback(async () => {
    if (!gameState || !isMyTurn || gameState.phase !== 'roll') return;

    const player = { ...gameState.players[playerId] };
    const dice   = rollDice();
    const steps  = dice[0] + dice[1];
    const log    = [...gameState.log];
    const patch: Record<string, unknown> = { diceResult: dice };

    // Handle jail
    if (player.inJail) {
      if (dice[0] === dice[1]) {
        player.inJail     = false;
        player.jailTurns  = 0;
        log.push(`${player.name} rolled doubles and escaped jail!`);
      } else {
        player.jailTurns += 1;
        if (player.jailTurns >= 3) {
          player.money    -= 50;
          player.inJail   = false;
          player.jailTurns = 0;
          log.push(`${player.name} paid 50 MAD bail after 3 turns in jail`);
        } else {
          log.push(`${player.name} is stuck in jail (turn ${player.jailTurns}/3)`);
          await patchGame(gameId, {
            diceResult: dice,
            [`players/${playerId}/jailTurns`]: player.jailTurns,
            [`players/${playerId}/money`]:     player.money,
            log,
            phase: 'end_turn',
          });
          return;
        }
      }
    }

    const { position, passedGo } = movePlayer(player, steps);
    let money = player.money;

    if (passedGo) {
      money += GO_SALARY;
      log.push(`${player.name} passed Go — collected ${GO_SALARY} MAD`);
    }

    const tile = BOARD[position];
    log.push(`${player.name} rolled ${dice[0]}+${dice[1]} and landed on ${tile.name}`);

    patch[`players/${playerId}/position`]  = position;
    patch[`players/${playerId}/money`]     = money;
    patch[`players/${playerId}/inJail`]    = player.inJail;
    patch[`players/${playerId}/jailTurns`] = player.jailTurns;

    let nextPhase: 'action' | 'end_turn' = 'action';

    if (tile.type === 'go_to_jail') {
      patch[`players/${playerId}/position`]  = JAIL_TILE;
      patch[`players/${playerId}/inJail`]    = true;
      patch[`players/${playerId}/jailTurns`] = 0;
      log.push(`${player.name} is sent to jail!`);
      nextPhase = 'end_turn';

    } else if (tile.type === 'tax') {
      const tax = tile.taxAmount ?? 0;
      patch[`players/${playerId}/money`] = money - tax;
      log.push(`${player.name} paid ${tax} MAD in taxes`);
      nextPhase = 'end_turn';

    } else if (tile.type === 'chance') {
      const bonus = 50;
      patch[`players/${playerId}/money`] = money + bonus;
      log.push(`${player.name} drew Chance — collected ${bonus} MAD bonus!`);
      nextPhase = 'end_turn';

    } else if (tile.type === 'free_parking' || tile.type === 'jail' || tile.type === 'go') {
      nextPhase = 'end_turn';

    } else if (tile.type === 'property' || tile.type === 'station') {
      const propState = gameState.properties[String(position)];
      const ownerId   = propState?.ownerId ?? '';

      if (!ownerId) {
        // Unowned — player may buy
        nextPhase = 'action';
      } else if (ownerId === playerId) {
        // Own it — nothing to do
        nextPhase = 'end_turn';
      } else {
        // Pay rent
        const rent = tile.type === 'station'
          ? calculateStationRent(ownerId, gameState.properties)
          : calculateRent(tile, propState, gameState.properties);

        const ownerMoney = gameState.players[ownerId].money + rent;
        patch[`players/${playerId}/money`] = money - rent;
        patch[`players/${ownerId}/money`]  = ownerMoney;

        // Bankruptcy check
        if (money - rent < 0) {
          patch[`players/${playerId}/isBankrupt`] = true;
          log.push(`${player.name} went bankrupt paying ${rent} MAD rent to ${gameState.players[ownerId].name}!`);
        } else {
          log.push(`${player.name} paid ${rent} MAD rent to ${gameState.players[ownerId].name}`);
        }
        nextPhase = 'end_turn';
      }
    }

    patch['log']   = log;
    patch['phase'] = nextPhase;

    await patchGame(gameId, patch);
  }, [gameState, isMyTurn, playerId, gameId]);

  // ── Buy property ────────────────────────────────────────────────────────
  const handleBuyProperty = useCallback(async () => {
    if (!gameState || !isMyTurn || gameState.phase !== 'action') return;

    const player = gameState.players[playerId];
    const tile   = BOARD[player.position];
    if (!canBuyProperty(player, tile)) return;

    const log = [...gameState.log, `${player.name} bought ${tile.name} for ${tile.price} MAD`];

    await patchGame(gameId, {
      [`players/${playerId}/money`]:                             player.money - (tile.price ?? 0),
      [`players/${playerId}/ownedProperties/${player.position}`]: true,
      [`properties/${player.position}/ownerId`]:                 playerId,
      [`properties/${player.position}/level`]:                   0,
      log,
      phase: 'end_turn',
    });
  }, [gameState, isMyTurn, playerId, gameId]);

  // ── End turn ────────────────────────────────────────────────────────────
  const handleEndTurn = useCallback(async () => {
    if (!gameState || !isMyTurn) return;
    if (gameState.phase !== 'end_turn' && gameState.phase !== 'action') return;

    const players = gameState.players;

    // Check for winner first
    const winnerId = getWinnerId(players);
    if (winnerId) {
      await patchGame(gameId, {
        status:   'finished',
        winnerId,
        log: [...gameState.log, `${players[winnerId].name} wins the game!`],
      });
      return;
    }

    // Advance to next non-bankrupt player
    let nextIndex = (gameState.currentPlayerIndex + 1) % gameState.playerOrder.length;
    let safety    = 0;
    while (
      players[gameState.playerOrder[nextIndex]]?.isBankrupt &&
      safety < gameState.playerOrder.length
    ) {
      nextIndex = (nextIndex + 1) % gameState.playerOrder.length;
      safety++;
    }

    await patchGame(gameId, {
      currentPlayerIndex: nextIndex,
      diceResult:         null,
      phase:              'roll',
      turnStartedAt:      Date.now(),
    });
  }, [gameState, isMyTurn, gameId]);

  // ── Build Riad ──────────────────────────────────────────────────────────
  const handleUpgrade = useCallback(async (tileId: number) => {
    if (!gameState || !isMyTurn) return;

    const player    = gameState.players[playerId];
    const tile      = BOARD[tileId];
    if (!canUpgradeTile(player, tileId, gameState.properties)) return;

    const propState = gameState.properties[String(tileId)];
    const log = [...gameState.log,
      `${player.name} built Riad level ${propState.level + 1} on ${tile.name}`];

    await patchGame(gameId, {
      [`players/${playerId}/money`]:       player.money - (tile.riadCost ?? 0),
      [`properties/${tileId}/level`]:      propState.level + 1,
      log,
    });
  }, [gameState, isMyTurn, playerId, gameId]);

  // ── Computed helpers ────────────────────────────────────────────────────
  const currentTile = myPlayer ? BOARD[myPlayer.position] : null;

  const canBuy = !!myPlayer && !!currentTile &&
    gameState?.phase === 'action' &&
    (currentTile.type === 'property' || currentTile.type === 'station') &&
    !(gameState?.properties[String(myPlayer.position)]?.ownerId) &&
    myPlayer.money >= (currentTile.price ?? 0);

  const upgradableTiles = myPlayer
    ? Object.keys(myPlayer.ownedProperties ?? {})
        .map(Number)
        .filter((tid) => canUpgradeTile(myPlayer, tid, gameState?.properties ?? {}))
    : [];

  return {
    gameState,
    loading,
    isMyTurn,
    myPlayer,
    currentTile,
    canBuy,
    upgradableTiles,
    handleRollDice,
    handleBuyProperty,
    handleEndTurn,
    handleUpgrade,
  };
}

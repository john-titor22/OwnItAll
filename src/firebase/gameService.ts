import {
  ref, set, get, update, remove, onValue, off, query, orderByChild, equalTo,
} from 'firebase/database';
import { db } from './config';
import { GameState, Player, PropertyState } from '../game/types';
import { BOARD, STARTING_MONEY, PLAYER_COLORS } from '../game/boardData';

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid confusion
  return Array.from({ length: 5 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

function buildInitialProperties(): Record<string, PropertyState> {
  const props: Record<string, PropertyState> = {};
  BOARD.forEach((tile) => {
    if (tile.type === 'property' || tile.type === 'station') {
      props[String(tile.id)] = { ownerId: '', level: 0 };
    }
  });
  return props;
}

function makePlayer(id: string, name: string, colorIndex: number): Player {
  return {
    id,
    name,
    color: PLAYER_COLORS[colorIndex] ?? '#FFFFFF',
    position: 0,
    money: STARTING_MONEY,
    ownedProperties: {},
    inJail: false,
    jailTurns: 0,
    isBankrupt: false,
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function createGame(
  hostId: string,
  hostName: string
): Promise<string> {
  const gameId = generateCode();
  const newRef = ref(db, `games/${gameId}`);

  const host = makePlayer(hostId, hostName, 0);

  const state: GameState = {
    id:                 gameId,
    status:             'waiting',
    currentPlayerIndex: 0,
    players:            { [hostId]: host },
    playerOrder:        [hostId],
    properties:         buildInitialProperties(),
    log:                [`${hostName} created the game`],
    diceResult:         null,
    phase:              'roll',
    createdBy:          hostId,
    createdAt:          Date.now(),
    turnStartedAt:      Date.now(),
  };

  await set(newRef, state);
  return gameId;
}

export async function joinGame(
  gameId: string,
  playerId: string,
  playerName: string
): Promise<void> {
  const gameRef  = ref(db, `games/${gameId}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) throw new Error('Game not found');

  const game: GameState = snapshot.val();
  if (game.status !== 'waiting')                    throw new Error('Game already started');
  if (Object.keys(game.players).length >= 6)        throw new Error('Game is full (max 6 players)');
  if (game.players[playerId])                       throw new Error('You are already in this game');

  const colorIndex = Object.keys(game.players).length;
  const newPlayer  = makePlayer(playerId, playerName, colorIndex);

  await update(gameRef, {
    [`players/${playerId}`]:  newPlayer,
    playerOrder:              [...game.playerOrder, playerId],
    log:                      [...game.log, `${playerName} joined`],
  });
}

export async function startGame(gameId: string): Promise<void> {
  const now = Date.now();
  await update(ref(db, `games/${gameId}`), { status: 'playing', turnStartedAt: now, gameStartedAt: now });
}

/**
 * Multi-path update — keys can contain "/" for nested paths, e.g.:
 *   { 'players/uid/money': 500, 'phase': 'end_turn' }
 * Firebase RTDB resolves these relative to the game ref.
 */
export async function patchGame(
  gameId: string,
  patches: Record<string, unknown>
): Promise<void> {
  await update(ref(db, `games/${gameId}`), patches);
}

export async function deleteStaleLobbies(): Promise<void> {
  const gamesRef  = ref(db, 'games');
  const snapshot  = await get(query(gamesRef, orderByChild('status'), equalTo('waiting')));
  if (!snapshot.exists()) return;

  const cutoff = Date.now() - 15 * 60 * 1000; // 15 minutes
  const deletions: Promise<void>[] = [];

  snapshot.forEach((child) => {
    const game = child.val() as { createdAt?: number };
    if (game.createdAt !== undefined && game.createdAt < cutoff) {
      deletions.push(remove(ref(db, `games/${child.key}`)));
    }
  });

  await Promise.all(deletions);
}

export function subscribeToGame(
  gameId: string,
  callback: (state: GameState | null) => void
): () => void {
  const gameRef = ref(db, `games/${gameId}`);
  onValue(gameRef, (snap) => callback(snap.exists() ? (snap.val() as GameState) : null));
  return () => off(gameRef);
}

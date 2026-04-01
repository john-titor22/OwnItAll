import { Player, PropertyState, Tile } from './types';
import { BOARD, BOARD_SIZE, JAIL_TILE } from './boardData';

export function rollDice(): [number, number] {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
}

export function movePlayer(
  player: Player,
  steps: number
): { position: number; passedGo: boolean } {
  if (player.inJail) {
    return { position: player.position, passedGo: false };
  }
  const raw = player.position + steps;
  return {
    position: raw % BOARD_SIZE,
    passedGo: raw >= BOARD_SIZE,
  };
}

export function calculateRent(
  tile: Tile,
  propState: PropertyState,
  allProperties: Record<string, PropertyState>
): number {
  if (!tile.rent) return 0;

  // Double base rent when owner has a monopoly and no riads built yet
  if (propState.level === 0) {
    const groupTiles = BOARD.filter(
      (t) => t.group === tile.group && t.type === 'property'
    );
    const hasMonopoly = groupTiles.every(
      (t) => allProperties[String(t.id)]?.ownerId === propState.ownerId
    );
    return hasMonopoly ? tile.rent[0] * 2 : tile.rent[0];
  }

  return tile.rent[propState.level] ?? tile.rent[0];
}

export function calculateStationRent(
  ownerId: string,
  allProperties: Record<string, PropertyState>
): number {
  const count = BOARD.filter(
    (t) => t.type === 'station' && allProperties[String(t.id)]?.ownerId === ownerId
  ).length;
  const table = [0, 25, 50, 100, 200];
  return table[count] ?? 25;
}

export function canBuyProperty(player: Player, tile: Tile): boolean {
  return (
    (tile.type === 'property' || tile.type === 'station') &&
    player.money >= (tile.price ?? 0)
  );
}

export function canUpgradeTile(
  player: Player,
  tileId: number,
  allProperties: Record<string, PropertyState>
): boolean {
  const tile = BOARD[tileId];
  if (!tile || tile.type !== 'property') return false;

  const propState = allProperties[String(tileId)];
  if (!propState || propState.ownerId !== player.id) return false;
  if (propState.level >= 4) return false;

  const groupTiles = BOARD.filter(
    (t) => t.group === tile.group && t.type === 'property'
  );
  const hasMonopoly = groupTiles.every(
    (t) => allProperties[String(t.id)]?.ownerId === player.id
  );
  if (!hasMonopoly) return false;

  return player.money >= (tile.riadCost ?? 0);
}

export function getActivePlayerIds(
  players: Record<string, Player>
): string[] {
  return Object.values(players)
    .filter((p) => !p.isBankrupt)
    .map((p) => p.id);
}

export function getWinnerId(
  players: Record<string, Player>
): string | null {
  const active = getActivePlayerIds(players);
  return active.length === 1 ? active[0] : null;
}

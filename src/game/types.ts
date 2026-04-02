export type TileType =
  | 'go'
  | 'property'
  | 'station'
  | 'tax'
  | 'chance'
  | 'jail'
  | 'free_parking'
  | 'go_to_jail';

export type PropertyGroup =
  | 'brown'
  | 'light_blue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'dark_blue';

export interface Tile {
  id: number;
  name: string;
  type: TileType;
  group?: PropertyGroup;
  price?: number;
  // rent[0]=base, rent[1..4]=with 1..4 Riads
  rent?: [number, number, number, number, number];
  riadCost?: number;
  taxAmount?: number;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
  money: number;
  // Record<tileId, true> — avoids Firebase empty-array issues
  ownedProperties: Record<string, boolean>;
  inJail: boolean;
  jailTurns: number;
  isBankrupt: boolean;
}

export interface PropertyState {
  ownerId: string; // '' = unowned
  level: number;   // 0 = no riads, 1-4 = riads
}

export type GamePhase = 'roll' | 'action' | 'end_turn';
export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface GameState {
  id: string;
  status: GameStatus;
  currentPlayerIndex: number;
  players: Record<string, Player>;
  playerOrder: string[];
  properties: Record<string, PropertyState>; // tileId string -> state
  log: string[];
  diceResult: [number, number] | null;
  phase: GamePhase;
  winnerId?: string;
  createdBy: string;
  createdAt?: number;      // ms timestamp — used for lobby auto-close
  turnStartedAt?: number;  // ms timestamp — resets on each turn change
}

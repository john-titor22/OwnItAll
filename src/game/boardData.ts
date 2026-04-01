import { Tile } from './types';

// Real Wikimedia Commons thumbnails for each Marrakech landmark
export const TILE_IMAGES: Record<number, string> = {
  0:  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Marrakech_Medina.jpg/320px-Marrakech_Medina.jpg',
  1:  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Marrakesh_medina_streets.jpg/320px-Marrakesh_medina_streets.jpg',
  3:  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Bab_Doukkala_Marrakesh.jpg/320px-Bab_Doukkala_Marrakesh.jpg',
  5:  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Marrakech_Gare_ONCF.jpg/320px-Marrakech_Gare_ONCF.jpg',
  6:  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Marrakesh_-_Mellah.jpg/320px-Marrakesh_-_Mellah.jpg',
  8:  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Mouassine_mosque_marrakech.jpg/320px-Mouassine_mosque_marrakech.jpg',
  9:  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Riad_in_Marrakech.jpg/320px-Riad_in_Marrakech.jpg',
  11: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Ben_Youssef_Madrasa_Marrakech_cropped.jpg/320px-Ben_Youssef_Madrasa_Marrakech_cropped.jpg',
  12: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Dar_Si_Said_Marrakech.jpg/320px-Dar_Si_Said_Marrakech.jpg',
  13: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Marrakesh_Bahia_Palace_1.jpg/320px-Marrakesh_Bahia_Palace_1.jpg',
  15: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Saadian_Tombs_-_Marrakesh%2C_Morocco.jpg/320px-Saadian_Tombs_-_Marrakesh%2C_Morocco.jpg',
  17: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/El_Badi_palace_Marrakech.jpg/320px-El_Badi_palace_Marrakech.jpg',
  18: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Menara_Gardens_Marrakesh.jpg/320px-Menara_Gardens_Marrakesh.jpg',
  20: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Marrakech_Jardin_Majorelle.jpg/320px-Marrakech_Jardin_Majorelle.jpg',
  22: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Cyber_Park_Marrakesh.jpg/320px-Cyber_Park_Marrakesh.jpg',
  24: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Koutoubia-Minaret.jpg/320px-Koutoubia-Minaret.jpg',
  25: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Jemaa_el-Fna_at_dusk.jpg/320px-Jemaa_el-Fna_at_dusk.jpg',
  27: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Souk_Marrakech.jpg/320px-Souk_Marrakech.jpg',
};

// Fallback: picsum with deterministic seed if Wikimedia fails
export function tileImage(id: number, name: string): string {
  return TILE_IMAGES[id] ?? `https://picsum.photos/seed/${encodeURIComponent(name)}/300/180`;
}

export const BOARD: Tile[] = [
  { id: 0,  name: 'Go',                  type: 'go' },
  { id: 1,  name: 'Derb Dabachi',        type: 'property', group: 'brown',      price: 60,  rent: [2,  10,  30,  90,  160],  riadCost: 50  },
  { id: 2,  name: 'Chance',              type: 'chance' },
  { id: 3,  name: 'Bab Doukkala',        type: 'property', group: 'brown',      price: 80,  rent: [4,  20,  60,  180, 320],  riadCost: 50  },
  { id: 4,  name: 'Medina Tax',          type: 'tax',      taxAmount: 200 },
  { id: 5,  name: 'Gare Marrakech',      type: 'station',  price: 200, rent: [25, 50, 100, 200, 200] },
  { id: 6,  name: 'Mellah',              type: 'property', group: 'light_blue', price: 100, rent: [6,  30,  90,  270, 400],  riadCost: 50  },
  { id: 7,  name: 'Chance',              type: 'chance' },
  { id: 8,  name: 'Mouassine',           type: 'property', group: 'light_blue', price: 100, rent: [6,  30,  90,  270, 400],  riadCost: 50  },
  { id: 9,  name: 'Riad Zitoun',         type: 'property', group: 'light_blue', price: 120, rent: [8,  40,  100, 300, 450],  riadCost: 50  },
  { id: 10, name: 'Just Visiting',       type: 'jail' },
  { id: 11, name: 'Ben Youssef Madrasa', type: 'property', group: 'pink',       price: 140, rent: [10, 50,  150, 450, 625],  riadCost: 100 },
  { id: 12, name: 'Dar Si Said',         type: 'property', group: 'pink',       price: 160, rent: [12, 60,  180, 500, 700],  riadCost: 100 },
  { id: 13, name: 'Bahia Palace',        type: 'property', group: 'pink',       price: 180, rent: [14, 70,  200, 550, 750],  riadCost: 100 },
  { id: 14, name: 'Free Parking',        type: 'free_parking' },
  { id: 15, name: 'Saadian Tombs',       type: 'property', group: 'orange',     price: 180, rent: [14, 70,  200, 550, 750],  riadCost: 100 },
  { id: 16, name: 'Chance',              type: 'chance' },
  { id: 17, name: 'El Badi Palace',      type: 'property', group: 'orange',     price: 200, rent: [16, 80,  220, 600, 800],  riadCost: 100 },
  { id: 18, name: 'Menara Gardens',      type: 'property', group: 'orange',     price: 220, rent: [18, 90,  250, 700, 875],  riadCost: 150 },
  { id: 19, name: 'Souk Tax',            type: 'tax',      taxAmount: 100 },
  { id: 20, name: 'Majorelle Garden',    type: 'property', group: 'red',        price: 260, rent: [22, 110, 330, 800, 975],  riadCost: 150 },
  { id: 21, name: 'Chance',              type: 'chance' },
  { id: 22, name: 'Cyber Parc',          type: 'property', group: 'red',        price: 260, rent: [22, 110, 330, 800, 975],  riadCost: 150 },
  { id: 23, name: 'Go to Jail',          type: 'go_to_jail' },
  { id: 24, name: 'Koutoubia Mosque',    type: 'property', group: 'yellow',     price: 300, rent: [26, 130, 390, 900, 1100], riadCost: 150 },
  { id: 25, name: 'Jemaa el-Fna',        type: 'property', group: 'yellow',     price: 320, rent: [28, 150, 450, 1000, 1200],riadCost: 150 },
  { id: 26, name: 'Chance',              type: 'chance' },
  { id: 27, name: 'Medina Grand Souks',  type: 'property', group: 'dark_blue',  price: 400, rent: [35, 175, 500, 1100, 1300],riadCost: 200 },
];

export const BOARD_SIZE = BOARD.length;
export const GO_SALARY = 200;
export const STARTING_MONEY = 1500;
export const JAIL_TILE = 10;

export const GROUP_COLORS: Record<string, string> = {
  brown:      '#8B4513',
  light_blue: '#5BB8D4',
  pink:       '#E91E8C',
  orange:     '#F97316',
  red:        '#E74C3C',
  yellow:     '#C9A84C',
  dark_blue:  '#1A3E8F',
};

// Moroccan-inspired palette
export const PALETTE = {
  bg:        '#0A0A16',
  surface:   '#11112A',
  surface2:  '#191932',
  gold:      '#C9A84C',
  goldLight: '#FFD166',
  terra:     '#CC4A2A',
  teal:      '#1E9E8F',
  sand:      '#D4B896',
  text:      '#EDE8DF',
  muted:     '#6B6880',
};

export const PLAYER_COLORS = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12'];

export const TILE_ICONS: Record<string, string> = {
  go:           '⭐',
  chance:       '❓',
  tax:          '💰',
  jail:         '👀',
  free_parking: '🌴',
  go_to_jail:   '🚔',
  station:      '🚂',
};

export type ChanceCardEffect =
  | { type: 'collect';      amount: number }
  | { type: 'pay';          amount: number }
  | { type: 'advance_to';   tileId: number }
  | { type: 'go_to_jail' }
  | { type: 'move_back';    steps: number }
  | { type: 'pay_per_riad'; amount: number };

export interface ChanceCard {
  id: number;
  emoji: string;
  text: string;
  effect: ChanceCardEffect;
}

export const CHANCE_CARDS: ChanceCard[] = [
  { id:  0, emoji: '🕌', text: 'Advance to Jemaa el-Fna — the beating heart of Marrakech!',    effect: { type: 'advance_to', tileId: 25 } },
  { id:  1, emoji: '⭐', text: 'Return to Go and collect 200 MAD!',                             effect: { type: 'advance_to', tileId: 0  } },
  { id:  2, emoji: '🚂', text: 'Head to Gare Marrakech for a new adventure.',                   effect: { type: 'advance_to', tileId: 5  } },
  { id:  3, emoji: '🏯', text: 'Advance to Koutoubia Mosque.',                                  effect: { type: 'advance_to', tileId: 24 } },
  { id:  4, emoji: '🚔', text: 'The city guards arrest you — Go directly to Jail!',             effect: { type: 'go_to_jail'              } },
  { id:  5, emoji: '🎪', text: 'The Medina festival is booming — collect 150 MAD!',             effect: { type: 'collect', amount: 150    } },
  { id:  6, emoji: '💼', text: 'Your business thrived this week — collect 100 MAD!',            effect: { type: 'collect', amount: 100    } },
  { id:  7, emoji: '🏛️', text: 'Tax audit complete — collect your refund of 50 MAD!',           effect: { type: 'collect', amount: 50     } },
  { id:  8, emoji: '🤑', text: 'A generous merchant pays you handsomely — collect 200 MAD!',   effect: { type: 'collect', amount: 200    } },
  { id:  9, emoji: '👑', text: 'The Sultan rewards your loyalty — collect 75 MAD!',             effect: { type: 'collect', amount: 75     } },
  { id: 10, emoji: '🔨', text: 'Your Riads need urgent repairs — pay 50 MAD per Riad level.',  effect: { type: 'pay_per_riad', amount: 50 } },
  { id: 11, emoji: '💸', text: 'Overdue souk tax — pay 150 MAD.',                              effect: { type: 'pay', amount: 150        } },
  { id: 12, emoji: '🐫', text: 'Lost in the medina — move back 3 spaces.',                     effect: { type: 'move_back', steps: 3     } },
  { id: 13, emoji: '🗡️', text: 'Your caravan was robbed — pay 75 MAD.',                        effect: { type: 'pay', amount: 75         } },
  { id: 14, emoji: '📜', text: 'Late Medina rent fine — pay 50 MAD.',                          effect: { type: 'pay', amount: 50         } },
  { id: 15, emoji: '💰', text: 'You overpaid a souk dealer — pay 100 MAD fine.',               effect: { type: 'pay', amount: 100        } },
];

export function drawChanceCard(): ChanceCard {
  return CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
}

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameState } from '../game/types';
import { BOARD, PALETTE } from '../game/boardData';

interface Props {
  gameState: GameState;
  myId: string;
}

export function PlayerList({ gameState, myId }: Props) {
  const currentId = gameState.playerOrder[gameState.currentPlayerIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>PLAYERS</Text>
      {gameState.playerOrder.map((pid) => {
        const p        = gameState.players[pid];
        if (!p) return null;
        const isActive = pid === currentId;
        const isMe     = pid === myId;
        const tileName = BOARD[p.position]?.name ?? '?';

        return (
          <View key={pid} style={[styles.row, isActive && styles.activeRow, p.isBankrupt && styles.dead]}>
            <View style={[styles.avatar, { backgroundColor: p.color }]}>
              <Text style={styles.avatarText}>{p.name[0].toUpperCase()}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>
                {p.name}{isMe ? ' (You)' : ''}{p.isBankrupt ? '  💀' : ''}
                {isActive && !p.isBankrupt ? '  🎲' : ''}
              </Text>
              <Text style={styles.sub}>{p.inJail ? '🔒 In Jail' : tileName}</Text>
            </View>
            <Text style={[styles.money, p.isBankrupt && { color: '#E74C3C' }]}>
              {p.isBankrupt ? 'BANKRUPT' : `${p.money} MAD`}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 10, marginTop: 8 },
  label:     { color: PALETTE.muted, fontSize: 10, letterSpacing: 1.5, marginBottom: 6 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: PALETTE.surface,
    padding: 10, borderRadius: 10,
    marginBottom: 5, borderWidth: 1.5,
    borderColor: 'transparent',
  },
  activeRow: { borderColor: PALETTE.goldLight },
  dead:      { opacity: 0.4 },

  avatar:     { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  info:       { flex: 1 },
  name:       { color: PALETTE.text, fontSize: 14, fontWeight: '700' },
  sub:        { color: PALETTE.muted, fontSize: 11, marginTop: 1 },
  money:      { color: '#2ECC71', fontSize: 13, fontWeight: 'bold' },
});

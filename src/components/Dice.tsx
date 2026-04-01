import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PALETTE } from '../game/boardData';

const FACES: Record<number, string> = { 1:'⚀', 2:'⚁', 3:'⚂', 4:'⚃', 5:'⚄', 6:'⚅' };

interface Props { values: [number, number]; }

export function Dice({ values }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.dieBox}>
          <Text style={styles.die}>{FACES[values[0]]}</Text>
        </View>
        <View style={styles.plus}><Text style={styles.plusText}>+</Text></View>
        <View style={styles.dieBox}>
          <Text style={styles.die}>{FACES[values[1]]}</Text>
        </View>
        <View style={styles.total}>
          <Text style={styles.totalText}>{values[0] + values[1]}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 10 },
  row:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dieBox: {
    backgroundColor: PALETTE.surface,
    borderRadius: 10, padding: 6,
    borderWidth: 1, borderColor: '#2A2A4A',
  },
  die:       { fontSize: 40 },
  plus:      { opacity: 0.4 },
  plusText:  { color: PALETTE.text, fontSize: 18 },
  total: {
    backgroundColor: PALETTE.goldLight,
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginLeft: 4,
  },
  totalText: { color: PALETTE.bg, fontWeight: '900', fontSize: 16 },
});

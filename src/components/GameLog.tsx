import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PALETTE } from '../game/boardData';

interface Props { log: string[]; }

export function GameLog({ log }: Props) {
  const entries = [...(Array.isArray(log) ? log : Object.values(log))]
    .reverse().slice(0, 3);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>LOG</Text>
      {entries.map((entry, i) => (
        <Text key={i} style={[styles.entry, i === 0 && styles.newest]}>
          {entry}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 14, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1A1A32' },
  label:     { color: PALETTE.muted, fontSize: 9, letterSpacing: 1.5, marginBottom: 3 },
  entry:     { color: PALETTE.muted, fontSize: 11, lineHeight: 16 },
  newest:    { color: PALETTE.sand,  fontWeight: '600' },
});

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
  container: { margin: 10, marginBottom: 24 },
  label:     { color: PALETTE.muted, fontSize: 10, letterSpacing: 1.5, marginBottom: 6 },
  entry:     { color: PALETTE.muted, fontSize: 12, lineHeight: 20, paddingVertical: 1 },
  newest:    { color: PALETTE.sand,  fontWeight: '600' },
});

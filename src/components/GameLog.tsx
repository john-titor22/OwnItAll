import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PALETTE } from '../game/boardData';

interface Props { log: string[]; }

export function GameLog({ log }: Props) {
  const entries = [...(Array.isArray(log) ? log : Object.values(log))]
    .reverse().slice(0, 3);

  return (
    <View style={s.container}>
      {entries.map((entry, i) => (
        <Text key={i} style={[s.entry, i === 0 && s.newest]} numberOfLines={1}>
          {i === 0 ? '▸ ' : '  '}{entry}
        </Text>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A36',
    gap: 1,
  },
  entry:  { color: PALETTE.muted, fontSize: 10, lineHeight: 15 },
  newest: { color: PALETTE.sand,  fontSize: 11, fontWeight: '600' },
});

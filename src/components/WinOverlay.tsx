import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Player } from '../game/types';
import { PALETTE } from '../game/boardData';

interface Props {
  winner: Player | null;
  onHome: () => void;
}

export function WinOverlay({ winner, onHome }: Props) {
  if (!winner) return null;
  return (
    <Modal visible transparent animationType="fade">
      <View style={s.backdrop}>
        <View style={[s.card, { borderColor: winner.color + '88' }]}>
          <View style={[s.crown, { backgroundColor: winner.color + '22', borderColor: winner.color + '55' }]}>
            <Text style={s.trophy}>🏆</Text>
          </View>
          <Text style={s.label}>WINNER</Text>
          <Text style={[s.name, { color: winner.color }]}>{winner.name}</Text>
          <Text style={s.sub}>conquers Marrakech!</Text>
          <TouchableOpacity style={[s.btn, { backgroundColor: winner.color }]} onPress={onHome} activeOpacity={0.8}>
            <Text style={s.btnTxt}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: '#0E0E22',
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    padding: 36,
    width: '100%',
    maxWidth: 340,
    gap: 8,
  },
  crown: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  trophy: { fontSize: 44 },
  label: {
    color: PALETTE.muted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 4,
  },
  name: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  sub: {
    color: PALETTE.sand,
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 20,
  },
  btn: {
    borderRadius: 14,
    paddingHorizontal: 40,
    paddingVertical: 14,
    marginTop: 8,
  },
  btnTxt: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

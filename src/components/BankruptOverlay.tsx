import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { PALETTE } from '../game/boardData';

interface Props {
  visible:    boolean;
  onSpectate: () => void;
  onLeave:    () => void;
}

export function BankruptOverlay({ visible, onSpectate, onLeave }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.backdrop}>
        <View style={s.card}>
          <Text style={s.emoji}>💸</Text>
          <Text style={s.title}>You're Bankrupt</Text>
          <Text style={s.sub}>Your properties have been freed.{'\n'}What would you like to do?</Text>
          <TouchableOpacity style={s.spectateBtn} onPress={onSpectate} activeOpacity={0.8}>
            <Text style={s.spectateTxt}>Keep Watching</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.leaveBtn} onPress={onLeave} activeOpacity={0.8}>
            <Text style={s.leaveTxt}>Leave Game</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: '#0E0E22',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: PALETTE.terra + '66',
    alignItems: 'center',
    padding: 32,
    width: '100%',
    maxWidth: 340,
    gap: 10,
  },
  emoji: { fontSize: 52, marginBottom: 4 },
  title: {
    color: PALETTE.terra,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sub: {
    color: PALETTE.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 8,
  },
  spectateBtn: {
    width: '100%',
    backgroundColor: PALETTE.surface2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  spectateTxt: { color: PALETTE.text, fontSize: 15, fontWeight: '700' },
  leaveBtn: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: PALETTE.terra + '88',
  },
  leaveTxt: { color: PALETTE.terra, fontSize: 15, fontWeight: '700' },
});

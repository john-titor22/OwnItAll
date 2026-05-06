import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { PALETTE } from '../game/boardData';

interface Props {
  card: { emoji: string; text: string } | null | undefined;
  isMyTurn: boolean;
  onDismiss: () => void;
}

export function ChanceCardOverlay({ card, isMyTurn, onDismiss }: Props) {
  if (!card) return null;
  return (
    <Modal visible transparent animationType="fade">
      <View style={s.backdrop}>
        <View style={s.card}>
          <Text style={s.label}>ZEHRK</Text>
          <Text style={s.emoji}>{card.emoji}</Text>
          <Text style={s.text}>{card.text}</Text>
          {isMyTurn ? (
            <TouchableOpacity style={s.btn} onPress={onDismiss} activeOpacity={0.8}>
              <Text style={s.btnTxt}>OK</Text>
            </TouchableOpacity>
          ) : (
            <Text style={s.waiting}>Waiting for active player…</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: '#12122A',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: PALETTE.goldLight + '55',
    alignItems: 'center',
    padding: 28,
    width: '100%',
    maxWidth: 340,
    shadowColor: PALETTE.goldLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  label: {
    color: PALETTE.goldLight,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 16,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 18,
  },
  text: {
    color: PALETTE.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  btn: {
    backgroundColor: PALETTE.goldLight,
    borderRadius: 14,
    paddingHorizontal: 48,
    paddingVertical: 12,
    shadowColor: PALETTE.goldLight,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  btnTxt: {
    color: '#1A1000',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  waiting: {
    color: PALETTE.muted,
    fontSize: 13,
    fontStyle: 'italic',
  },
});

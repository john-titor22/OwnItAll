import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { GamePhase, GameState } from '../game/types';
import { BOARD, PALETTE } from '../game/boardData';

interface Props {
  phase: GamePhase;
  canBuy: boolean;
  upgradableTiles: number[];
  gameState: GameState;
  myId: string;
  onRoll: () => void;
  onBuy: () => void;
  onEndTurn: () => void;
  onUpgrade: (tileId: number) => void;
}

export function GameControls({
  phase, canBuy, upgradableTiles,
  gameState, myId,
  onRoll, onBuy, onEndTurn, onUpgrade,
}: Props) {
  const [modal, setModal] = useState(false);

  return (
    <View style={styles.bar}>
      <View style={styles.row}>
        {phase === 'roll' && (
          <Btn label="🎲  Roll Dice" style={styles.gold} textStyle={styles.darkText} onPress={onRoll} />
        )}
        {phase === 'action' && canBuy && (
          <Btn label="🛒  Buy Property" style={styles.teal} textStyle={styles.lightText} onPress={onBuy} />
        )}
        {(phase === 'end_turn' || phase === 'action') && (
          <Btn label="End Turn  →" style={styles.outline} textStyle={styles.lightText} onPress={onEndTurn} />
        )}
        {upgradableTiles.length > 0 && (
          <Btn label="🏠  Riad" style={styles.riad} textStyle={styles.lightText} onPress={() => setModal(true)} />
        )}
      </View>

      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Build a Riad</Text>
            <ScrollView>
              {upgradableTiles.map((tid) => {
                const tile  = BOARD[tid];
                const level = gameState.properties[String(tid)]?.level ?? 0;
                return (
                  <TouchableOpacity
                    key={tid}
                    style={styles.upgradeRow}
                    onPress={() => { onUpgrade(tid); setModal(false); }}
                  >
                    <Text style={styles.upgradeName}>{tile.name}</Text>
                    <Text style={styles.upgradeDetail}>
                      {'▲'.repeat(level)} → {'▲'.repeat(level + 1)}   •   {tile.riadCost} MAD
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Btn label="Cancel" style={styles.cancel} textStyle={styles.lightText} onPress={() => setModal(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Btn({ label, style, textStyle, onPress }: {
  label: string; style: object; textStyle: object; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.btn, style]} onPress={onPress} activeOpacity={0.8}>
      <Text style={[styles.btnBase, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 12, paddingVertical: 8,
  },
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  btn: { paddingVertical: 11, paddingHorizontal: 18, borderRadius: 10, alignItems: 'center', minWidth: 110 },
  btnBase: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },

  gold:      { backgroundColor: PALETTE.goldLight },
  teal:      { backgroundColor: PALETTE.teal },
  outline:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: PALETTE.muted },
  riad:      { backgroundColor: '#5C3A1E' },
  cancel:    { backgroundColor: PALETTE.terra, marginTop: 8 },
  darkText:  { color: PALETTE.bg },
  lightText: { color: PALETTE.text },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: PALETTE.surface,
    padding: 20, paddingBottom: 36,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '55%',
    borderTopWidth: 1, borderColor: '#2A2A4A',
  },
  sheetTitle:    { color: PALETTE.goldLight, fontSize: 18, fontWeight: '900', marginBottom: 16, textAlign: 'center', letterSpacing: 1 },
  upgradeRow:    { backgroundColor: PALETTE.surface2, padding: 14, borderRadius: 10, marginBottom: 8 },
  upgradeName:   { color: PALETTE.text, fontSize: 15, fontWeight: '700' },
  upgradeDetail: { color: PALETTE.goldLight, fontSize: 13, marginTop: 3 },
});

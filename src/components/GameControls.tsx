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
    <View style={s.bar}>
      <View style={s.row}>

        {phase === 'roll' && (
          <TouchableOpacity style={[s.btn, s.btnGold]} onPress={onRoll} activeOpacity={0.8}>
            <Text style={s.btnGoldTxt}>🎲  Roll Dice</Text>
          </TouchableOpacity>
        )}

        {phase === 'action' && canBuy && (
          <TouchableOpacity style={[s.btn, s.btnTeal]} onPress={onBuy} activeOpacity={0.8}>
            <Text style={s.btnLightTxt}>🛒  Buy Property</Text>
          </TouchableOpacity>
        )}

        {(phase === 'end_turn' || phase === 'action') && (
          <TouchableOpacity style={[s.btn, s.btnOutline]} onPress={onEndTurn} activeOpacity={0.8}>
            <Text style={s.btnOutlineTxt}>End Turn  →</Text>
          </TouchableOpacity>
        )}

        {upgradableTiles.length > 0 && (
          <TouchableOpacity style={[s.btn, s.btnRiad]} onPress={() => setModal(true)} activeOpacity={0.8}>
            <Text style={s.btnLightTxt}>🏠  Riad</Text>
          </TouchableOpacity>
        )}

      </View>

      {/* Riad upgrade sheet */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Build a Riad</Text>
            <ScrollView>
              {upgradableTiles.map(tid => {
                const tile  = BOARD[tid];
                const level = gameState.properties[String(tid)]?.level ?? 0;
                return (
                  <TouchableOpacity
                    key={tid}
                    style={s.upgradeRow}
                    onPress={() => { onUpgrade(tid); setModal(false); }}
                    activeOpacity={0.8}
                  >
                    <Text style={s.upgradeName}>{tile.name}</Text>
                    <Text style={s.upgradeDetail}>
                      {'▲'.repeat(level)} → {'▲'.repeat(level + 1)}  ·  {tile.riadCost} MAD
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={[s.btn, s.btnCancel]} onPress={() => setModal(false)}>
              <Text style={s.btnLightTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  btn: {
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 130,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  // Gold — primary action (Roll)
  btnGold: {
    backgroundColor: PALETTE.goldLight,
    shadowColor: PALETTE.goldLight,
  },
  btnGoldTxt: {
    color: '#1A1000',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // Teal — buy
  btnTeal: {
    backgroundColor: PALETTE.teal,
    shadowColor: PALETTE.teal,
  },

  // Outline — end turn
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: PALETTE.muted,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnOutlineTxt: {
    color: PALETTE.text,
    fontSize: 14,
    fontWeight: '800',
  },

  // Riad
  btnRiad:   { backgroundColor: '#7A4A1E', shadowColor: '#7A4A1E' },
  btnCancel: { backgroundColor: PALETTE.terra, shadowColor: PALETTE.terra, marginTop: 10 },

  btnLightTxt: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // Upgrade modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: PALETTE.surface,
    padding: 20,
    paddingBottom: 36,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '60%',
    borderTopWidth: 1,
    borderColor: '#2A2A4A',
  },
  sheetTitle: {
    color: PALETTE.goldLight,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  upgradeRow: {
    backgroundColor: '#1A1A3A',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  upgradeName:   { color: PALETTE.text,      fontSize: 15, fontWeight: '700' },
  upgradeDetail: { color: PALETTE.goldLight, fontSize: 13, marginTop: 4 },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { PALETTE } from '../game/boardData';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const RULES = [
  { emoji: '🎲', title: 'Roll & Move',        body: 'Tap Roll Dice — move around the 28-tile Marrakech board. Pass Go to collect 200 MAD.' },
  { emoji: '🏠', title: 'Buy Properties',     body: 'Land on an unowned tile to buy it. Own a full color group? Build Riads (up to 4) to multiply rent.' },
  { emoji: '💸', title: 'Pay Rent',           body: 'Land on someone\'s property and pay rent. The more Riads they built, the more you owe.' },
  { emoji: '🃏', title: 'zehrk Cards',        body: 'Land on a zehrk tile to draw a card — collect cash, pay fines, advance to a location, or worse.' },
  { emoji: '⏱️', title: '30-Second Turns',    body: 'You have 30 seconds per turn. Timer runs out? The game acts for you automatically.' },
  { emoji: '🏆', title: 'Win Condition',      body: 'Last player standing wins. If 30 minutes pass, the player with the highest net worth takes Marrakech!' },
];

export function HowToPlay({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <Text style={s.title}>How to Play</Text>
          <Text style={s.sub}>✦  Own It All — Marrakech Edition  ✦</Text>

          <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
            {RULES.map((r, i) => (
              <View key={i} style={s.rule}>
                <Text style={s.ruleEmoji}>{r.emoji}</Text>
                <View style={s.ruleText}>
                  <Text style={s.ruleTitle}>{r.title}</Text>
                  <Text style={s.ruleBody}>{r.body}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={s.btn} onPress={onClose} activeOpacity={0.8}>
            <Text style={s.btnTxt}>Got it — Let's Play!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0E0E22',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: PALETTE.goldLight + '33',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 36,
    maxHeight: '90%',
  },
  title: {
    color: PALETTE.goldLight,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  sub: {
    color: PALETTE.muted,
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 20,
    marginTop: 4,
  },
  scroll: { marginBottom: 20 },
  rule: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 18,
  },
  ruleEmoji: { fontSize: 28, width: 36, textAlign: 'center', marginTop: 2 },
  ruleText:  { flex: 1 },
  ruleTitle: { color: PALETTE.text, fontSize: 14, fontWeight: '800', marginBottom: 3 },
  ruleBody:  { color: PALETTE.muted, fontSize: 13, lineHeight: 19 },
  btn: {
    backgroundColor: PALETTE.goldLight,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnTxt: { color: '#1A1000', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
});

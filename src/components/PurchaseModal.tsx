import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions,
} from 'react-native';
import { BOARD, GROUP_COLORS, PALETTE, tileImage } from '../game/boardData';
import { GamePhase } from '../game/types';

const SW = Dimensions.get('window').width;

interface Props {
  tileId:      number | null;
  phase:       GamePhase;
  canBuy:      boolean;
  isMyTurn:    boolean;
  playerMoney: number;
  onBuy:       () => void;
  onEndTurn:   () => void;
}

export function PurchaseModal({
  tileId, phase, canBuy, isMyTurn, playerMoney,
  onBuy, onEndTurn,
}: Props) {
  const slideY  = useRef(new Animated.Value(300)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const showPurchase = isMyTurn && canBuy && phase === 'action' && tileId !== null;
  const showEndTurn  = isMyTurn && (phase === 'end_turn' || (phase === 'action' && !canBuy));
  const visible      = showPurchase || showEndTurn;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideY,  { toValue: 0,   friction: 8, tension: 100, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY,  { toValue: 300, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,   duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const tile     = tileId !== null ? BOARD[tileId] : null;
  const canAfford = tile?.price !== undefined && playerMoney >= tile.price;

  return (
    <Animated.View
      style={[s.container, { opacity, transform: [{ translateY: slideY }] }]}
      pointerEvents={visible ? 'box-none' : 'none'}
    >
      {showPurchase && tile ? (
        <View style={s.card}>
          {/* Hero image */}
          <Image
            source={{ uri: tileImage(tile.id, tile.name) }}
            style={s.img}
            resizeMode="cover"
          />

          {/* Group colour band */}
          {tile.group && (
            <View style={[s.colorBand, { backgroundColor: GROUP_COLORS[tile.group] }]} />
          )}

          <View style={s.body}>
            <View style={s.titleRow}>
              <Text style={s.name}>{tile.name}</Text>
              <View style={s.pricePill}>
                <Text style={s.priceNum}>{tile.price}</Text>
                <Text style={s.priceCur}> MAD</Text>
              </View>
            </View>

            {tile.rent && (
              <View style={s.rentRow}>
                {['Base', '1 Riad', '2 Riads', '3 Riads', '4 Riads'].map((lbl, i) => (
                  <View key={i} style={s.rentCell}>
                    <Text style={s.rentLbl}>{lbl}</Text>
                    <Text style={s.rentVal}>{tile.rent![i]}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={s.btns}>
              <TouchableOpacity
                style={[s.btn, s.btnBuy, !canAfford && s.btnDisabled]}
                onPress={canAfford ? onBuy : undefined}
                activeOpacity={0.8}
              >
                <Text style={s.btnBuyTxt}>
                  {canAfford ? `Buy  ${tile.price} MAD` : 'Not enough MAD'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[s.btn, s.btnPass]} onPress={onEndTurn} activeOpacity={0.8}>
                <Text style={s.btnPassTxt}>Pass  →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : showEndTurn ? (
        <View style={s.endTurnWrap}>
          <TouchableOpacity style={[s.btn, s.btnEndTurn]} onPress={onEndTurn} activeOpacity={0.8}>
            <Text style={s.btnEndTurnTxt}>End Turn  →</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    zIndex: 500,
  },

  // ── Purchase card ──
  card: {
    backgroundColor: PALETTE.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#252545',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
  },
  img:       { width: '100%', height: 160 },
  colorBand: { height: 6, width: '100%' },
  body:      { padding: 16, paddingBottom: 30 },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  name: {
    color: PALETTE.text,
    fontSize: 20,
    fontWeight: '900',
    flex: 1,
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: PALETTE.goldLight + '22',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PALETTE.goldLight + '55',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  priceNum: { color: PALETTE.goldLight, fontSize: 17, fontWeight: '900' },
  priceCur: { color: PALETTE.goldLight, fontSize: 11, fontWeight: '700', opacity: 0.8 },

  // Compact rent table
  rentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0D0D22',
    borderRadius: 10,
    padding: 8,
    marginBottom: 14,
  },
  rentCell: { alignItems: 'center', gap: 2 },
  rentLbl:  { color: PALETTE.muted, fontSize: 9,  letterSpacing: 0.5 },
  rentVal:  { color: PALETTE.text,  fontSize: 11, fontWeight: '700' },

  // Buttons
  btns: { flexDirection: 'row', gap: 10 },
  btn:  {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  btnBuy:     { backgroundColor: PALETTE.goldLight, shadowColor: PALETTE.goldLight },
  btnBuyTxt:  { color: '#1A1000', fontSize: 15, fontWeight: '900' },
  btnDisabled:{ backgroundColor: PALETTE.muted, shadowOpacity: 0 },

  btnPass:    { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: PALETTE.muted, shadowOpacity: 0, elevation: 0 },
  btnPassTxt: { color: PALETTE.text, fontSize: 14, fontWeight: '800' },

  // ── End turn ──
  endTurnWrap: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
    backgroundColor: '#0E0E22',
    borderTopWidth: 1,
    borderTopColor: '#1A1A36',
  },
  btnEndTurn:    { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: PALETTE.muted, shadowOpacity: 0, elevation: 0 },
  btnEndTurnTxt: { color: PALETTE.text, fontSize: 15, fontWeight: '800' },
});

import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { PALETTE } from '../game/boardData';

const T = true, F = false;
const DOTS: boolean[][] = [
  [],
  [F,F,F, F,T,F, F,F,F],
  [T,F,F, F,F,F, F,F,T],
  [T,F,F, F,T,F, F,F,T],
  [T,F,T, F,F,F, T,F,T],
  [T,F,T, F,T,F, T,F,T],
  [T,F,T, T,F,T, T,F,T],
];

function DieFace({ value, size = 56 }: { value: number; size?: number }) {
  const layout = DOTS[value] ?? DOTS[1];
  const dot = Math.round(size * 0.18);
  return (
    <View style={[s.die, { width: size, height: size, borderRadius: size * 0.2 }]}>
      <View style={s.grid}>
        {layout.map((on, i) => (
          <View key={i} style={s.cell}>
            {on && <View style={[s.dot, { width: dot, height: dot, borderRadius: dot / 2 }]} />}
          </View>
        ))}
      </View>
    </View>
  );
}

interface Props {
  diceResult: [number, number] | null;
}

export function DiceRollOverlay({ diceResult }: Props) {
  const [visible,  setVisible]  = useState(false);
  const [display,  setDisplay]  = useState<[number,number]>([1,1]);
  const [settled,  setSettled]  = useState(false);

  const opacity   = useRef(new Animated.Value(0)).current;
  const scale     = useRef(new Animated.Value(0.4)).current;
  const rotation  = useRef(new Animated.Value(0)).current;

  // Skip triggering on first mount (stale Firebase value)
  const mountedAt = useRef(0);
  const prevKey   = useRef('');

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    const key = JSON.stringify(diceResult);
    if (!diceResult || key === prevKey.current) return;
    if (Date.now() - mountedAt.current < 800) { prevKey.current = key; return; }
    prevKey.current = key;

    setSettled(false);
    setVisible(true);
    opacity.setValue(0);
    scale.setValue(0.4);
    rotation.setValue(0);

    // Entrance spring
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(rotation,{ toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    // Cycle random values, then settle
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count <= 12) {
        setDisplay([Math.floor(Math.random()*6)+1, Math.floor(Math.random()*6)+1]);
      } else {
        clearInterval(interval);
        setDisplay(diceResult);
        setSettled(true);

        // Exit after 1.8s
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.timing(scale,   { toValue: 0.85, duration: 400, useNativeDriver: true }),
          ]).start(() => setVisible(false));
        }, 1800);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [JSON.stringify(diceResult)]);

  if (!visible) return null;

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={[s.overlay, { opacity }]}>
      <Animated.View style={[s.card, { transform: [{ scale }] }]}>
        {!settled && <Text style={s.rolling}>Rolling…</Text>}
        {settled  && <Text style={s.settled}>You rolled</Text>}

        <View style={s.row}>
          <Animated.View style={!settled ? { transform: [{ rotate: spin }] } : undefined}>
            <DieFace value={display[0]} />
          </Animated.View>

          <Text style={s.plus}>+</Text>

          <Animated.View style={!settled ? { transform: [{ rotate: spin }] } : undefined}>
            <DieFace value={display[1]} />
          </Animated.View>

          {settled && (
            <View style={s.badge}>
              <Text style={s.badgeTxt}>{display[0] + display[1]}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    pointerEvents: 'none',
  } as any,
  card: {
    backgroundColor: 'rgba(8,12,24,0.93)',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: PALETTE.goldLight + '55',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 20,
  },
  rolling: { color: PALETTE.muted,     fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' },
  settled: { color: PALETTE.goldLight, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700' },

  row:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  plus: { color: PALETTE.muted, fontSize: 22, fontWeight: '200' },

  die: {
    backgroundColor: '#F5F0E8',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#C8C0A8',
  },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '33.33%', height: '33.33%', alignItems: 'center', justifyContent: 'center' },
  dot:  { backgroundColor: '#1A1A2E' },

  badge: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: PALETTE.goldLight,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PALETTE.goldLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  badgeTxt: { color: PALETTE.bg, fontWeight: '900', fontSize: 20 },
});

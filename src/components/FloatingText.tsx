import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { PALETTE } from '../game/boardData';

interface FloatItem {
  id:     string;
  amount: number;   // positive = green, negative = red
  x:      number;
  y:      number;
}

interface Props {
  items: FloatItem[];
  onDone: (id: string) => void;
}

function FloatBubble({ item, onDone }: { item: FloatItem; onDone: () => void }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -64, duration: 1400, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    ]).start(() => onDone());
  }, []);

  const color  = item.amount >= 0 ? '#2ECC71' : '#E74C3C';
  const label  = item.amount >= 0 ? `+${item.amount} MAD` : `${item.amount} MAD`;

  return (
    <Animated.View
      style={[
        s.bubble,
        { left: item.x, top: item.y, opacity, transform: [{ translateY }] },
      ]}
      pointerEvents="none"
    >
      <Text style={[s.text, { color }]}>{label}</Text>
    </Animated.View>
  );
}

export function FloatingText({ items, onDone }: Props) {
  return (
    <>
      {items.map(item => (
        <FloatBubble key={item.id} item={item} onDone={() => onDone(item.id)} />
      ))}
    </>
  );
}

// ── Hook: watch money changes and produce float items ──────────────────────
export interface PlayerLayout { x: number; y: number; }

export function useFloatingTransactions(
  players: Record<string, { money: number }>,
  layouts: Record<string, PlayerLayout>,
) {
  const [items, setItems] = useState<FloatItem[]>([]);
  const prevMoney = useRef<Record<string, number>>({});

  useEffect(() => {
    const newItems: FloatItem[] = [];

    Object.entries(players).forEach(([pid, player]) => {
      const prev = prevMoney.current[pid];
      if (prev !== undefined && player.money !== prev) {
        const diff = player.money - prev;
        const layout = layouts[pid];
        if (layout) {
          newItems.push({
            id:     `${pid}-${Date.now()}`,
            amount: diff,
            x:      layout.x,
            y:      layout.y,
          });
        }
      }
      prevMoney.current[pid] = player.money;
    });

    if (newItems.length > 0) {
      setItems(prev => [...prev, ...newItems]);
    }
  }, [JSON.stringify(Object.fromEntries(
    Object.entries(players).map(([k, v]) => [k, v.money]),
  ))]);

  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  return { items, remove };
}

const s = StyleSheet.create({
  bubble: {
    position: 'absolute',
    zIndex: 9999,
  },
  text: {
    fontSize: 14,
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

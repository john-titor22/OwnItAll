import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { PALETTE } from '../game/boardData';

// Dot positions for each face [row][col] — 3×3 grid
const DOT_LAYOUTS: boolean[][] = [
  [],
  [false,false,false, false,true,false, false,false,false],  // 1
  [true,false,false,  false,false,false, false,false,true],  // 2
  [true,false,false,  false,true,false,  false,false,true],  // 3
  [true,false,true,   false,false,false, true,false,true],   // 4
  [true,false,true,   false,true,false,  true,false,true],   // 5
  [true,false,true,   true,false,true,   true,false,true],   // 6
];

function DieFace({ value, style }: { value: number; style?: object }) {
  const layout = DOT_LAYOUTS[value] ?? DOT_LAYOUTS[1];
  return (
    <View style={[styles.die, style]}>
      <View style={styles.dotGrid}>
        {layout.map((on, i) => (
          <View key={i} style={[styles.dotCell]}>
            {on && <View style={styles.dot} />}
          </View>
        ))}
      </View>
    </View>
  );
}

interface Props { values: [number, number]; }

export function Dice({ values }: Props) {
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [values[0], values[1]]);

  const rotate = shake.interpolate({ inputRange: [-1, 1], outputRange: ['-8deg', '8deg'] });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Last roll</Text>
      <View style={styles.row}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <DieFace value={values[0]} />
        </Animated.View>

        <Text style={styles.plus}>+</Text>

        <Animated.View style={{ transform: [{ rotate }] }}>
          <DieFace value={values[1]} />
        </Animated.View>

        <View style={styles.totalBadge}>
          <Text style={styles.totalNum}>{values[0] + values[1]}</Text>
        </View>
      </View>
    </View>
  );
}

const D = 48; // die size

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 12 },
  label:     { color: PALETTE.muted, fontSize: 10, letterSpacing: 1.5, marginBottom: 8 },
  row:       { flexDirection: 'row', alignItems: 'center', gap: 10 },

  die: {
    width: D, height: D,
    backgroundColor: '#F5F0E8',
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#C8C0A8',
  },
  dotGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
  },
  dotCell: {
    width: '33.33%',
    height: '33.33%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: '#1A1A2E',
  },

  plus:      { color: PALETTE.muted, fontSize: 20, fontWeight: '300' },
  totalBadge: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: PALETTE.goldLight,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PALETTE.goldLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  totalNum: { color: PALETTE.bg, fontWeight: '900', fontSize: 18 },
});

import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { PALETTE } from '../game/boardData';

const TURN_SECONDS = 30;

interface Props {
  turnStartedAt: number | undefined;
  onExpire: () => void;
}

export function TurnTimer({ turnStartedAt, onExpire }: Props) {
  const progress  = useRef(new Animated.Value(1)).current;
  const anim      = useRef<Animated.CompositeAnimation | null>(null);
  const fired     = useRef(false);
  const [color, setColor] = useState(PALETTE.teal);

  useEffect(() => {
    if (!turnStartedAt) return;

    const elapsed  = (Date.now() - turnStartedAt) / 1000;
    const remaining = Math.max(0, TURN_SECONDS - elapsed);
    const startFraction = remaining / TURN_SECONDS;

    fired.current = false;
    progress.setValue(startFraction);

    // Colour transitions: green → amber at 50%, red at 20%
    if (startFraction > 0.5)       setColor(PALETTE.teal);
    else if (startFraction > 0.2)  setColor('#F39C12');
    else                           setColor('#E74C3C');

    anim.current?.stop();
    anim.current = Animated.timing(progress, {
      toValue:        0,
      duration:       remaining * 1000,
      useNativeDriver: false,
    });
    anim.current.start(({ finished }) => {
      if (finished && !fired.current) {
        fired.current = true;
        onExpire();
      }
    });

    // Colour listener
    const id = progress.addListener(({ value }) => {
      if (value > 0.5)       setColor(PALETTE.teal);
      else if (value > 0.2)  setColor('#F39C12');
      else                   setColor('#E74C3C');
    });

    return () => {
      anim.current?.stop();
      progress.removeListener(id);
    };
  }, [turnStartedAt]);

  const widthPct = progress.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={s.track}>
      <Animated.View style={[s.bar, { width: widthPct, backgroundColor: color }]} />
    </View>
  );
}

const s = StyleSheet.create({
  track: {
    height: 3,
    backgroundColor: '#1A1A36',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
  },
});

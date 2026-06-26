import { memo, useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { FLOATING_SCORE_FEEDBACK_CONFIG } from '@/src/game/config';

const LABEL_ANCHOR_OFFSET_Y = 18;
const LABEL_HALF_WIDTH = 50;
const LABEL_MIN_WIDTH = 100;

export interface FloatingScoreLabelProps {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly stackOffsetY: number;
  readonly label: string;
  readonly color: string;
  readonly holdMs: number;
  readonly fadeMs: number;
  readonly floatPx: number;
  readonly onComplete: (id: number) => void;
}

function FloatingScoreLabelComponent({
  id,
  x,
  y,
  stackOffsetY,
  label,
  color,
  holdMs,
  fadeMs,
  floatPx,
  onComplete,
}: FloatingScoreLabelProps) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const handleComplete = useCallback(() => onComplete(id), [id, onComplete]);

  useEffect(() => {
    const totalMs = holdMs + fadeMs;
    const driftEasing = Easing.out(Easing.cubic);
    const fadeEasing = Easing.out(Easing.quad);

    opacity.value = withSequence(
      withTiming(1, { duration: holdMs }),
      withTiming(0, { duration: fadeMs, easing: fadeEasing }, (finished) => {
        if (finished) {
          runOnJS(handleComplete)();
        }
      }),
    );
    translateY.value = withTiming(-floatPx, { duration: totalMs, easing: driftEasing });
  }, [fadeMs, floatPx, handleComplete, holdMs, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - LABEL_HALF_WIDTH,
    top: y - LABEL_ANCHOR_OFFSET_Y + stackOffsetY,
    minWidth: LABEL_MIN_WIDTH,
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    alignItems: 'center',
  }));

  const labelStyle = useMemo<TextStyle>(
    () => ({
      ...styles.label,
      color,
      fontSize: FLOATING_SCORE_FEEDBACK_CONFIG.fontSize,
    }),
    [color],
  );

  return (
    <Animated.View pointerEvents="none" style={animatedStyle}>
      <Text style={labelStyle}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.92)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});

export const FloatingScoreLabel = memo(FloatingScoreLabelComponent);

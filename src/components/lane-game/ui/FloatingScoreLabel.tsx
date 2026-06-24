import { memo, useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export interface FloatingScoreLabelProps {
  readonly id: number;
  readonly x: number;
  readonly y: number;
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

    opacity.value = withSequence(
      withTiming(1, { duration: holdMs }),
      withTiming(0, { duration: fadeMs }, (finished) => {
        if (finished) {
          runOnJS(handleComplete)();
        }
      }),
    );
    translateY.value = withTiming(-floatPx, { duration: totalMs });
  }, [fadeMs, floatPx, handleComplete, holdMs, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - 40,
    top: y - 14,
    minWidth: 80,
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    alignItems: 'center',
  }));

  const labelStyle = useMemo<TextStyle>(
    () => ({
      ...styles.label,
      color,
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
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

export const FloatingScoreLabel = memo(FloatingScoreLabelComponent);

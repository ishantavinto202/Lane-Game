import { memo, useEffect, useMemo } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { SHIELD_CONFIG } from '@/src/game/config';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import type { PlayerMotionSharedValues } from '@/src/game/systems/player/PlayerMotionController';
import type { PlayerSnapshot } from '@/src/game/systems/player/PlayerSystem';

export interface ShieldBreakFlashProps {
  readonly snapshot: PlayerSnapshot;
  readonly motion: PlayerMotionSharedValues;
}

function ShieldBreakFlashComponent({ snapshot, motion }: ShieldBreakFlashProps) {
  const shieldBreakNonce = useGameStore(gameStoreSelectors.shieldBreakNonce);
  const flashOpacity = useSharedValue(0);
  const padding = SHIELD_CONFIG.bubblePaddingPx;
  const bubbleWidth = snapshot.width + padding * 2;
  const bubbleHeight = snapshot.height + padding * 2;
  const halfWidth = bubbleWidth / 2;
  const halfHeight = bubbleHeight / 2;
  const duration = SHIELD_CONFIG.breakEffectDurationMs;

  useEffect(() => {
    if (shieldBreakNonce === 0) {
      return;
    }

    flashOpacity.value = withSequence(
      withTiming(0.75, { duration: duration / 3 }),
      withTiming(0, { duration: (duration * 2) / 3 }),
    );
  }, [duration, flashOpacity, shieldBreakNonce]);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: motion.x.value - halfWidth,
    top: motion.y.value - halfHeight,
    width: bubbleWidth,
    height: bubbleHeight,
    borderRadius: bubbleWidth / 2,
    opacity: flashOpacity.value,
  }));

  const flashStyle = useMemo(
    () => ({
      backgroundColor: 'rgba(41, 182, 246, 0.55)',
      borderWidth: 4,
      borderColor: 'rgba(1, 87, 155, 0.9)',
    }),
    [],
  );

  if (shieldBreakNonce === 0) {
    return null;
  }

  return <Animated.View pointerEvents="none" style={[animatedStyle, flashStyle, { zIndex: 3 }]} />;
}

export const ShieldBreakFlash = memo(ShieldBreakFlashComponent);

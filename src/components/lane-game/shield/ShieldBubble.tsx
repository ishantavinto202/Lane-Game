import { memo, useMemo } from 'react';
import { Image } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { SHIELD_BUBBLE_IMAGE_SOURCE } from '@/src/game/assets/definitions/shield.assets';
import { SHIELD_CONFIG } from '@/src/game/config';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import type { PlayerMotionSharedValues } from '@/src/game/systems/player/PlayerMotionController';
import type { PlayerSnapshot } from '@/src/game/systems/player/PlayerSystem';

import { useTimedPowerUpExpiryBlink } from '../timed-power-up/useTimedPowerUpExpiryBlink';

export interface ShieldBubbleProps {
  readonly snapshot: PlayerSnapshot;
  readonly motion: PlayerMotionSharedValues;
}

function ShieldBubbleComponent({ snapshot, motion }: ShieldBubbleProps) {
  const shieldActive = useGameStore(gameStoreSelectors.shieldActive);
  const shieldRemainingRatio = useGameStore(gameStoreSelectors.shieldRemainingRatio);
  const padding = SHIELD_CONFIG.bubblePaddingPx;
  const scale = SHIELD_CONFIG.bubbleDisplayScale;
  const bubbleWidth = (snapshot.width + padding * 2) * scale;
  const bubbleHeight = (snapshot.height + padding * 2) * scale;
  const halfWidth = bubbleWidth / 2;
  const halfHeight = bubbleHeight / 2;

  const blinkOpacity = useTimedPowerUpExpiryBlink({
    active: shieldActive,
    remainingRatio: shieldRemainingRatio,
    durationMs: SHIELD_CONFIG.durationMs,
  });

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: motion.x.value - halfWidth,
    top: motion.y.value - halfHeight,
    width: bubbleWidth,
    height: bubbleHeight,
    opacity: blinkOpacity.value,
  }));

  const imageStyle = useMemo(
    () => ({
      width: bubbleWidth,
      height: bubbleHeight,
    }),
    [bubbleHeight, bubbleWidth],
  );

  if (!shieldActive) {
    return null;
  }

  return (
    <Animated.View pointerEvents="none" style={[animatedStyle, { zIndex: 2 }]}>
      <Image source={SHIELD_BUBBLE_IMAGE_SOURCE} style={imageStyle} resizeMode="contain" />
    </Animated.View>
  );
}

export const ShieldBubble = memo(ShieldBubbleComponent);

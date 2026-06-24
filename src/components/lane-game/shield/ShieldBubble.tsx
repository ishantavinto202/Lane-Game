import { memo, useMemo } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { SHIELD_CONFIG } from '@/src/game/config';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import type { PlayerMotionSharedValues } from '@/src/game/systems/player/PlayerMotionController';
import type { PlayerSnapshot } from '@/src/game/systems/player/PlayerSystem';

export interface ShieldBubbleProps {
  readonly snapshot: PlayerSnapshot;
  readonly motion: PlayerMotionSharedValues;
}

function ShieldBubbleComponent({ snapshot, motion }: ShieldBubbleProps) {
  const shieldActive = useGameStore(gameStoreSelectors.shieldActive);
  const padding = SHIELD_CONFIG.bubblePaddingPx;
  const bubbleWidth = snapshot.width + padding * 2;
  const bubbleHeight = snapshot.height + padding * 2;
  const halfWidth = bubbleWidth / 2;
  const halfHeight = bubbleHeight / 2;

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: motion.x.value - halfWidth,
    top: motion.y.value - halfHeight,
    width: bubbleWidth,
    height: bubbleHeight,
    borderRadius: bubbleWidth / 2,
  }));

  const bubbleStyle = useMemo(
    () => ({
      borderWidth: 3,
      borderColor: 'rgba(79, 195, 247, 0.85)',
      backgroundColor: 'rgba(79, 195, 247, 0.18)',
    }),
    [],
  );

  if (!shieldActive) {
    return null;
  }

  return (
    <Animated.View pointerEvents="none" style={[animatedStyle, bubbleStyle, { zIndex: 2 }]} />
  );
}

export const ShieldBubble = memo(ShieldBubbleComponent);

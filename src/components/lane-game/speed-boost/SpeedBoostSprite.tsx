import { memo } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import type { SpeedBoostRenderSlot } from '@/src/game/systems/speed-boost/speed-boost-motion.types';

import { SpeedBoostAtlasSprite } from './SpeedBoostAtlasSprite';

export interface SpeedBoostSpriteProps {
  readonly slot: SpeedBoostRenderSlot;
  readonly width: number;
  readonly height: number;
}

function SpeedBoostSpriteComponent({ slot, width, height }: SpeedBoostSpriteProps) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const containerStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: slot.x.value - halfWidth,
    top: slot.y.value - halfHeight,
    width,
    height,
    opacity: slot.opacity.value,
    overflow: 'hidden',
  }));

  return (
    <Animated.View pointerEvents="none" style={containerStyle}>
      <SpeedBoostAtlasSprite displaySize={width} />
    </Animated.View>
  );
}

export const SpeedBoostSprite = memo(SpeedBoostSpriteComponent);

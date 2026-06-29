import { memo } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import type { ShieldRenderSlot } from '@/src/game/systems/shield/shield-motion.types';

import { ShieldAtlasSprite } from './ShieldAtlasSprite';

export interface ShieldSpriteProps {
  readonly slot: ShieldRenderSlot;
  readonly width: number;
  readonly height: number;
}

function ShieldSpriteComponent({ slot, width, height }: ShieldSpriteProps) {
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
      <ShieldAtlasSprite displaySize={width} />
    </Animated.View>
  );
}

export const ShieldSprite = memo(ShieldSpriteComponent);

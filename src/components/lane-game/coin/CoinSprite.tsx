import { memo } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import type { CoinRenderSlot } from '@/src/game/systems/coin/coin-motion.types';

import { CoinAtlasSprite } from './CoinAtlasSprite';

export interface CoinSpriteProps {
  readonly slot: CoinRenderSlot;
  readonly width: number;
  readonly height: number;
}

function CoinSpriteComponent({ slot, width, height }: CoinSpriteProps) {
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
      <CoinAtlasSprite displaySize={width} />
    </Animated.View>
  );
}

export const CoinSprite = memo(CoinSpriteComponent);

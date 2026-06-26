import { memo } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import {
  COIN_ATLAS_FRAME_COUNT,
  COIN_ATLAS_FRAME_LAYOUTS,
  COIN_ATLAS_TEXTURE,
} from '@/src/game/assets/definitions/coin-atlas.assets';
import type { CoinRenderSlot } from '@/src/game/systems/coin/coin-motion.types';

import { coinAnimationFrame } from './coinAnimationClock';

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

  const imageStyle = useAnimatedStyle(() => {
    const frameIndex = Math.min(
      Math.floor(coinAnimationFrame.value),
      COIN_ATLAS_FRAME_COUNT - 1,
    );
    const layout = COIN_ATLAS_FRAME_LAYOUTS[frameIndex]!;

    return {
      position: 'absolute',
      width: layout.imageWidth,
      height: layout.imageHeight,
      left: layout.left,
      top: layout.top,
      transform: layout.transform,
    };
  });

  return (
    <Animated.View pointerEvents="none" style={containerStyle}>
      <Animated.Image
        pointerEvents="none"
        source={COIN_ATLAS_TEXTURE}
        style={imageStyle}
        resizeMode="stretch"
      />
    </Animated.View>
  );
}

export const CoinSprite = memo(CoinSpriteComponent);

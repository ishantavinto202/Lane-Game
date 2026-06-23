import { memo, useMemo } from 'react';
import { Image } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { COIN_IMAGE_SOURCE } from '@/src/game/assets/definitions/coin.assets';
import type { CoinRenderSlot } from '@/src/game/systems/coin/coin-motion.types';

export interface CoinSpriteProps {
  readonly slot: CoinRenderSlot;
  readonly width: number;
  readonly height: number;
}

function CoinSpriteComponent({ slot, width, height }: CoinSpriteProps) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: slot.x.value - halfWidth,
    top: slot.y.value - halfHeight,
    width,
    height,
    opacity: slot.opacity.value,
  }));

  const imageStyle = useMemo(
    () => ({
      width,
      height,
    }),
    [width, height],
  );

  return (
    <Animated.View pointerEvents="none" style={animatedStyle}>
      <Image source={COIN_IMAGE_SOURCE} style={imageStyle} resizeMode="contain" />
    </Animated.View>
  );
}

export const CoinSprite = memo(CoinSpriteComponent);

import { memo, useMemo } from 'react';
import { Image } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { SPEED_BOOST_IMAGE_SOURCE } from '@/src/game/assets/definitions/speed-boost.assets';
import type { SpeedBoostRenderSlot } from '@/src/game/systems/speed-boost/speed-boost-motion.types';

export interface SpeedBoostSpriteProps {
  readonly slot: SpeedBoostRenderSlot;
  readonly width: number;
  readonly height: number;
}

function SpeedBoostSpriteComponent({ slot, width, height }: SpeedBoostSpriteProps) {
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
      <Image source={SPEED_BOOST_IMAGE_SOURCE} style={imageStyle} resizeMode="contain" />
    </Animated.View>
  );
}

export const SpeedBoostSprite = memo(SpeedBoostSpriteComponent);

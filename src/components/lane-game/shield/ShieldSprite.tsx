import { memo, useMemo } from 'react';
import { Text } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { SHIELD_ASSET } from '@/src/game/assets/definitions/shield.assets';
import type { ShieldRenderSlot } from '@/src/game/systems/shield/shield-motion.types';

export interface ShieldSpriteProps {
  readonly slot: ShieldRenderSlot;
  readonly width: number;
  readonly height: number;
}

function ShieldSpriteComponent({ slot, width, height }: ShieldSpriteProps) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const visual = SHIELD_ASSET.visual;

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: slot.x.value - halfWidth,
    top: slot.y.value - halfHeight,
    width,
    height,
    opacity: slot.opacity.value,
  }));

  const innerStyle = useMemo(
    () => ({
      backgroundColor: visual.primaryColor,
      borderColor: visual.borderColor,
      borderWidth: visual.borderWidth ?? 0,
      borderRadius: visual.cornerRadius ?? width / 2,
    }),
    [visual.borderColor, visual.borderWidth, visual.cornerRadius, visual.primaryColor, width],
  );

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        animatedStyle,
        innerStyle,
        {
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <Text
        style={{
          color: '#01579B',
          fontSize: 20,
          fontWeight: '900',
          lineHeight: 24,
        }}
      >
        {visual.label}
      </Text>
    </Animated.View>
  );
}

export const ShieldSprite = memo(ShieldSpriteComponent);

import { memo, useMemo } from 'react';
import { Text } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { getAssetDefinition } from '@/src/game/assets';
import type { ObstacleAssetId } from '@/src/game/types';
import type { ObstacleRenderSlot } from '@/src/game/systems/obstacle/obstacle-motion.types';

export interface ObstacleSpriteProps {
  readonly slot: ObstacleRenderSlot;
  readonly assetId: ObstacleAssetId;
  readonly width: number;
  readonly height: number;
}

function ObstacleSpriteComponent({ slot, assetId, width, height }: ObstacleSpriteProps) {
  const asset = useMemo(() => getAssetDefinition(assetId), [assetId]);
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

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        animatedStyle,
        {
          backgroundColor: asset.visual.primaryColor,
          borderColor: asset.visual.borderColor,
          borderWidth: asset.visual.borderWidth ?? 0,
          borderRadius: asset.visual.cornerRadius ?? 0,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 9,
          fontWeight: '700',
        }}
      >
        {asset.visual.label}
      </Text>
    </Animated.View>
  );
}

export const ObstacleSprite = memo(ObstacleSpriteComponent);

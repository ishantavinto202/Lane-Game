import { memo, useMemo } from 'react';
import { Image, Text } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { getAssetDefinition } from '@/src/game/assets';
import {
  OBSTACLE_BARRIER_SKIN,
  OBSTACLE_CONE_SKIN,
  OBSTACLE_CRATE_SKIN,
  OBSTACLE_PUDDLE_SKIN,
  OBSTACLE_TIRE_SKIN,
  type ObstacleCrateSkinDefinition,
} from '@/src/game/assets/definitions/obstacle.assets';
import type { ObstacleAssetId } from '@/src/game/types';

const SKINNED_OBSTACLE_SKINS: Partial<Record<ObstacleAssetId, ObstacleCrateSkinDefinition>> = {
  OBSTACLE_TIRE: OBSTACLE_TIRE_SKIN,
  OBSTACLE_CRATE: OBSTACLE_CRATE_SKIN,
  OBSTACLE_CONE: OBSTACLE_CONE_SKIN,
  OBSTACLE_BARRIER: OBSTACLE_BARRIER_SKIN,
  OBSTACLE_PUDDLE: OBSTACLE_PUDDLE_SKIN,
};

export interface ObstacleSpriteProps {
  readonly x: SharedValue<number>;
  readonly y: SharedValue<number>;
  readonly opacity: SharedValue<number>;
  readonly renderIndex: number;
  readonly assetId: ObstacleAssetId;
  readonly width: number;
  readonly height: number;
}

function ObstacleSpriteComponent({
  x,
  y,
  opacity,
  renderIndex,
  assetId,
  width,
  height,
}: ObstacleSpriteProps) {
  void renderIndex;

  const asset = useMemo(() => getAssetDefinition(assetId), [assetId]);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const skin = SKINNED_OBSTACLE_SKINS[assetId];
  const isSkinnedObstacle = skin !== undefined;
  const skinVisualOffsetX = skin?.visualOffsetX ?? 0;
  const skinVisualOffsetY = skin?.visualOffsetY ?? 0;
  const skinSpriteWidth = skin?.spriteWidth ?? width;
  const skinSpriteHeight = skin?.spriteHeight ?? height;
  const skinVisualScale = skin?.visualScale ?? 1;

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: isSkinnedObstacle ? x.value + skinVisualOffsetX : x.value - halfWidth,
    top: isSkinnedObstacle ? y.value + skinVisualOffsetY : y.value - halfHeight,
    width: isSkinnedObstacle ? skinSpriteWidth : width,
    height: isSkinnedObstacle ? skinSpriteHeight : height,
    opacity: opacity.value,
    transform: isSkinnedObstacle ? [{ scale: skinVisualScale }] : [],
  }));

  if (isSkinnedObstacle && skin) {
    return (
      <Animated.View pointerEvents="none" style={animatedStyle}>
        <Image
          source={skin.source}
          style={{ width: skin.spriteWidth, height: skin.spriteHeight }}
          resizeMode="contain"
        />
      </Animated.View>
    );
  }

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
          overflow: 'hidden',
        },
      ]}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 9,
          fontWeight: '700',
          zIndex: 1,
        }}
      >
        {asset.visual.label}
      </Text>
    </Animated.View>
  );
}

export const ObstacleSprite = memo(ObstacleSpriteComponent);

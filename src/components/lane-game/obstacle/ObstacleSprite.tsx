import { memo, useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { getAssetDefinition } from '@/src/game/assets';
import type { ObstacleAssetId } from '@/src/game/types';

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
  const asset = useMemo(() => getAssetDefinition(assetId), [assetId]);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const isTireDebug = assetId === 'OBSTACLE_TIRE';
  const isBarrierDebug = assetId === 'OBSTACLE_BARRIER';

  useEffect(() => {
    if (!__DEV__ || !isBarrierDebug) {
      return;
    }

    console.log(
      `[ObstacleRendered] assetId=${assetId} renderIndex=${renderIndex} width=${width} height=${height}`,
    );
  }, [assetId, height, isBarrierDebug, renderIndex, width]);

  const debugStripes = useMemo(
    () =>
      isBarrierDebug || isTireDebug
        ? [-48, -24, 0, 24, 48].map((offset) => (
            <View
              key={`obstacle-stripe-${offset}`}
              style={{
                position: 'absolute',
                top: -8,
                bottom: -8,
                left: offset,
                width: 10,
                backgroundColor: '#000000',
                transform: [{ rotate: '-32deg' }],
              }}
            />
          ))
        : null,
    [isBarrierDebug, isTireDebug],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x.value - halfWidth,
    top: y.value - halfHeight,
    width,
    height,
    opacity: opacity.value,
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
          overflow: 'hidden',
        },
      ]}
    >
      {debugStripes}
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: isBarrierDebug || isTireDebug ? 10 : 9,
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

import { memo, useMemo } from 'react';
import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, { type SharedValue } from 'react-native-reanimated';

import type { AtlasFrameLayout } from '@/src/game/assets/texture-atlas.build';

import { useAtlasFrameClipStyle, useAtlasFrameImageStyle } from './useAtlasFrameImageStyle';

export interface AtlasSpriteViewportProps {
  readonly animationFrame: SharedValue<number>;
  readonly frameCount: number;
  readonly frameLayouts: readonly AtlasFrameLayout[];
  readonly texture: ImageSourcePropType;
  readonly displaySize: number;
}

function AtlasSpriteViewportComponent({
  animationFrame,
  frameCount,
  frameLayouts,
  texture,
  displaySize,
}: AtlasSpriteViewportProps) {
  const imageStyle = useAtlasFrameImageStyle(animationFrame, frameCount, frameLayouts);
  const clipStyle = useAtlasFrameClipStyle(animationFrame, frameCount, frameLayouts);

  const viewportStyle = useMemo(
    () => ({
      width: displaySize,
      height: displaySize,
    }),
    [displaySize],
  );

  return (
    <View style={[styles.viewport, viewportStyle]}>
      <Animated.View style={clipStyle}>
        <Animated.Image source={texture} style={imageStyle} resizeMode="stretch" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    overflow: 'hidden',
  },
});

export const AtlasSpriteViewport = memo(AtlasSpriteViewportComponent);

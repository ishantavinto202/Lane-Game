import { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import type { AtlasFrameLayout } from '@/src/game/assets/texture-atlas.build';

export function useAtlasFrameImageStyle(
  animationFrame: SharedValue<number>,
  frameCount: number,
  frameLayouts: readonly AtlasFrameLayout[],
) {
  return useAnimatedStyle(() => {
    const frameIndex = Math.min(Math.floor(animationFrame.value), frameCount - 1);
    const layout = frameLayouts[frameIndex]!;

    return {
      position: 'absolute',
      width: layout.imageWidth,
      height: layout.imageHeight,
      left: layout.left,
      top: layout.top,
      transform: layout.transform,
    };
  });
}

export function useAtlasFrameClipStyle(
  animationFrame: SharedValue<number>,
  frameCount: number,
  frameLayouts: readonly AtlasFrameLayout[],
) {
  return useAnimatedStyle(() => {
    const frameIndex = Math.min(Math.floor(animationFrame.value), frameCount - 1);
    const layout = frameLayouts[frameIndex]!;

    return {
      position: 'absolute',
      left: layout.clipLeft,
      top: layout.clipTop,
      width: layout.clipWidth,
      height: layout.clipHeight,
      overflow: 'hidden',
    };
  });
}

import { memo, useEffect, useMemo } from 'react';
import { Image, type ImageSourcePropType, type ImageStyle, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { GRASS_IMAGE_SOURCE } from '@/src/game/assets/definitions/road.assets';
import { GRASS_IMAGE, ROAD_IMAGE } from '@/src/game/config';

/** Module-level constants — safe to read inside Reanimated worklets. */
const GRASS_SEGMENT_HEIGHT = GRASS_IMAGE.segmentHeight;
const GRASS_SEGMENT_COUNT =
  Math.ceil(
    ((ROAD_IMAGE.maxWorldSegments + 1) * ROAD_IMAGE.segmentHeight) / GRASS_SEGMENT_HEIGHT,
  ) + 2;

export interface GrassImageColumnProps {
  readonly side: 'left' | 'right';
  readonly x: number;
  readonly width: number;
  readonly screenHeight: number;
  readonly scrollY: SharedValue<number>;
}

interface GrassSegmentRowProps {
  readonly source: ImageSourcePropType;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly segmentIndex: number;
  readonly side: 'left' | 'right';
}

const GrassSegmentRow = memo(function GrassSegmentRow({
  source,
  width,
  height,
  top,
  segmentIndex,
  side,
}: GrassSegmentRowProps) {
  const imageStyle = useMemo(
    (): ImageStyle => ({
      position: 'absolute',
      left: 0,
      top,
      width,
      height,
    }),
    [height, top, width],
  );

  return (
    <Image
      source={source}
      style={imageStyle}
      resizeMode="stretch"
      accessibilityLabel={`grass-${side}-${segmentIndex}`}
    />
  );
});

function GrassImageColumnComponent({
  side,
  x,
  width,
  screenHeight,
  scrollY,
}: GrassImageColumnProps) {
  const segmentIndices = useMemo(
    () => Array.from({ length: GRASS_SEGMENT_COUNT }, (_, index) => index),
    [],
  );
  const columnHeight = GRASS_SEGMENT_HEIGHT * GRASS_SEGMENT_COUNT;

  useEffect(() => {
    const resolved = Image.resolveAssetSource(GRASS_IMAGE_SOURCE);
    if (typeof resolved.uri === 'string') {
      void Image.prefetch(resolved.uri);
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value }],
  }));

  const clipStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      left: x,
      top: 0,
      width,
      height: screenHeight,
      overflow: 'hidden' as const,
    }),
    [screenHeight, width, x],
  );

  const columnStyle = useMemo(
    () => ({
      width,
      height: columnHeight,
    }),
    [columnHeight, width],
  );

  return (
    <View pointerEvents="none" style={clipStyle}>
      <Animated.View style={[columnStyle, animatedStyle]}>
        {segmentIndices.map((segmentIndex) => (
          <GrassSegmentRow
            key={`grass-${side}-${segmentIndex}`}
            source={GRASS_IMAGE_SOURCE}
            width={width}
            height={GRASS_SEGMENT_HEIGHT}
            top={-segmentIndex * GRASS_SEGMENT_HEIGHT}
            segmentIndex={segmentIndex}
            side={side}
          />
        ))}
      </Animated.View>
    </View>
  );
}

export const GrassImageColumn = memo(GrassImageColumnComponent);

import { memo, useEffect, useMemo } from 'react';
import { Image, type ImageSourcePropType, type ImageStyle, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import {
  SIDEWALK_LEFT_IMAGE_SOURCE,
  SIDEWALK_RIGHT_IMAGE_SOURCE,
} from '@/src/game/assets/definitions/road.assets';
import { ROAD_IMAGE } from '@/src/game/config';

/** Module-level constants — safe to read inside Reanimated worklets. */
const SIDEWALK_SEGMENT_HEIGHT = ROAD_IMAGE.segmentHeight;
const SIDEWALK_SEGMENT_COUNT = ROAD_IMAGE.maxWorldSegments + 1;

export interface SidewalkImageColumnProps {
  readonly side: 'left' | 'right';
  readonly x: number;
  readonly width: number;
  readonly screenHeight: number;
  readonly scrollY: SharedValue<number>;
}

interface SidewalkSegmentRowProps {
  readonly source: ImageSourcePropType;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly segmentIndex: number;
  readonly side: 'left' | 'right';
}

const SIDEWALK_SOURCES = {
  left: SIDEWALK_LEFT_IMAGE_SOURCE,
  right: SIDEWALK_RIGHT_IMAGE_SOURCE,
} as const;

const SidewalkSegmentRow = memo(function SidewalkSegmentRow({
  source,
  width,
  height,
  top,
  segmentIndex,
  side,
}: SidewalkSegmentRowProps) {
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
      accessibilityLabel={`sidewalk-${side}-${segmentIndex}`}
    />
  );
});

function SidewalkImageColumnComponent({
  side,
  x,
  width,
  screenHeight,
  scrollY,
}: SidewalkImageColumnProps) {
  const source = SIDEWALK_SOURCES[side];
  const segmentIndices = useMemo(
    () => Array.from({ length: SIDEWALK_SEGMENT_COUNT }, (_, index) => index),
    [],
  );
  const columnHeight = SIDEWALK_SEGMENT_HEIGHT * SIDEWALK_SEGMENT_COUNT;

  useEffect(() => {
    const resolved = Image.resolveAssetSource(source);
    if (typeof resolved.uri === 'string') {
      void Image.prefetch(resolved.uri);
    }
  }, [source]);

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
          <SidewalkSegmentRow
            key={`sidewalk-${side}-${segmentIndex}`}
            source={source}
            width={width}
            height={SIDEWALK_SEGMENT_HEIGHT}
            top={-segmentIndex * SIDEWALK_SEGMENT_HEIGHT}
            segmentIndex={segmentIndex}
            side={side}
          />
        ))}
      </Animated.View>
    </View>
  );
}

export const SidewalkImageColumn = memo(SidewalkImageColumnComponent);

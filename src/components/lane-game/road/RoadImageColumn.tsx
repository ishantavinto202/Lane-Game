import { memo, useEffect, useMemo } from 'react';
import { Image, type ImageSourcePropType, type ImageStyle, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import {
  pickLoopRoadImageSource,
  ROAD_LOOP_A_IMAGE_SOURCE,
  ROAD_LOOP_B_IMAGE_SOURCE,
  ROAD_START_IMAGE_SOURCE,
} from '@/src/game/assets/definitions/road.assets';
import { ROAD_IMAGE } from '@/src/game/config';

/** Module-level constants — safe to read inside Reanimated worklets. */
const ROAD_SEGMENT_HEIGHT = ROAD_IMAGE.segmentHeight;
const ROAD_MAX_WORLD_SEGMENTS = ROAD_IMAGE.maxWorldSegments;

const ROAD_IMAGE_SOURCES = [
  ROAD_START_IMAGE_SOURCE,
  ROAD_LOOP_A_IMAGE_SOURCE,
  ROAD_LOOP_B_IMAGE_SOURCE,
] as const;

function prefetchRoadImages(): void {
  for (const source of ROAD_IMAGE_SOURCES) {
    const resolved = Image.resolveAssetSource(source);
    if (typeof resolved.uri === 'string') {
      void Image.prefetch(resolved.uri);
    }
  }
}

function buildWorldSegmentSources(): readonly ImageSourcePropType[] {
  const sources: ImageSourcePropType[] = [ROAD_START_IMAGE_SOURCE];

  for (let worldSegmentIndex = 1; worldSegmentIndex <= ROAD_MAX_WORLD_SEGMENTS; worldSegmentIndex += 1) {
    sources.push(pickLoopRoadImageSource(worldSegmentIndex - 1));
  }

  return sources;
}

export interface RoadImageColumnProps {
  readonly x: number;
  readonly width: number;
  readonly screenHeight: number;
  readonly scrollY: SharedValue<number>;
}

interface RoadSegmentRowProps {
  readonly source: ImageSourcePropType;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly worldSegmentIndex: number;
}

const RoadSegmentRow = memo(function RoadSegmentRow({
  source,
  width,
  height,
  top,
  worldSegmentIndex,
}: RoadSegmentRowProps) {
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
      accessibilityLabel={`road-world-${worldSegmentIndex}`}
    />
  );
});

function RoadImageColumnComponent({
  x,
  width,
  screenHeight,
  scrollY,
}: RoadImageColumnProps) {
  const segmentSources = useMemo(() => buildWorldSegmentSources(), []);
  const columnHeight = ROAD_SEGMENT_HEIGHT * segmentSources.length;

  useEffect(() => {
    prefetchRoadImages();
  }, []);

  /** Positive translateY matches grass/sidewalk scroll direction. */
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
        {segmentSources.map((source, worldSegmentIndex) => (
          <RoadSegmentRow
            key={`road-world-${worldSegmentIndex}`}
            source={source}
            width={width}
            height={ROAD_SEGMENT_HEIGHT}
            top={-worldSegmentIndex * ROAD_SEGMENT_HEIGHT}
            worldSegmentIndex={worldSegmentIndex}
          />
        ))}
      </Animated.View>
    </View>
  );
}

export const RoadImageColumn = memo(RoadImageColumnComponent);

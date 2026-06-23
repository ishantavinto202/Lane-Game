import { memo, useMemo } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { ROAD_COLORS, ROAD_TILE } from '@/src/game/config';
import type { RoadRegions } from '@/src/game/utils/layout';

import { InfiniteTileColumn } from './InfiniteTileColumn';

export interface GrassStripProps {
  readonly side: 'left' | 'right';
  readonly regions: RoadRegions;
  readonly screenHeight: number;
  readonly scrollY: SharedValue<number>;
}

function GrassStripComponent({ side, regions, screenHeight, scrollY }: GrassStripProps) {
  const region = side === 'left' ? regions.leftGrass : regions.rightGrass;
  const sideSeed = side === 'left' ? 0 : 2;
  const colors = useMemo(() => ROAD_TILE.grassColorChoices, []);

  return (
    <InfiniteTileColumn
      x={region.x}
      width={region.width}
      tileSize={ROAD_TILE.grassTileSize}
      screenHeight={screenHeight}
      scrollY={scrollY}
      colors={colors}
      colorMode="indexed"
      sideSeed={sideSeed}
    />
  );
}

export const GrassStrip = memo(GrassStripComponent);

export interface SidewalkStripProps {
  readonly side: 'left' | 'right';
  readonly regions: RoadRegions;
  readonly screenHeight: number;
  readonly scrollY: SharedValue<number>;
}

function SidewalkStripComponent({
  side,
  regions,
  screenHeight,
  scrollY,
}: SidewalkStripProps) {
  const region = side === 'left' ? regions.leftSidewalk : regions.rightSidewalk;
  const colors = useMemo(() => ROAD_TILE.sidewalkColorPattern, []);

  return (
    <InfiniteTileColumn
      x={region.x}
      width={region.width}
      tileSize={ROAD_TILE.sidewalkTileSize}
      screenHeight={screenHeight}
      scrollY={scrollY}
      colors={colors}
      colorMode="alternate"
    />
  );
}

export const SidewalkStrip = memo(SidewalkStripComponent);

export interface RoadSurfaceProps {
  readonly regions: RoadRegions;
  readonly screenHeight: number;
}

function RoadSurfaceComponent({ regions, screenHeight }: RoadSurfaceProps) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: regions.road.x,
        top: 0,
        width: regions.road.width,
        height: screenHeight,
        backgroundColor: ROAD_COLORS.surface,
      }}
    />
  );
}

export const RoadSurface = memo(RoadSurfaceComponent);

interface AnimatedDividerColumnProps {
  readonly x: number;
  readonly width: number;
  readonly dashLength: number;
  readonly gapLength: number;
  readonly dashCount: number;
  readonly scrollY: SharedValue<number>;
}

const AnimatedDividerColumn = memo(function AnimatedDividerColumn({
  x,
  width,
  dashLength,
  gapLength,
  dashCount,
  scrollY,
}: AnimatedDividerColumnProps) {
  const patternLength = dashLength + gapLength;
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value % patternLength }],
  }));
  const dashes = useMemo(() => Array.from({ length: dashCount }, (_, index) => index), [dashCount]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: x,
          top: -patternLength,
          width,
          height: dashCount * patternLength + patternLength,
        },
        animatedStyle,
      ]}
    >
      {dashes.map((index) => (
        <View key={`dash-${index}`} style={{ marginBottom: gapLength }}>
          <View
            style={{
              width,
              height: dashLength,
              backgroundColor: ROAD_COLORS.laneDivider,
            }}
          />
        </View>
      ))}
    </Animated.View>
  );
});

export interface LaneDividersProps {
  readonly layoutRoadLeft: number;
  readonly layoutRoadWidth: number;
  readonly laneWidth: number;
  readonly screenHeight: number;
  readonly scrollY: SharedValue<number>;
}

function LaneDividersComponent({
  layoutRoadLeft,
  layoutRoadWidth,
  laneWidth,
  screenHeight,
  scrollY,
}: LaneDividersProps) {
  const dividerAssetWidth = 4;
  const dashLength = 32;
  const gapLength = 24;
  const patternLength = dashLength + gapLength;
  const dashCount = useMemo(
    () => Math.ceil(screenHeight / patternLength) + 6,
    [patternLength, screenHeight],
  );
  const dividerXs = useMemo(
    () => [layoutRoadLeft + laneWidth, layoutRoadLeft + laneWidth * 2],
    [layoutRoadLeft, laneWidth],
  );

  return (
    <>
      {dividerXs.map((dividerX) => (
        <AnimatedDividerColumn
          key={`divider-${dividerX}`}
          x={dividerX - dividerAssetWidth / 2}
          width={dividerAssetWidth}
          dashLength={dashLength}
          gapLength={gapLength}
          dashCount={dashCount}
          scrollY={scrollY}
        />
      ))}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: layoutRoadLeft,
          top: 0,
          width: 2,
          height: screenHeight,
          backgroundColor: ROAD_COLORS.laneDivider,
          opacity: 0.35,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: layoutRoadLeft + layoutRoadWidth - 2,
          top: 0,
          width: 2,
          height: screenHeight,
          backgroundColor: ROAD_COLORS.laneDivider,
          opacity: 0.35,
        }}
      />
    </>
  );
}

export const LaneDividers = memo(LaneDividersComponent);

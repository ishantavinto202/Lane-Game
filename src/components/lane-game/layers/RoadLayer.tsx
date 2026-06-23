import { memo, useMemo } from 'react';
import { View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import type { GameLayout } from '@/src/game/types';
import { getWorldCameraRenderHeight } from '@/src/game/constants';
import { getRoadRegions } from '@/src/game/utils/layout';

import {
  GrassStrip,
  LaneDividers,
  RoadSurface,
  SidewalkStrip,
} from '../road/RoadParts';

export interface RoadLayerProps {
  readonly layout: GameLayout;
  readonly scrollY: SharedValue<number>;
}

function RoadLayerComponent({ layout, scrollY }: RoadLayerProps) {
  const regions = useMemo(() => getRoadRegions(layout), [layout]);
  const renderHeight = useMemo(
    () => getWorldCameraRenderHeight(layout.screenHeight),
    [layout.screenHeight],
  );

  return (
    <View pointerEvents="none" className="absolute inset-0">
      <GrassStrip
        side="left"
        regions={regions}
        screenHeight={renderHeight}
        scrollY={scrollY}
      />
      <GrassStrip
        side="right"
        regions={regions}
        screenHeight={renderHeight}
        scrollY={scrollY}
      />
      <SidewalkStrip
        side="left"
        regions={regions}
        screenHeight={renderHeight}
        scrollY={scrollY}
      />
      <SidewalkStrip
        side="right"
        regions={regions}
        screenHeight={renderHeight}
        scrollY={scrollY}
      />
      <RoadSurface regions={regions} screenHeight={renderHeight} />
      <LaneDividers
        layoutRoadLeft={layout.roadLeft}
        layoutRoadWidth={layout.roadWidth}
        laneWidth={layout.laneWidth}
        screenHeight={renderHeight}
        scrollY={scrollY}
      />
    </View>
  );
}

export const RoadLayer = memo(RoadLayerComponent);

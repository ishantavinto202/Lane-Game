import type { SharedValue } from 'react-native-reanimated';

import type { LaneIndex } from './game-state.types';

/** Shared values owned by the render bridge (UI thread). */
export interface PlayerMotionSharedValues {
  readonly laneIndex: SharedValue<number>;
  readonly x: SharedValue<number>;
  readonly y: SharedValue<number>;
  readonly scale: SharedValue<number>;
}

/** Shared scroll offset for infinitely scrolling layers. */
export interface ScrollSharedValues {
  readonly roadOffsetY: SharedValue<number>;
  readonly sidewalkOffsetY: SharedValue<number>;
  readonly grassOffsetY: SharedValue<number>;
  readonly decorationOffsetY: SharedValue<number>;
}

/** Per-obstacle shared values stored in a stable map keyed by entity id. */
export interface ObstacleMotionSharedValues {
  readonly id: string;
  readonly x: SharedValue<number>;
  readonly y: SharedValue<number>;
  readonly opacity: SharedValue<number>;
}

/** Layout constants computed once from screen size and road config. */
export interface GameLayout {
  readonly screenWidth: number;
  readonly screenHeight: number;
  readonly roadLeft: number;
  readonly roadRight: number;
  readonly roadWidth: number;
  readonly laneWidth: number;
  readonly laneCenters: readonly [number, number, number];
  readonly playerY: number;
  readonly spawnY: number;
  readonly despawnY: number;
}

/** Maps lane index to horizontal center coordinate. */
export type LaneCenterMap = Record<LaneIndex, number>;

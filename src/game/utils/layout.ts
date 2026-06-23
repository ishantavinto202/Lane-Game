import {
  GAME_CONSTANTS,
  LANE_CONSTANTS,
  WORLD_CONSTANTS,
} from '../constants';
import { ROAD_LAYOUT, ROAD_WORLD } from '../config';
import type { GameLayout, LaneIndex } from '../types';

export interface RoadRegions {
  readonly leftGrass: { readonly x: number; readonly width: number };
  readonly leftSidewalk: { readonly x: number; readonly width: number };
  readonly road: { readonly x: number; readonly width: number };
  readonly rightSidewalk: { readonly x: number; readonly width: number };
  readonly rightGrass: { readonly x: number; readonly width: number };
}

/** Computes horizontal lane center positions from road left edge. */
export function computeLaneCenters(roadLeft: number): readonly [number, number, number] {
  const halfLane = LANE_CONSTANTS.LANE_WIDTH / 2;
  return [
    roadLeft + halfLane,
    roadLeft + LANE_CONSTANTS.LANE_WIDTH + halfLane,
    roadLeft + LANE_CONSTANTS.LANE_WIDTH * 2 + halfLane,
  ] as const;
}

/** Resolves lane index to center X using precomputed layout. */
export function getLaneCenterX(layout: GameLayout, lane: LaneIndex): number {
  return layout.laneCenters[lane];
}

/**
 * Builds deterministic layout metrics from screen dimensions.
 * Called once on mount / orientation change — not per frame.
 */
export function createGameLayout(screenWidth: number, screenHeight: number): GameLayout {
  const roadWidth = ROAD_WORLD.roadWidth;
  const totalWidth = ROAD_WORLD.totalWidth;
  const horizontalOffset = (screenWidth - totalWidth) / 2;
  const roadLeft = horizontalOffset + ROAD_LAYOUT.grassWidth + ROAD_LAYOUT.sidewalkWidth;
  const roadRight = roadLeft + roadWidth;
  const laneCenters = computeLaneCenters(roadLeft);
  const playerY = screenHeight * WORLD_CONSTANTS.PLAYER_Y_RATIO;
  const spawnY = -screenHeight * WORLD_CONSTANTS.SPAWN_ABOVE_SCREEN_RATIO;
  const despawnY = screenHeight + screenHeight * WORLD_CONSTANTS.DESPAWN_BELOW_SCREEN_RATIO;

  return {
    screenWidth,
    screenHeight,
    roadLeft,
    roadRight,
    roadWidth,
    laneWidth: LANE_CONSTANTS.LANE_WIDTH,
    laneCenters,
    playerY,
    spawnY,
    despawnY,
  };
}

/** Clamps lane index to valid road boundaries. */
export function clampLaneIndex(lane: number): LaneIndex {
  const clamped = Math.max(
    GAME_CONSTANTS.MIN_LANE_INDEX,
    Math.min(GAME_CONSTANTS.MAX_LANE_INDEX, Math.round(lane)),
  );
  return clamped as LaneIndex;
}

/** Maps layout to horizontal road region bounds for render layers. */
export function getRoadRegions(layout: GameLayout): RoadRegions {
  const totalWidth = ROAD_WORLD.totalWidth;
  const offset = (layout.screenWidth - totalWidth) / 2;

  return {
    leftGrass: { x: offset, width: ROAD_LAYOUT.grassWidth },
    leftSidewalk: { x: offset + ROAD_LAYOUT.grassWidth, width: ROAD_LAYOUT.sidewalkWidth },
    road: { x: layout.roadLeft, width: layout.roadWidth },
    rightSidewalk: { x: layout.roadRight, width: ROAD_LAYOUT.sidewalkWidth },
    rightGrass: {
      x: layout.roadRight + ROAD_LAYOUT.sidewalkWidth,
      width: ROAD_LAYOUT.grassWidth,
    },
  };
}

/** Returns next lane after a directional input, respecting boundaries. */
export function resolveLaneChange(currentLane: LaneIndex, direction: 'left' | 'right'): LaneIndex {
  if (direction === 'left') {
    return clampLaneIndex(currentLane - 1);
  }
  return clampLaneIndex(currentLane + 1);
}

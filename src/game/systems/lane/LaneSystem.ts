import { GAME_CONSTANTS, LANE_CONSTANTS } from '../../constants';
import type { GameLayout, LaneBounds, LaneIndex } from '../../types';
import { clampLaneIndex, getLaneCenterX } from '../../utils/layout';

/** Reusable lane geometry system — position calculations and boundary checks. */
export class LaneSystem {
  readonly id = 'lane-system' as const;

  private layout: GameLayout | null = null;

  initialize(layout: GameLayout): void {
    this.layout = layout;
  }

  getLayout(): GameLayout | null {
    return this.layout;
  }

  getCenterX(lane: LaneIndex): number {
    if (!this.layout) {
      throw new Error('LaneSystem.initialize() must be called before getCenterX()');
    }
    return getLaneCenterX(this.layout, lane);
  }

  getLaneBounds(lane: LaneIndex): LaneBounds {
    if (!this.layout) {
      throw new Error('LaneSystem.initialize() must be called before getLaneBounds()');
    }

    const left = this.layout.roadLeft + lane * LANE_CONSTANTS.LANE_WIDTH;
    return {
      left,
      right: left + LANE_CONSTANTS.LANE_WIDTH,
      centerX: getLaneCenterX(this.layout, lane),
    };
  }

  getSpawnLane(): LaneIndex {
    return GAME_CONSTANTS.PLAYER_SPAWN_LANE;
  }

  clampLane(lane: number): LaneIndex {
    return clampLaneIndex(lane);
  }

  reset(): void {
    // Layout reference preserved; lane indices reset in PlayerSystem (Phase 2).
  }

  dispose(): void {
    this.layout = null;
  }
}

export type { LaneBounds, LaneIndex };

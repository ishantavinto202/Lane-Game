import { PLAYER_CAR_ASSET } from '../../assets';
import { GAME_CONSTANTS } from '../../constants';
import type { GameLayout, LaneDirection, LaneIndex } from '../../types';
import { resolveLaneChange } from '../../utils/layout';
import type { LaneSystem } from '../lane/LaneSystem';

import type { LaneChangeResult } from '../input/input.types';

/** Read-only player snapshot for static layout metadata. */
export interface PlayerSnapshot {
  readonly y: number;
  readonly lane: LaneIndex;
  readonly width: number;
  readonly height: number;
}

/** Player lane state — authoritative lane index lives in refs, not React state. */
export class PlayerSystem {
  readonly id = 'player-system' as const;

  private layout: GameLayout | null = null;
  private laneSystem: LaneSystem | null = null;
  private lane: LaneIndex = GAME_CONSTANTS.PLAYER_SPAWN_LANE;

  initialize(layout: GameLayout, laneSystem: LaneSystem): void {
    this.layout = layout;
    this.laneSystem = laneSystem;
    this.lane = GAME_CONSTANTS.PLAYER_SPAWN_LANE;
  }

  getLane(): LaneIndex {
    return this.lane;
  }

  getSnapshot(): PlayerSnapshot {
    if (!this.layout) {
      throw new Error('PlayerSystem.initialize() must be called before getSnapshot()');
    }

    return {
      y: this.layout.playerY,
      lane: this.lane,
      width: PLAYER_CAR_ASSET.width,
      height: PLAYER_CAR_ASSET.height,
    };
  }

  /**
   * Attempts a lane change. Updates authoritative lane immediately on success.
   * Animation is handled separately by PlayerMotionController.
   */
  tryLaneChange(direction: LaneDirection): LaneChangeResult {
    if (!this.layout || !this.laneSystem) {
      return {
        accepted: false,
        fromLane: this.lane,
        toLane: this.lane,
        targetX: 0,
        direction,
      };
    }

    const fromLane = this.lane;
    const toLane = resolveLaneChange(fromLane, direction);

    if (toLane === fromLane) {
      return {
        accepted: false,
        fromLane,
        toLane,
        targetX: this.laneSystem.getCenterX(fromLane),
        direction,
      };
    }

    this.lane = toLane;
    const targetX = this.laneSystem.getCenterX(toLane);

    return {
      accepted: true,
      fromLane,
      toLane,
      targetX,
      direction,
    };
  }

  reset(): void {
    this.lane = GAME_CONSTANTS.PLAYER_SPAWN_LANE;
  }

  dispose(): void {
    this.layout = null;
    this.laneSystem = null;
    this.lane = GAME_CONSTANTS.PLAYER_SPAWN_LANE;
  }
}

export type { PlayerSnapshot as PlayerRenderSnapshot };

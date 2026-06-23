import type { LaneBounds, LaneIndex } from '../../types';
import type { GameLayout } from '../../types';

/** Lane geometry contract. */
export interface LaneSystemContract {
  readonly id: 'lane-system';
  initialize(layout: GameLayout): void;
  getCenterX(lane: LaneIndex): number;
  getLaneBounds(lane: LaneIndex): LaneBounds;
  getSpawnLane(): LaneIndex;
  clampLane(lane: number): LaneIndex;
  reset(): void;
  dispose(): void;
}

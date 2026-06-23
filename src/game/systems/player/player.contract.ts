import type { LaneDirection, LaneIndex, PlayerEntity } from '../../types';

/** Player lane movement contract (Phase 2 implementation). */
export interface PlayerSystemContract {
  readonly id: 'player-system';
  readonly getPlayer: () => PlayerEntity;
  readonly getLane: () => LaneIndex;
  readonly requestLaneChange: (direction: LaneDirection) => boolean;
  readonly updateLaneAnimation: (deltaMs: number) => void;
  readonly reset: (spawnLane: LaneIndex) => void;
}

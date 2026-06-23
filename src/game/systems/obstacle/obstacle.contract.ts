import type { ObstacleEntity } from '../../types';
import type { SpawnContext, SpawnDecision } from '../../types';

/** Obstacle spawning and movement contract (Phase 3 implementation). */
export interface ObstacleSystemContract {
  readonly id: 'obstacle-system';
  readonly planSpawn: (context: SpawnContext) => SpawnDecision;
  readonly updateObstacles: (
    deltaMs: number,
    speedPxPerSec: number,
  ) => readonly ObstacleEntity[];
  readonly reset: () => void;
  readonly dispose: () => void;
}

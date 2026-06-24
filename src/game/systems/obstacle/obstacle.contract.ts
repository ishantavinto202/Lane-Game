import type { CoinEntity, ObstacleEntity, ShieldEntity } from '../../types';
import type { SpawnContext, SpawnDecision } from '../../types';

/** Obstacle spawning and movement contract (Phase 3 implementation). */
export interface ObstacleSystemContract {
  readonly id: 'obstacle-system';
  readonly planSpawn: (
    context: SpawnContext,
    activeCoins: readonly CoinEntity[],
    activeShields: readonly ShieldEntity[],
  ) => SpawnDecision;
  readonly updateObstacles: (
    deltaMs: number,
    speedPxPerSec: number,
    activeCoins: readonly CoinEntity[],
    activeShields: readonly ShieldEntity[],
  ) => readonly ObstacleEntity[];
  readonly reset: () => void;
  readonly dispose: () => void;
}

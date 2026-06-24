import type { CoinEntity, ObstacleEntity, ShieldEntity } from '../../types';

/** Shield pickup spawning, movement, and collection contract (Phase 4.3A). */
export interface ShieldSystemContract {
  readonly id: 'shield-system';
  readonly updateShields: (
    deltaMs: number,
    speedPxPerSec: number,
    activeObstacles: readonly ObstacleEntity[],
    activeCoins: readonly CoinEntity[],
  ) => readonly ShieldEntity[];
  readonly reset: () => void;
  readonly dispose: () => void;
}

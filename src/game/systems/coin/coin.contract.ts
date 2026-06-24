import type { CoinEntity, ObstacleEntity, ShieldEntity } from '../../types';

/** Coin spawning, movement, and collection contract (Phase 4.2). */
export interface CoinSystemContract {
  readonly id: 'coin-system';
  readonly updateCoins: (
    deltaMs: number,
    speedPxPerSec: number,
    activeObstacles: readonly ObstacleEntity[],
    activeShields: readonly ShieldEntity[],
  ) => readonly CoinEntity[];
  readonly reset: () => void;
  readonly dispose: () => void;
}

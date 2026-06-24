import type { CoinEntity, ObstacleEntity, ShieldEntity, SpeedBoostEntity } from '../../types';

/** Speed boost pickup spawning, movement, and collection contract (Phase 5.5). */
export interface SpeedBoostSystemContract {
  readonly id: 'speed-boost-system';
  readonly updateSpeedBoosts: (
    deltaMs: number,
    speedPxPerSec: number,
    activeObstacles: readonly ObstacleEntity[],
    activeCoins: readonly CoinEntity[],
    activeShields: readonly ShieldEntity[],
  ) => readonly SpeedBoostEntity[];
  readonly reset: () => void;
  readonly dispose: () => void;
}

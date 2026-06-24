import type { ObstacleAssetId } from '../../types';

/** Deterministic cycle — guarantees every four pulls include all obstacle types. */
const OBSTACLE_VARIETY_CYCLE: readonly ObstacleAssetId[] = [
  'OBSTACLE_TIRE',
  'OBSTACLE_CONE',
  'OBSTACLE_CRATE',
  'OBSTACLE_BARRIER',
] as const;

/** Deterministic spawn cycle — one pull per spawn, retrying failed placements first. */
export class ObstacleSpawnBag {
  private retryQueue: ObstacleAssetId[] = [];
  private cycleIndex = 0;

  pullNext(): ObstacleAssetId {
    const retry = this.retryQueue.shift();
    if (retry) {
      return retry;
    }

    const next = OBSTACLE_VARIETY_CYCLE[this.cycleIndex]!;
    this.cycleIndex = (this.cycleIndex + 1) % OBSTACLE_VARIETY_CYCLE.length;
    return next;
  }

  /** Retries a failed placement before advancing the deterministic cycle. */
  returnType(assetId: ObstacleAssetId): void {
    this.retryQueue.unshift(assetId);
  }

  reset(): void {
    this.retryQueue = [];
    this.cycleIndex = 0;
  }
}

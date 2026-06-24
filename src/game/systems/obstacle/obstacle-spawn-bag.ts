import type { ObstacleAssetId } from '../../types';

/** One of each obstacle type per bag refill. */
const OBSTACLE_BAG_TEMPLATE: readonly ObstacleAssetId[] = [
  'OBSTACLE_TIRE',
  'OBSTACLE_CONE',
  'OBSTACLE_CRATE',
  'OBSTACLE_BARRIER',
  'OBSTACLE_PUDDLE',
] as const;

function shuffleBag(types: readonly ObstacleAssetId[]): ObstacleAssetId[] {
  const bag = [...types];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = bag[i]!;
    bag[i] = bag[j]!;
    bag[j] = current;
  }
  return bag;
}

/** Shuffled spawn bag — one pull per spawn, retrying failed placements first. */
export class ObstacleSpawnBag {
  private retryQueue: ObstacleAssetId[] = [];
  private bag: ObstacleAssetId[] = shuffleBag(OBSTACLE_BAG_TEMPLATE);

  pullNext(): ObstacleAssetId {
    const retry = this.retryQueue.shift();
    if (retry) {
      return retry;
    }

    if (this.bag.length === 0) {
      this.bag = shuffleBag(OBSTACLE_BAG_TEMPLATE);
    }

    return this.bag.shift()!;
  }

  /** Retries a failed placement before pulling the next bag entry. */
  returnType(assetId: ObstacleAssetId): void {
    this.retryQueue.unshift(assetId);
  }

  reset(): void {
    this.retryQueue = [];
    this.bag = shuffleBag(OBSTACLE_BAG_TEMPLATE);
  }
}

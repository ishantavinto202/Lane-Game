import type { ObstacleAssetId } from '../../types';

/** Bag template — two Tire/Cone entries keep common hazards frequent without streaks. */
const SPAWN_BAG_TEMPLATE: readonly ObstacleAssetId[] = [
  'OBSTACLE_TIRE',
  'OBSTACLE_TIRE',
  'OBSTACLE_CONE',
  'OBSTACLE_CONE',
  'OBSTACLE_CRATE',
  'OBSTACLE_BARRIER',
] as const;

function shuffleInPlace<T>(items: T[]): void {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = items[index];
    items[index] = items[swapIndex]!;
    items[swapIndex] = current!;
  }
}

/** Shuffled spawn bag — one pull per spawn, refill when empty. */
export class ObstacleSpawnBag {
  private bag: ObstacleAssetId[] = [];

  constructor() {
    this.refill();
  }

  pullNext(): ObstacleAssetId {
    if (this.bag.length === 0) {
      this.refill();
    }

    const next = this.bag.pop();
    if (!next) {
      this.refill();
      return this.pullNext();
    }

    return next;
  }

  /** Returns a type to the bag when lane placement fails — preserves bag order integrity. */
  returnType(assetId: ObstacleAssetId): void {
    this.bag.push(assetId);
  }

  reset(): void {
    this.refill();
  }

  private refill(): void {
    this.bag = [...SPAWN_BAG_TEMPLATE];
    shuffleInPlace(this.bag);
  }
}

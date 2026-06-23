import type { LaneIndex, ObstacleAssetId, WorldBounds } from '../../types';

export interface CoinSpawnRejectedEvent {
  readonly coinX: number;
  readonly coinY: number;
  readonly lane: LaneIndex;
  readonly obstacleType: ObstacleAssetId;
  readonly distancePx: number;
}

/** Dev-only rejection audit when expanded spawn bounds intersect an obstacle. */
export function logCoinSpawnRejected(event: CoinSpawnRejectedEvent): void {
  if (!__DEV__) {
    return;
  }

  console.log('[CoinSpawnRejected]', {
    coinPosition: { x: event.coinX, y: event.coinY, lane: event.lane },
    obstacleType: event.obstacleType,
    distancePx: Math.round(event.distancePx),
  });
}

/** Dev-only log when every lane fails validation at the spawn line. */
export function logCoinSpawnSkipped(spawnY: number): void {
  if (!__DEV__) {
    return;
  }

  console.log('[CoinSpawnSkipped] No valid lane at spawnY=', spawnY);
}

/** Euclidean distance between two bounds centers. */
export function distanceBetweenBounds(a: WorldBounds, b: WorldBounds): number {
  const dx = a.centerX - b.centerX;
  const dy = a.centerY - b.centerY;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Inflates an AABB by padding on all sides. */
export function expandWorldBounds(bounds: WorldBounds, padding: number): WorldBounds {
  return {
    left: bounds.left - padding,
    right: bounds.right + padding,
    top: bounds.top - padding,
    bottom: bounds.bottom + padding,
    centerX: bounds.centerX,
    centerY: bounds.centerY,
  };
}

/** True when two axis-aligned bounds share any area (touching edges do not count). */
export function boundsIntersect(a: WorldBounds, b: WorldBounds): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

/** Anchor-centered entity bounds from rendered width/height. */
export function computeEntityVisualBounds(
  x: number,
  y: number,
  width: number,
  height: number,
): WorldBounds {
  const left = x - width / 2;
  const top = y - height / 2;

  return {
    left,
    right: left + width,
    top,
    bottom: top + height,
    centerX: x,
    centerY: y,
  };
}

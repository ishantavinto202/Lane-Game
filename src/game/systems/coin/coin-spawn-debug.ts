import type { LaneIndex, ObstacleAssetId, WorldBounds } from '../../types';

export interface CoinSpawnRejectedEvent {
  readonly lane: LaneIndex;
  readonly coinBounds: WorldBounds;
  readonly obstacleType: ObstacleAssetId;
  readonly obstacleBounds: WorldBounds;
  readonly overlapAmountPx: number;
}

/** Dev-only rejection audit when coin bounds intersect buffered obstacle bounds. */
export function logCoinSpawnRejected(event: CoinSpawnRejectedEvent): void {
  if (!__DEV__) {
    return;
  }

  console.log('[CoinSpawnRejected]', {
    coinLane: event.lane,
    coinBounds: formatBounds(event.coinBounds),
    obstacleType: event.obstacleType,
    obstacleBounds: formatBounds(event.obstacleBounds),
    overlapAmountPx: Math.round(event.overlapAmountPx * 100) / 100,
  });
}

/** Dev-only log when every lane/position fails validation. */
export function logCoinSpawnSkipped(spawnY: number): void {
  if (!__DEV__) {
    return;
  }

  console.log('[CoinSpawnSkipped] No valid lane/position near spawnY=', spawnY);
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

/** Overlap width × height between two bounds (0 when separated). */
export function computeOverlapArea(a: WorldBounds, b: WorldBounds): number {
  const overlapWidth = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const overlapHeight = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return overlapWidth * overlapHeight;
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

/** Minimal bounds source for cross-pickup spawn validation. */
export interface PickupBoundsSource {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Returns first active pickup whose visual bounds overlap the candidate bounds. */
export function findPickupBoundsConflict(
  candidateBounds: WorldBounds,
  pickups: readonly PickupBoundsSource[],
): { bounds: WorldBounds; overlapAmountPx: number } | null {
  for (const pickup of pickups) {
    const otherBounds = computeEntityVisualBounds(
      pickup.x,
      pickup.y,
      pickup.width,
      pickup.height,
    );

    if (!boundsIntersect(candidateBounds, otherBounds)) {
      continue;
    }

    return {
      bounds: otherBounds,
      overlapAmountPx: computeOverlapArea(candidateBounds, otherBounds),
    };
  }

  return null;
}

function formatBounds(bounds: WorldBounds): {
  left: number;
  top: number;
  right: number;
  bottom: number;
} {
  return {
    left: Math.round(bounds.left),
    top: Math.round(bounds.top),
    right: Math.round(bounds.right),
    bottom: Math.round(bounds.bottom),
  };
}

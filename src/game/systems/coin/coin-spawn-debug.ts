import {
  OBSTACLE_ASSET_MAP,
  OBSTACLE_BARRIER_SKIN,
  OBSTACLE_CONE_SKIN,
  OBSTACLE_CRATE_SKIN,
  OBSTACLE_PUDDLE_SKIN,
  OBSTACLE_TIRE_SKIN,
  type ObstacleCrateSkinDefinition,
} from '../../assets/definitions/obstacle.assets';
import { COLLECTIBLE_SPAWN_CONFIG } from '../../config';
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

/** True when two axis-aligned bounds overlap or are closer than minSpacingPx. */
export function boundsWithinMinSpacing(
  a: WorldBounds,
  b: WorldBounds,
  minSpacingPx: number,
): boolean {
  if (minSpacingPx <= 0) {
    return boundsIntersect(a, b);
  }

  const halfGap = minSpacingPx / 2;
  return boundsIntersect(expandWorldBounds(a, halfGap), expandWorldBounds(b, halfGap));
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

const OBSTACLE_SKIN_BY_ID: Partial<Record<ObstacleAssetId, ObstacleCrateSkinDefinition>> = {
  OBSTACLE_TIRE: OBSTACLE_TIRE_SKIN,
  OBSTACLE_CRATE: OBSTACLE_CRATE_SKIN,
  OBSTACLE_CONE: OBSTACLE_CONE_SKIN,
  OBSTACLE_BARRIER: OBSTACLE_BARRIER_SKIN,
  OBSTACLE_PUDDLE: OBSTACLE_PUDDLE_SKIN,
};

/**
 * On-screen obstacle sprite bounds — matches ObstacleSprite layout
 * (visualOffset + scaled spriteWidth/spriteHeight from anchor center).
 */
export function computeObstaclePresentationBounds(
  x: number,
  y: number,
  assetId: ObstacleAssetId,
): WorldBounds {
  const skin = OBSTACLE_SKIN_BY_ID[assetId];

  if (!skin) {
    const asset = OBSTACLE_ASSET_MAP[assetId];
    return computeEntityVisualBounds(x, y, asset.width, asset.height);
  }

  const centerX = x + skin.visualOffsetX + skin.spriteWidth / 2;
  const centerY = y + skin.visualOffsetY + skin.spriteHeight / 2;
  const halfWidth = (skin.spriteWidth * skin.visualScale) / 2;
  const halfHeight = (skin.spriteHeight * skin.visualScale) / 2;

  return {
    left: centerX - halfWidth,
    right: centerX + halfWidth,
    top: centerY - halfHeight,
    bottom: centerY + halfHeight,
    centerX,
    centerY,
  };
}

/** Total clearance padding for collectible ↔ obstacle spawn validation. */
export function getObstacleCollectibleClearancePx(assetId: ObstacleAssetId): number {
  return (
    COLLECTIBLE_SPAWN_CONFIG.obstacleCollectibleBaseClearancePx +
    COLLECTIBLE_SPAWN_CONFIG.obstacleCollectibleClearanceByType[assetId]
  );
}

export interface ObstacleSpawnBoundsSource {
  readonly x: number;
  readonly y: number;
  readonly assetId: ObstacleAssetId;
}

/** Minimal bounds source for cross-pickup spawn validation. */
export interface PickupBoundsSource {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Returns first active pickup that overlaps or violates min spacing with the candidate bounds. */
export function findPickupBoundsConflict(
  candidateBounds: WorldBounds,
  pickups: readonly PickupBoundsSource[],
  minSpacingPx = 0,
): { bounds: WorldBounds; overlapAmountPx: number } | null {
  for (const pickup of pickups) {
    const otherBounds = computeEntityVisualBounds(
      pickup.x,
      pickup.y,
      pickup.width,
      pickup.height,
    );

    if (!boundsWithinMinSpacing(candidateBounds, otherBounds, minSpacingPx)) {
      continue;
    }

    return {
      bounds: otherBounds,
      overlapAmountPx: computeOverlapArea(candidateBounds, otherBounds),
    };
  }

  return null;
}

export interface ObstacleCollectibleSpawnConflict {
  readonly assetId: ObstacleAssetId;
  readonly obstacleBounds: WorldBounds;
  readonly overlapAmountPx: number;
}

/** True when collectible bounds intersect an obstacle presentation bound + type clearance. */
export function hasCollectibleObstacleSpawnConflict(
  collectibleBounds: WorldBounds,
  obstacleX: number,
  obstacleY: number,
  obstacleAssetId: ObstacleAssetId,
): boolean {
  return (
    findCollectibleObstacleSpawnConflict(
      collectibleBounds,
      obstacleX,
      obstacleY,
      obstacleAssetId,
    ) !== null
  );
}

/** Single obstacle collectible spawn conflict — sprite-aware bounds + per-type clearance. */
export function findCollectibleObstacleSpawnConflict(
  collectibleBounds: WorldBounds,
  obstacleX: number,
  obstacleY: number,
  obstacleAssetId: ObstacleAssetId,
): ObstacleCollectibleSpawnConflict | null {
  const presentationBounds = computeObstaclePresentationBounds(
    obstacleX,
    obstacleY,
    obstacleAssetId,
  );
  const clearance = getObstacleCollectibleClearancePx(obstacleAssetId);
  const bufferedObstacleBounds = expandWorldBounds(presentationBounds, clearance);

  if (!boundsIntersect(collectibleBounds, bufferedObstacleBounds)) {
    return null;
  }

  return {
    assetId: obstacleAssetId,
    obstacleBounds: presentationBounds,
    overlapAmountPx: computeOverlapArea(collectibleBounds, bufferedObstacleBounds),
  };
}

/** Returns first obstacle that blocks a candidate collectible spawn. */
export function findObstacleCollectibleSpawnConflict(
  candidateBounds: WorldBounds,
  obstacles: readonly ObstacleSpawnBoundsSource[],
): ObstacleCollectibleSpawnConflict | null {
  for (const obstacle of obstacles) {
    const conflict = findCollectibleObstacleSpawnConflict(
      candidateBounds,
      obstacle.x,
      obstacle.y,
      obstacle.assetId,
    );

    if (conflict) {
      return conflict;
    }
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

import type { AssetDefinition, CollisionBox, WorldBounds } from '../types';
import { COLLISION_CONFIG } from '../config';

/** Converts anchor-centered entity position into world-space AABB. */
export function computeWorldBounds(
  x: number,
  y: number,
  asset: AssetDefinition,
  hitboxScale: number = COLLISION_CONFIG.hitboxScale,
): WorldBounds {
  const box: CollisionBox | null =
    COLLISION_CONFIG.useReducedHitboxes && asset.collisionBox
      ? {
          offsetX: asset.collisionBox.offsetX * hitboxScale,
          offsetY: asset.collisionBox.offsetY * hitboxScale,
          width: asset.collisionBox.width * hitboxScale,
          height: asset.collisionBox.height * hitboxScale,
        }
      : asset.collisionBox;

  if (!box) {
    const left = x - asset.width / 2;
    const top = y - asset.height / 2;
    return {
      left,
      right: left + asset.width,
      top,
      bottom: top + asset.height,
      centerX: x,
      centerY: y,
    };
  }

  const left = x + box.offsetX;
  const top = y + box.offsetY;

  return {
    left,
    right: left + box.width,
    top,
    bottom: top + box.height,
    centerX: left + box.width / 2,
    centerY: top + box.height / 2,
  };
}

/** Returns true when two axis-aligned bounds overlap above min area threshold. */
export function boundsOverlap(a: WorldBounds, b: WorldBounds, minOverlapArea: number): boolean {
  const overlapWidth = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const overlapHeight = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return overlapWidth * overlapHeight >= minOverlapArea;
}

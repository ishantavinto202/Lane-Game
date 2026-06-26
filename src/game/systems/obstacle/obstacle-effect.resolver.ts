import { OBSTACLE_PENALTY_CONFIG } from '../../config';
import type { ObstacleAssetId } from '../../types';

/** Resolved health and score penalties for an obstacle collision. */
export interface ObstacleCollisionPenalty {
  readonly healthLoss: number;
  readonly scorePenalty: number;
}

/** Maps obstacle type to configured collision penalties. */
export function resolveObstacleCollisionPenalty(
  assetId: ObstacleAssetId,
): ObstacleCollisionPenalty {
  return OBSTACLE_PENALTY_CONFIG[assetId];
}

/** @deprecated Use resolveObstacleCollisionPenalty — kept for barrel export compatibility. */
export type ObstacleCollisionEffect = ObstacleCollisionPenalty;

/** @deprecated Use resolveObstacleCollisionPenalty. */
export function resolveObstacleCollisionEffect(
  assetId: ObstacleAssetId,
): ObstacleCollisionPenalty {
  return resolveObstacleCollisionPenalty(assetId);
}

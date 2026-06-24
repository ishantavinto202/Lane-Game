import type { ObstacleAssetId } from '../../types';
import { OBSTACLE_PERSONALITY_CONFIG } from '../../config';

/** Resolved outcome when the player collides with an obstacle type. */
export type ObstacleCollisionEffect =
  | { readonly kind: 'health-damage' }
  | { readonly kind: 'score-penalty'; readonly amount: number };

const OBSTACLE_COLLISION_EFFECTS: Partial<
  Record<ObstacleAssetId, Exclude<ObstacleCollisionEffect, { kind: 'health-damage' }>>
> = {
  OBSTACLE_PUDDLE: {
    kind: 'score-penalty',
    amount: OBSTACLE_PERSONALITY_CONFIG.puddleScorePenalty,
  },
};

/** Maps obstacle type to its collision personality (Phase 5.4). */
export function resolveObstacleCollisionEffect(
  assetId: ObstacleAssetId,
): ObstacleCollisionEffect {
  return OBSTACLE_COLLISION_EFFECTS[assetId] ?? { kind: 'health-damage' };
}

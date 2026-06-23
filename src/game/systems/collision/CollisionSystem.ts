import { PLAYER_CAR_ASSET, OBSTACLE_ASSET_MAP } from '../../assets';
import { COLLISION_CONFIG } from '../../config';
import type {
  CollisionEvent,
  CollisionPolicy,
  CollisionProbe,
  LaneIndex,
} from '../../types';
import { computeWorldBounds, boundsOverlap } from '../../utils/collision-bounds';

const DEFAULT_POLICY: CollisionPolicy = {
  laneTolerancePx: COLLISION_CONFIG.laneTolerancePx,
  minOverlapArea: COLLISION_CONFIG.minOverlapArea,
  useReducedHitboxes: COLLISION_CONFIG.useReducedHitboxes,
  hitboxScale: COLLISION_CONFIG.hitboxScale,
} as const;

/** Lane-based collision detection between player and obstacles. */
export class CollisionSystem {
  readonly id = 'collision-system' as const;

  private policy: CollisionPolicy = DEFAULT_POLICY;

  setPolicy(policy: CollisionPolicy): void {
    this.policy = policy;
  }

  evaluate(
    player: CollisionProbe,
    obstacles: readonly CollisionProbe[],
  ): CollisionEvent | null {
    for (const obstacle of obstacles) {
      if (player.lane !== obstacle.lane) {
        continue;
      }

      if (
        boundsOverlap(
          player.bounds,
          obstacle.bounds,
          this.policy.minOverlapArea,
        )
      ) {
        const overlapWidth = Math.max(
          0,
          Math.min(player.bounds.right, obstacle.bounds.right) -
            Math.max(player.bounds.left, obstacle.bounds.left),
        );
        const overlapHeight = Math.max(
          0,
          Math.min(player.bounds.bottom, obstacle.bounds.bottom) -
            Math.max(player.bounds.top, obstacle.bounds.top),
        );

        return {
          playerId: player.entityId,
          obstacleId: obstacle.entityId,
          lane: player.lane as LaneIndex,
          timestamp: Date.now(),
          overlapArea: overlapWidth * overlapHeight,
        };
      }
    }

    return null;
  }

  reset(): void {
    this.policy = DEFAULT_POLICY;
  }
}

/** Builds a collision probe for the player car. */
export function createPlayerCollisionProbe(
  entityId: string,
  lane: LaneIndex,
  x: number,
  y: number,
): CollisionProbe {
  return {
    entityId,
    lane,
    bounds: computeWorldBounds(x, y, PLAYER_CAR_ASSET, COLLISION_CONFIG.hitboxScale),
  };
}

/** Builds collision probes for active obstacles. */
export function createObstacleCollisionProbes(
  obstacles: readonly {
    readonly id: string;
    readonly lane: LaneIndex;
    readonly x: number;
    readonly y: number;
    readonly assetId: keyof typeof OBSTACLE_ASSET_MAP;
  }[],
): CollisionProbe[] {
  return obstacles.map((obstacle) => {
    const asset = OBSTACLE_ASSET_MAP[obstacle.assetId];
    return {
      entityId: obstacle.id,
      lane: obstacle.lane,
      bounds: computeWorldBounds(obstacle.x, obstacle.y, asset, COLLISION_CONFIG.hitboxScale),
    };
  });
}

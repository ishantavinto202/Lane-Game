import type { EntityId } from './entity.types';
import type { LaneIndex } from './game-state.types';

/** Resolved axis-aligned bounds in world space. */
export interface WorldBounds {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
  readonly centerX: number;
  readonly centerY: number;
}

/** Input to lane-aware collision checks. */
export interface CollisionProbe {
  readonly entityId: EntityId;
  readonly lane: LaneIndex;
  readonly bounds: WorldBounds;
}

/** Result emitted when player intersects an obstacle. */
export interface CollisionEvent {
  readonly playerId: EntityId;
  readonly obstacleId: EntityId;
  readonly lane: LaneIndex;
  readonly timestamp: number;
  readonly overlapArea: number;
}

/** Tunable collision policy consumed by the collision system. */
export interface CollisionPolicy {
  readonly laneTolerancePx: number;
  readonly minOverlapArea: number;
  readonly useReducedHitboxes: boolean;
  readonly hitboxScale: number;
}

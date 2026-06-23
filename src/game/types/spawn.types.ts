import type { ObstacleAssetId } from './asset.types';
import type { LaneIndex } from './game-state.types';
import type { EntityId } from './entity.types';

/** Candidate spawn slot evaluated by the spawn system. */
export interface SpawnSlot {
  readonly lane: LaneIndex | null;
  readonly y: number;
  readonly region: 'road' | 'sidewalk-left' | 'sidewalk-right' | 'grass-left' | 'grass-right';
}

/** Outcome of a spawn attempt. */
export interface SpawnDecision {
  readonly accepted: boolean;
  readonly assetId: ObstacleAssetId | null;
  readonly slot: SpawnSlot | null;
  readonly reason: SpawnRejectionReason | null;
}

export type SpawnRejectionReason =
  | 'phase-not-playing'
  | 'max-concurrent-reached'
  | 'insufficient-vertical-gap'
  | 'insufficient-lane-gap'
  | 'impossible-pattern'
  | 'no-valid-slot'
  | 'cooldown-active';

/** Tracks recent spawns to enforce fairness constraints. */
export interface SpawnHistoryEntry {
  readonly entityId: EntityId;
  readonly assetId: ObstacleAssetId;
  readonly lane: LaneIndex | null;
  readonly spawnedAtY: number;
  readonly timestamp: number;
}

/** Spawn system configuration snapshot passed into spawn planners. */
export interface SpawnContext {
  readonly elapsedMs: number;
  readonly speedPxPerSec: number;
  readonly obstacleCount: number;
  readonly decorationCount: number;
  readonly history: readonly SpawnHistoryEntry[];
  readonly nextSpawnY: number;
}

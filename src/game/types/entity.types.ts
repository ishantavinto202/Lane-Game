import type { AssetId, ObstacleAssetId } from './asset.types';
import type { LaneIndex } from './game-state.types';

/** Unique runtime identifier for any spawned entity. */
export type EntityId = string;

/** Base entity fields shared by simulation systems. */
export interface BaseEntity {
  readonly id: EntityId;
  readonly assetId: AssetId;
  readonly lane: LaneIndex | null;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly active: boolean;
}

export interface PlayerEntity extends BaseEntity {
  readonly assetId: 'PLAYER_CAR';
  readonly lane: LaneIndex;
  readonly targetLane: LaneIndex;
  readonly isChangingLane: boolean;
}

export interface ObstacleEntity extends BaseEntity {
  readonly assetId: ObstacleAssetId;
  readonly lane: LaneIndex;
  readonly speed: number;
}

export interface CoinEntity extends BaseEntity {
  readonly assetId: 'COIN';
  readonly lane: LaneIndex;
  readonly speed: number;
}

export interface ShieldEntity extends BaseEntity {
  readonly assetId: 'SHIELD';
  readonly lane: LaneIndex;
  readonly speed: number;
}

export interface SpeedBoostEntity extends BaseEntity {
  readonly assetId: 'SPEED_BOOST';
  readonly lane: LaneIndex;
  readonly speed: number;
}

/** Pool-friendly mutable refs used by the engine (not React state). */
export interface EntityRefs {
  readonly player: PlayerEntity;
  readonly obstacles: Map<EntityId, ObstacleEntity>;
}

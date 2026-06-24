/** Visual and logical render ordering. Lower values draw behind higher values. */
export enum RenderLayer {
  Grass = 0,
  Sidewalk = 1,
  Decoration = 2,
  Road = 3,
  Obstacle = 4,
  Player = 5,
  Controls = 6,
  Hud = 7,
  Overlay = 8,
}

/** Anchor point relative to entity bounds. All positions use center anchor unless noted. */
export type AnchorPoint = 'center' | 'top-left' | 'bottom-center';

/** Axis-aligned rectangle in game space (top-left origin, y increases downward). */
export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Collision or hit box defined relative to an entity anchor. */
export interface CollisionBox {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly width: number;
  readonly height: number;
}

/** Placeholder visual descriptor until real artwork replaces config entries. */
export interface PlaceholderVisual {
  readonly kind: 'solid' | 'pattern' | 'shape';
  readonly primaryColor: string;
  readonly secondaryColor?: string;
  readonly borderColor?: string;
  readonly borderWidth?: number;
  readonly cornerRadius?: number;
  readonly label?: string;
}

/** Regions where an entity may appear. */
export type SpawnRegion =
  | 'lane-left'
  | 'lane-center'
  | 'lane-right'
  | 'any-lane'
  | 'sidewalk-left'
  | 'sidewalk-right'
  | 'grass-left'
  | 'grass-right';

/** Shared asset metadata consumed by render and simulation systems. */
export interface AssetDefinition {
  readonly id: AssetId;
  readonly width: number;
  readonly height: number;
  readonly anchor: AnchorPoint;
  readonly layer: RenderLayer;
  readonly collisionBox: CollisionBox | null;
  readonly visual: PlaceholderVisual;
  readonly collidable: boolean;
}

export type AssetId =
  | 'PLAYER_CAR'
  | 'COIN'
  | 'SHIELD'
  | 'OBSTACLE_TIRE'
  | 'OBSTACLE_CONE'
  | 'OBSTACLE_CRATE'
  | 'OBSTACLE_BARRIER'
  | 'ROAD_SURFACE'
  | 'ROAD_LANE_DIVIDER'
  | 'SIDEWALK_TILE'
  | 'GRASS_TILE';

export type ObstacleAssetId = Extract<
  AssetId,
  'OBSTACLE_TIRE' | 'OBSTACLE_CONE' | 'OBSTACLE_CRATE' | 'OBSTACLE_BARRIER'
>;

export type RoadAssetId = Extract<
  AssetId,
  'ROAD_SURFACE' | 'ROAD_LANE_DIVIDER' | 'SIDEWALK_TILE' | 'GRASS_TILE'
>;

/** Spawn weighting and constraints attached to spawnable assets. */
export interface SpawnRule {
  readonly regions: readonly SpawnRegion[];
  readonly weight: number;
  readonly minSpawnDistance: number;
  readonly maxConcurrent: number;
  readonly minLaneGap: number;
  readonly verticalGapMultiplier: number;
}

export interface ObstacleAssetDefinition extends AssetDefinition {
  readonly id: ObstacleAssetId;
  readonly spawnRule?: SpawnRule;
}

export interface PlayerAssetDefinition extends AssetDefinition {
  readonly id: 'PLAYER_CAR';
}

export interface RoadAssetDefinition extends AssetDefinition {
  readonly id: RoadAssetId;
  readonly tileSize?: number;
  readonly pattern?: readonly string[];
}

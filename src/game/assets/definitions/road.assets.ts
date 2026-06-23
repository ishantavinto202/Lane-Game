import { ROAD_COLORS, ROAD_TILE } from '../../config';
import { RenderLayer } from '../../types';
import type { RoadAssetDefinition } from '../../types';

/** Main drivable road surface strip. */
export const ROAD_SURFACE_ASSET: RoadAssetDefinition = {
  id: 'ROAD_SURFACE',
  width: 300,
  height: 120,
  anchor: 'top-left',
  layer: RenderLayer.Road,
  collidable: false,
  collisionBox: null,
  visual: {
    kind: 'solid',
    primaryColor: ROAD_COLORS.surface,
  },
} as const;

/** Lane divider dash segment. */
export const ROAD_LANE_DIVIDER_ASSET: RoadAssetDefinition = {
  id: 'ROAD_LANE_DIVIDER',
  width: 4,
  height: 32,
  anchor: 'top-left',
  layer: RenderLayer.Road,
  collidable: false,
  collisionBox: null,
  visual: {
    kind: 'solid',
    primaryColor: ROAD_COLORS.laneDivider,
  },
} as const;

/** Repeating sidewalk tile — alternates light/dark via pattern index. */
export const SIDEWALK_TILE_ASSET: RoadAssetDefinition = {
  id: 'SIDEWALK_TILE',
  width: ROAD_TILE.sidewalkTileSize,
  height: ROAD_TILE.sidewalkTileSize,
  anchor: 'top-left',
  layer: RenderLayer.Sidewalk,
  collidable: false,
  collisionBox: null,
  tileSize: ROAD_TILE.sidewalkTileSize,
  pattern: ROAD_TILE.sidewalkColorPattern,
  visual: {
    kind: 'pattern',
    primaryColor: ROAD_COLORS.sidewalkLight,
    secondaryColor: ROAD_COLORS.sidewalkDark,
  },
} as const;

/** Repeating grass tile — color chosen randomly from palette at spawn. */
export const GRASS_TILE_ASSET: RoadAssetDefinition = {
  id: 'GRASS_TILE',
  width: ROAD_TILE.grassTileSize,
  height: ROAD_TILE.grassTileSize,
  anchor: 'top-left',
  layer: RenderLayer.Grass,
  collidable: false,
  collisionBox: null,
  tileSize: ROAD_TILE.grassTileSize,
  pattern: ROAD_TILE.grassColorChoices,
  visual: {
    kind: 'pattern',
    primaryColor: ROAD_COLORS.grassA,
    secondaryColor: ROAD_COLORS.grassB,
  },
} as const;

export const ROAD_ASSETS = [
  ROAD_SURFACE_ASSET,
  ROAD_LANE_DIVIDER_ASSET,
  SIDEWALK_TILE_ASSET,
  GRASS_TILE_ASSET,
] as const;

export const ROAD_ASSET_MAP = {
  ROAD_SURFACE: ROAD_SURFACE_ASSET,
  ROAD_LANE_DIVIDER: ROAD_LANE_DIVIDER_ASSET,
  SIDEWALK_TILE: SIDEWALK_TILE_ASSET,
  GRASS_TILE: GRASS_TILE_ASSET,
} as const;

import type { ImageSourcePropType } from 'react-native';

import { ROAD_COLORS, ROAD_IMAGE, ROAD_TILE, GRASS_IMAGE } from '../../config';
import { RenderLayer } from '../../types';
import type { RoadAssetDefinition } from '../../types';

/** Start-of-run road strip — 225×869 native, scaled to 300×1159 in-game. */
export const ROAD_START_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/voxel/R_1.png');

/** Loop road strip variant A — randomized after the start segment. */
export const ROAD_LOOP_A_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/voxel/R_2.png');

/** Loop road strip variant B — randomized after the start segment. */
export const ROAD_LOOP_B_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/voxel/R_3.png');

/** Left sidewalk strip — 40×1159, aligned to road segment height. */
export const SIDEWALK_LEFT_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/voxel/Side_L.png');

/** Right sidewalk strip — 40×1159, aligned to road segment height. */
export const SIDEWALK_RIGHT_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/voxel/Side_R.png');

/** Grass strip — native 28×843, scaled to 56×1686 on both sides. */
export const GRASS_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/voxel/Grass.png');

const ROAD_LOOP_SOURCES = [ROAD_LOOP_A_IMAGE_SOURCE, ROAD_LOOP_B_IMAGE_SOURCE] as const;

/** Deterministic pseudo-random loop pick — stable per segment index across re-renders. */
export function pickLoopRoadImageSource(loopIndex: number): ImageSourcePropType {
  const mixed = (loopIndex * 1103515245 + 12345) >>> 0;
  return ROAD_LOOP_SOURCES[mixed % ROAD_LOOP_SOURCES.length] ?? ROAD_LOOP_A_IMAGE_SOURCE;
}

/** Main drivable road surface strip. */
export const ROAD_SURFACE_ASSET: RoadAssetDefinition = {
  id: 'ROAD_SURFACE',
  width: ROAD_IMAGE.displayWidth,
  height: ROAD_IMAGE.segmentHeight,
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
  height: ROAD_IMAGE.segmentHeight,
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
  width: GRASS_IMAGE.displayWidth,
  height: GRASS_IMAGE.segmentHeight,
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

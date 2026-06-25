import type { ImageSourcePropType } from 'react-native';

import { RenderLayer } from '../../types';
import type { ObstacleAssetDefinition } from '../../types';

export interface ObstacleCrateSkinDefinition {
  readonly source: ImageSourcePropType;
  readonly sourceWidth: number;
  readonly sourceHeight: number;
  readonly spriteWidth: number;
  readonly spriteHeight: number;
  /** Body-left shadow padding in source pixels — crate body begins at this X. */
  readonly sourceBodyOffsetX: number;
  readonly sourceBodyOffsetY: number;
  readonly sourceBodyWidth: number;
  readonly sourceBodyHeight: number;
  readonly visualOffsetX: number;
  readonly visualOffsetY: number;
  /** Presentation-only multiplier — scales sprite from body center; gameplay footprint unchanged. */
  readonly visualScale: number;
}

export const OBSTACLE_CONE_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/voxel/Cone.png');

/** Cone presentation skin — baked shadow extends left; gameplay footprint stays 48×48. */
export const OBSTACLE_CONE_SKIN: ObstacleCrateSkinDefinition = {
  source: OBSTACLE_CONE_IMAGE_SOURCE,
  sourceWidth: 138,
  sourceHeight: 118,
  spriteWidth: 138,
  spriteHeight: 118,
  sourceBodyOffsetX: 53,
  sourceBodyOffsetY: 0,
  sourceBodyWidth: 85,
  sourceBodyHeight: 92,
  visualOffsetX: -(53 + 85 / 2),
  visualOffsetY: -(0 + 92 / 2),
  visualScale: 0.64,
} as const;

export const OBSTACLE_CRATE_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/voxel/Crate.png');

/** Crate presentation skin — baked shadow extends left; gameplay footprint stays 96×96. */
export const OBSTACLE_CRATE_SKIN: ObstacleCrateSkinDefinition = {
  source: OBSTACLE_CRATE_IMAGE_SOURCE,
  sourceWidth: 148,
  sourceHeight: 112,
  spriteWidth: 148,
  spriteHeight: 112,
  sourceBodyOffsetX: 56,
  sourceBodyOffsetY: 0,
  sourceBodyWidth: 92,
  sourceBodyHeight: 100,
  visualOffsetX: -(56 + 92 / 2),
  visualOffsetY: -(0 + 100 / 2),
  visualScale: 0.72,
} as const;

export const OBSTACLE_BARRIER_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/voxel/Barrier.png');

/** Barrier presentation skin — baked shadow extends outside body; gameplay footprint stays 96×80. */
export const OBSTACLE_BARRIER_SKIN: ObstacleCrateSkinDefinition = {
  source: OBSTACLE_BARRIER_IMAGE_SOURCE,
  sourceWidth: 153,
  sourceHeight: 158,
  spriteWidth: 153,
  spriteHeight: 158,
  sourceBodyOffsetX: 13,
  sourceBodyOffsetY: 0,
  sourceBodyWidth: 141,
  sourceBodyHeight: 135,
  visualOffsetX: -(13 + 141 / 2),
  visualOffsetY: -(0 + 135 / 2),
  visualScale: 0.54,
} as const;

export const OBSTACLE_TIRE_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/voxel/Tyre.png');

/** Tire presentation skin — baked shadow extends left; gameplay footprint stays 64×64. */
export const OBSTACLE_TIRE_SKIN: ObstacleCrateSkinDefinition = {
  source: OBSTACLE_TIRE_IMAGE_SOURCE,
  sourceWidth: 144,
  sourceHeight: 95,
  spriteWidth: 144,
  spriteHeight: 95,
  sourceBodyOffsetX: 20,
  sourceBodyOffsetY: 0,
  sourceBodyWidth: 124,
  sourceBodyHeight: 95,
  visualOffsetX: -(20 + 124 / 2),
  visualOffsetY: -(0 + 95 / 2),
  visualScale: 0.82,
} as const;

export const OBSTACLE_PUDDLE_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/voxel/Puddle.png');

/** Puddle presentation skin — wider flat art; gameplay footprint stays 72×72. */
export const OBSTACLE_PUDDLE_SKIN: ObstacleCrateSkinDefinition = {
  source: OBSTACLE_PUDDLE_IMAGE_SOURCE,
  sourceWidth: 138,
  sourceHeight: 67,
  spriteWidth: 138,
  spriteHeight: 67,
  sourceBodyOffsetX: 33,
  sourceBodyOffsetY: 0,
  sourceBodyWidth: 72,
  sourceBodyHeight: 67,
  visualOffsetX: -(33 + 72 / 2),
  visualOffsetY: -(0 + 67 / 2),
  visualScale: 0.595,
} as const;

const BASE_OBSTACLE_SPAWN = {
  regions: ['any-lane'] as const,
  minSpawnDistance: 220,
  maxConcurrent: 8,
  minLaneGap: 1,
  verticalGapMultiplier: 1,
} as const;

/** Tire obstacle — DEBUG: bright cyan for visibility test (revert after confirmation). */
export const OBSTACLE_TIRE_ASSET: ObstacleAssetDefinition = {
  id: 'OBSTACLE_TIRE',
  width: 64,
  height: 64,
  anchor: 'center',
  layer: RenderLayer.Obstacle,
  collidable: true,
  collisionBox: {
    offsetX: -24,
    offsetY: -24,
    width: 48,
    height: 48,
  },
  visual: {
    kind: 'shape',
    primaryColor: '#00FFFF',
    secondaryColor: '#000000',
    borderColor: '#000000',
    borderWidth: 4,
    cornerRadius: 32,
    label: 'TIRE',
  },
  spawnRule: {
    ...BASE_OBSTACLE_SPAWN,
    weight: 30,
    minSpawnDistance: 200,
    regions: ['any-lane'],
  },
} as const;

/** Traffic cone — 48x48, narrow lane hazard. */
export const OBSTACLE_CONE_ASSET: ObstacleAssetDefinition = {
  id: 'OBSTACLE_CONE',
  width: 48,
  height: 48,
  anchor: 'center',
  layer: RenderLayer.Obstacle,
  collidable: true,
  collisionBox: {
    offsetX: -16,
    offsetY: -18,
    width: 32,
    height: 36,
  },
  visual: {
    kind: 'shape',
    primaryColor: '#FF6B00',
    secondaryColor: '#FFFFFF',
    borderColor: '#CC5500',
    borderWidth: 2,
    cornerRadius: 4,
    label: 'CONE',
  },
  spawnRule: {
    ...BASE_OBSTACLE_SPAWN,
    weight: 35,
    minSpawnDistance: 200,
  },
} as const;

/** Crate — 96x96, wide obstacle requiring lane commitment. */
export const OBSTACLE_CRATE_ASSET: ObstacleAssetDefinition = {
  id: 'OBSTACLE_CRATE',
  width: 96,
  height: 96,
  anchor: 'center',
  layer: RenderLayer.Obstacle,
  collidable: true,
  collisionBox: {
    offsetX: -38,
    offsetY: -38,
    width: 76,
    height: 76,
  },
  visual: {
    kind: 'shape',
    primaryColor: '#8B5E3C',
    secondaryColor: '#6F4E37',
    borderColor: '#4E342E',
    borderWidth: 2,
    cornerRadius: 6,
    label: 'CRATE',
  },
  spawnRule: {
    ...BASE_OBSTACLE_SPAWN,
    weight: 20,
    minSpawnDistance: 200,
    maxConcurrent: 4,
  },
} as const;

/** Puddle — 72x72 circular lane hazard, same spawn rules as Tire. */
export const OBSTACLE_PUDDLE_ASSET: ObstacleAssetDefinition = {
  id: 'OBSTACLE_PUDDLE',
  width: 72,
  height: 72,
  anchor: 'center',
  layer: RenderLayer.Obstacle,
  collidable: true,
  collisionBox: {
    offsetX: -27,
    offsetY: -27,
    width: 54,
    height: 54,
  },
  visual: {
    kind: 'shape',
    primaryColor: '#FF3B30',
    secondaryColor: '#CC2E26',
    borderColor: '#B32822',
    borderWidth: 2,
    cornerRadius: 36,
    label: 'PUDDLE',
  },
  spawnRule: {
    ...BASE_OBSTACLE_SPAWN,
    weight: 30,
    minSpawnDistance: 200,
    regions: ['any-lane'],
  },
} as const;

/** Barrier — temporary high-contrast styling for runtime visibility confirmation. */
export const OBSTACLE_BARRIER_ASSET: ObstacleAssetDefinition = {
  id: 'OBSTACLE_BARRIER',
  width: 96,
  height: 80,
  anchor: 'center',
  layer: RenderLayer.Obstacle,
  collidable: true,
  collisionBox: {
    offsetX: -38,
    offsetY: -28,
    width: 76,
    height: 56,
  },
  visual: {
    kind: 'shape',
    primaryColor: '#FF00FF',
    secondaryColor: '#000000',
    borderColor: '#000000',
    borderWidth: 4,
    cornerRadius: 4,
    label: 'BARRIER',
  },
  spawnRule: {
    ...BASE_OBSTACLE_SPAWN,
    weight: 20,
    minSpawnDistance: 200,
    maxConcurrent: 4,
    minLaneGap: 1,
  },
} as const;

export const OBSTACLE_ASSETS = [
  OBSTACLE_TIRE_ASSET,
  OBSTACLE_CONE_ASSET,
  OBSTACLE_CRATE_ASSET,
  OBSTACLE_BARRIER_ASSET,
  OBSTACLE_PUDDLE_ASSET,
] as const;

export const OBSTACLE_ASSET_MAP = {
  OBSTACLE_TIRE: OBSTACLE_TIRE_ASSET,
  OBSTACLE_CONE: OBSTACLE_CONE_ASSET,
  OBSTACLE_CRATE: OBSTACLE_CRATE_ASSET,
  OBSTACLE_BARRIER: OBSTACLE_BARRIER_ASSET,
  OBSTACLE_PUDDLE: OBSTACLE_PUDDLE_ASSET,
} as const;

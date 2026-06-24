import { RenderLayer } from '../../types';
import type { ObstacleAssetDefinition } from '../../types';

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
] as const;

export const OBSTACLE_ASSET_MAP = {
  OBSTACLE_TIRE: OBSTACLE_TIRE_ASSET,
  OBSTACLE_CONE: OBSTACLE_CONE_ASSET,
  OBSTACLE_CRATE: OBSTACLE_CRATE_ASSET,
  OBSTACLE_BARRIER: OBSTACLE_BARRIER_ASSET,
} as const;

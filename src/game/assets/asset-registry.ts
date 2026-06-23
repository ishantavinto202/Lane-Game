import type { AssetDefinition, AssetId } from '../types';

import {
  COIN_ASSET,
  OBSTACLE_ASSETS,
  OBSTACLE_ASSET_MAP,
  PLAYER_CAR_ASSET,
  ROAD_ASSETS,
  ROAD_ASSET_MAP,
} from './definitions';

/** Canonical lookup table for Phase 1 assets. */
export const ASSET_REGISTRY: Record<
  AssetId,
  AssetDefinition
> = {
  PLAYER_CAR: PLAYER_CAR_ASSET,
  COIN: COIN_ASSET,
  OBSTACLE_TIRE: OBSTACLE_ASSET_MAP.OBSTACLE_TIRE,
  OBSTACLE_CONE: OBSTACLE_ASSET_MAP.OBSTACLE_CONE,
  OBSTACLE_CRATE: OBSTACLE_ASSET_MAP.OBSTACLE_CRATE,
  OBSTACLE_BARRIER: OBSTACLE_ASSET_MAP.OBSTACLE_BARRIER,
  ROAD_SURFACE: ROAD_ASSET_MAP.ROAD_SURFACE,
  ROAD_LANE_DIVIDER: ROAD_ASSET_MAP.ROAD_LANE_DIVIDER,
  SIDEWALK_TILE: ROAD_ASSET_MAP.SIDEWALK_TILE,
  GRASS_TILE: ROAD_ASSET_MAP.GRASS_TILE,
} as const;

export const ALL_ASSETS: readonly AssetDefinition[] = [
  PLAYER_CAR_ASSET,
  COIN_ASSET,
  ...OBSTACLE_ASSETS,
  ...ROAD_ASSETS,
] as const;

/** Returns asset metadata by id with compile-time key safety. */
export function getAssetDefinition<T extends AssetId>(id: T): (typeof ASSET_REGISTRY)[T] {
  return ASSET_REGISTRY[id];
}

/** Lists obstacle definitions (not rendered in Phase 1). */
export function getObstacleDefinitions() {
  return OBSTACLE_ASSETS;
}

/** Lists road layer tile definitions for infinite scroll renderers. */
export function getRoadDefinitions() {
  return ROAD_ASSETS;
}

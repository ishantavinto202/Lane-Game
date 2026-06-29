import { Image, type ImageSourcePropType } from 'react-native';

import { COIN_ATLAS_TEXTURE } from './definitions/coin-atlas.assets';
import { SHIELD_ATLAS_TEXTURE } from './definitions/shield-atlas.assets';
import { SPEED_BOOST_ATLAS_TEXTURE } from './definitions/speed-boost-atlas.assets';
import {
  GRASS_IMAGE_SOURCE,
  HEART_EMPTY_IMAGE_SOURCE,
  HEART_FULL_IMAGE_SOURCE,
  OBSTACLE_BARRIER_IMAGE_SOURCE,
  OBSTACLE_CONE_IMAGE_SOURCE,
  OBSTACLE_CRATE_IMAGE_SOURCE,
  OBSTACLE_PUDDLE_IMAGE_SOURCE,
  OBSTACLE_TIRE_IMAGE_SOURCE,
  PLAYER_CAR_IMAGE_SOURCE,
  ROAD_LOOP_A_IMAGE_SOURCE,
  ROAD_LOOP_B_IMAGE_SOURCE,
  ROAD_START_IMAGE_SOURCE,
  SHIELD_BUBBLE_IMAGE_SOURCE,
  SHIELD_IMAGE_SOURCE,
  SIDEWALK_LEFT_IMAGE_SOURCE,
  SIDEWALK_RIGHT_IMAGE_SOURCE,
  SPEED_BOOST_IMAGE_SOURCE,
  TREE_IMAGE_SOURCE,
} from './definitions';

/** Every Lane game image source — preloaded on Home before navigating to `/lane-game`. */
const LANE_GAME_IMAGE_SOURCES: readonly ImageSourcePropType[] = [
  PLAYER_CAR_IMAGE_SOURCE,
  COIN_ATLAS_TEXTURE,
  SHIELD_ATLAS_TEXTURE,
  SHIELD_BUBBLE_IMAGE_SOURCE,
  SHIELD_IMAGE_SOURCE,
  SPEED_BOOST_ATLAS_TEXTURE,
  SPEED_BOOST_IMAGE_SOURCE,
  OBSTACLE_TIRE_IMAGE_SOURCE,
  OBSTACLE_CONE_IMAGE_SOURCE,
  OBSTACLE_CRATE_IMAGE_SOURCE,
  OBSTACLE_BARRIER_IMAGE_SOURCE,
  OBSTACLE_PUDDLE_IMAGE_SOURCE,
  ROAD_START_IMAGE_SOURCE,
  ROAD_LOOP_A_IMAGE_SOURCE,
  ROAD_LOOP_B_IMAGE_SOURCE,
  GRASS_IMAGE_SOURCE,
  SIDEWALK_LEFT_IMAGE_SOURCE,
  SIDEWALK_RIGHT_IMAGE_SOURCE,
  TREE_IMAGE_SOURCE,
  HEART_FULL_IMAGE_SOURCE,
  HEART_EMPTY_IMAGE_SOURCE,
] as const;

function prefetchImageSource(source: ImageSourcePropType): Promise<void> {
  const resolved = Image.resolveAssetSource(source);
  if (typeof resolved.uri !== 'string') {
    return Promise.resolve();
  }

  return Image.prefetch(resolved.uri).then(() => undefined);
}

/** Resolves when all Lane game textures are cached and ready for first paint. */
export function preloadLaneGameImages(): Promise<void> {
  return Promise.all(LANE_GAME_IMAGE_SOURCES.map(prefetchImageSource)).then(() => undefined);
}

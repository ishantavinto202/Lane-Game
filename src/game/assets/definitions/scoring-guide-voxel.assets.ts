import type { ImageSourcePropType } from 'react-native';

import type { ObstacleAssetId } from '../../types';

/** Scoring Guide modal only — do not use for in-game sprites. */
export const SCORING_GUIDE_COIN_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/Voxel asset guide/Coin.png');

/** Scoring Guide modal only — do not use for in-game sprites. */
export const SCORING_GUIDE_SPEED_BOOST_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/Voxel asset guide/Blue_Thunder_Asset.png');

const SCORING_GUIDE_OBSTACLE_IMAGE_SOURCES: Record<ObstacleAssetId, ImageSourcePropType> = {
  OBSTACLE_CONE: require('../../../../assets/Voxel asset guide/Cone_1.png'),
  OBSTACLE_TIRE: require('../../../../assets/Voxel asset guide/Tyre_3.png'),
  OBSTACLE_CRATE: require('../../../../assets/Voxel asset guide/Crate_5.png'),
  OBSTACLE_BARRIER: require('../../../../assets/Voxel asset guide/Barrier_2.png'),
  OBSTACLE_PUDDLE: require('../../../../assets/Voxel asset guide/Puddle_4.png'),
};

export function getScoringGuideObstacleImageSource(id: ObstacleAssetId): ImageSourcePropType {
  return SCORING_GUIDE_OBSTACLE_IMAGE_SOURCES[id];
}

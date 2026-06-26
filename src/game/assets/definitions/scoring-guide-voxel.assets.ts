import type { ImageSourcePropType } from 'react-native';

import type { ObstacleAssetId } from '../../types';

/** Opaque/visual centroid for a scoring-guide PNG in source pixel space. */
export interface ScoringGuideVisualBounds {
  readonly sourceWidth: number;
  readonly sourceHeight: number;
  readonly visualCenterX: number;
  readonly visualCenterY: number;
}

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

/**
 * Alpha-weighted visual centroids for guide obstacle PNGs.
 * Derived from opaque pixel analysis of assets/Voxel asset guide/*.png.
 */
const SCORING_GUIDE_OBSTACLE_VISUAL_BOUNDS: Record<ObstacleAssetId, ScoringGuideVisualBounds> = {
  OBSTACLE_CONE: {
    sourceWidth: 85,
    sourceHeight: 92,
    visualCenterX: 41.97,
    visualCenterY: 51.92,
  },
  OBSTACLE_TIRE: {
    sourceWidth: 124,
    sourceHeight: 95,
    visualCenterX: 61.89,
    visualCenterY: 40.74,
  },
  OBSTACLE_CRATE: {
    sourceWidth: 92,
    sourceHeight: 100,
    visualCenterX: 45.26,
    visualCenterY: 49.74,
  },
  OBSTACLE_BARRIER: {
    sourceWidth: 132,
    sourceHeight: 135,
    visualCenterX: 67.52,
    visualCenterY: 66.1,
  },
  OBSTACLE_PUDDLE: {
    sourceWidth: 138,
    sourceHeight: 67,
    visualCenterX: 72.3,
    visualCenterY: 33.73,
  },
};

export function getScoringGuideObstacleImageSource(id: ObstacleAssetId): ImageSourcePropType {
  return SCORING_GUIDE_OBSTACLE_IMAGE_SOURCES[id];
}

export function getScoringGuideObstacleVisualBounds(id: ObstacleAssetId): ScoringGuideVisualBounds {
  return SCORING_GUIDE_OBSTACLE_VISUAL_BOUNDS[id];
}

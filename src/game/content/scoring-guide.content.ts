import type { ImageSourcePropType } from 'react-native';

import type { ScoringGuideVisualBounds } from '../assets/definitions/scoring-guide-voxel.assets';

import {
  getScoringGuideCollectibleImageSource,
  getScoringGuideCollectibleVisualBounds,
  getScoringGuideObstacleImageSource,
  getScoringGuideObstacleVisualBounds,
  type ScoringGuideCollectibleId,
} from '../assets/definitions/scoring-guide-voxel.assets';
import { COIN_CONFIG, OBSTACLE_PENALTY_CONFIG, SHIELD_CONFIG, SPEED_BOOST_CONFIG } from '../config';
import type { ObstacleAssetId } from '../types';

export interface ScoringGuideCollectibleEntry {
  readonly id: ScoringGuideCollectibleId;
  readonly name: string;
  readonly scoreReward: number;
  readonly guideDescription: string;
  readonly imageSource: ImageSourcePropType;
  readonly visualBounds: ScoringGuideVisualBounds;
}

export interface ScoringGuideObstacleEntry {
  readonly id: ObstacleAssetId;
  readonly name: string;
  readonly guideDescription: string;
  readonly imageSource: ImageSourcePropType;
  readonly visualBounds: ScoringGuideVisualBounds;
  readonly scorePenalty: number;
  readonly healthLoss: number;
}

const SHIELD_DURATION_SECONDS = SHIELD_CONFIG.durationMs / 1000;
const SPEED_BOOST_DURATION_SECONDS = SPEED_BOOST_CONFIG.durationMs / 1000;

const OBSTACLE_GUIDE_ORDER: readonly ObstacleAssetId[] = [
  'OBSTACLE_CONE',
  'OBSTACLE_TIRE',
  'OBSTACLE_CRATE',
  'OBSTACLE_BARRIER',
  'OBSTACLE_PUDDLE',
] as const;

const OBSTACLE_GUIDE_NAMES: Record<ObstacleAssetId, string> = {
  OBSTACLE_CONE: 'Traffic Cone',
  OBSTACLE_TIRE: 'Tyre',
  OBSTACLE_CRATE: 'Crate',
  OBSTACLE_BARRIER: 'Barrier',
  OBSTACLE_PUDDLE: 'Puddle',
};

const OBSTACLE_GUIDE_DESCRIPTIONS: Record<ObstacleAssetId, string> = {
  OBSTACLE_CONE: 'Minor obstacle',
  OBSTACLE_TIRE: 'Rolling hazard',
  OBSTACLE_CRATE: 'Heavy obstacle',
  OBSTACLE_BARRIER: 'Major roadblock',
  OBSTACLE_PUDDLE: 'Slippery hazard',
};

/** Collectible rewards — values sourced from gameplay config. */
export const SCORING_GUIDE_COLLECTIBLES: readonly ScoringGuideCollectibleEntry[] = [
  {
    id: 'coin',
    name: 'Coin',
    scoreReward: COIN_CONFIG.scoreReward,
    guideDescription: 'Collect for points',
    imageSource: getScoringGuideCollectibleImageSource('coin'),
    visualBounds: getScoringGuideCollectibleVisualBounds('coin'),
  },
  {
    id: 'shield',
    name: 'Shield',
    scoreReward: 0,
    guideDescription: `Absorbs one hit · lasts ${SHIELD_DURATION_SECONDS}s`,
    imageSource: getScoringGuideCollectibleImageSource('shield'),
    visualBounds: getScoringGuideCollectibleVisualBounds('shield'),
  },
  {
    id: 'speedBoost',
    name: 'Speed Boost',
    scoreReward: 0,
    guideDescription: `2× speed · lasts ${SPEED_BOOST_DURATION_SECONDS}s`,
    imageSource: getScoringGuideCollectibleImageSource('speedBoost'),
    visualBounds: getScoringGuideCollectibleVisualBounds('speedBoost'),
  },
] as const;

/** Obstacle penalties — values sourced from OBSTACLE_PENALTY_CONFIG. */
export const SCORING_GUIDE_OBSTACLES: readonly ScoringGuideObstacleEntry[] = OBSTACLE_GUIDE_ORDER.map(
  (id) => ({
    id,
    name: OBSTACLE_GUIDE_NAMES[id],
    guideDescription: OBSTACLE_GUIDE_DESCRIPTIONS[id],
    imageSource: getScoringGuideObstacleImageSource(id),
    visualBounds: getScoringGuideObstacleVisualBounds(id),
    scorePenalty: OBSTACLE_PENALTY_CONFIG[id].scorePenalty,
    healthLoss: OBSTACLE_PENALTY_CONFIG[id].healthLoss,
  }),
);

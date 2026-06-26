import type { ImageSourcePropType } from 'react-native';

import type { ScoringGuideVisualBounds } from '../assets/definitions/scoring-guide-voxel.assets';

import {
  getScoringGuideObstacleImageSource,
  getScoringGuideObstacleVisualBounds,
} from '../assets/definitions/scoring-guide-voxel.assets';
import { COIN_CONFIG, OBSTACLE_PENALTY_CONFIG } from '../config';
import type { ObstacleAssetId } from '../types';

export type ScoringGuideCollectibleKind = 'coin' | 'speed-boost';

export interface ScoringGuideCollectibleEntry {
  readonly id: string;
  readonly name: string;
  readonly kind: ScoringGuideCollectibleKind;
  readonly scoreReward: number;
  readonly guideDescription: string;
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
    kind: 'coin',
    scoreReward: COIN_CONFIG.scoreReward,
    guideDescription: 'Collect for points',
  },
  {
    id: 'speed-boost',
    name: 'Speed Boost',
    kind: 'speed-boost',
    scoreReward: 0,
    guideDescription: 'Temporary burst of speed',
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

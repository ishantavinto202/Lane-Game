import type { ImageSourcePropType } from 'react-native';

import { getScoringGuideObstacleImageSource } from '../assets/definitions/scoring-guide-voxel.assets';
import { COIN_CONFIG, OBSTACLE_PENALTY_CONFIG } from '../config';
import type { ObstacleAssetId } from '../types';

export type ScoringGuideCollectibleKind = 'coin' | 'speed-boost';

export interface ScoringGuideCollectibleEntry {
  readonly id: string;
  readonly name: string;
  readonly kind: ScoringGuideCollectibleKind;
  readonly scoreReward: number;
  readonly description?: string;
}

export interface ScoringGuideObstacleEntry {
  readonly id: ObstacleAssetId;
  readonly name: string;
  readonly imageSource: ImageSourcePropType;
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
  OBSTACLE_CONE: 'Cone',
  OBSTACLE_TIRE: 'Tyre',
  OBSTACLE_CRATE: 'Crate',
  OBSTACLE_BARRIER: 'Barrier',
  OBSTACLE_PUDDLE: 'Puddle',
};

/** Collectible rewards — values sourced from gameplay config. */
export const SCORING_GUIDE_COLLECTIBLES: readonly ScoringGuideCollectibleEntry[] = [
  {
    id: 'coin',
    name: 'Coin',
    kind: 'coin',
    scoreReward: COIN_CONFIG.scoreReward,
  },
  {
    id: 'speed-boost',
    name: 'Speed Boost',
    kind: 'speed-boost',
    scoreReward: 0,
    description: 'Temporary speed boost.',
  },
] as const;

/** Obstacle penalties — values sourced from OBSTACLE_PENALTY_CONFIG. */
export const SCORING_GUIDE_OBSTACLES: readonly ScoringGuideObstacleEntry[] = OBSTACLE_GUIDE_ORDER.map(
  (id) => ({
    id,
    name: OBSTACLE_GUIDE_NAMES[id],
    imageSource: getScoringGuideObstacleImageSource(id),
    scorePenalty: OBSTACLE_PENALTY_CONFIG[id].scorePenalty,
    healthLoss: OBSTACLE_PENALTY_CONFIG[id].healthLoss,
  }),
);

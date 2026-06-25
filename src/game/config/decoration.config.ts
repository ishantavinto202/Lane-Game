import { POOL_CONSTANTS } from '../constants';
import { ROAD_SCROLL } from './road.config';

/** Cosmetic roadside tree tuning — no gameplay impact. */
export const DECORATION_CONFIG = {
  spawnIntervalMs: 400,
  initialDelayMs: 250,
  minVerticalGapPx: 175,
  maxActiveDecorations: POOL_CONSTANTS.MAX_DECORATIONS,
  baseDisplayWidth: 234,
  baseDisplayHeight: 218,
  minScaleVariation: 0.9,
  maxScaleVariation: 1.1,
  /** Horizontal jitter applied to trunk center within the grass strip. */
  trunkJitterPx: 8,
  /** Minimum inset from grass edge for trunk center placement. */
  trunkInsetPx: 8,
  /** Shifts left-side trees toward the road after trunk placement (+X). */
  leftTreeRoadwardOffsetPx: 16,
  spawnYJitterPx: 40,
  scrollSpeedMultiplier: ROAD_SCROLL.decorationMultiplier,
} as const;

import { SCORING_GUIDE_ICON_SIZE } from './ScoringGuideIconSlot';

import type { ScoringGuideVisualBounds } from '@/src/game/assets/definitions/scoring-guide-voxel.assets';

export type { ScoringGuideVisualBounds };

export interface ScoringGuideIconLayout {
  readonly width: number;
  readonly height: number;
  readonly left: number;
  readonly top: number;
}

/** Centers the alpha-weighted sprite centroid inside a square icon slot. */
export function computeScoringGuideIconLayout(
  bounds: ScoringGuideVisualBounds,
  slotSize: number = SCORING_GUIDE_ICON_SIZE,
): ScoringGuideIconLayout {
  const scale = Math.min(slotSize / bounds.sourceWidth, slotSize / bounds.sourceHeight);
  const width = bounds.sourceWidth * scale;
  const height = bounds.sourceHeight * scale;

  return {
    width,
    height,
    left: slotSize / 2 - bounds.visualCenterX * scale,
    top: slotSize / 2 - bounds.visualCenterY * scale,
  };
}

import { memo } from 'react';

import { SCORING_GUIDE_COIN_IMAGE_SOURCE } from '@/src/game/assets/definitions/scoring-guide-voxel.assets';

import { ScoringGuideStaticIcon } from './ScoringGuideStaticIcon';

/** Scoring guide coin — modal-only voxel artwork. */
function ScoringGuideCoinIconComponent() {
  return <ScoringGuideStaticIcon source={SCORING_GUIDE_COIN_IMAGE_SOURCE} />;
}

export const ScoringGuideCoinIcon = memo(ScoringGuideCoinIconComponent);

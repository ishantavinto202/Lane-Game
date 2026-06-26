import { memo } from 'react';

import { SCORING_GUIDE_SPEED_BOOST_IMAGE_SOURCE } from '@/src/game/assets/definitions/scoring-guide-voxel.assets';

import { ScoringGuideStaticIcon } from './ScoringGuideStaticIcon';

/** Scoring guide speed boost — modal-only voxel artwork. */
function ScoringGuideSpeedBoostIconComponent() {
  return <ScoringGuideStaticIcon source={SCORING_GUIDE_SPEED_BOOST_IMAGE_SOURCE} />;
}

export const ScoringGuideSpeedBoostIcon = memo(ScoringGuideSpeedBoostIconComponent);

import { memo } from 'react';

import {
  SCORING_GUIDE_SPEED_BOOST_IMAGE_SOURCE,
  SCORING_GUIDE_SPEED_BOOST_VISUAL_BOUNDS,
} from '@/src/game/assets/definitions/scoring-guide-voxel.assets';

import { SCORING_GUIDE_COLLECTIBLE_ICON_SCALE } from './ScoringGuideIconSlot';
import { ScoringGuideStaticIcon } from './ScoringGuideStaticIcon';

/** Scoring guide speed boost — static Blue_Thunder_Asset.png preview. */
function ScoringGuideSpeedBoostIconComponent() {
  return (
    <ScoringGuideStaticIcon
      source={SCORING_GUIDE_SPEED_BOOST_IMAGE_SOURCE}
      visualBounds={SCORING_GUIDE_SPEED_BOOST_VISUAL_BOUNDS}
      displayScale={SCORING_GUIDE_COLLECTIBLE_ICON_SCALE}
    />
  );
}

export const ScoringGuideSpeedBoostIcon = memo(ScoringGuideSpeedBoostIconComponent);

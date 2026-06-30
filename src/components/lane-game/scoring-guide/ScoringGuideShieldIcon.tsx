import { memo } from 'react';

import {
  SCORING_GUIDE_SHIELD_IMAGE_SOURCE,
  SCORING_GUIDE_SHIELD_VISUAL_BOUNDS,
} from '@/src/game/assets/definitions/scoring-guide-voxel.assets';

import { SCORING_GUIDE_COLLECTIBLE_ICON_SCALE } from './ScoringGuideIconSlot';
import { ScoringGuideStaticIcon } from './ScoringGuideStaticIcon';

/** Scoring guide shield — static Sheld Guide.png preview. */
function ScoringGuideShieldIconComponent() {
  return (
    <ScoringGuideStaticIcon
      source={SCORING_GUIDE_SHIELD_IMAGE_SOURCE}
      visualBounds={SCORING_GUIDE_SHIELD_VISUAL_BOUNDS}
      displayScale={SCORING_GUIDE_COLLECTIBLE_ICON_SCALE}
    />
  );
}

export const ScoringGuideShieldIcon = memo(ScoringGuideShieldIconComponent);

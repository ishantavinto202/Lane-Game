import { memo, useMemo } from 'react';

import {
  getScoringGuideCollectibleVisualBounds,
  SCORING_GUIDE_SHIELD_IMAGE_SOURCE,
} from '@/src/game/assets/definitions/scoring-guide-voxel.assets';

import { SCORING_GUIDE_COLLECTIBLE_ICON_SCALE } from './ScoringGuideIconSlot';
import { ScoringGuideStaticIcon } from './ScoringGuideStaticIcon';

/** Scoring guide shield — static voxel preview. */
function ScoringGuideShieldIconComponent() {
  const visualBounds = useMemo(() => getScoringGuideCollectibleVisualBounds('shield'), []);

  return (
    <ScoringGuideStaticIcon
      source={SCORING_GUIDE_SHIELD_IMAGE_SOURCE}
      visualBounds={visualBounds}
      displayScale={SCORING_GUIDE_COLLECTIBLE_ICON_SCALE}
    />
  );
}

export const ScoringGuideShieldIcon = memo(ScoringGuideShieldIconComponent);

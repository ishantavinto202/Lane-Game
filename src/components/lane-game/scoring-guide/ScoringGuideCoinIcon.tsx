import { memo, useMemo } from 'react';

import {
  getScoringGuideCollectibleVisualBounds,
  SCORING_GUIDE_COIN_IMAGE_SOURCE,
} from '@/src/game/assets/definitions/scoring-guide-voxel.assets';

import { SCORING_GUIDE_COLLECTIBLE_ICON_SCALE } from './ScoringGuideIconSlot';
import { ScoringGuideStaticIcon } from './ScoringGuideStaticIcon';

/** Scoring guide coin — static voxel preview. */
function ScoringGuideCoinIconComponent() {
  const visualBounds = useMemo(() => getScoringGuideCollectibleVisualBounds('coin'), []);

  return (
    <ScoringGuideStaticIcon
      source={SCORING_GUIDE_COIN_IMAGE_SOURCE}
      visualBounds={visualBounds}
      displayScale={SCORING_GUIDE_COLLECTIBLE_ICON_SCALE}
    />
  );
}

export const ScoringGuideCoinIcon = memo(ScoringGuideCoinIconComponent);

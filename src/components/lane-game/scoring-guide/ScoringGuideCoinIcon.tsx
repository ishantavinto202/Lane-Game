import { memo } from 'react';

import {
  SCORING_GUIDE_COIN_IMAGE_SOURCE,
  SCORING_GUIDE_COIN_VISUAL_BOUNDS,
} from '@/src/game/assets/definitions/scoring-guide-voxel.assets';

import { SCORING_GUIDE_COLLECTIBLE_ICON_SCALE } from './ScoringGuideIconSlot';
import { ScoringGuideStaticIcon } from './ScoringGuideStaticIcon';

/** Scoring guide coin — static Coin.png preview. */
function ScoringGuideCoinIconComponent() {
  return (
    <ScoringGuideStaticIcon
      source={SCORING_GUIDE_COIN_IMAGE_SOURCE}
      visualBounds={SCORING_GUIDE_COIN_VISUAL_BOUNDS}
      displayScale={SCORING_GUIDE_COLLECTIBLE_ICON_SCALE}
    />
  );
}

export const ScoringGuideCoinIcon = memo(ScoringGuideCoinIconComponent);

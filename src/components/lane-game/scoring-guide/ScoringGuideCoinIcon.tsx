import { memo } from 'react';

import { CoinAtlasSprite } from '../coin/CoinAtlasSprite';

import { SCORING_GUIDE_ATLAS_DISPLAY_SIZE, ScoringGuideIconSlot } from './ScoringGuideIconSlot';

/** Scoring guide coin — animated atlas preview. */
function ScoringGuideCoinIconComponent() {
  return (
    <ScoringGuideIconSlot>
      <CoinAtlasSprite displaySize={SCORING_GUIDE_ATLAS_DISPLAY_SIZE} />
    </ScoringGuideIconSlot>
  );
}

export const ScoringGuideCoinIcon = memo(ScoringGuideCoinIconComponent);

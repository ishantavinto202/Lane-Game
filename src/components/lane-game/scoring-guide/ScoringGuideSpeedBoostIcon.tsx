import { memo } from 'react';

import { SpeedBoostAtlasSprite } from '../speed-boost/SpeedBoostAtlasSprite';

import { SCORING_GUIDE_ATLAS_DISPLAY_SIZE, ScoringGuideIconSlot } from './ScoringGuideIconSlot';

/** Scoring guide speed boost — animated thunder atlas preview. */
function ScoringGuideSpeedBoostIconComponent() {
  return (
    <ScoringGuideIconSlot>
      <SpeedBoostAtlasSprite displaySize={SCORING_GUIDE_ATLAS_DISPLAY_SIZE} />
    </ScoringGuideIconSlot>
  );
}

export const ScoringGuideSpeedBoostIcon = memo(ScoringGuideSpeedBoostIconComponent);

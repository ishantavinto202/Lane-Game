import { memo, useEffect } from 'react';

import {
  SPEED_BOOST_ATLAS_FRAME_COUNT,
  SPEED_BOOST_ATLAS_FRAME_LAYOUTS,
  SPEED_BOOST_ATLAS_TEXTURE,
} from '@/src/game/assets/definitions/speed-boost-atlas.assets';
import { SPEED_BOOST_CONFIG } from '@/src/game/config';

import { AtlasSpriteViewport } from '../atlas/AtlasSpriteViewport';

import { ensureSpeedBoostAnimationClock, speedBoostAnimationFrame } from './speedBoostAnimationClock';

export interface SpeedBoostAtlasSpriteProps {
  readonly displaySize?: number;
}

/** Thunder atlas sprite — shared by in-game pickups and scoring guide. */
function SpeedBoostAtlasSpriteComponent({
  displaySize = SPEED_BOOST_CONFIG.size,
}: SpeedBoostAtlasSpriteProps) {
  useEffect(() => {
    ensureSpeedBoostAnimationClock();
  }, []);

  return (
    <AtlasSpriteViewport
      animationFrame={speedBoostAnimationFrame}
      frameCount={SPEED_BOOST_ATLAS_FRAME_COUNT}
      frameLayouts={SPEED_BOOST_ATLAS_FRAME_LAYOUTS}
      texture={SPEED_BOOST_ATLAS_TEXTURE}
      displaySize={displaySize}
    />
  );
}

export const SpeedBoostAtlasSprite = memo(SpeedBoostAtlasSpriteComponent);

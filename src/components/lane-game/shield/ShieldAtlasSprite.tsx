import { memo, useEffect } from 'react';

import {
  SHIELD_ATLAS_FRAME_COUNT,
  SHIELD_ATLAS_FRAME_LAYOUTS,
  SHIELD_ATLAS_TEXTURE,
} from '@/src/game/assets/definitions/shield-atlas.assets';
import { SHIELD_CONFIG } from '@/src/game/config';

import { AtlasSpriteViewport } from '../atlas/AtlasSpriteViewport';

import { ensureShieldAnimationClock, shieldAnimationFrame } from './shieldAnimationClock';

export interface ShieldAtlasSpriteProps {
  readonly displaySize?: number;
}

/** Shield atlas sprite — shared by in-game pickups and scoring guide. */
function ShieldAtlasSpriteComponent({ displaySize = SHIELD_CONFIG.size }: ShieldAtlasSpriteProps) {
  useEffect(() => {
    ensureShieldAnimationClock();
  }, []);

  return (
    <AtlasSpriteViewport
      animationFrame={shieldAnimationFrame}
      frameCount={SHIELD_ATLAS_FRAME_COUNT}
      frameLayouts={SHIELD_ATLAS_FRAME_LAYOUTS}
      texture={SHIELD_ATLAS_TEXTURE}
      displaySize={displaySize}
    />
  );
}

export const ShieldAtlasSprite = memo(ShieldAtlasSpriteComponent);

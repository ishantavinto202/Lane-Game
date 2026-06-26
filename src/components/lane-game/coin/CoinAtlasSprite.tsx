import { memo, useEffect } from 'react';

import {
  COIN_ATLAS_FRAME_COUNT,
  COIN_ATLAS_FRAME_LAYOUTS,
  COIN_ATLAS_TEXTURE,
} from '@/src/game/assets/definitions/coin-atlas.assets';
import { COIN_CONFIG } from '@/src/game/config';

import { AtlasSpriteViewport } from '../atlas/AtlasSpriteViewport';

import { coinAnimationFrame, ensureCoinAnimationClock } from './coinAnimationClock';

export interface CoinAtlasSpriteProps {
  readonly displaySize?: number;
}

/** Shared looping coin spin atlas — used by in-game pickups and UI previews. */
function CoinAtlasSpriteComponent({ displaySize = COIN_CONFIG.size }: CoinAtlasSpriteProps) {
  useEffect(() => {
    ensureCoinAnimationClock();
  }, []);

  return (
    <AtlasSpriteViewport
      animationFrame={coinAnimationFrame}
      frameCount={COIN_ATLAS_FRAME_COUNT}
      frameLayouts={COIN_ATLAS_FRAME_LAYOUTS}
      texture={COIN_ATLAS_TEXTURE}
      displaySize={displaySize}
    />
  );
}

export const CoinAtlasSprite = memo(CoinAtlasSpriteComponent);

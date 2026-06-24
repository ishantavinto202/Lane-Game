import { memo, useMemo } from 'react';

import { COIN_CONFIG } from '@/src/game/config';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';

import { FloatingScoreLabel } from '../ui/FloatingScoreLabel';

function CoinCollectBurstComponent() {
  const coinScoreFloaters = useGameStore(gameStoreSelectors.coinScoreFloaters);
  const dismissCoinScoreFloater = useGameStore(gameStoreSelectors.dismissCoinScoreFloater);
  const label = useMemo(() => `+${COIN_CONFIG.scoreReward}`, []);
  const { collectEffectHoldMs, collectEffectFadeMs, collectEffectFloatPx } = COIN_CONFIG;

  return (
    <>
      {coinScoreFloaters.map((floater) => (
        <FloatingScoreLabel
          key={floater.id}
          id={floater.id}
          x={floater.x}
          y={floater.y}
          label={label}
          color="#FFD700"
          holdMs={collectEffectHoldMs}
          fadeMs={collectEffectFadeMs}
          floatPx={collectEffectFloatPx}
          onComplete={dismissCoinScoreFloater}
        />
      ))}
    </>
  );
}

export const CoinCollectBurst = memo(CoinCollectBurstComponent);

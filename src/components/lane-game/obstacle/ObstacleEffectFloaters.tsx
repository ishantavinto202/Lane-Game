import { memo } from 'react';

import { OBSTACLE_PERSONALITY_CONFIG } from '@/src/game/config';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';

import { FloatingScoreLabel } from '../ui/FloatingScoreLabel';

function ObstacleEffectFloatersComponent() {
  const obstacleEffectFloaters = useGameStore(gameStoreSelectors.obstacleEffectFloaters);
  const dismissObstacleEffectFloater = useGameStore(gameStoreSelectors.dismissObstacleEffectFloater);
  const { effectHoldMs, effectFadeMs, effectFloatPx } = OBSTACLE_PERSONALITY_CONFIG;

  return (
    <>
      {obstacleEffectFloaters.map((floater) => (
        <FloatingScoreLabel
          key={floater.id}
          id={floater.id}
          x={floater.x}
          y={floater.y}
          label={floater.label}
          color="#FF3B30"
          holdMs={effectHoldMs}
          fadeMs={effectFadeMs}
          floatPx={effectFloatPx}
          onComplete={dismissObstacleEffectFloater}
        />
      ))}
    </>
  );
}

export const ObstacleEffectFloaters = memo(ObstacleEffectFloatersComponent);

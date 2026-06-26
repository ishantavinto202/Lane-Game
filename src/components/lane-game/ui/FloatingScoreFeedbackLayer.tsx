import { memo, useMemo } from 'react';
import { View } from 'react-native';

import { COIN_CONFIG, FLOATING_SCORE_FEEDBACK_CONFIG } from '@/src/game/config';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';

import { FloatingScoreLabel } from './FloatingScoreLabel';

interface FloatingScoreEntry {
  readonly key: string;
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly stackOffsetY: number;
  readonly sequence: number;
  readonly label: string;
  readonly color: string;
  readonly onComplete: (id: number) => void;
}

function FloatingScoreFeedbackLayerComponent() {
  const coinScoreFloaters = useGameStore(gameStoreSelectors.coinScoreFloaters);
  const obstacleEffectFloaters = useGameStore(gameStoreSelectors.obstacleEffectFloaters);
  const dismissCoinScoreFloater = useGameStore(gameStoreSelectors.dismissCoinScoreFloater);
  const dismissObstacleEffectFloater = useGameStore(gameStoreSelectors.dismissObstacleEffectFloater);
  const positiveLabel = useMemo(() => `+${COIN_CONFIG.scoreReward}`, []);
  const { holdMs, fadeMs, floatPx, positiveColor, negativeColor } = FLOATING_SCORE_FEEDBACK_CONFIG;

  const entries = useMemo<readonly FloatingScoreEntry[]>(() => {
    const coinEntries: FloatingScoreEntry[] = coinScoreFloaters.map((floater) => ({
      key: `coin-${floater.id}`,
      id: floater.id,
      x: floater.x,
      y: floater.y,
      stackOffsetY: floater.stackOffsetY,
      sequence: floater.sequence,
      label: positiveLabel,
      color: positiveColor,
      onComplete: dismissCoinScoreFloater,
    }));

    const obstacleEntries: FloatingScoreEntry[] = obstacleEffectFloaters.map((floater) => ({
      key: `obstacle-${floater.id}`,
      id: floater.id,
      x: floater.x,
      y: floater.y,
      stackOffsetY: floater.stackOffsetY,
      sequence: floater.sequence,
      label: floater.label,
      color: negativeColor,
      onComplete: dismissObstacleEffectFloater,
    }));

    return [...coinEntries, ...obstacleEntries].sort((left, right) => left.sequence - right.sequence);
  }, [
    coinScoreFloaters,
    dismissCoinScoreFloater,
    dismissObstacleEffectFloater,
    negativeColor,
    obstacleEffectFloaters,
    positiveColor,
    positiveLabel,
  ]);

  return (
    <View pointerEvents="none" className="absolute inset-0">
      {entries.map((entry) => (
        <FloatingScoreLabel
          key={entry.key}
          id={entry.id}
          x={entry.x}
          y={entry.y}
          stackOffsetY={entry.stackOffsetY}
          label={entry.label}
          color={entry.color}
          holdMs={holdMs}
          fadeMs={fadeMs}
          floatPx={floatPx}
          onComplete={entry.onComplete}
        />
      ))}
    </View>
  );
}

export const FloatingScoreFeedbackLayer = memo(FloatingScoreFeedbackLayerComponent);

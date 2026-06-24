import { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COUNTDOWN_CONFIG } from '@/src/game/config';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import { GameStatus } from '@/src/game/types';

const COUNTDOWN_STEPS = ['3', '2', '1', 'GO!'] as const;

function CountdownOverlayComponent() {
  const status = useGameStore(gameStoreSelectors.status);
  const resetNonce = useGameStore(gameStoreSelectors.resetNonce);
  const startPlaying = useGameStore(gameStoreSelectors.startPlaying);
  const [stepIndex, setStepIndex] = useState(0);

  const isVisible = status === GameStatus.Countdown;
  const label = useMemo(
    () => (isVisible ? COUNTDOWN_STEPS[stepIndex] : null),
    [isVisible, stepIndex],
  );

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    setStepIndex(0);
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const { stepDurationMs, goHoldMs } = COUNTDOWN_CONFIG;

    const schedule = (delayMs: number, fn: () => void) => {
      timeouts.push(
        setTimeout(() => {
          if (!cancelled) {
            fn();
          }
        }, delayMs),
      );
    };

    schedule(stepDurationMs, () => setStepIndex(1));
    schedule(stepDurationMs * 2, () => setStepIndex(2));
    schedule(stepDurationMs * 3, () => setStepIndex(3));
    schedule(stepDurationMs * 3 + goHoldMs, () => startPlaying());

    return () => {
      cancelled = true;
      for (const timeoutId of timeouts) {
        clearTimeout(timeoutId);
      }
    };
  }, [isVisible, resetNonce, startPlaying]);

  if (!isVisible || label === null) {
    return null;
  }

  const isGo = label === 'GO!';

  return (
    <View pointerEvents="none" style={styles.backdrop}>
      <Text style={isGo ? styles.goLabel : styles.countLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 45000,
    elevation: 45000,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  countLabel: {
    color: '#FFFFFF',
    fontSize: 96,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
  },
  goLabel: {
    color: '#34D399',
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export const CountdownOverlay = memo(CountdownOverlayComponent);

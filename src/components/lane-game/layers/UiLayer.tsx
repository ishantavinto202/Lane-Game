import { memo, useMemo } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CONTROLS_CONSTANTS } from '@/src/game/constants';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import { GameStatus } from '@/src/game/types';

const STATUS_LABELS: Record<GameStatus, string> = {
  [GameStatus.Ready]: 'Ready',
  [GameStatus.Playing]: 'Playing',
  [GameStatus.Paused]: 'Paused',
  [GameStatus.GameOver]: 'Game Over',
};

function UiLayerComponent() {
  const insets = useSafeAreaInsets();
  const status = useGameStore(gameStoreSelectors.status);
  const scoreSnapshot = useGameStore(gameStoreSelectors.scoreSnapshot);

  const statusLabel = useMemo(() => {
    if (status === GameStatus.Playing || status === GameStatus.Paused) {
      return `${STATUS_LABELS[status]} · ${scoreSnapshot.currentScore}`;
    }

    return STATUS_LABELS[status];
  }, [scoreSnapshot.currentScore, status]);

  const bestLabel = useMemo(
    () => `Best ${scoreSnapshot.bestScore}`,
    [scoreSnapshot.bestScore],
  );

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      top: insets.top + 12,
      left: CONTROLS_CONSTANTS.BUTTON_PADDING,
    }),
    [insets.top],
  );

  const showBadge = status !== GameStatus.GameOver;

  if (!showBadge) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[styles.layer, containerStyle]}>
      <View style={styles.badge}>
        <Text style={styles.status}>{statusLabel}</Text>
        <Text style={styles.best}>{bestLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    zIndex: 10001,
    elevation: 10001,
    alignItems: 'flex-start',
  },
  badge: {
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  status: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  best: {
    marginTop: 4,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'left',
  },
});

export const UiLayer = memo(UiLayerComponent);

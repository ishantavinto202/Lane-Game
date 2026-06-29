import { memo, useMemo } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import { GameStatus } from '@/src/game/types';

import {
  GAME_HUD_BADGE,
  GAME_HUD_HORIZONTAL_INSET,
  GAME_HUD_TOP_OFFSET,
  GAME_HUD_Z_INDEX,
} from '../ui/game-hud.styles';

function UiLayerComponent() {
  const insets = useSafeAreaInsets();
  const status = useGameStore(gameStoreSelectors.status);
  const scoreSnapshot = useGameStore(gameStoreSelectors.scoreSnapshot);

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      top: insets.top + GAME_HUD_TOP_OFFSET,
      left: GAME_HUD_HORIZONTAL_INSET,
    }),
    [insets.top],
  );

  const scoreLabel = useMemo(
    () => scoreSnapshot.currentScore.toLocaleString(),
    [scoreSnapshot.currentScore],
  );

  const bestLabel = useMemo(
    () => `Best ${scoreSnapshot.bestScore.toLocaleString()}`,
    [scoreSnapshot.bestScore],
  );

  const isVisible = status !== GameStatus.GameOver;

  if (!isVisible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[styles.layer, containerStyle]}>
      <View style={styles.badge}>
        <Text style={styles.score}>{scoreLabel}</Text>
        <Text style={styles.best}>{bestLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    zIndex: GAME_HUD_Z_INDEX,
    elevation: GAME_HUD_Z_INDEX,
    alignItems: 'flex-start',
  },
  badge: {
    borderRadius: GAME_HUD_BADGE.borderRadius,
    backgroundColor: GAME_HUD_BADGE.backgroundColor,
    paddingHorizontal: GAME_HUD_BADGE.paddingHorizontal,
    paddingVertical: GAME_HUD_BADGE.paddingVertical,
    minWidth: 88,
  },
  score: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.3,
    lineHeight: 32,
  },
  best: {
    marginTop: 2,
    color: 'rgba(255, 255, 255, 0.58)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export const UiLayer = memo(UiLayerComponent);

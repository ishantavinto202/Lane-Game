import { memo, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import { GameStatus } from '@/src/game/types';

function GameOverOverlayComponent() {
  const status = useGameStore(gameStoreSelectors.status);
  const scoreSnapshot = useGameStore(gameStoreSelectors.scoreSnapshot);
  const runStats = useGameStore(gameStoreSelectors.runStats);
  const restartRun = useGameStore(gameStoreSelectors.restartRun);

  const isVisible = status === GameStatus.GameOver;

  const handleRetry = useCallback(() => {
    restartRun();
  }, [restartRun]);

  const scoreText = useMemo(() => String(scoreSnapshot.currentScore), [scoreSnapshot.currentScore]);
  const bestText = useMemo(() => String(scoreSnapshot.bestScore), [scoreSnapshot.bestScore]);
  const runsText = useMemo(() => String(runStats.totalRuns), [runStats.totalRuns]);

  if (!isVisible) {
    return null;
  }

  return (
    <View pointerEvents="auto" style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>Game Over</Text>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{scoreText}</Text>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Best</Text>
          <Text style={styles.bestValue}>{bestText}</Text>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Runs</Text>
          <Text style={styles.scoreValue}>{runsText}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry"
          onPress={handleRetry}
          style={styles.retryButton}
        >
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50000,
    elevation: 50000,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  card: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 24,
    backgroundColor: 'rgba(23, 23, 23, 0.98)',
    paddingHorizontal: 32,
    paddingVertical: 40,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  scoreRow: {
    marginTop: 24,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  bestValue: {
    color: '#C4B5FD',
    fontSize: 24,
    fontWeight: '700',
  },
  retryButton: {
    marginTop: 36,
    width: '100%',
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export const GameOverOverlay = memo(GameOverOverlayComponent);

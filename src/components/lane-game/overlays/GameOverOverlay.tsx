import { memo, useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import { GameStatus } from '@/src/game/types';

import { ScoringGuideButton } from '../scoring-guide/ScoringGuideButton';
import { ScoringGuideModal } from '../scoring-guide/ScoringGuideModal';

function GameOverOverlayComponent() {
  const status = useGameStore(gameStoreSelectors.status);
  const scoreSnapshot = useGameStore(gameStoreSelectors.scoreSnapshot);
  const restartRun = useGameStore(gameStoreSelectors.restartRun);
  const [scoringGuideVisible, setScoringGuideVisible] = useState(false);

  const isVisible = status === GameStatus.GameOver;

  const handleRetry = useCallback(() => {
    restartRun();
  }, [restartRun]);

  const handleOpenScoringGuide = useCallback(() => {
    setScoringGuideVisible(true);
  }, []);

  const handleCloseScoringGuide = useCallback(() => {
    setScoringGuideVisible(false);
  }, []);

  const scoreText = useMemo(() => String(scoreSnapshot.currentScore), [scoreSnapshot.currentScore]);
  const bestText = useMemo(() => String(scoreSnapshot.bestScore), [scoreSnapshot.bestScore]);

  if (!isVisible) {
    return null;
  }

  return (
    <>
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

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Play Again"
            onPress={handleRetry}
            style={styles.retryButton}
          >
            <Text style={styles.retryLabel}>Play Again</Text>
          </Pressable>

          <ScoringGuideButton onPress={handleOpenScoringGuide} />
        </View>
      </View>

      <ScoringGuideModal visible={scoringGuideVisible} onClose={handleCloseScoringGuide} />
    </>
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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

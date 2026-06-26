import { Play } from 'phosphor-react-native';
import { memo, useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import { GameStatus } from '@/src/game/types';

import { ScoringGuideButton } from '../scoring-guide/ScoringGuideButton';
import { ScoringGuideModal } from '../scoring-guide/ScoringGuideModal';

function PauseOverlayComponent() {
  const status = useGameStore(gameStoreSelectors.status);
  const startPlaying = useGameStore(gameStoreSelectors.startPlaying);
  const [scoringGuideVisible, setScoringGuideVisible] = useState(false);

  const isVisible = status === GameStatus.Paused;

  const label = useMemo(() => 'Paused', []);

  const handleResume = useCallback(() => {
    startPlaying();
  }, [startPlaying]);

  const handleOpenScoringGuide = useCallback(() => {
    setScoringGuideVisible(true);
  }, []);

  const handleCloseScoringGuide = useCallback(() => {
    setScoringGuideVisible(false);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <View pointerEvents="box-none" style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{label}</Text>
          <Text style={styles.subtitle}>Take a breather — resume when ready.</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Resume"
            onPress={handleResume}
            style={styles.resumeButton}
          >
            <Play size={18} color="#FFFFFF" weight="bold" />
            <Text style={styles.resumeLabel}>Resume</Text>
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
    zIndex: 40000,
    elevation: 40000,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  card: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 24,
    backgroundColor: 'rgba(23, 23, 23, 0.96)',
    paddingHorizontal: 28,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  resumeButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  resumeLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export const PauseOverlay = memo(PauseOverlayComponent);

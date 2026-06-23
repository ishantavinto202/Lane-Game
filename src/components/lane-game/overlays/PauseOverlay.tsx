import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import { GameStatus } from '@/src/game/types';

function PauseOverlayComponent() {
  const status = useGameStore(gameStoreSelectors.status);
  const isVisible = status === GameStatus.Paused;

  const label = useMemo(() => 'Paused', []);

  if (!isVisible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.subtitle}>Tap Resume to continue</Text>
      </View>
    </View>
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
    borderRadius: 20,
    backgroundColor: 'rgba(23, 23, 23, 0.92)',
    paddingHorizontal: 28,
    paddingVertical: 24,
    alignItems: 'center',
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
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 14,
    fontWeight: '500',
  },
});

export const PauseOverlay = memo(PauseOverlayComponent);

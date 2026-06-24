import { memo, useMemo } from 'react';
import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SPEED_BOOST_IMAGE_SOURCE } from '@/src/game/assets/definitions/speed-boost.assets';
import { SPEED_BOOST_CONFIG } from '@/src/game/config';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import { GameStatus } from '@/src/game/types';

function SpeedBoostHudComponent() {
  const insets = useSafeAreaInsets();
  const status = useGameStore(gameStoreSelectors.status);
  const speedBoostActive = useGameStore(gameStoreSelectors.speedBoostActive);
  const speedBoostRemainingRatio = useGameStore(gameStoreSelectors.speedBoostRemainingRatio);

  const isVisible = status !== GameStatus.GameOver && speedBoostActive;

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      top: insets.top + 52,
    }),
    [insets.top],
  );

  const remainingSeconds = useMemo(
    () => Math.ceil(speedBoostRemainingRatio * (SPEED_BOOST_CONFIG.durationMs / 1000)),
    [speedBoostRemainingRatio],
  );

  const fillWidth = useMemo(
    () => Math.max(0, Math.min(120, speedBoostRemainingRatio * 120)),
    [speedBoostRemainingRatio],
  );

  if (!isVisible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[styles.layer, containerStyle]}>
      <View style={styles.badge}>
        <Image source={SPEED_BOOST_IMAGE_SOURCE} style={styles.icon} resizeMode="contain" />
        <View style={styles.meta}>
          <Text style={styles.label}>SPEED BOOST</Text>
          <Text style={styles.timer}>{remainingSeconds}s</Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: fillWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10002,
    elevation: 10002,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  icon: {
    width: 24,
    height: 24,
  },
  meta: {
    alignItems: 'flex-start',
  },
  label: {
    color: '#FFD60A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  timer: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  track: {
    marginTop: 6,
    width: 120,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FFD60A',
  },
});

export const SpeedBoostHud = memo(SpeedBoostHudComponent);

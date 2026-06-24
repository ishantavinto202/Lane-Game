import { memo, useMemo } from 'react';
import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SHIELD_IMAGE_SOURCE } from '@/src/game/assets/definitions/shield.assets';
import { HEALTH_CONFIG } from '@/src/game/config';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import { GameStatus } from '@/src/game/types';

const HEART_FULL = '❤️';
const HEART_EMPTY = '🖤';

function HealthHudComponent() {
  const insets = useSafeAreaInsets();
  const status = useGameStore(gameStoreSelectors.status);
  const health = useGameStore(gameStoreSelectors.health);
  const shieldActive = useGameStore(gameStoreSelectors.shieldActive);

  const isVisible = status !== GameStatus.GameOver;

  const heartsLabel = useMemo(() => {
    const hearts: string[] = [];

    for (let index = 0; index < HEALTH_CONFIG.maxHealth; index += 1) {
      hearts.push(index < health ? HEART_FULL : HEART_EMPTY);
    }

    return hearts.join(' ');
  }, [health]);

  const showShieldIcon = shieldActive;

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      top: insets.top + 8,
    }),
    [insets.top],
  );

  if (!isVisible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[styles.layer, containerStyle]}>
      <View style={styles.badge}>
        <Text style={styles.hearts}>{heartsLabel}</Text>
        {showShieldIcon ? (
          <Image source={SHIELD_IMAGE_SOURCE} style={styles.shieldIcon} resizeMode="contain" />
        ) : null}
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
    zIndex: 10001,
    elevation: 10001,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  hearts: {
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
    letterSpacing: 4,
  },
  shieldIcon: {
    width: 24,
    height: 24,
  },
});

export const HealthHud = memo(HealthHudComponent);

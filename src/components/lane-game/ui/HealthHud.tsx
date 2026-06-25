import { memo, useMemo } from 'react';
import { Image, StyleSheet, View, type ImageStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  HEART_EMPTY_IMAGE_SOURCE,
  HEART_FULL_IMAGE_SOURCE,
  HEART_HUD_ICON,
} from '@/src/game/assets/definitions/heart.assets';
import { SHIELD_IMAGE_SOURCE } from '@/src/game/assets/definitions/shield.assets';
import { HEALTH_CONFIG } from '@/src/game/config';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import { GameStatus } from '@/src/game/types';

const HEART_INDICES = Array.from({ length: HEALTH_CONFIG.maxHealth }, (_, index) => index);

interface HeartIconProps {
  readonly filled: boolean;
  readonly index: number;
}

const HeartIcon = memo(function HeartIcon({ filled, index }: HeartIconProps) {
  const imageStyle = useMemo(
    (): ImageStyle => ({
      width: HEART_HUD_ICON.width,
      height: HEART_HUD_ICON.height,
    }),
    [],
  );

  return (
    <Image
      source={filled ? HEART_FULL_IMAGE_SOURCE : HEART_EMPTY_IMAGE_SOURCE}
      style={imageStyle}
      resizeMode="contain"
      accessibilityLabel={filled ? `heart-full-${index}` : `heart-empty-${index}`}
    />
  );
});

function HealthHudComponent() {
  const insets = useSafeAreaInsets();
  const status = useGameStore(gameStoreSelectors.status);
  const health = useGameStore(gameStoreSelectors.health);
  const shieldActive = useGameStore(gameStoreSelectors.shieldActive);

  const isVisible = status !== GameStatus.GameOver;

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
        <View style={styles.heartsRow}>
          {HEART_INDICES.map((index) => (
            <HeartIcon key={`heart-${index}`} index={index} filled={index < health} />
          ))}
        </View>
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
  heartsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shieldIcon: {
    width: 24,
    height: 24,
  },
});

export const HealthHud = memo(HealthHudComponent);

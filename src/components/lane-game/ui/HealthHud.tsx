import { memo, useMemo } from 'react';
import { Image, StyleSheet, View, type ImageStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  HEART_EMPTY_IMAGE_SOURCE,
  HEART_FULL_IMAGE_SOURCE,
  HEART_HUD_ICON,
} from '@/src/game/assets/definitions/heart.assets';
import { SHIELD_IMAGE_SOURCE } from '@/src/game/assets/definitions/shield.assets';
import { HEALTH_CONFIG, SHIELD_CONFIG, TIMED_POWER_UP_UI_CONFIG } from '@/src/game/config';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import { GameStatus } from '@/src/game/types';

import {
  computeTimedPowerUpExpiryTimerColor,
  computeTimedPowerUpRemainingSeconds,
  isTimedPowerUpInExpiryWarning,
} from '../timed-power-up/compute-timed-power-up-display';
import { TimedPowerUpHudBadge } from '../timed-power-up/TimedPowerUpHudBadge';
import { useTimedPowerUpExpiryBlink } from '../timed-power-up/useTimedPowerUpExpiryBlink';

import {
  GAME_HUD_BADGE,
  GAME_HUD_TOP_OFFSET,
  GAME_HUD_Z_INDEX,
} from './game-hud.styles';

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
  const shieldRemainingRatio = useGameStore(gameStoreSelectors.shieldRemainingRatio);

  const isVisible = status !== GameStatus.GameOver;

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      top: insets.top + GAME_HUD_TOP_OFFSET,
    }),
    [insets.top],
  );

  const remainingSeconds = useMemo(
    () => computeTimedPowerUpRemainingSeconds(shieldRemainingRatio, SHIELD_CONFIG.durationMs),
    [shieldRemainingRatio],
  );

  const inExpiryWarning = useMemo(
    () =>
      isTimedPowerUpInExpiryWarning(
        shieldActive,
        shieldRemainingRatio,
        SHIELD_CONFIG.durationMs,
        TIMED_POWER_UP_UI_CONFIG.expiryWarningMs,
      ),
    [shieldActive, shieldRemainingRatio],
  );

  const timerColor = useMemo(
    () => computeTimedPowerUpExpiryTimerColor(remainingSeconds, inExpiryWarning),
    [inExpiryWarning, remainingSeconds],
  );

  const blinkOpacity = useTimedPowerUpExpiryBlink({
    active: shieldActive,
    remainingRatio: shieldRemainingRatio,
    durationMs: SHIELD_CONFIG.durationMs,
  });

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
        {shieldActive ? (
          <TimedPowerUpHudBadge
            iconSource={SHIELD_IMAGE_SOURCE}
            remainingSeconds={remainingSeconds}
            blinkOpacity={blinkOpacity}
            timerColor={timerColor}
          />
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
    zIndex: GAME_HUD_Z_INDEX,
    elevation: GAME_HUD_Z_INDEX,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: GAME_HUD_BADGE.borderRadius,
    backgroundColor: GAME_HUD_BADGE.backgroundColor,
    paddingHorizontal: GAME_HUD_BADGE.paddingHorizontal,
    paddingVertical: GAME_HUD_BADGE.paddingVertical,
  },
  heartsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

export const HealthHud = memo(HealthHudComponent);

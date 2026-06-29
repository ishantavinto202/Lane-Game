import { useEffect } from 'react';
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { TIMED_POWER_UP_UI_CONFIG } from '@/src/game/config';

import { isTimedPowerUpInExpiryWarning } from './compute-timed-power-up-display';

export interface UseTimedPowerUpExpiryBlinkOptions {
  readonly active: boolean;
  readonly remainingRatio: number;
  readonly durationMs: number;
  readonly warningMs?: number;
}

/** Smooth expiry-warning opacity pulse — visual only, driven by engine timer ratio. */
export function useTimedPowerUpExpiryBlink({
  active,
  remainingRatio,
  durationMs,
  warningMs = TIMED_POWER_UP_UI_CONFIG.expiryWarningMs,
}: UseTimedPowerUpExpiryBlinkOptions): SharedValue<number> {
  const blinkOpacity = useSharedValue(1);

  const inExpiryWarning = isTimedPowerUpInExpiryWarning(
    active,
    remainingRatio,
    durationMs,
    warningMs,
  );

  useEffect(() => {
    if (!inExpiryWarning) {
      cancelAnimation(blinkOpacity);
      blinkOpacity.value = TIMED_POWER_UP_UI_CONFIG.expiryBlinkMaxOpacity;
      return;
    }

    const halfCycleMs =
      1000 /
      (TIMED_POWER_UP_UI_CONFIG.expiryBlinkFlashesPerSecond * 2);
    const easing = Easing.inOut(Easing.sin);

    blinkOpacity.value = withRepeat(
      withSequence(
        withTiming(TIMED_POWER_UP_UI_CONFIG.expiryBlinkMinOpacity, {
          duration: halfCycleMs,
          easing,
        }),
        withTiming(TIMED_POWER_UP_UI_CONFIG.expiryBlinkMaxOpacity, {
          duration: halfCycleMs,
          easing,
        }),
      ),
      -1,
      false,
    );
  }, [blinkOpacity, inExpiryWarning]);

  return blinkOpacity;
}

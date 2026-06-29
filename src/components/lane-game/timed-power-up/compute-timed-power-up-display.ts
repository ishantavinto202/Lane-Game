/** Remaining whole seconds for a timed power-up HUD label. */
export function computeTimedPowerUpRemainingSeconds(
  remainingRatio: number,
  durationMs: number,
): number {
  return Math.ceil(Math.max(0, remainingRatio) * (durationMs / 1000));
}

/** Whether the power-up is inside its final expiry warning window. */
export function isTimedPowerUpInExpiryWarning(
  active: boolean,
  remainingRatio: number,
  durationMs: number,
  warningMs: number,
): boolean {
  if (!active || remainingRatio <= 0) {
    return false;
  }

  return remainingRatio * durationMs <= warningMs;
}

export const TIMED_POWER_UP_TIMER_COLORS = {
  normal: '#FFFFFF',
  warning: '#FFAB00',
  critical: '#FF453A',
} as const;

/** Expiry timer label color — white → amber → red in the final warning window. */
export function computeTimedPowerUpExpiryTimerColor(
  remainingSeconds: number,
  inExpiryWarning: boolean,
): string {
  if (!inExpiryWarning) {
    return TIMED_POWER_UP_TIMER_COLORS.normal;
  }

  if (remainingSeconds <= 1) {
    return TIMED_POWER_UP_TIMER_COLORS.critical;
  }

  return TIMED_POWER_UP_TIMER_COLORS.warning;
}

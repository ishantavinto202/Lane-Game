/** Shared timed power-up HUD + expiry warning tuning (Shield, future Magnet, etc.). */
export const TIMED_POWER_UP_UI_CONFIG = {
  /** Final window before expiry where HUD + world visuals begin blinking. */
  expiryWarningMs: 3000,
  expiryBlinkMinOpacity: 0.25,
  expiryBlinkMaxOpacity: 1,
  /** Smooth opacity pulse rate during the expiry warning window. */
  expiryBlinkFlashesPerSecond: 4.5,
} as const;

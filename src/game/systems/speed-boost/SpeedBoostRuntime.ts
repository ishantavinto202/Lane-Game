import { SPEED_BOOST_CONFIG } from '../../config';

/** Tracks active speed boost duration and multipliers (Phase 5.5). */
export class SpeedBoostRuntime {
  readonly id = 'speed-boost-runtime' as const;

  private remainingMs = 0;

  reset(): void {
    this.remainingMs = 0;
  }

  /** Refreshes boost duration — re-pick during active boost resets the timer. */
  activate(): void {
    this.remainingMs = SPEED_BOOST_CONFIG.durationMs;
  }

  update(deltaMs: number): void {
    if (this.remainingMs <= 0) {
      return;
    }

    this.remainingMs = Math.max(0, this.remainingMs - deltaMs);
  }

  isActive(): boolean {
    return this.remainingMs > 0;
  }

  getSpeedMultiplier(): number {
    return this.isActive() ? SPEED_BOOST_CONFIG.speedMultiplier : 1;
  }

  getScoreRateMultiplier(): number {
    return this.isActive() ? SPEED_BOOST_CONFIG.scoreRateMultiplier : 1;
  }

  getRemainingMs(): number {
    return this.remainingMs;
  }

  getRemainingRatio(): number {
    if (!this.isActive()) {
      return 0;
    }

    return this.remainingMs / SPEED_BOOST_CONFIG.durationMs;
  }
}

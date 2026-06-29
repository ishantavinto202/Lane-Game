import { SHIELD_CONFIG } from '../../config';

/** Tracks active shield duration — single source of truth for shield timer (Phase 4.3A). */
export class ShieldRuntime {
  readonly id = 'shield-runtime' as const;

  private remainingMs = 0;

  reset(): void {
    this.remainingMs = 0;
  }

  activate(): void {
    this.remainingMs = SHIELD_CONFIG.durationMs;
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

  getRemainingMs(): number {
    return this.remainingMs;
  }

  getRemainingRatio(): number {
    if (!this.isActive()) {
      return 0;
    }

    return this.remainingMs / SHIELD_CONFIG.durationMs;
  }
}

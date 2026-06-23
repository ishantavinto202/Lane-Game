import { HEALTH_CONFIG } from '../../config';
import type { HealthSnapshot } from '../../types';

/** Tracks player health and post-hit invulnerability (Phase 4.1). */
export class HealthSystem {
  readonly id = 'health-system' as const;

  private current = HEALTH_CONFIG.maxHealth;
  private invulnerabilityRemainingMs = 0;

  getSnapshot(): HealthSnapshot {
    return {
      current: this.current,
      max: HEALTH_CONFIG.maxHealth,
      isInvulnerable: this.invulnerabilityRemainingMs > 0,
    };
  }

  isInvulnerable(): boolean {
    return this.invulnerabilityRemainingMs > 0;
  }

  update(deltaMs: number): void {
    if (this.invulnerabilityRemainingMs <= 0) {
      return;
    }

    this.invulnerabilityRemainingMs = Math.max(0, this.invulnerabilityRemainingMs - deltaMs);
  }

  takeDamage(): HealthSnapshot {
    if (this.isInvulnerable()) {
      return this.getSnapshot();
    }

    this.current = Math.max(0, this.current - 1);
    this.invulnerabilityRemainingMs = HEALTH_CONFIG.invulnerabilityMs;
    return this.getSnapshot();
  }

  reset(): void {
    this.current = HEALTH_CONFIG.maxHealth;
    this.invulnerabilityRemainingMs = 0;
  }
}

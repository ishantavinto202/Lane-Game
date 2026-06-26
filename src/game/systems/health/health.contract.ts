import type { HealthSnapshot } from '../../types';

/** Player health and invulnerability contract (Phase 4.1). */
export interface HealthSystemContract {
  readonly id: 'health-system';
  readonly getSnapshot: () => HealthSnapshot;
  readonly isInvulnerable: () => boolean;
  readonly update: (deltaMs: number) => void;
  readonly takeDamage: (amount?: number) => HealthSnapshot;
  readonly reset: () => void;
}

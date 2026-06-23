/** Runtime health values exposed to HUD and engine. */
export interface HealthSnapshot {
  readonly current: number;
  readonly max: number;
  readonly isInvulnerable: boolean;
}

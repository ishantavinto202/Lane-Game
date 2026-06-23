/** Score accumulation rules and formatting metadata. */
export interface ScorePolicy {
  readonly pointsPerMeter: number;
  readonly displayDecimals: number;
  readonly hudUpdateIntervalMs: number;
}

/** Score values for HUD (Phase 3+). */
export interface ScoreSnapshot {
  readonly currentScore: number;
  readonly bestScore: number;
  readonly distanceTraveled: number;
}

/** Lifetime stats persisted via AsyncStorage. */
export interface PersistedPlayerStats {
  readonly bestScore: number;
  readonly totalRuns: number;
  readonly totalDistance: number;
  readonly lifetimeCoins: number;
  readonly lastPlayedAt: string | null;
  readonly version: number;
}

/** HUD + run lifecycle stats mirrored in Zustand. */
export interface RunStatistics {
  readonly totalRuns: number;
  readonly totalDistance: number;
}

/** Default shape used when no saved stats exist. */
export const EMPTY_PERSISTED_STATS: PersistedPlayerStats = {
  bestScore: 0,
  totalRuns: 0,
  totalDistance: 0,
  lifetimeCoins: 0,
  lastPlayedAt: null,
  version: 1,
} as const;

export const EMPTY_RUN_STATISTICS: RunStatistics = {
  totalRuns: 0,
  totalDistance: 0,
} as const;

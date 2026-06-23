/** Difficulty curve inputs derived from elapsed run time. */
export interface DifficultyCurve {
  readonly baseSpeedPxPerSec: number;
  readonly maxSpeedPxPerSec: number;
  readonly speedRampSeconds: number;
  readonly baseSpawnIntervalMs: number;
  readonly minSpawnIntervalMs: number;
  readonly spawnRampSeconds: number;
}

/** Resolved runtime difficulty values after curve evaluation. */
export interface DifficultyRuntime {
  readonly speedPxPerSec: number;
  readonly spawnIntervalMs: number;
  readonly speedMultiplier: number;
  readonly elapsedSeconds: number;
}

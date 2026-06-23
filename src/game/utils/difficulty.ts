import { DIFFICULTY_CONFIG } from '../config';
import type { DifficultyCurve, DifficultyRuntime } from '../types';

const DEFAULT_CURVE: DifficultyCurve = {
  baseSpeedPxPerSec: DIFFICULTY_CONFIG.baseSpeedPxPerSec,
  maxSpeedPxPerSec: DIFFICULTY_CONFIG.maxSpeedPxPerSec,
  speedRampSeconds: DIFFICULTY_CONFIG.speedRampSeconds,
  baseSpawnIntervalMs: DIFFICULTY_CONFIG.baseSpawnIntervalMs,
  minSpawnIntervalMs: DIFFICULTY_CONFIG.minSpawnIntervalMs,
  spawnRampSeconds: DIFFICULTY_CONFIG.spawnRampSeconds,
} as const;

function easeOutPower(progress: number, power: number): number {
  const clamped = Math.max(0, Math.min(1, progress));
  return 1 - (1 - clamped) ** power;
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/** Evaluates smooth difficulty scaling from elapsed run time. */
export function evaluateDifficulty(
  elapsedMs: number,
  curve: DifficultyCurve = DEFAULT_CURVE,
): DifficultyRuntime {
  const elapsedSeconds = elapsedMs / 1000;
  const speedProgress = easeOutPower(
    elapsedSeconds / curve.speedRampSeconds,
    DIFFICULTY_CONFIG.speedEasePower,
  );
  const spawnProgress = easeOutPower(
    elapsedSeconds / curve.spawnRampSeconds,
    DIFFICULTY_CONFIG.spawnEasePower,
  );

  const speedPxPerSec = lerp(
    curve.baseSpeedPxPerSec,
    curve.maxSpeedPxPerSec,
    speedProgress,
  );
  const spawnIntervalMs = lerp(
    curve.baseSpawnIntervalMs,
    curve.minSpawnIntervalMs,
    spawnProgress,
  );

  return {
    speedPxPerSec,
    spawnIntervalMs,
    speedMultiplier: speedPxPerSec / curve.baseSpeedPxPerSec,
    elapsedSeconds,
  };
}

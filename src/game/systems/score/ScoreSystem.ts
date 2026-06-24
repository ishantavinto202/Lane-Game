import { SCORE_CONFIG } from '../../config';
import type { PersistedPlayerStats, ScoreSnapshot } from '../../types';
import { EMPTY_PERSISTED_STATS } from '../../types';

/** Time-based scoring with best-score tracking. */
export class ScoreSystem {
  readonly id = 'score-system' as const;

  private survivalTimeMs = 0;
  private scoreAccumulatorMs = 0;
  private currentScore = 0;
  private bestScore = 0;

  reset(): void {
    this.survivalTimeMs = 0;
    this.scoreAccumulatorMs = 0;
    this.currentScore = 0;
  }

  /** Accumulates active play time and awards +5 every 1 second survived. */
  addSurvivalTime(deltaMs: number, scoreRateMultiplier = 1): ScoreSnapshot {
    this.survivalTimeMs += deltaMs;
    this.scoreAccumulatorMs += deltaMs * scoreRateMultiplier;

    const { pointsIntervalMs, pointsPerInterval } = SCORE_CONFIG;
    while (this.scoreAccumulatorMs >= pointsIntervalMs) {
      this.scoreAccumulatorMs -= pointsIntervalMs;
      this.currentScore += pointsPerInterval;
    }

    return this.getSnapshot();
  }

  /** Awards instant score from a coin pickup. */
  addPickupBonus(points: number): ScoreSnapshot {
    this.currentScore += points;
    return this.getSnapshot();
  }

  /** Applies a score penalty clamped at zero. */
  applyScorePenalty(amount: number): ScoreSnapshot {
    this.currentScore = Math.max(0, this.currentScore - amount);
    return this.getSnapshot();
  }

  getSnapshot(): ScoreSnapshot {
    return {
      currentScore: this.currentScore,
      bestScore: this.bestScore,
      distanceTraveled: this.getEquivalentDistancePx(),
    };
  }

  applyBestScore(stats: PersistedPlayerStats): ScoreSnapshot {
    this.bestScore = stats.bestScore;
    return this.getSnapshot();
  }

  /** Returns updated best score if current run beat the record. */
  resolveBestScore(): ScoreSnapshot {
    if (this.currentScore > this.bestScore) {
      this.bestScore = this.currentScore;
    }

    return this.getSnapshot();
  }

  setBestScore(score: number): void {
    this.bestScore = Math.max(this.bestScore, score);
  }

  loadFromStats(stats: PersistedPlayerStats = EMPTY_PERSISTED_STATS): void {
    this.bestScore = stats.bestScore;
  }

  private getEquivalentDistancePx(): number {
    return (this.survivalTimeMs / 1000) * SCORE_CONFIG.equivalentScrollSpeedPxPerSec;
  }
}

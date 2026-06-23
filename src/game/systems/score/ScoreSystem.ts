import { SCORE_CONFIG } from '../../config';
import type { DifficultyRuntime, PersistedPlayerStats, ScoreSnapshot } from '../../types';
import { EMPTY_PERSISTED_STATS } from '../../types';

/** Distance-based scoring with best-score tracking. */
export class ScoreSystem {
  readonly id = 'score-system' as const;

  private distanceTraveled = 0;
  private currentScore = 0;
  private bestScore = 0;

  reset(): void {
    this.distanceTraveled = 0;
    this.currentScore = 0;
  }

  addDistance(deltaPx: number, _difficulty: DifficultyRuntime): ScoreSnapshot {
    this.distanceTraveled += deltaPx;
    const meters = this.distanceTraveled * SCORE_CONFIG.metersPerPixel;
    this.currentScore = Math.floor(meters * SCORE_CONFIG.pointsPerMeter);
    return this.getSnapshot();
  }

  getSnapshot(): ScoreSnapshot {
    return {
      currentScore: this.currentScore,
      bestScore: this.bestScore,
      distanceTraveled: this.distanceTraveled,
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
}

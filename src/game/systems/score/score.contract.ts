import type { PersistedPlayerStats, ScoreSnapshot } from '../../types';

/** Time-based scoring contract (Phase 5.2). */
export interface ScoreSystemContract {
  readonly id: 'score-system';
  readonly reset: () => void;
  readonly addSurvivalTime: (deltaMs: number, scoreRateMultiplier?: number) => ScoreSnapshot;
  readonly addPickupBonus: (points: number) => ScoreSnapshot;
  readonly applyScorePenalty: (amount: number) => ScoreSnapshot;
  readonly getSnapshot: () => ScoreSnapshot;
  readonly applyBestScore: (stats: PersistedPlayerStats) => ScoreSnapshot;
}

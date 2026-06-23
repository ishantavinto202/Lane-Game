import type { DifficultyRuntime } from '../../types';
import type { PersistedPlayerStats, ScoreSnapshot } from '../../types';

/** Distance-based scoring contract (Phase 3 implementation). */
export interface ScoreSystemContract {
  readonly id: 'score-system';
  readonly reset: () => void;
  readonly addDistance: (deltaPx: number, difficulty: DifficultyRuntime) => ScoreSnapshot;
  readonly getSnapshot: () => ScoreSnapshot;
  readonly applyBestScore: (stats: PersistedPlayerStats) => ScoreSnapshot;
}

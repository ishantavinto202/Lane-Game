import type { PersistedPlayerStats, ScoreSnapshot } from '../types';

/** Persistence layer contract (Phase 4.2). */
export interface PersistenceContract {
  readonly loadPlayerStats: () => Promise<PersistedPlayerStats>;
  readonly savePlayerStats: (stats: PersistedPlayerStats) => Promise<void>;
  readonly updateBestScore: (score: number) => Promise<PersistedPlayerStats>;
  readonly incrementRunCount: () => Promise<PersistedPlayerStats>;
  readonly persistRunEnd: (
    snapshot: ScoreSnapshot,
    runCoins: number,
  ) => Promise<PersistedPlayerStats>;
}

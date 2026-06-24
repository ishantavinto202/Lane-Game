import AsyncStorage from '@react-native-async-storage/async-storage';

import { SCORE_CONFIG } from '../config';
import { STORAGE_CONSTANTS } from '../constants';
import type { PersistedPlayerStats, ScoreSnapshot } from '../types';
import { EMPTY_PERSISTED_STATS } from '../types';

import { PERSISTENCE_KEYS } from './storage-keys';
import type { PersistenceContract } from './persistence.contract';

function parseStats(raw: string | null): PersistedPlayerStats {
  if (!raw) {
    return EMPTY_PERSISTED_STATS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedPlayerStats>;
    return {
      bestScore: typeof parsed.bestScore === 'number' ? parsed.bestScore : 0,
      totalRuns: typeof parsed.totalRuns === 'number' ? parsed.totalRuns : 0,
      totalDistance: typeof parsed.totalDistance === 'number' ? parsed.totalDistance : 0,
      lastPlayedAt: typeof parsed.lastPlayedAt === 'string' ? parsed.lastPlayedAt : null,
      version: STORAGE_CONSTANTS.SCHEMA_VERSION,
    };
  } catch {
    return EMPTY_PERSISTED_STATS;
  }
}

function metersFromSnapshot(snapshot: ScoreSnapshot): number {
  return snapshot.distanceTraveled * SCORE_CONFIG.metersPerPixel;
}

/** AsyncStorage-backed player stats persistence. */
export const playerStatsPersistence: PersistenceContract = {
  async loadPlayerStats(): Promise<PersistedPlayerStats> {
    const raw = await AsyncStorage.getItem(PERSISTENCE_KEYS.playerStats);
    return parseStats(raw);
  },

  async savePlayerStats(stats: PersistedPlayerStats): Promise<void> {
    await AsyncStorage.setItem(PERSISTENCE_KEYS.playerStats, JSON.stringify(stats));
  },

  async updateBestScore(score: number): Promise<PersistedPlayerStats> {
    const current = await playerStatsPersistence.loadPlayerStats();
    const next: PersistedPlayerStats = {
      ...current,
      bestScore: Math.max(current.bestScore, score),
      lastPlayedAt: new Date().toISOString(),
      version: STORAGE_CONSTANTS.SCHEMA_VERSION,
    };
    await playerStatsPersistence.savePlayerStats(next);
    return next;
  },

  async incrementRunCount(): Promise<PersistedPlayerStats> {
    const current = await playerStatsPersistence.loadPlayerStats();
    const next: PersistedPlayerStats = {
      ...current,
      totalRuns: current.totalRuns + 1,
      lastPlayedAt: new Date().toISOString(),
      version: STORAGE_CONSTANTS.SCHEMA_VERSION,
    };
    await playerStatsPersistence.savePlayerStats(next);
    return next;
  },

  async persistRunEnd(snapshot: ScoreSnapshot): Promise<PersistedPlayerStats> {
    const current = await playerStatsPersistence.loadPlayerStats();
    const next: PersistedPlayerStats = {
      bestScore: Math.max(current.bestScore, snapshot.bestScore),
      totalRuns: current.totalRuns + 1,
      totalDistance: current.totalDistance + metersFromSnapshot(snapshot),
      lastPlayedAt: new Date().toISOString(),
      version: STORAGE_CONSTANTS.SCHEMA_VERSION,
    };

    await playerStatsPersistence.savePlayerStats(next);
    return next;
  },
};

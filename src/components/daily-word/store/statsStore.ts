import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { updateAverageGuesses } from '../game/scoring';
import { getPuzzleDateKey } from '../game/wordPicker';

import type { GameStats } from '../game/types';

const STORAGE_KEY = '@daily-word/stats';

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  totalScore: 0,
  bestScore: 0,
  averageGuesses: 0,
  lastPlayedDate: null,
};

export interface StatsStoreState {
  stats: GameStats;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  recordWin: (guessCount: number, score: number) => Promise<void>;
  recordLoss: () => Promise<void>;
  resetStats: () => Promise<void>;
}

async function persistStats(stats: GameStats): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export const useStatsStore = create<StatsStoreState>((set, get) => ({
  stats: DEFAULT_STATS,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GameStats;
        set({ stats: { ...DEFAULT_STATS, ...parsed }, hydrated: true });
        return;
      }
    } catch {
      // fall through to defaults
    }
    set({ stats: DEFAULT_STATS, hydrated: true });
  },

  recordWin: async (guessCount, score) => {
    const today = getPuzzleDateKey();
    const { stats } = get();
    const playedToday = stats.lastPlayedDate === today;
    const gamesWon = stats.gamesWon + 1;

    const next: GameStats = {
      gamesPlayed: stats.gamesPlayed + (playedToday ? 0 : 1),
      gamesWon,
      currentStreak: stats.currentStreak + (playedToday ? 0 : 1),
      maxStreak: Math.max(stats.maxStreak, stats.currentStreak + (playedToday ? 0 : 1)),
      totalScore: stats.totalScore + score,
      bestScore: Math.max(stats.bestScore, score),
      averageGuesses: updateAverageGuesses(stats.averageGuesses, gamesWon, guessCount),
      lastPlayedDate: today,
    };

    set({ stats: next });
    await persistStats(next);
  },

  recordLoss: async () => {
    const today = getPuzzleDateKey();
    const { stats } = get();
    const playedToday = stats.lastPlayedDate === today;

    const next: GameStats = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + (playedToday ? 0 : 1),
      currentStreak: playedToday ? stats.currentStreak : 0,
      lastPlayedDate: today,
    };

    set({ stats: next });
    await persistStats(next);
  },

  resetStats: async () => {
    set({ stats: DEFAULT_STATS });
    await persistStats(DEFAULT_STATS);
  },
}));

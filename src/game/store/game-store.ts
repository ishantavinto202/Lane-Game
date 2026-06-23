import { create } from 'zustand';

import { GameStatus } from '../types';
import { EMPTY_PERSISTED_STATS } from '../types';

import type { GameStore } from './game-store.types';
import {
  INITIAL_COIN_COLLECT_EFFECT,
  INITIAL_HEALTH,
  INITIAL_RUN_STATS,
  INITIAL_SCORE_SNAPSHOT,
} from './game-store.types';

export const useGameStore = create<GameStore>((set) => ({
  status: GameStatus.Playing,
  resetNonce: 0,
  collisionFlashNonce: 0,
  damageBlinkNonce: 0,
  health: INITIAL_HEALTH,
  runCoins: 0,
  lifetimeCoins: EMPTY_PERSISTED_STATS.lifetimeCoins,
  coinCollectEffect: INITIAL_COIN_COLLECT_EFFECT,
  scoreSnapshot: INITIAL_SCORE_SNAPSHOT,
  runStats: INITIAL_RUN_STATS,
  setStatus: (status) => set({ status }),
  startPlaying: () => set({ status: GameStatus.Playing }),
  pausePlaying: () => set({ status: GameStatus.Paused }),
  resetToReady: () =>
    set((state) => ({
      status: GameStatus.Playing,
      resetNonce: state.resetNonce + 1,
      health: INITIAL_HEALTH,
      runCoins: 0,
      scoreSnapshot: {
        currentScore: 0,
        bestScore: state.scoreSnapshot.bestScore,
        distanceTraveled: 0,
      },
    })),
  restartRun: () =>
    set((state) => ({
      status: GameStatus.Playing,
      resetNonce: state.resetNonce + 1,
      health: INITIAL_HEALTH,
      runCoins: 0,
      scoreSnapshot: {
        currentScore: 0,
        bestScore: state.scoreSnapshot.bestScore,
        distanceTraveled: 0,
      },
    })),
  setScoreSnapshot: (scoreSnapshot) => set({ scoreSnapshot }),
  setRunStats: (runStats) => set({ runStats }),
  setHealth: (health) => set({ health }),
  setRunCoins: (runCoins) => set({ runCoins }),
  setLifetimeCoins: (lifetimeCoins) => set({ lifetimeCoins }),
  triggerCoinCollect: (x, y) =>
    set((state) => ({
      coinCollectEffect: {
        x,
        y,
        nonce: state.coinCollectEffect.nonce + 1,
      },
    })),
  triggerCollisionFlash: () =>
    set((state) => ({
      collisionFlashNonce: state.collisionFlashNonce + 1,
    })),
  triggerDamageBlink: () =>
    set((state) => ({
      damageBlinkNonce: state.damageBlinkNonce + 1,
    })),
  triggerGameOver: () => set({ status: GameStatus.GameOver }),
}));

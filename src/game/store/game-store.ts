import { create } from 'zustand';

import { GameStatus } from '../types';

import type { GameStore } from './game-store.types';
import {
  INITIAL_HEALTH,
  INITIAL_RUN_STATS,
  INITIAL_SCORE_SNAPSHOT,
} from './game-store.types';

const clearScoreFeedbackFloaters = {
  coinScoreFloaters: [] as const,
  obstacleEffectFloaters: [] as const,
};

export const useGameStore = create<GameStore>((set) => ({
  status: GameStatus.Countdown,
  resetNonce: 0,
  collisionFlashNonce: 0,
  damageBlinkNonce: 0,
  health: INITIAL_HEALTH,
  coinScoreFloaters: [],
  nextCoinScoreFloaterId: 1,
  obstacleEffectFloaters: [],
  nextObstacleEffectFloaterId: 1,
  shieldActive: false,
  shieldBreakNonce: 0,
  speedBoostActive: false,
  speedBoostRemainingRatio: 0,
  scoreSnapshot: INITIAL_SCORE_SNAPSHOT,
  runStats: INITIAL_RUN_STATS,
  setStatus: (status) => set({ status }),
  startPlaying: () => set({ status: GameStatus.Playing }),
  pausePlaying: () => set({ status: GameStatus.Paused }),
  resetToReady: () =>
    set((state) => ({
      status: GameStatus.Countdown,
      resetNonce: state.resetNonce + 1,
      health: INITIAL_HEALTH,
      shieldActive: false,
      shieldBreakNonce: 0,
      speedBoostActive: false,
      speedBoostRemainingRatio: 0,
      ...clearScoreFeedbackFloaters,
      scoreSnapshot: {
        currentScore: 0,
        bestScore: state.scoreSnapshot.bestScore,
        distanceTraveled: 0,
      },
    })),
  restartRun: () =>
    set((state) => ({
      status: GameStatus.Countdown,
      resetNonce: state.resetNonce + 1,
      health: INITIAL_HEALTH,
      shieldActive: false,
      shieldBreakNonce: 0,
      speedBoostActive: false,
      speedBoostRemainingRatio: 0,
      ...clearScoreFeedbackFloaters,
      scoreSnapshot: {
        currentScore: 0,
        bestScore: state.scoreSnapshot.bestScore,
        distanceTraveled: 0,
      },
    })),
  setScoreSnapshot: (scoreSnapshot) => set({ scoreSnapshot }),
  setRunStats: (runStats) => set({ runStats }),
  setHealth: (health) => set({ health }),
  triggerCoinCollect: (x, y) =>
    set((state) => {
      const id = state.nextCoinScoreFloaterId;
      return {
        coinScoreFloaters: [...state.coinScoreFloaters, { id, x, y }],
        nextCoinScoreFloaterId: id + 1,
      };
    }),
  dismissCoinScoreFloater: (id) =>
    set((state) => ({
      coinScoreFloaters: state.coinScoreFloaters.filter((floater) => floater.id !== id),
    })),
  triggerObstacleEffectFloater: (x, y, label) =>
    set((state) => {
      const id = state.nextObstacleEffectFloaterId;
      return {
        obstacleEffectFloaters: [...state.obstacleEffectFloaters, { id, x, y, label }],
        nextObstacleEffectFloaterId: id + 1,
      };
    }),
  dismissObstacleEffectFloater: (id) =>
    set((state) => ({
      obstacleEffectFloaters: state.obstacleEffectFloaters.filter((floater) => floater.id !== id),
    })),
  setShieldActive: (shieldActive) => set({ shieldActive }),
  triggerShieldBreak: () =>
    set((state) => ({
      shieldActive: false,
      shieldBreakNonce: state.shieldBreakNonce + 1,
    })),
  clearShieldState: () => set({ shieldActive: false, shieldBreakNonce: 0 }),
  setSpeedBoostState: (speedBoostActive, speedBoostRemainingRatio) =>
    set({ speedBoostActive, speedBoostRemainingRatio }),
  clearSpeedBoostState: () => set({ speedBoostActive: false, speedBoostRemainingRatio: 0 }),
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

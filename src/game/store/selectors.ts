import type { GameStore } from './game-store.types';

/** Selector input type for Zustand `useGameStore(selector)`. */
export type GameStoreSelector<T> = (state: GameStore) => T;

/** Stable selectors — subscribe to slices only, never the full store. */
export const gameStoreSelectors = {
  status: (state: GameStore) => state.status,
  isReady: (state: GameStore) => state.status === 'ready',
  isPlaying: (state: GameStore) => state.status === 'playing',
  isPaused: (state: GameStore) => state.status === 'paused',
  isGameOver: (state: GameStore) => state.status === 'game-over',
  scoreSnapshot: (state: GameStore) => state.scoreSnapshot,
  runStats: (state: GameStore) => state.runStats,
  health: (state: GameStore) => state.health,
  runCoins: (state: GameStore) => state.runCoins,
  lifetimeCoins: (state: GameStore) => state.lifetimeCoins,
  coinCollectEffect: (state: GameStore) => state.coinCollectEffect,
  shieldActive: (state: GameStore) => state.shieldActive,
  shieldBreakNonce: (state: GameStore) => state.shieldBreakNonce,
  collisionFlashNonce: (state: GameStore) => state.collisionFlashNonce,
  damageBlinkNonce: (state: GameStore) => state.damageBlinkNonce,
  setStatus: (state: GameStore) => state.setStatus,
  startPlaying: (state: GameStore) => state.startPlaying,
  pausePlaying: (state: GameStore) => state.pausePlaying,
  resetToReady: (state: GameStore) => state.resetToReady,
  restartRun: (state: GameStore) => state.restartRun,
  setScoreSnapshot: (state: GameStore) => state.setScoreSnapshot,
  setRunStats: (state: GameStore) => state.setRunStats,
  setHealth: (state: GameStore) => state.setHealth,
  setRunCoins: (state: GameStore) => state.setRunCoins,
  setLifetimeCoins: (state: GameStore) => state.setLifetimeCoins,
  triggerCoinCollect: (state: GameStore) => state.triggerCoinCollect,
  setShieldActive: (state: GameStore) => state.setShieldActive,
  triggerShieldBreak: (state: GameStore) => state.triggerShieldBreak,
  clearShieldState: (state: GameStore) => state.clearShieldState,
  triggerCollisionFlash: (state: GameStore) => state.triggerCollisionFlash,
  triggerDamageBlink: (state: GameStore) => state.triggerDamageBlink,
  triggerGameOver: (state: GameStore) => state.triggerGameOver,
  resetNonce: (state: GameStore) => state.resetNonce,
} as const;

export type GameStoreSelectorKey = keyof typeof gameStoreSelectors;

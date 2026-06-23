import type { GameStatus } from '../types';
import type { RunStatistics, ScoreSnapshot } from '../types';
import { EMPTY_PERSISTED_STATS, EMPTY_RUN_STATISTICS } from '../types';
import { HEALTH_CONFIG } from '../config';

/** Coin collection burst position for render effect. */
export interface CoinCollectEffect {
  readonly x: number;
  readonly y: number;
  readonly nonce: number;
}

/** Zustand store shape — Phase 4.2: coins + lifecycle. */
export interface GameStoreState {
  readonly status: GameStatus;
  readonly resetNonce: number;
  readonly collisionFlashNonce: number;
  readonly damageBlinkNonce: number;
  readonly health: number;
  readonly runCoins: number;
  readonly lifetimeCoins: number;
  readonly coinCollectEffect: CoinCollectEffect;
  readonly scoreSnapshot: ScoreSnapshot;
  readonly runStats: RunStatistics;
}

/** Zustand store actions — Phase 4.2. */
export interface GameStoreActions {
  readonly setStatus: (status: GameStatus) => void;
  readonly startPlaying: () => void;
  readonly pausePlaying: () => void;
  readonly resetToReady: () => void;
  readonly restartRun: () => void;
  readonly setScoreSnapshot: (snapshot: ScoreSnapshot) => void;
  readonly setRunStats: (runStats: RunStatistics) => void;
  readonly setHealth: (health: number) => void;
  readonly setRunCoins: (runCoins: number) => void;
  readonly setLifetimeCoins: (lifetimeCoins: number) => void;
  readonly triggerCoinCollect: (x: number, y: number) => void;
  readonly triggerCollisionFlash: () => void;
  readonly triggerDamageBlink: () => void;
  readonly triggerGameOver: () => void;
}

export type GameStore = GameStoreState & GameStoreActions;

export const INITIAL_SCORE_SNAPSHOT: ScoreSnapshot = {
  currentScore: 0,
  bestScore: EMPTY_PERSISTED_STATS.bestScore,
  distanceTraveled: 0,
};

export const INITIAL_RUN_STATS: RunStatistics = EMPTY_RUN_STATISTICS;

export const INITIAL_HEALTH = HEALTH_CONFIG.maxHealth;

export const INITIAL_COIN_COLLECT_EFFECT: CoinCollectEffect = {
  x: 0,
  y: 0,
  nonce: 0,
};

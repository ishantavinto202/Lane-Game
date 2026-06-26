import type { GameStatus } from '../types';
import type { RunStatistics, ScoreSnapshot } from '../types';
import { EMPTY_PERSISTED_STATS, EMPTY_RUN_STATISTICS } from '../types';
import { HEALTH_CONFIG } from '../config';

/** Independent floating score label spawned on coin pickup. */
export interface CoinScoreFloaterInstance {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly stackOffsetY: number;
  readonly sequence: number;
}

/** Independent floating label spawned on obstacle personality effect. */
export interface ObstacleEffectFloaterInstance {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly label: string;
  readonly stackOffsetY: number;
  readonly sequence: number;
}

/** Zustand store shape — Phase 4.2: coin pickups + lifecycle. Phase 4.3A: shield. */
export interface GameStoreState {
  readonly status: GameStatus;
  readonly resetNonce: number;
  readonly collisionFlashNonce: number;
  readonly damageBlinkNonce: number;
  readonly health: number;
  readonly coinScoreFloaters: readonly CoinScoreFloaterInstance[];
  readonly nextCoinScoreFloaterId: number;
  readonly obstacleEffectFloaters: readonly ObstacleEffectFloaterInstance[];
  readonly nextObstacleEffectFloaterId: number;
  readonly nextFloatingScoreSequence: number;
  readonly shieldActive: boolean;
  readonly shieldBreakNonce: number;
  readonly speedBoostActive: boolean;
  readonly speedBoostRemainingRatio: number;
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
  readonly triggerCoinCollect: (x: number, y: number) => void;
  readonly dismissCoinScoreFloater: (id: number) => void;
  readonly triggerObstacleEffectFloater: (x: number, y: number, label: string) => void;
  readonly dismissObstacleEffectFloater: (id: number) => void;
  readonly setShieldActive: (shieldActive: boolean) => void;
  readonly triggerShieldBreak: () => void;
  readonly clearShieldState: () => void;
  readonly setSpeedBoostState: (active: boolean, remainingRatio: number) => void;
  readonly clearSpeedBoostState: () => void;
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

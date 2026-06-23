import { POOL_CONSTANTS } from '../constants';

/** Global gameplay tuning values. */
export const GAME_CONFIG = {
  initialPhase: 'loading',
  autoStartAfterLoad: false,
  enableSwipeControls: true,
  enableSound: true,
  enableHaptics: true,
  debugDrawHitboxes: false,
} as const;

/** Score conversion and HUD throttling. */
export const SCORE_CONFIG = {
  pointsPerMeter: 1,
  metersPerPixel: 0.01,
  displayDecimals: 0,
  hudUpdateIntervalMs: 100,
  persistBestScoreImmediately: true,
} as const;

/** Difficulty ramp over a single run. */
export const DIFFICULTY_CONFIG = {
  baseSpeedPxPerSec: 320,
  maxSpeedPxPerSec: 720,
  speedRampSeconds: 120,
  baseSpawnIntervalMs: 1400,
  minSpawnIntervalMs: 650,
  spawnRampSeconds: 90,
  speedEasePower: 1.35,
  spawnEasePower: 1.2,
} as const;

/** Collision fairness tuning. */
export const COLLISION_CONFIG = {
  laneTolerancePx: 8,
  minOverlapArea: 120,
  useReducedHitboxes: true,
  hitboxScale: 0.82,
  checkEveryFrame: true,
} as const;

/** Obstacle spawn fairness and density. */
export const SPAWN_CONFIG = {
  initialDelayMs: 1200,
  minVerticalGapPx: 220,
  minLaneGapPx: 1,
  maxObstaclesOnScreen: POOL_CONSTANTS.MAX_OBSTACLES,
  maxDecorationsOnScreen: POOL_CONSTANTS.MAX_DECORATIONS,
  impossiblePatternWindowPx: 280,
  weightedRandomSeed: 'lane-game-spawn',
  decorationSpawnIntervalMs: 900,
  obstacleSpawnLaneRetryLimit: 6,
} as const;

/** Touch control behavior. */
export const CONTROLS_CONFIG = {
  debounceMs: 50,
  allowQueueDuringLaneChange: true,
  maxQueuedLaneChanges: 1,
  hapticOnPress: true,
  animatePressScale: true,
} as const;

/** Audio volumes (Phase 4 wiring). */
export const AUDIO_CONFIG = {
  masterVolume: 1,
  sfxVolume: 0.85,
  collisionVolume: 1,
  laneChangeVolume: 0.35,
} as const;

/** Player health and damage invulnerability (Phase 4.1). */
export const HEALTH_CONFIG = {
  maxHealth: 3,
  invulnerabilityMs: 1000,
  carBlinkCycleMs: 160,
} as const;

/** Coin spawn, collection, and pooling (Phase 4.2). */
export const COIN_CONFIG = {
  size: 38,
  maxActiveCoins: POOL_CONSTANTS.MAX_COINS,
  initialDelayMs: 900,
  minSpawnIntervalMs: 1100,
  maxSpawnIntervalMs: 2600,
  minVerticalGapPx: 160,
  /** Padding added to coin + obstacle visual bounds before spawn overlap test. */
  spawnClearancePx: 20,
  hitboxScale: 0.88,
  minCollectionOverlapArea: 41,
  collectEffectDurationMs: 220,
} as const;

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
  /** Points awarded each interval while actively playing. */
  pointsPerInterval: 5,
  pointsIntervalMs: 1000,
  /** Virtual scroll speed used to derive persisted run distance from survival time. */
  equivalentScrollSpeedPxPerSec: 320,
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
  openingShowcaseSpawnCount: 4,
  openingShowcaseSpawnIntervalMs: 900,
  /** Upward Y offsets (px) retried when spawn line is blocked by pickups or lane gaps. */
  obstacleSpawnYRetryOffsetsPx: [0, -40, -80, -120] as const,
} as const;

/** Touch control behavior. */
export const CONTROLS_CONFIG = {
  debounceMs: 50,
  allowQueueDuringLaneChange: true,
  maxQueuedLaneChanges: 1,
  hapticOnPress: true,
  animatePressScale: true,
  /** Minimum horizontal swipe distance before a lane change is accepted. */
  swipeMinDistancePx: 60,
  /** Horizontal travel must exceed vertical travel by this factor. */
  swipeHorizontalDominanceRatio: 1.5,
  /** Pan gesture activates after this horizontal movement (px). */
  swipeActiveOffsetX: 12,
  /** Pan gesture fails if vertical movement exceeds this before activation (px). */
  swipeFailOffsetY: 24,
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

/** Pre-run countdown before gameplay begins (Phase 5.1). */
export const COUNTDOWN_CONFIG = {
  stepDurationMs: 1000,
  goHoldMs: 600,
} as const;

/** Shared floating score popup timing, stacking, and colors. */
export const FLOATING_SCORE_FEEDBACK_CONFIG = {
  holdMs: 600,
  fadeMs: 300,
  floatPx: 30,
  stackSpacingPx: 16,
  positionTolerancePx: 20,
  fontSize: 26,
  positiveColor: '#34C759',
  negativeColor: '#FF3B30',
} as const;

/** Obstacle collision personalities (Phase 5.4 UI timing). */
export const OBSTACLE_PERSONALITY_CONFIG = {
  effectHoldMs: FLOATING_SCORE_FEEDBACK_CONFIG.holdMs,
  effectFadeMs: FLOATING_SCORE_FEEDBACK_CONFIG.fadeMs,
  effectFloatPx: FLOATING_SCORE_FEEDBACK_CONFIG.floatPx,
} as const;

/** Per-type health loss and score penalty on player collision (Phase 5.6). */
export const OBSTACLE_PENALTY_CONFIG = {
  OBSTACLE_CONE: { healthLoss: 0, scorePenalty: 30 },
  OBSTACLE_TIRE: { healthLoss: 0, scorePenalty: 40 },
  OBSTACLE_CRATE: { healthLoss: 1, scorePenalty: 20 },
  OBSTACLE_BARRIER: { healthLoss: 2, scorePenalty: 40 },
  OBSTACLE_PUDDLE: { healthLoss: 0, scorePenalty: 25 },
} as const;

/** Shared spawn spacing for coin, shield, and speed boost pickups. */
export const COLLECTIBLE_SPAWN_CONFIG = {
  /** Minimum edge-to-edge gap between any two active collectibles. */
  minCollectibleSpacingPx: 48,
  /** Base clearance added to every obstacle presentation bound before collectible spawn tests. */
  obstacleCollectibleBaseClearancePx: 12,
  /** Extra per-type clearance on top of base — wider/taller sprites get more breathing room. */
  obstacleCollectibleClearanceByType: {
    OBSTACLE_PUDDLE: 36,
    OBSTACLE_BARRIER: 28,
    OBSTACLE_CRATE: 18,
    OBSTACLE_TIRE: 18,
    OBSTACLE_CONE: 10,
  },
} as const;

/** Coin spawn, collection, and pooling (Phase 4.2). */
export const COIN_CONFIG = {
  size: 38,
  maxActiveCoins: POOL_CONSTANTS.MAX_COINS,
  initialDelayMs: 900,
  minSpawnIntervalMs: 1100,
  maxSpawnIntervalMs: 2600,
  minVerticalGapPx: 160,
  /** Padding added to obstacle visual bounds before spawn overlap test. */
  obstacleSafetyMarginPx: 25,
  /** Upward Y offsets (px) retried when spawn line is blocked. */
  spawnYRetryOffsetsPx: [0, -40, -80, -120] as const,
  hitboxScale: 0.88,
  minCollectionOverlapArea: 41,
  /** Full-opacity hold before fade-out (Phase 5.3 UI). */
  collectEffectHoldMs: FLOATING_SCORE_FEEDBACK_CONFIG.holdMs,
  /** Fade-out duration after hold. */
  collectEffectFadeMs: FLOATING_SCORE_FEEDBACK_CONFIG.fadeMs,
  /** Upward drift distance in px over the full effect. */
  collectEffectFloatPx: FLOATING_SCORE_FEEDBACK_CONFIG.floatPx,
  /** Score awarded immediately on pickup (Phase 5.3). */
  scoreReward: 20,
} as const;

/** Shield pickup spawn, collection, and pooling (Phase 4.3A). */
export const SHIELD_CONFIG = {
  size: 44,
  maxActivePickups: POOL_CONSTANTS.MAX_SHIELDS,
  initialDelayMs: 6000,
  minSpawnIntervalMs: 9000,
  maxSpawnIntervalMs: 18000,
  minVerticalGapPx: 220,
  obstacleSafetyMarginPx: 25,
  spawnYRetryOffsetsPx: [0, -40, -80, -120] as const,
  hitboxScale: 0.88,
  minCollectionOverlapArea: 45,
  breakEffectDurationMs: 240,
  /** Active shield duration after pickup — expires naturally or on first absorb. */
  durationMs: 10000,
  bubblePaddingPx: 24,
  /** Visual scale applied to the active shield bubble overlay (1 = base envelope). */
  bubbleDisplayScale: 1.15,
} as const;

/** Speed boost pickup spawn, collection, and active boost tuning (Phase 5.5). */
export const SPEED_BOOST_CONFIG = {
  size: 44,
  maxActivePickups: POOL_CONSTANTS.MAX_SPEED_BOOSTS,
  initialDelayMs: 8000,
  minSpawnIntervalMs: 12000,
  maxSpawnIntervalMs: 22000,
  minVerticalGapPx: 220,
  obstacleSafetyMarginPx: 25,
  spawnYRetryOffsetsPx: [0, -40, -80, -120] as const,
  hitboxScale: 0.88,
  minCollectionOverlapArea: 45,
  durationMs: 3000,
  speedMultiplier: 2,
  scoreRateMultiplier: 2,
} as const;

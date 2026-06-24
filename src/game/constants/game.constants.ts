/** Core gameplay counts and timing defaults. */
export const GAME_CONSTANTS = {
  LANE_COUNT: 3,
  TARGET_FPS: 60,
  FRAME_BUDGET_MS: 1000 / 60,
  MIN_LANE_INDEX: 0,
  MAX_LANE_INDEX: 2,
  PLAYER_SPAWN_LANE: 1,
  SCORE_DECIMALS: 0,
} as const;

/** Lane geometry derived from player/obstacle asset widths. */
export const LANE_CONSTANTS = {
  LANE_WIDTH: 100,
  LANE_SWITCH_DURATION_MS: 180,
  LANE_SWITCH_EASING: 'ease-out',
  MIN_TAP_INTERVAL_MS: 50,
} as const;

/** World scroll and entity lifecycle distances (px). */
export const WORLD_CONSTANTS = {
  PLAYER_Y_RATIO: 0.78,
  SPAWN_ABOVE_SCREEN_RATIO: 0.15,
  DESPAWN_BELOW_SCREEN_RATIO: 0.1,
  SCROLL_WRAP_TILE_COUNT: 3,
} as const;

/** AsyncStorage keys and schema version. */
export const STORAGE_CONSTANTS = {
  PLAYER_STATS_KEY: '@lane-game/player-stats',
  SETTINGS_KEY: '@lane-game/settings',
  SCHEMA_VERSION: 1,
} as const;

/** Audio asset identifiers (Phase 4 wiring). */
export const AUDIO_CONSTANTS = {
  COLLISION_SFX_ID: 'collision-impact',
  LANE_CHANGE_SFX_ID: 'lane-change-tap',
} as const;

/** Haptic feedback identifiers mapped to expo-haptics styles. */
export const HAPTICS_CONSTANTS = {
  LANE_CHANGE: 'light',
  COLLISION: 'heavy',
  BUTTON_PRESS: 'selection',
} as const;

/** UI control sizing and opacity. */
export const CONTROLS_CONSTANTS = {
  BUTTON_MIN_SIZE: 64,
  BUTTON_PADDING: 16,
  BUTTON_OPACITY: 0.55,
  BUTTON_ACTIVE_SCALE: 0.92,
  SWIPE_MIN_DISTANCE: 24,
  SWIPE_VELOCITY_THRESHOLD: 300,
} as const;

/** Player motion tuning for lane animation and tilt (Phase 2). */
export const PLAYER_MOTION_CONSTANTS = {
  TILT_DEGREES: 8,
  TILT_IN_MS: 90,
  TILT_OUT_MS: 90,
} as const;

/** Entity pool limits to bound memory usage. */
export const POOL_CONSTANTS = {
  MAX_OBSTACLES: 24,
  MAX_COINS: 12,
  MAX_SHIELDS: 4,
  MAX_SPEED_BOOSTS: 4,
  MAX_DECORATIONS: 32,
  MAX_SPAWN_HISTORY: 64,
} as const;

import { STORAGE_CONSTANTS } from '../constants';

/** AsyncStorage keys for the lane game module. */
export const PERSISTENCE_KEYS = {
  playerStats: STORAGE_CONSTANTS.PLAYER_STATS_KEY,
  settings: STORAGE_CONSTANTS.SETTINGS_KEY,
} as const;

export type PersistenceKey = (typeof PERSISTENCE_KEYS)[keyof typeof PERSISTENCE_KEYS];

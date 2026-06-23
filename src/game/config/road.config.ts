import {
  CONTROLS_CONSTANTS,
  GAME_CONSTANTS,
  LANE_CONSTANTS,
  WORLD_CONSTANTS,
} from '../constants';

/** Road, sidewalk, and grass color palette. */
export const ROAD_COLORS = {
  surface: '#4A4A4A',
  laneDivider: '#707070',
  sidewalkLight: '#D6D6D6',
  sidewalkDark: '#BDBDBD',
  grassA: '#5F9E4A',
  grassB: '#6BAE50',
  grassC: '#4E8A3D',
} as const;

/** Horizontal layout for road-adjacent regions. */
export const ROAD_LAYOUT = {
  sidewalkWidth: 40,
  grassWidth: 56,
  laneDividerWidth: 4,
  dividerDashLength: 32,
  dividerGapLength: 24,
} as const;

/** Tile dimensions for repeating sidewalk/grass patterns. */
export const ROAD_TILE = {
  sidewalkTileSize: 40,
  grassTileSize: 40,
  grassColorChoices: [
    ROAD_COLORS.grassA,
    ROAD_COLORS.grassB,
    ROAD_COLORS.grassC,
  ] as const,
  sidewalkColorPattern: [
    ROAD_COLORS.sidewalkLight,
    ROAD_COLORS.sidewalkDark,
  ] as const,
} as const;

/** Computes total world width from lane geometry. */
export const ROAD_WORLD = {
  get roadWidth(): number {
    return GAME_CONSTANTS.LANE_COUNT * LANE_CONSTANTS.LANE_WIDTH;
  },
  get totalWidth(): number {
    return (
      ROAD_LAYOUT.grassWidth * 2 +
      ROAD_LAYOUT.sidewalkWidth * 2 +
      this.roadWidth
    );
  },
} as const;

/** Scroll speed multipliers relative to base game speed. */
export const ROAD_SCROLL = {
  roadMultiplier: 1,
  sidewalkMultiplier: 1,
  grassMultiplier: 0.85,
  decorationMultiplier: 0.85,
  parallaxEnabled: true,
} as const;

/** Player anchor position helpers (computed at runtime from screen height). */
export const ROAD_PLAYER = {
  yRatio: WORLD_CONSTANTS.PLAYER_Y_RATIO,
  spawnLane: GAME_CONSTANTS.PLAYER_SPAWN_LANE,
} as const;

/** Control overlay placement relative to safe area. */
export const ROAD_CONTROLS = {
  bottomInsetPadding: CONTROLS_CONSTANTS.BUTTON_PADDING,
  horizontalInsetPadding: CONTROLS_CONSTANTS.BUTTON_PADDING,
  buttonSize: CONTROLS_CONSTANTS.BUTTON_MIN_SIZE,
} as const;

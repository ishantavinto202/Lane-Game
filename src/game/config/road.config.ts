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

/** Voxel road strip bitmaps — native 225×869, displayed at game road width (300). */
export const ROAD_IMAGE = {
  nativeWidth: 225,
  nativeHeight: 869,
  get displayWidth(): number {
    return ROAD_WORLD.roadWidth;
  },
  get segmentHeight(): number {
    return Math.round(
      (this.nativeHeight * this.displayWidth) / this.nativeWidth,
    );
  },
  /** Pre-built world segments after R_1 — enough for ~7 min at base scroll speed. */
  maxWorldSegments: 120,
  useVoxelArtwork: true,
} as const;

/** Voxel grass strip — native 28×843, displayed at grass lane width 56 (segment height 1686). */
export const GRASS_IMAGE = {
  nativeWidth: 28,
  nativeHeight: 843,
  displayWidth: ROAD_LAYOUT.grassWidth,
  get segmentHeight(): number {
    return Math.round(
      (this.nativeHeight * this.displayWidth) / this.nativeWidth,
    );
  },
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
  decorationMultiplier: 1.0,
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

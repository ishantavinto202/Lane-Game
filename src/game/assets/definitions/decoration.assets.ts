import type { ImageSourcePropType } from 'react-native';

import { DECORATION_CONFIG } from '../../config/decoration.config';

export interface TreeSkinDefinition {
  readonly source: ImageSourcePropType;
  readonly sourceWidth: number;
  readonly sourceHeight: number;
  readonly spriteWidth: number;
  readonly spriteHeight: number;
  readonly sourceBodyOffsetX: number;
  readonly sourceBodyOffsetY: number;
  readonly sourceBodyWidth: number;
  readonly sourceBodyHeight: number;
  readonly visualOffsetX: number;
  readonly visualOffsetY: number;
  readonly visualScale: number;
  /** Trunk center offset from body center in source pixels (+X = trunk right of body). */
  readonly trunkOffsetFromBodyCenterX: number;
  /** Visible trunk half-width in source pixels (used for grass-bound clamping). */
  readonly trunkHalfWidthPx: number;
}

export const TREE_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/voxel/Tree.png');

/** Palm tree — baked shadow extends left; trunk anchored on grass inner edge at runtime. */
export const TREE_SKIN: TreeSkinDefinition = {
  source: TREE_IMAGE_SOURCE,
  sourceWidth: 233,
  sourceHeight: 209,
  spriteWidth: 233,
  spriteHeight: 209,
  sourceBodyOffsetX: 38,
  sourceBodyOffsetY: 0,
  sourceBodyWidth: 156,
  sourceBodyHeight: 161,
  visualOffsetX: -(38 + 156 / 2),
  visualOffsetY: -(0 + 161 / 2),
  visualScale: Math.min(
    DECORATION_CONFIG.baseDisplayWidth / 233,
    DECORATION_CONFIG.baseDisplayHeight / 209,
  ),
  trunkOffsetFromBodyCenterX: 50,
  trunkHalfWidthPx: 16,
} as const;

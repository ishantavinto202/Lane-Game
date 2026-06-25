import type { ImageSourcePropType } from 'react-native';

/** Source bitmap — 225×213 voxel heart, rendered in HealthHud. */
export const HEART_FULL_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/voxel/Heart_Red.png');

/** Empty heart — 225×213 voxel heart, rendered in HealthHud. */
export const HEART_EMPTY_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/voxel/Heart_Grey.png');

/** HUD display size for heart icons (native 225×213). */
export const HEART_HUD_ICON = {
  width: 24,
  height: Math.round(24 * (213 / 225)),
} as const;

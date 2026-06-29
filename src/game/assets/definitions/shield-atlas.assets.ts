import type { ImageSourcePropType } from 'react-native';

import { SHIELD_CONFIG } from '../../config';
import {
  buildAtlasFrameLayouts,
  buildUniqueAtlasSpinFrames,
  type AtlasFrameLayout,
  type AtlasSpinFrame,
  type TexturePackerAtlas,
} from '../texture-atlas.build';

import shieldAtlasJson from '../../../../assets/Shield Animations/texture.json';

export type ShieldAtlasSpinFrame = AtlasSpinFrame;
export type ShieldAtlasFrameLayout = AtlasFrameLayout;

export const SHIELD_ATLAS_FPS = 18.85;

export const SHIELD_ATLAS_TEXTURE: ImageSourcePropType = require('../../../../assets/Shield Animations/texture.png');

const atlas = shieldAtlasJson as TexturePackerAtlas;

export const SHIELD_ATLAS_SPIN_FRAMES = buildUniqueAtlasSpinFrames(atlas);
export const SHIELD_ATLAS_FRAME_COUNT = SHIELD_ATLAS_SPIN_FRAMES.length;
export const SHIELD_ATLAS_FRAME_LAYOUTS = buildAtlasFrameLayouts(
  atlas,
  SHIELD_ATLAS_SPIN_FRAMES,
  SHIELD_CONFIG.size,
);

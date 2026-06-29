import type { ImageSourcePropType } from 'react-native';

import { SPEED_BOOST_CONFIG } from '../../config';
import {
  buildAtlasFrameLayouts,
  buildUniqueAtlasSpinFrames,
  type AtlasFrameLayout,
  type AtlasSpinFrame,
  type TexturePackerAtlas,
} from '../texture-atlas.build';

import speedBoostAtlasJson from '../../../../assets/Thunder Animations/texture.json';

export type SpeedBoostAtlasSpinFrame = AtlasSpinFrame;
export type SpeedBoostAtlasFrameLayout = AtlasFrameLayout;

export const SPEED_BOOST_ATLAS_FPS = 18.85;

export const SPEED_BOOST_ATLAS_TEXTURE: ImageSourcePropType = require('../../../../assets/Thunder Animations/texture.png');

const atlas = speedBoostAtlasJson as TexturePackerAtlas;

export const SPEED_BOOST_ATLAS_SPIN_FRAMES = buildUniqueAtlasSpinFrames(atlas);
export const SPEED_BOOST_ATLAS_FRAME_COUNT = SPEED_BOOST_ATLAS_SPIN_FRAMES.length;
export const SPEED_BOOST_ATLAS_FRAME_LAYOUTS = buildAtlasFrameLayouts(
  atlas,
  SPEED_BOOST_ATLAS_SPIN_FRAMES,
  SPEED_BOOST_CONFIG.size,
);

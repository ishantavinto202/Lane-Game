import type { ImageSourcePropType } from 'react-native';

import { COIN_CONFIG } from '../../config';
import {
  buildAtlasFrameLayouts,
  buildUniqueAtlasSpinFrames,
  type AtlasFrameLayout,
  type AtlasSpinFrame,
  type TexturePackerAtlas,
} from '../texture-atlas.build';

import coinAtlasJson from '../../../../assets/Coin Animations/texture.json';

export type CoinAtlasSpinFrame = AtlasSpinFrame;

export type CoinAtlasFrameLayout = AtlasFrameLayout;

export const COIN_ATLAS_FPS = 14.5;

/** Spin atlas — texture baked with +20% brightness and +20% contrast for in-game visibility. */
export const COIN_ATLAS_TEXTURE: ImageSourcePropType = require('../../../../assets/Coin Animations/texture.png');

const atlas = coinAtlasJson as TexturePackerAtlas;

export const COIN_ATLAS_SPIN_FRAMES = buildUniqueAtlasSpinFrames(atlas);
export const COIN_ATLAS_FRAME_COUNT = COIN_ATLAS_SPIN_FRAMES.length;
export const COIN_ATLAS_FRAME_LAYOUTS = buildAtlasFrameLayouts(
  atlas,
  COIN_ATLAS_SPIN_FRAMES,
  COIN_CONFIG.size,
);

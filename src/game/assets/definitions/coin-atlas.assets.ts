import type { ImageSourcePropType } from 'react-native';

import { COIN_CONFIG } from '../../config';

import coinAtlasJson from '../../../../assets/Coin Animations/texture.json';

interface TexturePackerFrameRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

interface TexturePackerFrameEntry {
  readonly frame: TexturePackerFrameRect;
  readonly rotated: boolean;
  readonly trimmed: boolean;
  readonly spriteSourceSize: TexturePackerFrameRect;
  readonly sourceSize: { readonly w: number; readonly h: number };
}

interface TexturePackerAtlas {
  readonly frames: Record<string, TexturePackerFrameEntry>;
  readonly meta: {
    readonly image: string;
    readonly size: { readonly w: number; readonly h: number };
    readonly scale: number;
  };
}

export interface CoinAtlasSpinFrame {
  readonly atlasX: number;
  readonly atlasY: number;
  readonly atlasW: number;
  readonly atlasH: number;
  readonly rotated: boolean;
  readonly sourceOffsetX: number;
  readonly sourceOffsetY: number;
  readonly sourceWidth: number;
  readonly sourceHeight: number;
}

export interface CoinAtlasFrameLayout {
  readonly imageWidth: number;
  readonly imageHeight: number;
  readonly left: number;
  readonly top: number;
  readonly transform: readonly (
    | { readonly rotate: string }
    | { readonly translateX: number }
  )[];
}

export const COIN_ATLAS_FPS = 14;

export const COIN_ATLAS_TEXTURE: ImageSourcePropType = require('../../../../assets/Coin Animations/texture.png');

const atlas = coinAtlasJson as TexturePackerAtlas;

function frameSortKey(name: string): number {
  const match = name.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function frameRectKey(entry: TexturePackerFrameEntry): string {
  const { frame, rotated } = entry;
  return `${frame.x},${frame.y},${frame.w},${frame.h},${rotated}`;
}

/** Unique spin frames in numeric order — duplicate atlas rects are skipped. */
function buildUniqueSpinFrames(): readonly CoinAtlasSpinFrame[] {
  const seen = new Set<string>();
  const frames: CoinAtlasSpinFrame[] = [];

  const sortedEntries = Object.entries(atlas.frames).sort(
    ([nameA], [nameB]) => frameSortKey(nameA) - frameSortKey(nameB),
  );

  for (const [, entry] of sortedEntries) {
    const key = frameRectKey(entry);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    frames.push({
      atlasX: entry.frame.x,
      atlasY: entry.frame.y,
      atlasW: entry.frame.w,
      atlasH: entry.frame.h,
      rotated: entry.rotated,
      sourceOffsetX: entry.spriteSourceSize.x,
      sourceOffsetY: entry.spriteSourceSize.y,
      sourceWidth: entry.spriteSourceSize.w,
      sourceHeight: entry.spriteSourceSize.h,
    });
  }

  return frames;
}

function buildFrameLayouts(
  spinFrames: readonly CoinAtlasSpinFrame[],
  displaySize: number,
): readonly CoinAtlasFrameLayout[] {
  const firstEntry = Object.values(atlas.frames)[0];
  const sourceSize = firstEntry?.sourceSize ?? { w: 259, h: 248 };

  const scale = Math.min(displaySize / sourceSize.w, displaySize / sourceSize.h);
  const canvasWidth = sourceSize.w * scale;
  const canvasHeight = sourceSize.h * scale;
  const canvasLeft = (displaySize - canvasWidth) / 2;
  const canvasTop = (displaySize - canvasHeight) / 2;
  const imageWidth = atlas.meta.size.w * scale;
  const imageHeight = atlas.meta.size.h * scale;

  return spinFrames.map((frame) => {
    const left = canvasLeft - frame.atlasX * scale + frame.sourceOffsetX * scale;
    const top = canvasTop - frame.atlasY * scale + frame.sourceOffsetY * scale;
    const transform: CoinAtlasFrameLayout['transform'] = [];

    if (frame.rotated) {
      transform.push({ translateX: frame.atlasH * scale });
      transform.push({ rotate: '-90deg' });
    }

    return {
      imageWidth,
      imageHeight,
      left,
      top,
      transform,
    };
  });
}

export const COIN_ATLAS_SPIN_FRAMES = buildUniqueSpinFrames();
export const COIN_ATLAS_FRAME_COUNT = COIN_ATLAS_SPIN_FRAMES.length;
export const COIN_ATLAS_FRAME_LAYOUTS = buildFrameLayouts(
  COIN_ATLAS_SPIN_FRAMES,
  COIN_CONFIG.size,
);

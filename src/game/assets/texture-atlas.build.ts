export interface TexturePackerFrameRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface TexturePackerFrameEntry {
  readonly frame: TexturePackerFrameRect;
  readonly rotated: boolean;
  readonly trimmed: boolean;
  readonly spriteSourceSize: TexturePackerFrameRect;
  readonly sourceSize: { readonly w: number; readonly h: number };
}

export interface TexturePackerAtlas {
  readonly frames: Record<string, TexturePackerFrameEntry>;
  readonly meta: {
    readonly image: string;
    readonly size: { readonly w: number; readonly h: number };
    readonly scale: number;
  };
}

export interface AtlasSpinFrame {
  readonly atlasX: number;
  readonly atlasY: number;
  readonly atlasW: number;
  readonly atlasH: number;
  readonly rotated: boolean;
  readonly sourceOffsetX: number;
  readonly sourceOffsetY: number;
  readonly sourceSizeW: number;
  readonly sourceSizeH: number;
}

export interface AtlasFrameLayout {
  readonly imageWidth: number;
  readonly imageHeight: number;
  readonly left: number;
  readonly top: number;
  readonly clipWidth: number;
  readonly clipHeight: number;
  readonly clipLeft: number;
  readonly clipTop: number;
  readonly transform: readonly (
    | { readonly rotate: string }
    | { readonly translateX: number }
  )[];
}

function frameRectKey(entry: TexturePackerFrameEntry): string {
  const { frame, rotated } = entry;
  return `${frame.x},${frame.y},${frame.w},${frame.h},${rotated}`;
}

export function atlasFrameSortKey(name: string): number {
  const match = name.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

/** Unique spin frames in numeric order — duplicate atlas rects are skipped. */
export function buildUniqueAtlasSpinFrames(atlas: TexturePackerAtlas): readonly AtlasSpinFrame[] {
  const seen = new Set<string>();
  const frames: AtlasSpinFrame[] = [];

  const sortedEntries = Object.entries(atlas.frames).sort(
    ([nameA], [nameB]) => atlasFrameSortKey(nameA) - atlasFrameSortKey(nameB),
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
      sourceSizeW: entry.sourceSize.w,
      sourceSizeH: entry.sourceSize.h,
    });
  }

  return frames;
}

/** Builds per-frame clip + atlas offsets for TexturePacker hash atlases (trim-aware). */
export function buildAtlasFrameLayouts(
  atlas: TexturePackerAtlas,
  spinFrames: readonly AtlasSpinFrame[],
  displaySize: number,
): readonly AtlasFrameLayout[] {
  return spinFrames.map((frame) => {
    const scale = Math.min(displaySize / frame.sourceSizeW, displaySize / frame.sourceSizeH);
    const clipWidth = frame.sourceSizeW * scale;
    const clipHeight = frame.sourceSizeH * scale;
    const clipLeft = (displaySize - clipWidth) / 2;
    const clipTop = (displaySize - clipHeight) / 2;
    const imageWidth = atlas.meta.size.w * scale;
    const imageHeight = atlas.meta.size.h * scale;
    const left = -frame.atlasX * scale + frame.sourceOffsetX * scale;
    const top = -frame.atlasY * scale + frame.sourceOffsetY * scale;
    const transform: AtlasFrameLayout['transform'] = frame.rotated
      ? [{ translateX: frame.atlasH * scale }, { rotate: '-90deg' }]
      : [];

    return {
      imageWidth,
      imageHeight,
      left,
      top,
      clipWidth,
      clipHeight,
      clipLeft,
      clipTop,
      transform,
    };
  });
}

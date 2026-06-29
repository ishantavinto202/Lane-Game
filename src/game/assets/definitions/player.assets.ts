import type { ImageSourcePropType } from 'react-native';

import { RenderLayer } from '../../types';
import type { PlayerAssetDefinition } from '../../types';

export interface PlayerCarSkinDefinition {
  readonly assetId: 'PLAYER_CAR';
  readonly source: ImageSourcePropType;
  readonly sourceWidth: number;
  readonly sourceHeight: number;
  readonly spriteWidth: number;
  readonly spriteHeight: number;
  readonly visualOffsetX: number;
  readonly visualOffsetY: number;
  readonly collisionBox: PlayerAssetDefinition['collisionBox'];
}

export const PLAYER_CAR_IMAGE_SOURCE: ImageSourcePropType = require('../../../../assets/voxel/CAR.png');

/** Default player skin. Its baked shadow extends left of the vehicle body. */
export const PLAYER_CAR_DEFAULT: PlayerCarSkinDefinition = {
  assetId: 'PLAYER_CAR',
  source: PLAYER_CAR_IMAGE_SOURCE,
  sourceWidth: 200,
  sourceHeight: 241,
  spriteWidth: 116,
  spriteHeight: 140,
  visualOffsetX: -72.52,
  visualOffsetY: -70,
  collisionBox: {
    offsetX: -30,
    offsetY: -55,
    width: 60,
    height: 110,
  },
} as const;

/** Player gameplay asset. Width/height remain body-sized; skin config owns sprite bounds. */
export const PLAYER_CAR_ASSET: PlayerAssetDefinition = {
  id: PLAYER_CAR_DEFAULT.assetId,
  width: 80,
  height: 140,
  anchor: 'center',
  layer: RenderLayer.Player,
  collidable: true,
  collisionBox: PLAYER_CAR_DEFAULT.collisionBox,
  visual: {
    kind: 'shape',
    primaryColor: '#7B2CBF',
    secondaryColor: '#5A189A',
    borderColor: '#3C096C',
    borderWidth: 2,
    cornerRadius: 10,
    label: 'PLAYER',
  },
} as const;

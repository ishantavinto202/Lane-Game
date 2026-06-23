import { RenderLayer } from '../../types';
import type { AssetDefinition } from '../../types';

/** Source bitmap — 323×323 voxel coin, rendered at COIN_CONFIG.size (38×38). */
export const COIN_IMAGE_SOURCE = require('../../../../assets/voxel/Coin.png');

/** Collectible coin — 38×38 display size with voxel artwork (20% smaller than base 48). */
export const COIN_ASSET: AssetDefinition = {
  id: 'COIN',
  width: 38,
  height: 38,
  anchor: 'center',
  layer: RenderLayer.Obstacle,
  collidable: true,
  collisionBox: {
    offsetX: -16,
    offsetY: -16,
    width: 32,
    height: 32,
  },
  visual: {
    kind: 'shape',
    primaryColor: '#FFD700',
    secondaryColor: '#FFC107',
    borderColor: '#B8860B',
    borderWidth: 3,
    cornerRadius: 19,
    label: '●',
  },
} as const;

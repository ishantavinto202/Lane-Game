import { RenderLayer } from '../../types';
import type { AssetDefinition } from '../../types';

/** Source bitmap — Blue Thunder voxel artwork, rendered at SPEED_BOOST_CONFIG.size (44×44). */
export const SPEED_BOOST_IMAGE_SOURCE = require('../../../../assets/Voxel asset guide/Blue_Thunder_Asset.png');

/** Collectible speed boost pickup — 44×44 display size with voxel artwork. */
export const SPEED_BOOST_ASSET: AssetDefinition = {
  id: 'SPEED_BOOST',
  width: 44,
  height: 44,
  anchor: 'center',
  layer: RenderLayer.Obstacle,
  collidable: true,
  collisionBox: {
    offsetX: -18,
    offsetY: -18,
    width: 36,
    height: 36,
  },
  visual: {
    kind: 'shape',
    primaryColor: '#FFD60A',
    secondaryColor: '#FF9F0A',
    borderColor: '#CC7A00',
    borderWidth: 3,
    cornerRadius: 22,
    label: '⚡',
  },
} as const;

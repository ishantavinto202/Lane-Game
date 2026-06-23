import { RenderLayer } from '../../types';
import type { PlayerAssetDefinition } from '../../types';

/** Player placeholder asset — swap artwork by replacing this config only. */
export const PLAYER_CAR_ASSET: PlayerAssetDefinition = {
  id: 'PLAYER_CAR',
  width: 80,
  height: 140,
  anchor: 'center',
  layer: RenderLayer.Player,
  collidable: true,
  collisionBox: {
    offsetX: -30,
    offsetY: -55,
    width: 60,
    height: 110,
  },
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

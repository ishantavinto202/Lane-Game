import { RenderLayer } from '../../types';
import type { AssetDefinition } from '../../types';

/** Collectible shield pickup — 44×44 blue energy orb. */
export const SHIELD_ASSET: AssetDefinition = {
  id: 'SHIELD',
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
    primaryColor: '#4FC3F7',
    secondaryColor: '#0288D1',
    borderColor: '#01579B',
    borderWidth: 3,
    cornerRadius: 22,
    label: '🛡',
  },
} as const;

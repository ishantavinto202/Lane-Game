import { memo } from 'react';
import { View } from 'react-native';

import type { ShieldRenderBridge } from '@/src/game/systems/shield/shield-motion.types';

import { ShieldSprite } from '../shield/ShieldSprite';

export interface ShieldLayerProps {
  readonly renderBridge: ShieldRenderBridge;
  readonly poolRevision: number;
}

function ShieldLayerComponent({ renderBridge, poolRevision }: ShieldLayerProps) {
  void poolRevision;

  return (
    <View pointerEvents="none" className="absolute inset-0">
      {renderBridge.slots.map((slot, index) => {
        const { meta } = slot;
        if (!meta.active) {
          return null;
        }

        return (
          <ShieldSprite
            key={`shield-slot-${index}`}
            slot={slot}
            width={meta.width}
            height={meta.height}
          />
        );
      })}
    </View>
  );
}

export const ShieldLayer = memo(ShieldLayerComponent);

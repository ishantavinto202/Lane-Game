import { memo } from 'react';
import { View } from 'react-native';

import type { SpeedBoostRenderBridge } from '@/src/game/systems/speed-boost/speed-boost-motion.types';

import { SpeedBoostSprite } from '../speed-boost/SpeedBoostSprite';

export interface SpeedBoostLayerProps {
  readonly renderBridge: SpeedBoostRenderBridge;
  readonly poolRevision: number;
}

function SpeedBoostLayerComponent({ renderBridge, poolRevision }: SpeedBoostLayerProps) {
  void poolRevision;

  return (
    <View pointerEvents="none" className="absolute inset-0">
      {renderBridge.slots.map((slot, index) => {
        const { meta } = slot;
        if (!meta.active) {
          return null;
        }

        return (
          <SpeedBoostSprite
            key={`speed-boost-slot-${index}`}
            slot={slot}
            width={meta.width}
            height={meta.height}
          />
        );
      })}
    </View>
  );
}

export const SpeedBoostLayer = memo(SpeedBoostLayerComponent);

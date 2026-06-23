import { memo } from 'react';
import { View } from 'react-native';

import type { ObstacleRenderBridge } from '@/src/game/systems/obstacle/obstacle-motion.types';

import { ObstacleSprite } from '../obstacle/ObstacleSprite';

export interface ObstacleLayerProps {
  readonly renderBridge: ObstacleRenderBridge;
  readonly poolRevision: number;
}

function ObstacleLayerComponent({ renderBridge, poolRevision }: ObstacleLayerProps) {
  void poolRevision;

  return (
    <View pointerEvents="none" className="absolute inset-0">
      {renderBridge.slots.map((slot, index) => {
        const { meta } = slot;
        if (!meta.active || !meta.assetId) {
          return null;
        }

        return (
          <ObstacleSprite
            key={`obstacle-slot-${index}`}
            slot={slot}
            assetId={meta.assetId}
            width={meta.width}
            height={meta.height}
          />
        );
      })}
    </View>
  );
}

export const ObstacleLayer = memo(ObstacleLayerComponent);

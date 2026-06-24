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
        if (!slot.active || !slot.assetId) {
          return null;
        }

        return (
          <ObstacleSprite
            key={`obstacle-slot-${index}`}
            x={slot.x}
            y={slot.y}
            opacity={slot.opacity}
            renderIndex={index}
            assetId={slot.assetId}
            width={slot.width}
            height={slot.height}
          />
        );
      })}
    </View>
  );
}

export const ObstacleLayer = memo(ObstacleLayerComponent);

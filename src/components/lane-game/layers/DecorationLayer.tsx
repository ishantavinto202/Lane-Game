import { memo } from 'react';
import { View } from 'react-native';

import type { DecorationRenderBridge } from '@/src/game/systems/decoration/decoration-motion.types';

import { TreeSprite } from '../decoration/TreeSprite';

export interface DecorationLayerProps {
  readonly renderBridge: DecorationRenderBridge;
  readonly poolRevision: number;
}

function DecorationLayerComponent({ renderBridge, poolRevision }: DecorationLayerProps) {
  void poolRevision;

  return (
    <View pointerEvents="none" className="absolute inset-0">
      {renderBridge.slots.map((slot, index) => {
        if (!slot.active) {
          return null;
        }

        return (
          <TreeSprite
            key={`decoration-slot-${index}`}
            x={slot.x}
            y={slot.y}
            opacity={slot.opacity}
            instanceScale={slot.scale}
          />
        );
      })}
    </View>
  );
}

export const DecorationLayer = memo(DecorationLayerComponent);

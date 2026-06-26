import { memo, useEffect } from 'react';
import { View } from 'react-native';

import type { CoinRenderBridge } from '@/src/game/systems/coin/coin-motion.types';

import { ensureCoinAnimationClock } from '../coin/coinAnimationClock';
import { CoinSprite } from '../coin/CoinSprite';

export interface CoinLayerProps {
  readonly renderBridge: CoinRenderBridge;
  readonly poolRevision: number;
}

function CoinLayerComponent({ renderBridge, poolRevision }: CoinLayerProps) {
  void poolRevision;

  useEffect(() => {
    ensureCoinAnimationClock();
  }, []);

  return (
    <View pointerEvents="none" className="absolute inset-0">
      {renderBridge.slots.map((slot, index) => {
        const { meta } = slot;
        if (!meta.active) {
          return null;
        }

        return (
          <CoinSprite
            key={`coin-slot-${index}`}
            slot={slot}
            width={meta.width}
            height={meta.height}
          />
        );
      })}
    </View>
  );
}

export const CoinLayer = memo(CoinLayerComponent);

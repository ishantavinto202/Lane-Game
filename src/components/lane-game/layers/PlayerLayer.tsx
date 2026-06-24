import { memo } from 'react';
import { View } from 'react-native';

import type { PlayerMotionSharedValues } from '@/src/game/systems/player/PlayerMotionController';
import type { PlayerSnapshot } from '@/src/game/systems/player/PlayerSystem';

import { PlayerCar } from '../player/PlayerCar';
import { ShieldBreakFlash } from '../shield/ShieldBreakFlash';
import { ShieldBubble } from '../shield/ShieldBubble';

export interface PlayerLayerProps {
  readonly snapshot: PlayerSnapshot;
  readonly motion: PlayerMotionSharedValues;
}

function PlayerLayerComponent({ snapshot, motion }: PlayerLayerProps) {
  return (
    <View pointerEvents="none" className="absolute inset-0">
      <PlayerCar motion={motion} snapshot={snapshot} />
      <ShieldBubble motion={motion} snapshot={snapshot} />
      <ShieldBreakFlash motion={motion} snapshot={snapshot} />
    </View>
  );
}

export const PlayerLayer = memo(PlayerLayerComponent);

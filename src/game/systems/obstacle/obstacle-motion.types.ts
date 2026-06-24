import type { SharedValue } from 'react-native-reanimated';

import type { ObstacleAssetId } from '../../types';

/** Per-slot shared values synced by ObstacleSystem each frame. */
export interface ObstacleRenderSlot {
  readonly x: SharedValue<number>;
  readonly y: SharedValue<number>;
  readonly opacity: SharedValue<number>;
  active: boolean;
  assetId: ObstacleAssetId | null;
  width: number;
  height: number;
}

/** Bridge between ObstacleSystem simulation and ObstacleLayer render. */
export interface ObstacleRenderBridge {
  readonly slots: readonly ObstacleRenderSlot[];
  readonly revision: { current: number };
  onRevisionChange?: () => void;
}

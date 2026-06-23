import type { SharedValue } from 'react-native-reanimated';

import type { ObstacleAssetId } from '../../types';

/** Mutable metadata for a pooled obstacle slot (updated on spawn/despawn only). */
export interface ObstacleSlotMeta {
  active: boolean;
  assetId: ObstacleAssetId | null;
  width: number;
  height: number;
}

/** Per-slot shared values synced by ObstacleSystem each frame. */
export interface ObstacleRenderSlot {
  readonly x: SharedValue<number>;
  readonly y: SharedValue<number>;
  readonly opacity: SharedValue<number>;
  readonly meta: ObstacleSlotMeta;
}

/** Bridge between ObstacleSystem simulation and ObstacleLayer render. */
export interface ObstacleRenderBridge {
  readonly slots: readonly ObstacleRenderSlot[];
  readonly revision: { current: number };
  onRevisionChange?: () => void;
}

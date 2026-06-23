import type { SharedValue } from 'react-native-reanimated';

/** Mutable metadata for a pooled coin slot (updated on spawn/despawn only). */
export interface CoinSlotMeta {
  active: boolean;
  width: number;
  height: number;
}

/** Per-slot shared values synced by CoinSystem each frame. */
export interface CoinRenderSlot {
  readonly x: SharedValue<number>;
  readonly y: SharedValue<number>;
  readonly opacity: SharedValue<number>;
  readonly meta: CoinSlotMeta;
}

/** Bridge between CoinSystem simulation and CoinLayer render. */
export interface CoinRenderBridge {
  readonly slots: readonly CoinRenderSlot[];
  readonly revision: { current: number };
  onRevisionChange?: () => void;
}

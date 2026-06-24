import type { SharedValue } from 'react-native-reanimated';

/** Mutable metadata for a pooled speed boost slot (updated on spawn/despawn only). */
export interface SpeedBoostSlotMeta {
  active: boolean;
  width: number;
  height: number;
}

/** Per-slot shared values synced by SpeedBoostSystem each frame. */
export interface SpeedBoostRenderSlot {
  readonly x: SharedValue<number>;
  readonly y: SharedValue<number>;
  readonly opacity: SharedValue<number>;
  readonly meta: SpeedBoostSlotMeta;
}

/** Bridge between SpeedBoostSystem simulation and SpeedBoostLayer render. */
export interface SpeedBoostRenderBridge {
  readonly slots: readonly SpeedBoostRenderSlot[];
  readonly revision: { current: number };
  onRevisionChange?: () => void;
}

import type { SharedValue } from 'react-native-reanimated';

/** Mutable metadata for a pooled shield pickup slot (updated on spawn/despawn only). */
export interface ShieldSlotMeta {
  active: boolean;
  width: number;
  height: number;
}

/** Per-slot shared values synced by ShieldSystem each frame. */
export interface ShieldRenderSlot {
  readonly x: SharedValue<number>;
  readonly y: SharedValue<number>;
  readonly opacity: SharedValue<number>;
  readonly meta: ShieldSlotMeta;
}

/** Bridge between ShieldSystem simulation and ShieldLayer render. */
export interface ShieldRenderBridge {
  readonly slots: readonly ShieldRenderSlot[];
  readonly revision: { current: number };
  onRevisionChange?: () => void;
}

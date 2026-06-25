import type { SharedValue } from 'react-native-reanimated';

export type DecorationSide = 'left' | 'right';

/** Per-slot shared values synced by DecorationSystem each frame. */
export interface DecorationRenderSlot {
  readonly x: SharedValue<number>;
  readonly y: SharedValue<number>;
  readonly opacity: SharedValue<number>;
  active: boolean;
  side: DecorationSide;
  scale: number;
}

/** Bridge between DecorationSystem simulation and DecorationLayer render. */
export interface DecorationRenderBridge {
  readonly slots: readonly DecorationRenderSlot[];
  readonly revision: { current: number };
  onRevisionChange?: () => void;
}

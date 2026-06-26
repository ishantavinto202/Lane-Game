import { Easing, makeMutable, withRepeat, withTiming } from 'react-native-reanimated';

import {
  COIN_ATLAS_FPS,
  COIN_ATLAS_FRAME_COUNT,
} from '@/src/game/assets/definitions/coin-atlas.assets';

/** Shared UI-thread frame index for all pooled coin sprites. */
export const coinAnimationFrame = makeMutable(0);

let clockStarted = false;

/** Starts one looping atlas clock — safe to call multiple times. */
export function ensureCoinAnimationClock(): void {
  if (clockStarted || COIN_ATLAS_FRAME_COUNT <= 0) {
    return;
  }

  clockStarted = true;
  const cycleMs = (COIN_ATLAS_FRAME_COUNT / COIN_ATLAS_FPS) * 1000;

  coinAnimationFrame.value = withRepeat(
    withTiming(COIN_ATLAS_FRAME_COUNT, {
      duration: cycleMs,
      easing: Easing.linear,
    }),
    -1,
    false,
  );
}

import { Easing, makeMutable, withRepeat, withTiming } from 'react-native-reanimated';

import {
  SHIELD_ATLAS_FPS,
  SHIELD_ATLAS_FRAME_COUNT,
} from '@/src/game/assets/definitions/shield-atlas.assets';

/** Shared UI-thread frame index for all shield atlas sprites (pickups + scoring guide). */
export const shieldAnimationFrame = makeMutable(0);

let clockStarted = false;

/** Starts one looping shield atlas clock — safe to call multiple times. */
export function ensureShieldAnimationClock(): void {
  if (clockStarted || SHIELD_ATLAS_FRAME_COUNT <= 0) {
    return;
  }

  clockStarted = true;
  const cycleMs = (SHIELD_ATLAS_FRAME_COUNT / SHIELD_ATLAS_FPS) * 1000;

  shieldAnimationFrame.value = withRepeat(
    withTiming(SHIELD_ATLAS_FRAME_COUNT, {
      duration: cycleMs,
      easing: Easing.linear,
    }),
    -1,
    false,
  );
}

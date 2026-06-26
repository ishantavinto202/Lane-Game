import { Easing, makeMutable, withRepeat, withTiming } from 'react-native-reanimated';

import {
  SPEED_BOOST_ATLAS_FPS,
  SPEED_BOOST_ATLAS_FRAME_COUNT,
} from '@/src/game/assets/definitions/speed-boost-atlas.assets';

/** Shared UI-thread frame index for all thunder atlas sprites (pickups + scoring guide). */
export const speedBoostAnimationFrame = makeMutable(0);

let clockStarted = false;

/** Starts (or restarts) the looping thunder atlas clock — safe to call multiple times. */
export function ensureSpeedBoostAnimationClock(): void {
  if (SPEED_BOOST_ATLAS_FRAME_COUNT <= 0) {
    return;
  }

  clockStarted = true;
  const cycleMs = (SPEED_BOOST_ATLAS_FRAME_COUNT / SPEED_BOOST_ATLAS_FPS) * 1000;

  speedBoostAnimationFrame.value = 0;
  speedBoostAnimationFrame.value = withRepeat(
    withTiming(SPEED_BOOST_ATLAS_FRAME_COUNT, {
      duration: cycleMs,
      easing: Easing.linear,
    }),
    -1,
    false,
  );
}

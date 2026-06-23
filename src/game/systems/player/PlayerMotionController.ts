import {
  cancelAnimation,
  Easing,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { LANE_CONSTANTS, PLAYER_MOTION_CONSTANTS } from '../../constants';
import type { GameLayout, LaneDirection, LaneIndex } from '../../types';

export interface PlayerMotionSharedValues {
  readonly x: SharedValue<number>;
  readonly y: SharedValue<number>;
  readonly tilt: SharedValue<number>;
}

/** UI-thread player motion — lane X transitions and tilt feedback. */
export class PlayerMotionController {
  private readonly x: SharedValue<number>;
  private readonly y: SharedValue<number>;
  private readonly tilt: SharedValue<number>;

  constructor(sharedValues: PlayerMotionSharedValues) {
    this.x = sharedValues.x;
    this.y = sharedValues.y;
    this.tilt = sharedValues.tilt;
  }

  getSharedValues(): PlayerMotionSharedValues {
    return {
      x: this.x,
      y: this.y,
      tilt: this.tilt,
    };
  }

  initialize(layout: GameLayout, lane: LaneIndex): void {
    cancelAnimation(this.x);
    cancelAnimation(this.tilt);

    this.x.value = layout.laneCenters[lane];
    this.y.value = layout.playerY;
    this.tilt.value = 0;
  }

  /**
   * Interrupt-safe lane animation — always eases from the current X to the exact lane center.
   * Rapid taps retarget mid-animation without positional drift.
   */
  animateToLane(targetX: number, direction: LaneDirection): void {
    cancelAnimation(this.x);
    cancelAnimation(this.tilt);

    this.x.value = withTiming(targetX, {
      duration: LANE_CONSTANTS.LANE_SWITCH_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });

    const tiltDegrees =
      direction === 'left'
        ? -PLAYER_MOTION_CONSTANTS.TILT_DEGREES
        : PLAYER_MOTION_CONSTANTS.TILT_DEGREES;

    this.tilt.value = withSequence(
      withTiming(tiltDegrees, { duration: PLAYER_MOTION_CONSTANTS.TILT_IN_MS }),
      withTiming(0, { duration: PLAYER_MOTION_CONSTANTS.TILT_OUT_MS }),
    );
  }

  reset(layout: GameLayout, lane: LaneIndex): void {
    cancelAnimation(this.x);
    cancelAnimation(this.tilt);
    this.initialize(layout, lane);
  }

  dispose(): void {
    cancelAnimation(this.x);
    cancelAnimation(this.tilt);
  }
}

export type { PlayerMotionSharedValues as PlayerMotionValues };

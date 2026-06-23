import type { LaneDirection } from '../../types';

/** Source of a lane-change input (extensible for swipe in a later phase). */
export type InputSource = 'button' | 'swipe';

/** Result of a lane-change request routed through InputManager. */
export interface LaneChangeResult {
  readonly accepted: boolean;
  readonly fromLane: number;
  readonly toLane: number;
  readonly targetX: number;
  readonly direction: LaneDirection;
}

/** Contract for centralized player input routing. */
export interface InputManagerContract {
  readonly requestLaneChange: (
    direction: LaneDirection,
    source?: InputSource,
  ) => boolean;
  readonly setEnabled: (enabled: boolean) => void;
  readonly reset: () => void;
  readonly dispose: () => void;
}

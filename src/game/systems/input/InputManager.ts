import * as Haptics from 'expo-haptics';

import { CONTROLS_CONFIG, GAME_CONFIG } from '../../config';
import type { GameLayout, LaneDirection } from '../../types';
import type { LaneSystem } from '../lane/LaneSystem';
import type { PlayerMotionController } from '../player/PlayerMotionController';
import type { PlayerSystem } from '../player/PlayerSystem';

import type { InputManagerContract, InputSource, LaneChangeResult } from './input.types';

export interface InputManagerOptions {
  readonly playerSystem: PlayerSystem;
  readonly laneSystem: LaneSystem;
  readonly motionController: PlayerMotionController;
}

/**
 * Central input router — all lane movement requests flow through here.
 * Button and future swipe controls share the same path.
 */
export class InputManager implements InputManagerContract {
  readonly id = 'input-manager' as const;

  private readonly playerSystem: PlayerSystem;
  private readonly laneSystem: LaneSystem;
  private readonly motionController: PlayerMotionController;
  private enabled = false;
  private layout: GameLayout | null = null;
  private lastRequestAt = 0;

  constructor(options: InputManagerOptions) {
    this.playerSystem = options.playerSystem;
    this.laneSystem = options.laneSystem;
    this.motionController = options.motionController;
  }

  initialize(layout: GameLayout): void {
    this.layout = layout;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  requestLaneChange(direction: LaneDirection, _source: InputSource = 'button'): boolean {
    if (!this.enabled || !this.layout) {
      return false;
    }

    const now = Date.now();
    if (now - this.lastRequestAt < CONTROLS_CONFIG.debounceMs) {
      return false;
    }

    const result = this.playerSystem.tryLaneChange(direction);
    if (!result.accepted) {
      return false;
    }

    this.lastRequestAt = now;
    this.motionController.animateToLane(result.targetX, direction);
    this.triggerHaptic();

    return true;
  }

  reset(): void {
    if (!this.layout) {
      return;
    }

    this.lastRequestAt = 0;
    this.playerSystem.reset();
    this.motionController.reset(this.layout, this.playerSystem.getLane());
  }

  dispose(): void {
    this.layout = null;
    this.enabled = false;
    this.lastRequestAt = 0;
  }

  /** Exposed for tests and future swipe gesture wiring. */
  evaluateLaneChange(direction: LaneDirection): LaneChangeResult {
    return this.playerSystem.tryLaneChange(direction);
  }

  private triggerHaptic(): void {
    if (!GAME_CONFIG.enableHaptics || !CONTROLS_CONFIG.hapticOnPress) {
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

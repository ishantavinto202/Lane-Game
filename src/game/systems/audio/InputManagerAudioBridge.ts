import type { LaneDirection } from '../../types';
import type { InputManager } from '../input/InputManager';
import type { InputManagerContract, InputSource } from '../input/input.types';

import type { AudioManagerContract } from './audio.contract';

/** Wraps InputManager lane success with SFX without modifying InputManager. */
export class InputManagerAudioBridge implements InputManagerContract {
  readonly id = 'input-manager-audio-bridge' as const;

  constructor(
    private readonly delegate: InputManager,
    private readonly audioManager: AudioManagerContract,
  ) {}

  setEnabled(enabled: boolean): void {
    this.delegate.setEnabled(enabled);
  }

  requestLaneChange(direction: LaneDirection, source: InputSource = 'button'): boolean {
    const accepted = this.delegate.requestLaneChange(direction, source);

    if (accepted) {
      this.audioManager.playLaneChange();
    }

    return accepted;
  }

  reset(): void {
    this.delegate.reset();
  }

  dispose(): void {
    this.delegate.dispose();
  }
}

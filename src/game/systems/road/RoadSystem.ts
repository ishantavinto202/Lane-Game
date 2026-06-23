import type { SharedValue } from 'react-native-reanimated';

import { ENGINE_CONFIG, ROAD_SCROLL } from '../../config';
import type { ScrollSharedValues } from '../../types';

export interface RoadSystemOptions {
  readonly scrollY: SharedValue<number>;
}

/** Infinite road scroll system — updates shared values on the UI thread path. */
export class RoadSystem {
  readonly id = 'road-system' as const;

  private readonly scrollY: SharedValue<number>;
  private offsetRef = { current: 0 };
  private speedPxPerSec: number = ENGINE_CONFIG.baseScrollSpeedPxPerSec;

  constructor(options: RoadSystemOptions) {
    this.scrollY = options.scrollY;
  }

  getScrollValues(): ScrollSharedValues {
    return {
      roadOffsetY: this.scrollY,
      sidewalkOffsetY: this.scrollY,
      grassOffsetY: this.scrollY,
      decorationOffsetY: this.scrollY,
    };
  }

  setSpeed(speedPxPerSec: number): void {
    this.speedPxPerSec = speedPxPerSec;
  }

  updateScroll(deltaMs: number): void {
    const clampedDelta = Math.min(deltaMs, ENGINE_CONFIG.maxDeltaMs);
    const roadDelta =
      (this.speedPxPerSec * clampedDelta * ROAD_SCROLL.roadMultiplier) / 1000;
    const grassDelta =
      (this.speedPxPerSec * clampedDelta * ROAD_SCROLL.grassMultiplier) / 1000;

    this.offsetRef.current += roadDelta;
    this.scrollY.value = this.offsetRef.current;

    // Grass/sidewalk use the same shared value in Phase 1; multipliers applied at render if needed.
    void grassDelta;
  }

  reset(): void {
    this.offsetRef.current = 0;
    this.scrollY.value = 0;
  }

  dispose(): void {
    this.reset();
  }
}

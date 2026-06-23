import type { ScrollSharedValues } from '../../types';

/** Infinite road scrolling contract (Phase 2 implementation). */
export interface RoadSystemContract {
  readonly id: 'road-system';
  readonly getScrollValues: () => ScrollSharedValues;
  readonly updateScroll: (deltaMs: number, speedPxPerSec: number) => void;
  readonly reset: () => void;
  readonly dispose: () => void;
}

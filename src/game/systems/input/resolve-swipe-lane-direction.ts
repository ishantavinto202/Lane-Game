import { CONTROLS_CONFIG } from '../../config';
import type { LaneDirection } from '../../types';

/** Resolves a completed horizontal swipe into a single lane direction, or null if invalid. */
export function resolveSwipeLaneDirection(
  translationX: number,
  translationY: number,
): LaneDirection | null {
  const absX = Math.abs(translationX);
  const absY = Math.abs(translationY);

  if (absX < CONTROLS_CONFIG.swipeMinDistancePx) {
    return null;
  }

  if (absX < absY * CONTROLS_CONFIG.swipeHorizontalDominanceRatio) {
    return null;
  }

  return translationX < 0 ? 'left' : 'right';
}

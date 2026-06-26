import { FLOATING_SCORE_FEEDBACK_CONFIG } from '../config';

export interface FloatingScoreAnchor {
  readonly x: number;
  readonly y: number;
  readonly stackOffsetY: number;
}

/** Assigns the next vertical slot when multiple floaters share the same anchor. */
export function resolveFloatingScoreStackOffsetY(
  x: number,
  y: number,
  activeFloaters: readonly FloatingScoreAnchor[],
): number {
  const { stackSpacingPx, positionTolerancePx } = FLOATING_SCORE_FEEDBACK_CONFIG;
  const nearbyCount = activeFloaters.filter(
    (floater) =>
      Math.abs(floater.x - x) <= positionTolerancePx &&
      Math.abs(floater.y - y) <= positionTolerancePx,
  ).length;

  return nearbyCount * stackSpacingPx;
}

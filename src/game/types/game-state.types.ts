/** Game lifecycle status managed by Zustand. */
export enum GameStatus {
  Ready = 'ready',
  Playing = 'playing',
  Paused = 'paused',
  GameOver = 'game-over',
}

/** @deprecated Use GameStatus. Reserved for later phases. */
export enum GamePhase {
  Ready = 'ready',
  Playing = 'playing',
  Paused = 'paused',
}

/** Discrete lane indices. Lane 0 is leftmost playable lane. */
export type LaneIndex = 0 | 1 | 2;

/** Direction of a lane change request (Phase 2+). */
export type LaneDirection = 'left' | 'right';

/** Horizontal bounds of a single lane. */
export interface LaneBounds {
  readonly left: number;
  readonly right: number;
  readonly centerX: number;
}

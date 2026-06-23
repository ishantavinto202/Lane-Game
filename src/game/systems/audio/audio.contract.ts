/** Audio feedback contract (Phase 4). */
export interface AudioManagerContract {
  readonly preload: () => Promise<void>;
  readonly playLaneChange: () => void;
  readonly playCollision: () => void;
  readonly playGameOver: () => void;
  readonly dispose: () => void;
}

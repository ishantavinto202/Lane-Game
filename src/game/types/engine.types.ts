import type { GamePhase } from './game-state.types';
import type { DifficultyRuntime } from './difficulty.types';
import type { EntityRefs } from './entity.types';
import type { GameLayout } from './render.types';
import type { ScoreSnapshot } from './score.types';

/** Frame delta passed into deterministic simulation steps. */
export interface FrameTick {
  readonly deltaMs: number;
  readonly timestamp: number;
  readonly elapsedMs: number;
}

/** Engine-owned mutable runtime state stored in refs (never React state). */
export interface EngineRuntimeState {
  readonly layout: GameLayout;
  readonly entities: EntityRefs;
  readonly difficulty: DifficultyRuntime;
  readonly distanceTraveled: number;
  readonly isRunning: boolean;
  readonly lastCollisionAt: number | null;
}

/** Events emitted from engine to store/UI layers. */
export type EngineEvent =
  | { readonly type: 'phase-change'; readonly phase: GamePhase }
  | { readonly type: 'collision'; readonly timestamp: number }
  | { readonly type: 'score-update'; readonly snapshot: ScoreSnapshot }
  | { readonly type: 'run-started'; readonly runId: string }
  | { readonly type: 'run-ended'; readonly snapshot: ScoreSnapshot };

/** Contract implemented by the game engine orchestrator (Phase 2+). */
export interface GameEngineContract {
  readonly startRun: () => void;
  readonly pauseRun: () => void;
  readonly resumeRun: () => void;
  readonly endRun: () => void;
  readonly resetRun: () => void;
  readonly requestLaneChange: (direction: 'left' | 'right') => void;
  readonly tick: (frame: FrameTick) => void;
  readonly dispose: () => void;
}

/** Contract for subsystems registered with the engine. */
export interface GameSystemContract {
  readonly id: string;
  readonly initialize: (layout: GameLayout) => void;
  readonly reset: () => void;
  readonly update: (frame: FrameTick, runtime: EngineRuntimeState) => void;
  readonly dispose: () => void;
}

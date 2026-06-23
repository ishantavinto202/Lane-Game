import type {
  EngineEvent,
  FrameTick,
  GameEngineContract,
  GameLayout,
  GamePhase,
  GameSystemContract,
} from '../../types';

/** Central orchestrator contract — owns refs, rAF loop, and system coordination. */
export interface GameEngineOrchestrator extends GameEngineContract {
  readonly getPhase: () => GamePhase;
  readonly getLayout: () => GameLayout;
  readonly registerSystem: (system: GameSystemContract) => void;
  readonly subscribe: (listener: (event: EngineEvent) => void) => () => void;
  readonly initialize: (layout: GameLayout) => void;
  readonly tick: (frame: FrameTick) => void;
}

export type { GameEngineContract, GameSystemContract } from '../../types';

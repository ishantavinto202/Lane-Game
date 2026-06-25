export type { LaneSystemContract } from './lane/lane.contract';
export { LaneSystem } from './lane/LaneSystem';

export type { InputManagerContract, InputSource, LaneChangeResult } from './input';
export { InputManager } from './input';

export type { RoadSystemContract } from './road/road.contract';
export { RoadSystem } from './road/RoadSystem';

export type { PlayerSystemContract } from './player/player.contract';
export { PlayerSystem } from './player/PlayerSystem';
export type { PlayerSnapshot } from './player/PlayerSystem';
export { PlayerMotionController } from './player/PlayerMotionController';
export type { PlayerMotionSharedValues } from './player/PlayerMotionController';

export type { ObstacleSystemContract } from './obstacle/obstacle.contract';
export { ObstacleSystem } from './obstacle/ObstacleSystem';
export type { ObstacleRenderBridge, ObstacleRenderSlot } from './obstacle/obstacle-motion.types';
export {
  resolveObstacleCollisionEffect,
  type ObstacleCollisionEffect,
} from './obstacle/obstacle-effect.resolver';

export type { CollisionSystemContract } from './collision/collision.contract';
export {
  CollisionSystem,
  createObstacleCollisionProbes,
  createPlayerCollisionProbe,
} from './collision/CollisionSystem';

export type { ScoreSystemContract } from './score/score.contract';
export { ScoreSystem } from './score/ScoreSystem';

export type { HealthSystemContract } from './health/health.contract';
export { HealthSystem } from './health/HealthSystem';

export type { CoinSystemContract } from './coin/coin.contract';
export { CoinSystem, createCoinCollisionProbes } from './coin/CoinSystem';
export type { CoinRenderBridge, CoinRenderSlot } from './coin/coin-motion.types';

export type { ShieldSystemContract } from './shield/shield.contract';
export { ShieldSystem, createShieldCollisionProbes } from './shield/ShieldSystem';
export type { ShieldRenderBridge, ShieldRenderSlot } from './shield/shield-motion.types';

export type { SpeedBoostSystemContract } from './speed-boost/speed-boost.contract';
export {
  SpeedBoostSystem,
  createSpeedBoostCollisionProbes,
} from './speed-boost/SpeedBoostSystem';
export { SpeedBoostRuntime } from './speed-boost/SpeedBoostRuntime';
export type {
  SpeedBoostRenderBridge,
  SpeedBoostRenderSlot,
} from './speed-boost/speed-boost-motion.types';

export type { DecorationSystemContract } from './decoration/decoration.contract';
export { DecorationSystem } from './decoration/DecorationSystem';
export type {
  DecorationRenderBridge,
  DecorationRenderSlot,
  DecorationSide,
} from './decoration/decoration-motion.types';

export type { AudioManagerContract } from './audio/audio.contract';
export { AudioManager } from './audio/AudioManager';
export { InputManagerAudioBridge } from './audio/InputManagerAudioBridge';

export type { GameEngineOrchestrator } from './engine/engine.contract';

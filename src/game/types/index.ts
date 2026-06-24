export {
  GameStatus,
  GamePhase,
} from './game-state.types';

export type {
  LaneBounds,
  LaneDirection,
  LaneIndex,
} from './game-state.types';

export type {
  AnchorPoint,
  AssetDefinition,
  AssetId,
  CollisionBox,
  ObstacleAssetDefinition,
  ObstacleAssetId,
  PlaceholderVisual,
  PlayerAssetDefinition,
  Rect,
  RoadAssetDefinition,
  RoadAssetId,
  SpawnRegion,
  SpawnRule,
} from './asset.types';

export {
  RenderLayer,
} from './asset.types';

export type {
  BaseEntity,
  CoinEntity,
  EntityId,
  EntityRefs,
  ObstacleEntity,
  PlayerEntity,
  ShieldEntity,
} from './entity.types';

export type {
  EngineEvent,
  EngineRuntimeState,
  FrameTick,
  GameEngineContract,
  GameSystemContract,
} from './engine.types';

export type {
  GameLayout,
  LaneCenterMap,
  ScrollSharedValues,
} from './render.types';

export type {
  PersistedPlayerStats,
  RunStatistics,
  ScorePolicy,
  ScoreSnapshot,
} from './score.types';

export {
  EMPTY_PERSISTED_STATS,
  EMPTY_RUN_STATISTICS,
} from './score.types';

export type {
  SpawnContext,
  SpawnDecision,
  SpawnHistoryEntry,
  SpawnRejectionReason,
  SpawnSlot,
} from './spawn.types';

export type {
  CollisionEvent,
  CollisionPolicy,
  CollisionProbe,
  WorldBounds,
} from './collision.types';

export type {
  DifficultyCurve,
  DifficultyRuntime,
} from './difficulty.types';

export type {
  HealthSnapshot,
} from './health.types';

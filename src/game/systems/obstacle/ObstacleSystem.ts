import { OBSTACLE_ASSET_MAP } from '../../assets/definitions/obstacle.assets';
import { GAME_CONSTANTS, POOL_CONSTANTS } from '../../constants';
import { COIN_CONFIG, SPAWN_CONFIG } from '../../config';
import type {
  CoinEntity,
  GameLayout,
  LaneIndex,
  ObstacleAssetId,
  ObstacleEntity,
  ShieldEntity,
  SpawnContext,
  SpawnDecision,
  SpawnHistoryEntry,
  WorldBounds,
} from '../../types';
import { evaluateDifficulty } from '../../utils/difficulty';
import type { LaneSystem } from '../lane/LaneSystem';
import {
  boundsIntersect,
  computeEntityVisualBounds,
  expandWorldBounds,
  type PickupBoundsSource,
} from '../coin/coin-spawn-debug';

import type { ObstacleRenderBridge } from './obstacle-motion.types';
import { ObstacleSpawnBag } from './obstacle-spawn-bag';
import {
  ObstacleSpawnDebugTracker,
  ObstacleTypeSpawnAuditTracker,
  type ObstacleSkipReasonKey,
} from './obstacle-spawn-debug';

interface MutableObstacleSlot {
  id: string;
  active: boolean;
  assetId: ObstacleAssetId;
  lane: LaneIndex;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  renderIndex: number;
}

type ObstacleRemovalReason = 'collision' | 'despawn';

let nextEntityId = 0;

function createEntityId(): string {
  nextEntityId += 1;
  return `obstacle-${nextEntityId}`;
}

/** Spawns and moves lane obstacles with object pooling and fair lane gaps. */
export class ObstacleSystem {
  readonly id = 'obstacle-system' as const;

  private layout: GameLayout | null = null;
  private laneSystem: LaneSystem | null = null;
  private readonly renderBridge: ObstacleRenderBridge;
  private readonly spawnBag = new ObstacleSpawnBag();
  private readonly spawnDebug = new ObstacleSpawnDebugTracker();
  private readonly typeAudit = new ObstacleTypeSpawnAuditTracker();
  private readonly pool: MutableObstacleSlot[] = [];
  private readonly activeIds = new Set<string>();
  private spawnHistory: SpawnHistoryEntry[] = [];
  private spawnAccumulatorMs = 0;
  private openingShowcaseSpawnCount = 0;
  private elapsedMs = 0;
  private lastRenderSlotStateLogMs = 0;

  constructor(renderBridge: ObstacleRenderBridge) {
    this.renderBridge = renderBridge;
  }

  initialize(layout: GameLayout, laneSystem: LaneSystem): void {
    this.layout = layout;
    this.laneSystem = laneSystem;
    this.reset();
  }

  planSpawn(
    context: SpawnContext,
    activeCoins: readonly CoinEntity[],
    activeShields: readonly ShieldEntity[],
  ): SpawnDecision {
    this.typeAudit.onSpawnAttempt();

    if (context.obstacleCount >= SPAWN_CONFIG.maxObstaclesOnScreen) {
      this.typeAudit.recordMaxObstacleCount();
      return {
        accepted: false,
        assetId: null,
        slot: null,
        reason: 'max-concurrent-reached',
      };
    }

    const baseSpawnY = this.layout?.spawnY ?? context.nextSpawnY;
    const selectedType = this.spawnBag.pullNext();

    this.typeAudit.recordSelected(selectedType);

    const asset = OBSTACLE_ASSET_MAP[selectedType];

    for (const yOffset of SPAWN_CONFIG.obstacleSpawnYRetryOffsetsPx) {
      const spawnY = baseSpawnY + yOffset;

      for (let attempt = 0; attempt < SPAWN_CONFIG.obstacleSpawnLaneRetryLimit; attempt += 1) {
        const lane = this.pickFairLane(spawnY, selectedType);

        if (lane === null) {
          this.typeAudit.recordRetryFailure(
            selectedType,
            this.diagnosePickFairLaneFailure(spawnY, selectedType),
          );
          continue;
        }

        const resolvedY = this.resolveSpawnY(spawnY, asset.height);
        const obstacleBounds = this.computeSpawnObstacleBounds(
          lane,
          resolvedY,
          asset.width,
          asset.height,
        );

        if (this.findSpawnPickupConflict(obstacleBounds, activeCoins, activeShields)) {
          this.typeAudit.recordRetryFailure(
            selectedType,
            this.diagnosePickupConflict(obstacleBounds, activeCoins, activeShields),
          );
          continue;
        }

        this.typeAudit.recordSpawned(selectedType);

        this.spawnDebug.record({
          selectedType,
          spawnedType: selectedType,
          fallbackUsed: false,
          skipped: false,
        });

        return {
          accepted: true,
          assetId: selectedType,
          slot: {
            lane,
            y: resolvedY,
            region: 'road',
          },
          reason: null,
        };
      }
    }

    this.spawnBag.returnType(selectedType);

    this.typeAudit.recordSkipped(selectedType);

    this.spawnDebug.record({
      selectedType,
      spawnedType: null,
      fallbackUsed: false,
      skipped: true,
    });

    return {
      accepted: false,
      assetId: null,
      slot: null,
      reason: 'no-valid-slot',
    };
  }

  updateObstacles(
    deltaMs: number,
    speedPxPerSec: number,
    activeCoins: readonly CoinEntity[],
    activeShields: readonly ShieldEntity[],
  ): readonly ObstacleEntity[] {
    if (!this.layout || !this.laneSystem) {
      return [];
    }

    this.elapsedMs += deltaMs;
    const difficulty = evaluateDifficulty(this.elapsedMs);
    this.spawnAccumulatorMs += deltaMs;

    while (true) {
      const spawnIntervalMs = this.getCurrentSpawnIntervalMs(difficulty.spawnIntervalMs);
      if (this.spawnAccumulatorMs < spawnIntervalMs) {
        break;
      }

      this.spawnAccumulatorMs -= spawnIntervalMs;
      this.trySpawn(speedPxPerSec, activeCoins, activeShields);
    }

    const deltaPx = (speedPxPerSec * deltaMs) / 1000;

    for (const slot of this.pool) {
      if (!slot.active) {
        continue;
      }

      slot.y += deltaPx;
      slot.speed = speedPxPerSec;

      if (slot.y > this.layout.despawnY) {
        this.deactivateSlot(slot, 'despawn');
        continue;
      }

      this.syncRenderSlot(slot);
    }

    this.logRenderSlotStateIfDue();

    return this.getActiveEntities();
  }

  getActiveObstacles(): readonly ObstacleEntity[] {
    return this.getActiveEntities();
  }

  removeObstacleById(
    obstacleId: string,
    reason: ObstacleRemovalReason = 'collision',
  ): boolean {
    const slot = this.pool.find((entry) => entry.active && entry.id === obstacleId);
    if (!slot) {
      return false;
    }

    this.deactivateSlot(slot, reason);
    return true;
  }

  reset(): void {
    for (const slot of this.pool) {
      if (slot.active) {
        this.deactivateSlot(slot);
      }
    }

    this.pool.length = 0;
    this.activeIds.clear();
    this.spawnHistory = [];
    this.spawnBag.reset();
    this.spawnDebug.reset();
    this.typeAudit.reset();
    this.spawnAccumulatorMs = SPAWN_CONFIG.initialDelayMs;
    this.openingShowcaseSpawnCount = 0;
    this.elapsedMs = 0;
    this.lastRenderSlotStateLogMs = 0;

    for (const renderSlot of this.renderBridge.slots) {
      renderSlot.active = false;
      renderSlot.assetId = null;
      renderSlot.width = 0;
      renderSlot.height = 0;
      renderSlot.x.value = 0;
      renderSlot.y.value = 0;
      renderSlot.opacity.value = 0;
    }
  }

  dispose(): void {
    this.reset();
    this.layout = null;
    this.laneSystem = null;
  }

  private trySpawn(
    speedPxPerSec: number,
    activeCoins: readonly CoinEntity[],
    activeShields: readonly ShieldEntity[],
  ): void {
    if (!this.layout || !this.laneSystem) {
      return;
    }

    const context: SpawnContext = {
      elapsedMs: this.elapsedMs,
      speedPxPerSec,
      obstacleCount: this.activeIds.size,
      decorationCount: 0,
      history: this.spawnHistory,
      nextSpawnY: this.layout.spawnY,
    };

    const decision = this.planSpawn(context, activeCoins, activeShields);
    if (!decision.accepted || !decision.assetId || decision.slot?.lane == null) {
      return;
    }

    const lane = decision.slot.lane;
    const asset = OBSTACLE_ASSET_MAP[decision.assetId];
    const existingSlot = this.pool.find((entry) => !entry.active);
    const renderIndex = existingSlot?.renderIndex ?? this.claimRenderIndex();

    if (renderIndex === null) {
      this.spawnBag.returnType(decision.assetId);
      return;
    }

    const spawnY = decision.slot.y;
    const x = this.laneSystem.getCenterX(lane);

    const oldEntityId = existingSlot?.id ?? null;
    const newEntityId = existingSlot ? createEntityId() : createEntityId();
    const slot: MutableObstacleSlot = existingSlot ?? {
      id: newEntityId,
      active: false,
      assetId: decision.assetId,
      lane,
      x,
      y: spawnY,
      width: asset.width,
      height: asset.height,
      speed: speedPxPerSec,
      renderIndex,
    };

    slot.id = existingSlot ? newEntityId : slot.id;
    slot.active = true;
    slot.assetId = decision.assetId;
    slot.lane = lane;
    slot.x = x;
    slot.y = spawnY;
    slot.width = asset.width;
    slot.height = asset.height;
    slot.speed = speedPxPerSec;
    slot.renderIndex = renderIndex;

    if (!existingSlot) {
      this.pool.push(slot);
    }

    if (__DEV__) {
      if (existingSlot) {
        console.log(
          `[ObstacleReused] assetId=${slot.assetId} oldEntityId=${oldEntityId} newEntityId=${slot.id} renderIndex=${slot.renderIndex}`,
        );
      } else {
        console.log(
          `[ObstacleCreated] assetId=${slot.assetId} entityId=${slot.id} renderIndex=${slot.renderIndex}`,
        );
      }
    }

    this.activeIds.add(slot.id);
    this.spawnHistory.push({
      entityId: slot.id,
      assetId: decision.assetId,
      lane,
      spawnedAtY: spawnY,
      timestamp: this.elapsedMs,
    });

    if (this.spawnHistory.length > POOL_CONSTANTS.MAX_SPAWN_HISTORY) {
      this.spawnHistory.shift();
    }

    this.activateRenderSlot(slot);
    this.syncRenderSlot(slot);
    this.recordSuccessfulSpawn();
  }

  private getCurrentSpawnIntervalMs(normalSpawnIntervalMs: number): number {
    if (this.openingShowcaseSpawnCount < SPAWN_CONFIG.openingShowcaseSpawnCount) {
      return SPAWN_CONFIG.openingShowcaseSpawnIntervalMs;
    }

    return normalSpawnIntervalMs;
  }

  private recordSuccessfulSpawn(): void {
    if (this.openingShowcaseSpawnCount >= SPAWN_CONFIG.openingShowcaseSpawnCount) {
      return;
    }

    this.openingShowcaseSpawnCount += 1;
  }

  private claimRenderIndex(): number | null {
    const used = new Set(this.pool.filter((slot) => slot.active).map((slot) => slot.renderIndex));

    for (let index = 0; index < this.renderBridge.slots.length; index += 1) {
      if (!used.has(index)) {
        return index;
      }
    }

    return null;
  }

  private pickFairLane(spawnY: number, assetId: ObstacleAssetId): LaneIndex | null {
    if (!this.layout) {
      return null;
    }

    const windowPx = SPAWN_CONFIG.impossiblePatternWindowPx;
    const occupied = new Set<LaneIndex>();

    for (const slot of this.pool) {
      if (!slot.active) {
        continue;
      }

      if (Math.abs(slot.y - spawnY) <= windowPx) {
        occupied.add(slot.lane);
      }
    }

    const asset = OBSTACLE_ASSET_MAP[assetId];
    const minGap = asset.spawnRule?.minLaneGap ?? SPAWN_CONFIG.minLaneGapPx;
    const minVerticalGap =
      asset.spawnRule?.minSpawnDistance ?? SPAWN_CONFIG.minVerticalGapPx;
    const candidates: LaneIndex[] = [];

    for (let lane = 0 as LaneIndex; lane <= 2; lane = (lane + 1) as LaneIndex) {
      if (
        this.hasVerticalGap(lane, spawnY, asset.height, minVerticalGap) &&
        this.respectsLaneGap(lane, minGap)
      ) {
        candidates.push(lane);
      }
    }

    const fairCandidates = candidates.filter((lane) => {
      const nextOccupied = new Set(occupied);
      nextOccupied.add(lane);
      return nextOccupied.size < GAME_CONSTANTS.LANE_COUNT;
    });

    if (fairCandidates.length === 0) {
      return null;
    }

    return fairCandidates[Math.floor(Math.random() * fairCandidates.length)] ?? null;
  }

  private hasVerticalGap(
    lane: LaneIndex,
    spawnY: number,
    height: number,
    minGapPx: number = SPAWN_CONFIG.minVerticalGapPx,
  ): boolean {
    for (const slot of this.pool) {
      if (!slot.active || slot.lane !== lane) {
        continue;
      }

      const gap = Math.abs(slot.y - spawnY) - (slot.height + height) / 2;
      if (gap < minGapPx) {
        return false;
      }
    }

    return true;
  }

  private respectsLaneGap(lane: LaneIndex, minLaneGap: number): boolean {
    if (minLaneGap <= 1) {
      return true;
    }

    for (const slot of this.pool) {
      if (!slot.active) {
        continue;
      }

      if (Math.abs(slot.lane - lane) < minLaneGap) {
        return false;
      }
    }

    return true;
  }

  private resolveSpawnY(requestedY: number, height: number): number {
    if (!this.layout) {
      return requestedY;
    }

    let spawnY = requestedY;

    for (const slot of this.pool) {
      if (!slot.active) {
        continue;
      }

      const gap = spawnY - slot.y;
      if (gap >= 0 && gap < SPAWN_CONFIG.minVerticalGapPx + (slot.height + height) / 2) {
        spawnY = slot.y - SPAWN_CONFIG.minVerticalGapPx - (slot.height + height) / 2;
      }
    }

    return Math.min(spawnY, this.layout.spawnY);
  }

  private computeSpawnObstacleBounds(
    lane: LaneIndex,
    spawnY: number,
    width: number,
    height: number,
  ): WorldBounds {
    const obstacleX = this.laneSystem!.getCenterX(lane);
    return computeEntityVisualBounds(obstacleX, spawnY, width, height);
  }

  private findSpawnPickupConflict(
    obstacleBounds: WorldBounds,
    activeCoins: readonly CoinEntity[],
    activeShields: readonly ShieldEntity[],
  ): boolean {
    return (
      this.hasBufferedPickupConflict(obstacleBounds, activeCoins) ||
      this.hasBufferedPickupConflict(obstacleBounds, activeShields)
    );
  }

  /** Dev-only — classifies pickFairLane null without altering spawn decisions. */
  private diagnosePickFairLaneFailure(
    spawnY: number,
    assetId: ObstacleAssetId,
  ): ObstacleSkipReasonKey {
    if (!this.layout) {
      return 'noValidLane';
    }

    const windowPx = SPAWN_CONFIG.impossiblePatternWindowPx;
    const occupied = new Set<LaneIndex>();

    for (const slot of this.pool) {
      if (!slot.active) {
        continue;
      }

      if (Math.abs(slot.y - spawnY) <= windowPx) {
        occupied.add(slot.lane);
      }
    }

    const asset = OBSTACLE_ASSET_MAP[assetId];
    const minGap = asset.spawnRule?.minLaneGap ?? SPAWN_CONFIG.minLaneGapPx;
    const minVerticalGap =
      asset.spawnRule?.minSpawnDistance ?? SPAWN_CONFIG.minVerticalGapPx;
    const candidates: LaneIndex[] = [];

    for (let lane = 0 as LaneIndex; lane <= 2; lane = (lane + 1) as LaneIndex) {
      if (
        this.hasVerticalGap(lane, spawnY, asset.height, minVerticalGap) &&
        this.respectsLaneGap(lane, minGap)
      ) {
        candidates.push(lane);
      }
    }

    if (candidates.length === 0) {
      let anyRespectsLaneGap = false;
      let anyVerticalGap = false;

      for (let lane = 0 as LaneIndex; lane <= 2; lane = (lane + 1) as LaneIndex) {
        if (this.respectsLaneGap(lane, minGap)) {
          anyRespectsLaneGap = true;
        }

        if (this.hasVerticalGap(lane, spawnY, asset.height, minVerticalGap)) {
          anyVerticalGap = true;
        }
      }

      if (!anyVerticalGap) {
        return 'verticalGapFailure';
      }

      if (!anyRespectsLaneGap) {
        return 'noValidLane';
      }

      return 'noValidLane';
    }

    const fairCandidates = candidates.filter((lane) => {
      const nextOccupied = new Set(occupied);
      nextOccupied.add(lane);
      return nextOccupied.size < GAME_CONSTANTS.LANE_COUNT;
    });

    if (fairCandidates.length === 0) {
      return 'fairLaneFailure';
    }

    return 'noValidLane';
  }

  /** Dev-only — identifies pickup overlap source without altering spawn decisions. */
  private diagnosePickupConflict(
    obstacleBounds: WorldBounds,
    activeCoins: readonly CoinEntity[],
    activeShields: readonly ShieldEntity[],
  ): ObstacleSkipReasonKey {
    if (this.hasBufferedPickupConflict(obstacleBounds, activeCoins)) {
      return 'coinConflict';
    }

    return 'shieldConflict';
  }

  /** Mirrors CoinSystem spawn overlap — pickup AABB expanded by COIN_CONFIG margin. */
  private hasBufferedPickupConflict(
    obstacleBounds: WorldBounds,
    pickups: readonly PickupBoundsSource[],
  ): boolean {
    const margin = COIN_CONFIG.obstacleSafetyMarginPx;

    for (const pickup of pickups) {
      const pickupCore = computeEntityVisualBounds(
        pickup.x,
        pickup.y,
        pickup.width,
        pickup.height,
      );
      const bufferedPickupBounds = expandWorldBounds(pickupCore, margin);

      if (boundsIntersect(obstacleBounds, bufferedPickupBounds)) {
        return true;
      }
    }

    return false;
  }

  private activateRenderSlot(slot: MutableObstacleSlot): void {
    const renderSlot = this.renderBridge.slots[slot.renderIndex];
    if (!renderSlot) {
      return;
    }

    renderSlot.active = true;
    renderSlot.assetId = slot.assetId;
    renderSlot.width = slot.width;
    renderSlot.height = slot.height;
    renderSlot.opacity.value = 1;
    if (__DEV__) {
      console.log(`[ObstacleActivated] assetId=${slot.assetId} renderIndex=${slot.renderIndex}`);
    }
    this.bumpRevision();
  }

  private deactivateSlot(slot: MutableObstacleSlot, reason?: ObstacleRemovalReason): void {
    if (__DEV__) {
      console.log(
        `[ObstacleDeactivated] assetId=${slot.assetId} renderIndex=${slot.renderIndex} reason=${reason ?? 'reset'}`,
      );
    }

    slot.active = false;
    this.activeIds.delete(slot.id);

    const renderSlot = this.renderBridge.slots[slot.renderIndex];
    if (renderSlot) {
      renderSlot.active = false;
      renderSlot.assetId = null;
      renderSlot.width = 0;
      renderSlot.height = 0;
      renderSlot.opacity.value = 0;
      this.bumpRevision();
    }
  }

  private bumpRevision(): void {
    this.renderBridge.revision.current += 1;
    this.renderBridge.onRevisionChange?.();
  }

  private syncRenderSlot(slot: MutableObstacleSlot): void {
    const renderSlot = this.renderBridge.slots[slot.renderIndex];
    if (!renderSlot) {
      return;
    }

    renderSlot.x.value = slot.x;
    renderSlot.y.value = slot.y;
  }

  private logRenderSlotStateIfDue(): void {
    if (!__DEV__ || this.elapsedMs - this.lastRenderSlotStateLogMs < 5_000) {
      return;
    }

    this.lastRenderSlotStateLogMs = this.elapsedMs;

    this.renderBridge.slots.forEach((renderSlot, renderIndex) => {
      console.log(
        `[RenderSlotState] renderIndex=${renderIndex} assetId=${renderSlot.assetId ?? 'null'} active=${renderSlot.active}`,
      );
    });
  }

  private getActiveEntities(): readonly ObstacleEntity[] {
    return this.pool
      .filter((slot) => slot.active)
      .map(
        (slot): ObstacleEntity => ({
          id: slot.id,
          assetId: slot.assetId,
          lane: slot.lane,
          x: slot.x,
          y: slot.y,
          width: slot.width,
          height: slot.height,
          active: true,
          speed: slot.speed,
        }),
      );
  }
}

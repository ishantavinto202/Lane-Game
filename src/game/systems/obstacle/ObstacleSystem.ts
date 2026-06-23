import { OBSTACLE_ASSET_MAP } from '../../assets';
import { GAME_CONSTANTS, POOL_CONSTANTS } from '../../constants';
import { SPAWN_CONFIG } from '../../config';
import type {
  GameLayout,
  LaneIndex,
  ObstacleAssetId,
  ObstacleEntity,
  SpawnContext,
  SpawnDecision,
  SpawnHistoryEntry,
} from '../../types';
import { evaluateDifficulty } from '../../utils/difficulty';
import type { LaneSystem } from '../lane/LaneSystem';

import type { ObstacleRenderBridge } from './obstacle-motion.types';
import { ObstacleSpawnBag } from './obstacle-spawn-bag';
import { ObstacleSpawnDebugTracker } from './obstacle-spawn-debug';

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
  private readonly pool: MutableObstacleSlot[] = [];
  private readonly activeIds = new Set<string>();
  private spawnHistory: SpawnHistoryEntry[] = [];
  private spawnAccumulatorMs = 0;
  private elapsedMs = 0;

  constructor(renderBridge: ObstacleRenderBridge) {
    this.renderBridge = renderBridge;
  }

  initialize(layout: GameLayout, laneSystem: LaneSystem): void {
    this.layout = layout;
    this.laneSystem = laneSystem;
    this.reset();
  }

  planSpawn(context: SpawnContext): SpawnDecision {
    if (context.obstacleCount >= SPAWN_CONFIG.maxObstaclesOnScreen) {
      return {
        accepted: false,
        assetId: null,
        slot: null,
        reason: 'max-concurrent-reached',
      };
    }

    const spawnY = this.layout?.spawnY ?? context.nextSpawnY;
    const selectedType = this.spawnBag.pullNext();

    for (let attempt = 0; attempt < SPAWN_CONFIG.obstacleSpawnLaneRetryLimit; attempt += 1) {
      const lane = this.pickFairLane(spawnY, selectedType);

      if (lane !== null) {
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
            y: spawnY,
            region: 'road',
          },
          reason: null,
        };
      }
    }

    this.spawnBag.returnType(selectedType);

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

  updateObstacles(deltaMs: number, speedPxPerSec: number): readonly ObstacleEntity[] {
    if (!this.layout || !this.laneSystem) {
      return [];
    }

    this.elapsedMs += deltaMs;
    const difficulty = evaluateDifficulty(this.elapsedMs);
    this.spawnAccumulatorMs += deltaMs;

    while (this.spawnAccumulatorMs >= difficulty.spawnIntervalMs) {
      this.spawnAccumulatorMs -= difficulty.spawnIntervalMs;
      this.trySpawn(speedPxPerSec);
    }

    const deltaPx = (speedPxPerSec * deltaMs) / 1000;

    for (const slot of this.pool) {
      if (!slot.active) {
        continue;
      }

      slot.y += deltaPx;
      slot.speed = speedPxPerSec;

      if (slot.y > this.layout.despawnY) {
        this.deactivateSlot(slot);
        continue;
      }

      this.syncRenderSlot(slot);
    }

    return this.getActiveEntities();
  }

  getActiveObstacles(): readonly ObstacleEntity[] {
    return this.getActiveEntities();
  }

  removeObstacleById(obstacleId: string): boolean {
    const slot = this.pool.find((entry) => entry.active && entry.id === obstacleId);
    if (!slot) {
      return false;
    }

    this.deactivateSlot(slot);
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
    this.spawnAccumulatorMs = SPAWN_CONFIG.initialDelayMs;
    this.elapsedMs = 0;

    for (const renderSlot of this.renderBridge.slots) {
      renderSlot.meta.active = false;
      renderSlot.meta.assetId = null;
      renderSlot.meta.width = 0;
      renderSlot.meta.height = 0;
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

  private trySpawn(speedPxPerSec: number): void {
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

    const decision = this.planSpawn(context);
    if (!decision.accepted || !decision.assetId || decision.slot?.lane == null) {
      return;
    }

    const lane = decision.slot.lane;
    const asset = OBSTACLE_ASSET_MAP[decision.assetId];
    const existingSlot = this.pool.find((entry) => !entry.active);
    const renderIndex = existingSlot?.renderIndex ?? this.claimRenderIndex();

    if (renderIndex === null) {
      return;
    }

    const spawnY = this.resolveSpawnY(decision.slot.y, asset.height);
    const x = this.laneSystem.getCenterX(lane);

    const slot: MutableObstacleSlot = existingSlot ?? {
      id: createEntityId(),
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

    slot.id = existingSlot ? createEntityId() : slot.id;
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

  private activateRenderSlot(slot: MutableObstacleSlot): void {
    const renderSlot = this.renderBridge.slots[slot.renderIndex];
    if (!renderSlot) {
      return;
    }

    const meta = renderSlot.meta;
    meta.active = true;
    meta.assetId = slot.assetId;
    meta.width = slot.width;
    meta.height = slot.height;
    renderSlot.opacity.value = 1;
    this.bumpRevision();
  }

  private deactivateSlot(slot: MutableObstacleSlot): void {
    slot.active = false;
    this.activeIds.delete(slot.id);

    const renderSlot = this.renderBridge.slots[slot.renderIndex];
    if (renderSlot) {
      renderSlot.meta.active = false;
      renderSlot.meta.assetId = null;
      renderSlot.meta.width = 0;
      renderSlot.meta.height = 0;
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

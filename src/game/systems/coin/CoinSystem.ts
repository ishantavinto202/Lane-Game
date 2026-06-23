import { COIN_ASSET } from '../../assets/definitions/coin.assets';
import { COIN_CONFIG } from '../../config';
import type { CoinEntity, LaneIndex, ObstacleEntity } from '../../types';
import type { CollisionProbe } from '../../types';
import { computeWorldBounds, boundsOverlap } from '../../utils/collision-bounds';
import type { LaneSystem } from '../lane/LaneSystem';

import type { CoinRenderBridge } from './coin-motion.types';
import {
  boundsIntersect,
  computeEntityVisualBounds,
  distanceBetweenBounds,
  expandWorldBounds,
  logCoinSpawnRejected,
  logCoinSpawnSkipped,
} from './coin-spawn-debug';

interface MutableCoinSlot {
  id: string;
  active: boolean;
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
  return `coin-${nextEntityId}`;
}

function randomSpawnIntervalMs(): number {
  const { minSpawnIntervalMs, maxSpawnIntervalMs } = COIN_CONFIG;
  return (
    minSpawnIntervalMs +
    Math.floor(Math.random() * (maxSpawnIntervalMs - minSpawnIntervalMs + 1))
  );
}

/** Builds collision probes for active coins. */
export function createCoinCollisionProbes(
  coins: readonly {
    readonly id: string;
    readonly lane: LaneIndex;
    readonly x: number;
    readonly y: number;
  }[],
): CollisionProbe[] {
  return coins.map((coin) => ({
    entityId: coin.id,
    lane: coin.lane,
    bounds: computeWorldBounds(
      coin.x,
      coin.y,
      COIN_ASSET,
      COIN_CONFIG.hitboxScale,
    ),
  }));
}

/** Spawns and moves lane coins with object pooling and obstacle-safe placement. */
export class CoinSystem {
  readonly id = 'coin-system' as const;

  private layout: { spawnY: number; despawnY: number } | null = null;
  private laneSystem: LaneSystem | null = null;
  private readonly renderBridge: CoinRenderBridge;
  private readonly pool: MutableCoinSlot[] = [];
  private readonly activeIds = new Set<string>();
  private spawnAccumulatorMs = 0;
  private nextSpawnIntervalMs: number = COIN_CONFIG.minSpawnIntervalMs;

  constructor(renderBridge: CoinRenderBridge) {
    this.renderBridge = renderBridge;
  }

  initialize(
    layout: { spawnY: number; despawnY: number },
    laneSystem: LaneSystem,
  ): void {
    this.layout = layout;
    this.laneSystem = laneSystem;
    this.reset();
  }

  updateCoins(
    deltaMs: number,
    speedPxPerSec: number,
    activeObstacles: readonly ObstacleEntity[],
  ): readonly CoinEntity[] {
    if (!this.layout || !this.laneSystem) {
      return [];
    }

    this.spawnAccumulatorMs += deltaMs;

    while (this.spawnAccumulatorMs >= this.nextSpawnIntervalMs) {
      this.spawnAccumulatorMs -= this.nextSpawnIntervalMs;
      this.nextSpawnIntervalMs = randomSpawnIntervalMs();
      this.trySpawn(activeObstacles, speedPxPerSec);
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

  getActiveCoins(): readonly CoinEntity[] {
    return this.getActiveEntities();
  }

  evaluateCollection(
    playerProbe: CollisionProbe,
    coins: readonly CollisionProbe[],
  ): readonly string[] {
    const collected: string[] = [];

    for (const coin of coins) {
      if (playerProbe.lane !== coin.lane) {
        continue;
      }

      if (
        boundsOverlap(
          playerProbe.bounds,
          coin.bounds,
          COIN_CONFIG.minCollectionOverlapArea,
        )
      ) {
        collected.push(coin.entityId);
      }
    }

    return collected;
  }

  removeCoinById(coinId: string): { x: number; y: number } | null {
    const slot = this.pool.find((entry) => entry.active && entry.id === coinId);
    if (!slot) {
      return null;
    }

    const position = { x: slot.x, y: slot.y };
    this.deactivateSlot(slot);
    return position;
  }

  reset(): void {
    for (const slot of this.pool) {
      if (slot.active) {
        this.deactivateSlot(slot);
      }
    }

    this.pool.length = 0;
    this.activeIds.clear();
    this.spawnAccumulatorMs = COIN_CONFIG.initialDelayMs;
    this.nextSpawnIntervalMs = randomSpawnIntervalMs();

    for (const renderSlot of this.renderBridge.slots) {
      renderSlot.meta.active = false;
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

  private trySpawn(
    activeObstacles: readonly ObstacleEntity[],
    speedPxPerSec: number,
  ): void {
    if (!this.layout || !this.laneSystem) {
      return;
    }

    if (this.activeIds.size >= COIN_CONFIG.maxActiveCoins) {
      return;
    }

    const spawnY = this.layout.spawnY;
    const lane = this.pickSpawnLane(spawnY, activeObstacles);

    if (lane === null) {
      return;
    }

    const existingSlot = this.pool.find((entry) => !entry.active);
    const renderIndex = existingSlot?.renderIndex ?? this.claimRenderIndex();

    if (renderIndex === null) {
      return;
    }

    const x = this.laneSystem.getCenterX(lane);
    const width = COIN_ASSET.width;
    const height = COIN_ASSET.height;

    const slot: MutableCoinSlot = existingSlot ?? {
      id: createEntityId(),
      active: false,
      lane,
      x,
      y: spawnY,
      width,
      height,
      speed: speedPxPerSec,
      renderIndex,
    };

    slot.id = existingSlot ? createEntityId() : slot.id;
    slot.active = true;
    slot.lane = lane;
    slot.x = x;
    slot.y = spawnY;
    slot.width = width;
    slot.height = height;
    slot.speed = speedPxPerSec;
    slot.renderIndex = renderIndex;

    if (!existingSlot) {
      this.pool.push(slot);
    }

    this.activeIds.add(slot.id);
    this.activateRenderSlot(slot);
    this.syncRenderSlot(slot);
  }

  private pickSpawnLane(
    spawnY: number,
    activeObstacles: readonly ObstacleEntity[],
  ): LaneIndex | null {
    const shuffled = shuffleLanes([0, 1, 2]);
    const candidates: LaneIndex[] = [];

    for (const lane of shuffled) {
      if (!this.hasCoinVerticalGap(lane, spawnY)) {
        continue;
      }

      const rejection = this.findSpawnObstacleConflict(lane, spawnY, activeObstacles);
      if (rejection) {
        logCoinSpawnRejected({
          coinX: this.laneSystem!.getCenterX(lane),
          coinY: spawnY,
          lane,
          obstacleType: rejection.obstacleType,
          distancePx: rejection.distancePx,
        });
        continue;
      }

      candidates.push(lane);
    }

    if (candidates.length === 0) {
      logCoinSpawnSkipped(spawnY);
      return null;
    }

    return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
  }

  private hasCoinVerticalGap(lane: LaneIndex, spawnY: number): boolean {
    for (const slot of this.pool) {
      if (!slot.active || slot.lane !== lane) {
        continue;
      }

      const gap = Math.abs(slot.y - spawnY) - (slot.height + COIN_ASSET.height) / 2;
      if (gap < COIN_CONFIG.minVerticalGapPx) {
        return false;
      }
    }

    return true;
  }

  private findSpawnObstacleConflict(
    lane: LaneIndex,
    spawnY: number,
    activeObstacles: readonly ObstacleEntity[],
  ): { obstacleType: ObstacleEntity['assetId']; distancePx: number } | null {
    const coinX = this.laneSystem!.getCenterX(lane);
    const clearance = COIN_CONFIG.spawnClearancePx;
    const coinCore = computeEntityVisualBounds(
      coinX,
      spawnY,
      COIN_ASSET.width,
      COIN_ASSET.height,
    );
    const coinBounds = expandWorldBounds(coinCore, clearance);

    for (const obstacle of activeObstacles) {
      const obstacleCore = computeEntityVisualBounds(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height,
      );
      const obstacleBounds = expandWorldBounds(obstacleCore, clearance);

      if (boundsIntersect(coinBounds, obstacleBounds)) {
        return {
          obstacleType: obstacle.assetId,
          distancePx: distanceBetweenBounds(coinCore, obstacleCore),
        };
      }
    }

    return null;
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

  private activateRenderSlot(slot: MutableCoinSlot): void {
    const renderSlot = this.renderBridge.slots[slot.renderIndex];
    if (!renderSlot) {
      return;
    }

    renderSlot.meta.active = true;
    renderSlot.meta.width = slot.width;
    renderSlot.meta.height = slot.height;
    renderSlot.opacity.value = 1;
    this.bumpRevision();
  }

  private deactivateSlot(slot: MutableCoinSlot): void {
    slot.active = false;
    this.activeIds.delete(slot.id);

    const renderSlot = this.renderBridge.slots[slot.renderIndex];
    if (renderSlot) {
      renderSlot.meta.active = false;
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

  private syncRenderSlot(slot: MutableCoinSlot): void {
    const renderSlot = this.renderBridge.slots[slot.renderIndex];
    if (!renderSlot) {
      return;
    }

    renderSlot.x.value = slot.x;
    renderSlot.y.value = slot.y;
  }

  private getActiveEntities(): readonly CoinEntity[] {
    return this.pool
      .filter((slot) => slot.active)
      .map(
        (slot): CoinEntity => ({
          id: slot.id,
          assetId: 'COIN',
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

function shuffleLanes(lanes: readonly LaneIndex[]): LaneIndex[] {
  const shuffled = [...lanes];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[swapIndex]!;
    shuffled[swapIndex] = current!;
  }

  return shuffled;
}

import { SPEED_BOOST_ASSET } from '../../assets/definitions/speed-boost.assets';
import { SPEED_BOOST_CONFIG } from '../../config';
import type {
  CoinEntity,
  LaneIndex,
  ObstacleEntity,
  ShieldEntity,
  SpeedBoostEntity,
} from '../../types';
import type { CollisionProbe } from '../../types';
import { boundsOverlap, computeWorldBounds } from '../../utils/collision-bounds';
import type { LaneSystem } from '../lane/LaneSystem';
import {
  boundsIntersect,
  computeEntityVisualBounds,
  expandWorldBounds,
  findPickupBoundsConflict,
} from '../coin/coin-spawn-debug';

import type { SpeedBoostRenderBridge } from './speed-boost-motion.types';

interface MutableSpeedBoostSlot {
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
  return `speed-boost-${nextEntityId}`;
}

function randomSpawnIntervalMs(): number {
  const { minSpawnIntervalMs, maxSpawnIntervalMs } = SPEED_BOOST_CONFIG;
  return (
    minSpawnIntervalMs +
    Math.floor(Math.random() * (maxSpawnIntervalMs - minSpawnIntervalMs + 1))
  );
}

/** Builds collision probes for active speed boost pickups. */
export function createSpeedBoostCollisionProbes(
  speedBoosts: readonly {
    readonly id: string;
    readonly lane: LaneIndex;
    readonly x: number;
    readonly y: number;
  }[],
): CollisionProbe[] {
  return speedBoosts.map((speedBoost) => ({
    entityId: speedBoost.id,
    lane: speedBoost.lane,
    bounds: computeWorldBounds(
      speedBoost.x,
      speedBoost.y,
      SPEED_BOOST_ASSET,
      SPEED_BOOST_CONFIG.hitboxScale,
    ),
  }));
}

/** Spawns and moves speed boost pickups with object pooling and obstacle-safe placement. */
export class SpeedBoostSystem {
  readonly id = 'speed-boost-system' as const;

  private layout: { spawnY: number; despawnY: number } | null = null;
  private laneSystem: LaneSystem | null = null;
  private readonly renderBridge: SpeedBoostRenderBridge;
  private readonly pool: MutableSpeedBoostSlot[] = [];
  private readonly activeIds = new Set<string>();
  private spawnAccumulatorMs = 0;
  private nextSpawnIntervalMs: number = SPEED_BOOST_CONFIG.minSpawnIntervalMs;

  constructor(renderBridge: SpeedBoostRenderBridge) {
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

  updateSpeedBoosts(
    deltaMs: number,
    speedPxPerSec: number,
    activeObstacles: readonly ObstacleEntity[],
    activeCoins: readonly CoinEntity[],
    activeShields: readonly ShieldEntity[],
  ): readonly SpeedBoostEntity[] {
    if (!this.layout || !this.laneSystem) {
      return [];
    }

    this.spawnAccumulatorMs += deltaMs;

    while (this.spawnAccumulatorMs >= this.nextSpawnIntervalMs) {
      this.spawnAccumulatorMs -= this.nextSpawnIntervalMs;
      this.nextSpawnIntervalMs = randomSpawnIntervalMs();
      this.trySpawn(activeObstacles, activeCoins, activeShields, speedPxPerSec);
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

  getActiveSpeedBoosts(): readonly SpeedBoostEntity[] {
    return this.getActiveEntities();
  }

  evaluateCollection(
    playerProbe: CollisionProbe,
    speedBoosts: readonly CollisionProbe[],
  ): readonly string[] {
    const collected: string[] = [];

    for (const speedBoost of speedBoosts) {
      if (playerProbe.lane !== speedBoost.lane) {
        continue;
      }

      if (
        boundsOverlap(
          playerProbe.bounds,
          speedBoost.bounds,
          SPEED_BOOST_CONFIG.minCollectionOverlapArea,
        )
      ) {
        collected.push(speedBoost.entityId);
      }
    }

    return collected;
  }

  removeSpeedBoostById(speedBoostId: string): { x: number; y: number } | null {
    const slot = this.pool.find((entry) => entry.active && entry.id === speedBoostId);
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
    this.spawnAccumulatorMs = SPEED_BOOST_CONFIG.initialDelayMs;
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
    activeCoins: readonly CoinEntity[],
    activeShields: readonly ShieldEntity[],
    speedPxPerSec: number,
  ): void {
    if (!this.layout || !this.laneSystem) {
      return;
    }

    if (this.activeIds.size >= SPEED_BOOST_CONFIG.maxActivePickups) {
      return;
    }

    const spawnPosition = this.pickSpawnPosition(activeObstacles, activeCoins, activeShields);

    if (spawnPosition === null) {
      return;
    }

    const { lane, spawnY } = spawnPosition;

    const existingSlot = this.pool.find((entry) => !entry.active);
    const renderIndex = existingSlot?.renderIndex ?? this.claimRenderIndex();

    if (renderIndex === null) {
      return;
    }

    const x = this.laneSystem.getCenterX(lane);
    const width = SPEED_BOOST_CONFIG.size;
    const height = SPEED_BOOST_CONFIG.size;

    const slot: MutableSpeedBoostSlot = existingSlot ?? {
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

  private pickSpawnPosition(
    activeObstacles: readonly ObstacleEntity[],
    activeCoins: readonly CoinEntity[],
    activeShields: readonly ShieldEntity[],
  ): { lane: LaneIndex; spawnY: number } | null {
    const baseSpawnY = this.layout!.spawnY;
    const shuffledLanes = shuffleLanes([0, 1, 2]);

    for (const yOffset of SPEED_BOOST_CONFIG.spawnYRetryOffsetsPx) {
      const spawnY = baseSpawnY + yOffset;

      for (const lane of shuffledLanes) {
        if (!this.hasSpeedBoostVerticalGap(lane, spawnY)) {
          continue;
        }

        const speedBoostBounds = this.computeSpawnSpeedBoostBounds(lane, spawnY);

        const coinConflict = findPickupBoundsConflict(speedBoostBounds, activeCoins);
        if (coinConflict) {
          continue;
        }

        const shieldConflict = findPickupBoundsConflict(speedBoostBounds, activeShields);
        if (shieldConflict) {
          continue;
        }

        if (this.findSpawnObstacleConflict(speedBoostBounds, activeObstacles)) {
          continue;
        }

        return { lane, spawnY };
      }
    }

    return null;
  }

  private hasSpeedBoostVerticalGap(lane: LaneIndex, spawnY: number): boolean {
    for (const slot of this.pool) {
      if (!slot.active || slot.lane !== lane) {
        continue;
      }

      const gap = Math.abs(slot.y - spawnY) - (slot.height + SPEED_BOOST_CONFIG.size) / 2;
      if (gap < SPEED_BOOST_CONFIG.minVerticalGapPx) {
        return false;
      }
    }

    return true;
  }

  private computeSpawnSpeedBoostBounds(lane: LaneIndex, spawnY: number) {
    const speedBoostX = this.laneSystem!.getCenterX(lane);
    return computeEntityVisualBounds(
      speedBoostX,
      spawnY,
      SPEED_BOOST_CONFIG.size,
      SPEED_BOOST_CONFIG.size,
    );
  }

  private findSpawnObstacleConflict(
    speedBoostBounds: ReturnType<typeof computeEntityVisualBounds>,
    activeObstacles: readonly ObstacleEntity[],
  ): boolean {
    const margin = SPEED_BOOST_CONFIG.obstacleSafetyMarginPx;

    for (const obstacle of activeObstacles) {
      const obstacleCore = computeEntityVisualBounds(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height,
      );
      const bufferedObstacleBounds = expandWorldBounds(obstacleCore, margin);

      if (boundsIntersect(speedBoostBounds, bufferedObstacleBounds)) {
        return true;
      }
    }

    return false;
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

  private activateRenderSlot(slot: MutableSpeedBoostSlot): void {
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

  private deactivateSlot(slot: MutableSpeedBoostSlot): void {
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

  private syncRenderSlot(slot: MutableSpeedBoostSlot): void {
    const renderSlot = this.renderBridge.slots[slot.renderIndex];
    if (!renderSlot) {
      return;
    }

    renderSlot.x.value = slot.x;
    renderSlot.y.value = slot.y;
  }

  private getActiveEntities(): readonly SpeedBoostEntity[] {
    return this.pool
      .filter((slot) => slot.active)
      .map(
        (slot): SpeedBoostEntity => ({
          id: slot.id,
          assetId: 'SPEED_BOOST',
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

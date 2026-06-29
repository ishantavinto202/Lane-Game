import { COIN_ASSET } from '../../assets/definitions/coin.assets';
import { COIN_CONFIG, COLLECTIBLE_SPAWN_CONFIG, SHIELD_CONFIG, SPEED_BOOST_CONFIG } from '../../config';
import type {
  CoinEntity,
  LaneIndex,
  ObstacleEntity,
  ShieldEntity,
  SpeedBoostEntity,
} from '../../types';
import type { CollisionProbe } from '../../types';
import { computeWorldBounds, boundsOverlap } from '../../utils/collision-bounds';
import type { LaneSystem } from '../lane/LaneSystem';

import type { CoinRenderBridge } from './coin-motion.types';
import {
  computeEntityVisualBounds,
  findObstacleCollectibleSpawnConflict,
  findPickupBoundsConflict,
  logCoinSpawnRejected,
  logCoinSpawnSkipped,
  type PickupBoundsSource,
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
    activeShields: readonly ShieldEntity[],
    activeSpeedBoosts: readonly SpeedBoostEntity[],
  ): readonly CoinEntity[] {
    if (!this.layout || !this.laneSystem) {
      return [];
    }

    this.spawnAccumulatorMs += deltaMs;

    while (this.spawnAccumulatorMs >= this.nextSpawnIntervalMs) {
      this.spawnAccumulatorMs -= this.nextSpawnIntervalMs;
      this.nextSpawnIntervalMs = randomSpawnIntervalMs();
      this.trySpawn(activeObstacles, activeShields, activeSpeedBoosts, speedPxPerSec);
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
    activeShields: readonly ShieldEntity[],
    activeSpeedBoosts: readonly SpeedBoostEntity[],
    speedPxPerSec: number,
  ): void {
    if (!this.layout || !this.laneSystem) {
      return;
    }

    if (this.activeIds.size >= COIN_CONFIG.maxActiveCoins) {
      return;
    }

    const spawnPosition = this.pickSpawnPosition(
      activeObstacles,
      activeShields,
      activeSpeedBoosts,
    );

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
    const width = COIN_CONFIG.size;
    const height = COIN_CONFIG.size;

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

  private pickSpawnPosition(
    activeObstacles: readonly ObstacleEntity[],
    activeShields: readonly ShieldEntity[],
    activeSpeedBoosts: readonly SpeedBoostEntity[],
  ): { lane: LaneIndex; spawnY: number } | null {
    const baseSpawnY = this.layout!.spawnY;
    const shuffledLanes = shuffleLanes([0, 1, 2]);
    const otherCollectibles = this.toCollectibleBoundsSources(activeShields, activeSpeedBoosts);

    for (const yOffset of COIN_CONFIG.spawnYRetryOffsetsPx) {
      const spawnY = baseSpawnY + yOffset;

      for (const lane of shuffledLanes) {
        if (!this.hasCoinVerticalGap(lane, spawnY)) {
          continue;
        }

        const coinBounds = this.computeSpawnCoinBounds(lane, spawnY);

        const pickupConflict = findPickupBoundsConflict(
          coinBounds,
          otherCollectibles,
          COLLECTIBLE_SPAWN_CONFIG.minCollectibleSpacingPx,
        );
        if (pickupConflict) {
          continue;
        }

        const rejection = this.findSpawnObstacleConflict(coinBounds, activeObstacles);
        if (rejection) {
          logCoinSpawnRejected({
            lane,
            coinBounds,
            obstacleType: rejection.assetId,
            obstacleBounds: rejection.obstacleBounds,
            overlapAmountPx: rejection.overlapAmountPx,
          });
          continue;
        }

        return { lane, spawnY };
      }
    }

    logCoinSpawnSkipped(baseSpawnY);
    return null;
  }

  private hasCoinVerticalGap(lane: LaneIndex, spawnY: number): boolean {
    for (const slot of this.pool) {
      if (!slot.active || slot.lane !== lane) {
        continue;
      }

      const gap = Math.abs(slot.y - spawnY) - (slot.height + COIN_CONFIG.size) / 2;
      if (gap < COIN_CONFIG.minVerticalGapPx) {
        return false;
      }
    }

    return true;
  }

  private computeSpawnCoinBounds(lane: LaneIndex, spawnY: number) {
    const coinX = this.laneSystem!.getCenterX(lane);
    return computeEntityVisualBounds(
      coinX,
      spawnY,
      COIN_CONFIG.size,
      COIN_CONFIG.size,
    );
  }

  private findSpawnObstacleConflict(
    coinBounds: ReturnType<typeof computeEntityVisualBounds>,
    activeObstacles: readonly ObstacleEntity[],
  ) {
    return findObstacleCollectibleSpawnConflict(coinBounds, activeObstacles);
  }

  private toCollectibleBoundsSources(
    activeShields: readonly ShieldEntity[],
    activeSpeedBoosts: readonly SpeedBoostEntity[],
  ): readonly PickupBoundsSource[] {
    return [
      ...activeShields.map(
        (shield): PickupBoundsSource => ({
          x: shield.x,
          y: shield.y,
          width: SHIELD_CONFIG.size,
          height: SHIELD_CONFIG.size,
        }),
      ),
      ...activeSpeedBoosts.map(
        (speedBoost): PickupBoundsSource => ({
          x: speedBoost.x,
          y: speedBoost.y,
          width: SPEED_BOOST_CONFIG.size,
          height: SPEED_BOOST_CONFIG.size,
        }),
      ),
    ];
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

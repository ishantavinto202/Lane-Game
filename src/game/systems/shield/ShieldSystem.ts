import { SHIELD_ASSET } from '../../assets/definitions/shield.assets';
import {
  COIN_CONFIG,
  COLLECTIBLE_SPAWN_CONFIG,
  SHIELD_CONFIG,
  SPEED_BOOST_CONFIG,
} from '../../config';
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
  computeEntityVisualBounds,
  findObstacleCollectibleSpawnConflict,
  findPickupBoundsConflict,
  type PickupBoundsSource,
} from '../coin/coin-spawn-debug';

import type { ShieldRenderBridge } from './shield-motion.types';

interface MutableShieldSlot {
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
  return `shield-${nextEntityId}`;
}

function randomSpawnIntervalMs(): number {
  const { minSpawnIntervalMs, maxSpawnIntervalMs } = SHIELD_CONFIG;
  return (
    minSpawnIntervalMs +
    Math.floor(Math.random() * (maxSpawnIntervalMs - minSpawnIntervalMs + 1))
  );
}

/** Builds collision probes for active shield pickups. */
export function createShieldCollisionProbes(
  shields: readonly {
    readonly id: string;
    readonly lane: LaneIndex;
    readonly x: number;
    readonly y: number;
  }[],
): CollisionProbe[] {
  return shields.map((shield) => ({
    entityId: shield.id,
    lane: shield.lane,
    bounds: computeWorldBounds(
      shield.x,
      shield.y,
      SHIELD_ASSET,
      SHIELD_CONFIG.hitboxScale,
    ),
  }));
}

/** Spawns and moves shield pickups with object pooling and obstacle-safe placement. */
export class ShieldSystem {
  readonly id = 'shield-system' as const;

  private layout: { spawnY: number; despawnY: number } | null = null;
  private laneSystem: LaneSystem | null = null;
  private readonly renderBridge: ShieldRenderBridge;
  private readonly pool: MutableShieldSlot[] = [];
  private readonly activeIds = new Set<string>();
  private spawnAccumulatorMs = 0;
  private nextSpawnIntervalMs: number = SHIELD_CONFIG.minSpawnIntervalMs;

  constructor(renderBridge: ShieldRenderBridge) {
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

  updateShields(
    deltaMs: number,
    speedPxPerSec: number,
    activeObstacles: readonly ObstacleEntity[],
    activeCoins: readonly CoinEntity[],
    activeSpeedBoosts: readonly SpeedBoostEntity[],
  ): readonly ShieldEntity[] {
    if (!this.layout || !this.laneSystem) {
      return [];
    }

    this.spawnAccumulatorMs += deltaMs;

    while (this.spawnAccumulatorMs >= this.nextSpawnIntervalMs) {
      this.spawnAccumulatorMs -= this.nextSpawnIntervalMs;
      this.nextSpawnIntervalMs = randomSpawnIntervalMs();
      this.trySpawn(activeObstacles, activeCoins, activeSpeedBoosts, speedPxPerSec);
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

  getActiveShields(): readonly ShieldEntity[] {
    return this.getActiveEntities();
  }

  evaluateCollection(
    playerProbe: CollisionProbe,
    shields: readonly CollisionProbe[],
  ): readonly string[] {
    const collected: string[] = [];

    for (const shield of shields) {
      if (playerProbe.lane !== shield.lane) {
        continue;
      }

      if (
        boundsOverlap(
          playerProbe.bounds,
          shield.bounds,
          SHIELD_CONFIG.minCollectionOverlapArea,
        )
      ) {
        collected.push(shield.entityId);
      }
    }

    return collected;
  }

  removeShieldById(shieldId: string): { x: number; y: number } | null {
    const slot = this.pool.find((entry) => entry.active && entry.id === shieldId);
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
    this.spawnAccumulatorMs = SHIELD_CONFIG.initialDelayMs;
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
    activeSpeedBoosts: readonly SpeedBoostEntity[],
    speedPxPerSec: number,
  ): void {
    if (!this.layout || !this.laneSystem) {
      return;
    }

    if (this.activeIds.size >= SHIELD_CONFIG.maxActivePickups) {
      return;
    }

    const spawnPosition = this.pickSpawnPosition(
      activeObstacles,
      activeCoins,
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
    const width = SHIELD_CONFIG.size;
    const height = SHIELD_CONFIG.size;

    const slot: MutableShieldSlot = existingSlot ?? {
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
    activeSpeedBoosts: readonly SpeedBoostEntity[],
  ): { lane: LaneIndex; spawnY: number } | null {
    const baseSpawnY = this.layout!.spawnY;
    const shuffledLanes = shuffleLanes([0, 1, 2]);
    const otherCollectibles = this.toCollectibleBoundsSources(activeCoins, activeSpeedBoosts);

    for (const yOffset of SHIELD_CONFIG.spawnYRetryOffsetsPx) {
      const spawnY = baseSpawnY + yOffset;

      for (const lane of shuffledLanes) {
        if (!this.hasShieldVerticalGap(lane, spawnY)) {
          continue;
        }

        const shieldBounds = this.computeSpawnShieldBounds(lane, spawnY);

        const pickupConflict = findPickupBoundsConflict(
          shieldBounds,
          otherCollectibles,
          COLLECTIBLE_SPAWN_CONFIG.minCollectibleSpacingPx,
        );
        if (pickupConflict) {
          continue;
        }

        if (this.findSpawnObstacleConflict(shieldBounds, activeObstacles)) {
          continue;
        }

        return { lane, spawnY };
      }
    }

    return null;
  }

  private hasShieldVerticalGap(lane: LaneIndex, spawnY: number): boolean {
    for (const slot of this.pool) {
      if (!slot.active || slot.lane !== lane) {
        continue;
      }

      const gap = Math.abs(slot.y - spawnY) - (slot.height + SHIELD_CONFIG.size) / 2;
      if (gap < SHIELD_CONFIG.minVerticalGapPx) {
        return false;
      }
    }

    return true;
  }

  private computeSpawnShieldBounds(lane: LaneIndex, spawnY: number) {
    const shieldX = this.laneSystem!.getCenterX(lane);
    return computeEntityVisualBounds(
      shieldX,
      spawnY,
      SHIELD_CONFIG.size,
      SHIELD_CONFIG.size,
    );
  }

  private findSpawnObstacleConflict(
    shieldBounds: ReturnType<typeof computeEntityVisualBounds>,
    activeObstacles: readonly ObstacleEntity[],
  ): boolean {
    return findObstacleCollectibleSpawnConflict(shieldBounds, activeObstacles) !== null;
  }

  private toCollectibleBoundsSources(
    activeCoins: readonly CoinEntity[],
    activeSpeedBoosts: readonly SpeedBoostEntity[],
  ): readonly PickupBoundsSource[] {
    return [
      ...activeCoins.map(
        (coin): PickupBoundsSource => ({
          x: coin.x,
          y: coin.y,
          width: COIN_CONFIG.size,
          height: COIN_CONFIG.size,
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

  private activateRenderSlot(slot: MutableShieldSlot): void {
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

  private deactivateSlot(slot: MutableShieldSlot): void {
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

  private syncRenderSlot(slot: MutableShieldSlot): void {
    const renderSlot = this.renderBridge.slots[slot.renderIndex];
    if (!renderSlot) {
      return;
    }

    renderSlot.x.value = slot.x;
    renderSlot.y.value = slot.y;
  }

  private getActiveEntities(): readonly ShieldEntity[] {
    return this.pool
      .filter((slot) => slot.active)
      .map(
        (slot): ShieldEntity => ({
          id: slot.id,
          assetId: 'SHIELD',
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

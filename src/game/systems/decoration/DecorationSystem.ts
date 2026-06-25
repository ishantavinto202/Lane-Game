import { DECORATION_CONFIG } from '../../config';
import { TREE_SKIN } from '../../assets/definitions/decoration.assets';
import type { GameLayout } from '../../types';
import { getRoadRegions } from '../../utils/layout';

import type { DecorationRenderBridge, DecorationSide } from './decoration-motion.types';

interface MutableDecorationSlot {
  id: string;
  active: boolean;
  side: DecorationSide;
  x: number;
  y: number;
  scale: number;
  speed: number;
  renderIndex: number;
}

let nextEntityId = 0;

function createEntityId(): string {
  nextEntityId += 1;
  return `tree-${nextEntityId}`;
}

function randomScaleVariation(): number {
  const { minScaleVariation, maxScaleVariation } = DECORATION_CONFIG;
  return (
    minScaleVariation +
    Math.random() * (maxScaleVariation - minScaleVariation)
  );
}

function randomSide(): DecorationSide {
  return Math.random() < 0.5 ? 'left' : 'right';
}

function randomTrunkJitter(): number {
  const { trunkJitterPx } = DECORATION_CONFIG;
  return (Math.random() * 2 - 1) * trunkJitterPx;
}

function randomSpawnYJitter(): number {
  const { spawnYJitterPx } = DECORATION_CONFIG;
  return (Math.random() * 2 - 1) * spawnYJitterPx;
}

/** Spawns and moves cosmetic roadside trees — no gameplay or collision impact. */
export class DecorationSystem {
  readonly id = 'decoration-system' as const;

  private layout: GameLayout | null = null;
  private readonly renderBridge: DecorationRenderBridge;
  private readonly pool: MutableDecorationSlot[] = [];
  private readonly activeIds = new Set<string>();
  private spawnAccumulatorMs = 0;

  constructor(renderBridge: DecorationRenderBridge) {
    this.renderBridge = renderBridge;
  }

  initialize(layout: GameLayout): void {
    this.layout = layout;
    this.reset();
    this.seedInitialTrees();
  }

  updateDecorations(deltaMs: number, speedPxPerSec: number): void {
    if (!this.layout) {
      return;
    }

    this.spawnAccumulatorMs += deltaMs;

    while (this.spawnAccumulatorMs >= DECORATION_CONFIG.spawnIntervalMs) {
      this.spawnAccumulatorMs -= DECORATION_CONFIG.spawnIntervalMs;
      this.trySpawn();
    }

    const scrollSpeed =
      speedPxPerSec * DECORATION_CONFIG.scrollSpeedMultiplier;
    const deltaPx = (scrollSpeed * deltaMs) / 1000;

    for (const slot of this.pool) {
      if (!slot.active) {
        continue;
      }

      slot.y += deltaPx;
      slot.speed = scrollSpeed;

      if (slot.y > this.layout.despawnY) {
        this.deactivateSlot(slot);
        continue;
      }

      this.syncRenderSlot(slot);
    }
  }

  reset(): void {
    for (const slot of this.pool) {
      if (slot.active) {
        this.deactivateSlot(slot);
      }
    }

    this.pool.length = 0;
    this.activeIds.clear();
    this.spawnAccumulatorMs = DECORATION_CONFIG.initialDelayMs;

    for (const renderSlot of this.renderBridge.slots) {
      renderSlot.active = false;
      renderSlot.side = 'left';
      renderSlot.scale = 1;
      renderSlot.x.value = 0;
      renderSlot.y.value = 0;
      renderSlot.opacity.value = 0;
    }
  }

  dispose(): void {
    this.reset();
    this.layout = null;
  }

  /**
   * Pre-populates the pool with trees spread across the full visible Y range
   * so the roadside is already populated during the countdown screen.
   * Uses the same placement logic as runtime spawning.
   */
  private seedInitialTrees(): void {
    if (!this.layout) {
      return;
    }

    const { minVerticalGapPx } = DECORATION_CONFIG;
    const step = minVerticalGapPx;
    const sides: DecorationSide[] = ['left', 'right'];

    for (
      let y = this.layout.spawnY;
      y <= this.layout.despawnY;
      y += step + Math.random() * step * 0.5
    ) {
      for (const side of sides) {
        if (this.activeIds.size >= DECORATION_CONFIG.maxActiveDecorations) {
          break;
        }

        const candidateY = y + (Math.random() * 2 - 1) * DECORATION_CONFIG.spawnYJitterPx;
        this.placeTreeAt(side, candidateY);
      }
    }

    this.ensureVisibleTreesAtStart();

    // Runtime spawning starts immediately — roadside is already seeded.
    this.spawnAccumulatorMs = 0;
  }

  /**
   * After seeding, guarantees at least MIN_VISIBLE_START_TREES trees are
   * within the visible viewport so the countdown never shows an empty roadside.
   */
  private ensureVisibleTreesAtStart(): void {
    if (!this.layout) {
      return;
    }

    const MIN_VISIBLE_START_TREES = 5;
    const VISIBLE_MARGIN = 200;
    const visibleMinY = -VISIBLE_MARGIN;
    const visibleMaxY = this.layout.screenHeight + VISIBLE_MARGIN;

    let attempts = 0;
    const MAX_ATTEMPTS = 60;

    while (
      this.countVisibleActive(visibleMinY, visibleMaxY) < MIN_VISIBLE_START_TREES &&
      this.activeIds.size < DECORATION_CONFIG.maxActiveDecorations &&
      attempts < MAX_ATTEMPTS
    ) {
      attempts += 1;
      const side = randomSide();
      const y = visibleMinY + Math.random() * (visibleMaxY - visibleMinY);
      this.placeTreeAt(side, y);
    }
  }

  private countVisibleActive(minY: number, maxY: number): number {
    let count = 0;

    for (const slot of this.pool) {
      if (slot.active && slot.y >= minY && slot.y <= maxY) {
        count += 1;
      }
    }

    return count;
  }

  /** Shared slot-creation path used by both seeding and top-up. */
  private placeTreeAt(side: DecorationSide, y: number): boolean {
    if (!this.layout) {
      return false;
    }

    if (this.activeIds.size >= DECORATION_CONFIG.maxActiveDecorations) {
      return false;
    }

    if (!this.hasVerticalGap(side, y)) {
      return false;
    }

    const existingSlot = this.pool.find((entry) => !entry.active);
    const renderIndex = existingSlot?.renderIndex ?? this.claimRenderIndex();
    if (renderIndex === null) {
      return false;
    }

    const scale = randomScaleVariation();
    const x = this.computeSpawnX(side, scale);

    const slot: MutableDecorationSlot = existingSlot ?? {
      id: createEntityId(),
      active: false,
      side,
      x,
      y,
      scale,
      speed: 0,
      renderIndex,
    };

    slot.id = createEntityId();
    slot.active = true;
    slot.side = side;
    slot.x = x;
    slot.y = y;
    slot.scale = scale;
    slot.speed = 0;
    slot.renderIndex = renderIndex;

    if (!existingSlot) {
      this.pool.push(slot);
    }

    this.activeIds.add(slot.id);
    this.activateRenderSlot(slot);
    this.syncRenderSlot(slot);

    return true;
  }

  private trySpawn(): void {
    if (!this.layout) {
      return;
    }

    const side = randomSide();
    const spawnY = this.layout.spawnY + randomSpawnYJitter();
    this.placeTreeAt(side, spawnY);
  }

  private computeSpawnX(side: DecorationSide, instanceScale: number): number {
    if (!this.layout) {
      return 0;
    }

    const regions = getRoadRegions(this.layout);
    const grass = side === 'left' ? regions.leftGrass : regions.rightGrass;
    const jitter = randomTrunkJitter();
    const { trunkInsetPx } = DECORATION_CONFIG;
    const trunkHalfWidthWorld =
      TREE_SKIN.trunkHalfWidthPx * TREE_SKIN.visualScale * instanceScale;

    const safeMin = grass.x + trunkInsetPx + trunkHalfWidthWorld;
    const safeMax = grass.x + grass.width - trunkInsetPx - trunkHalfWidthWorld;
    const desiredCenterX = grass.x + grass.width / 2 + jitter;
    const trunkCenterX =
      safeMin <= safeMax
        ? Math.max(safeMin, Math.min(safeMax, desiredCenterX))
        : grass.x + grass.width / 2;

    const trunkOffsetWorld =
      TREE_SKIN.trunkOffsetFromBodyCenterX *
      TREE_SKIN.visualScale *
      instanceScale;

    let bodyX = trunkCenterX - trunkOffsetWorld;

    if (side === 'left') {
      const shiftedTrunkCenterX =
        trunkCenterX + DECORATION_CONFIG.leftTreeRoadwardOffsetPx;
      const clampedTrunkCenterX = Math.max(
        safeMin,
        Math.min(safeMax, shiftedTrunkCenterX),
      );
      bodyX = clampedTrunkCenterX - trunkOffsetWorld;
    }

    return bodyX;
  }

  private hasVerticalGap(side: DecorationSide, spawnY: number): boolean {
    for (const slot of this.pool) {
      if (!slot.active || slot.side !== side) {
        continue;
      }

      if (Math.abs(slot.y - spawnY) < DECORATION_CONFIG.minVerticalGapPx) {
        return false;
      }
    }

    return true;
  }

  private claimRenderIndex(): number | null {
    const used = new Set(
      this.pool.filter((entry) => entry.active).map((entry) => entry.renderIndex),
    );

    for (let index = 0; index < this.renderBridge.slots.length; index += 1) {
      if (!used.has(index)) {
        return index;
      }
    }

    return null;
  }

  private activateRenderSlot(slot: MutableDecorationSlot): void {
    const renderSlot = this.renderBridge.slots[slot.renderIndex];
    if (!renderSlot) {
      return;
    }

    renderSlot.active = true;
    renderSlot.side = slot.side;
    renderSlot.scale = slot.scale;
    renderSlot.opacity.value = 1;
    this.bumpRevision();
  }

  private deactivateSlot(slot: MutableDecorationSlot): void {
    slot.active = false;
    this.activeIds.delete(slot.id);

    const renderSlot = this.renderBridge.slots[slot.renderIndex];
    if (renderSlot) {
      renderSlot.active = false;
      renderSlot.scale = 1;
      renderSlot.opacity.value = 0;
      this.bumpRevision();
    }
  }

  private bumpRevision(): void {
    this.renderBridge.revision.current += 1;
    this.renderBridge.onRevisionChange?.();
  }

  private syncRenderSlot(slot: MutableDecorationSlot): void {
    const renderSlot = this.renderBridge.slots[slot.renderIndex];
    if (!renderSlot) {
      return;
    }

    renderSlot.x.value = slot.x;
    renderSlot.y.value = slot.y;
  }
}

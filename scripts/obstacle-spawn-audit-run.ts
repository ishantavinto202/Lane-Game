/**
 * Headless obstacle spawn audit — runs ObstacleSystem with __DEV__ instrumentation.
 * Usage: npx tsx scripts/obstacle-spawn-audit-run.ts
 */
(globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__ = true;

import { COIN_CONFIG, SHIELD_CONFIG } from '../src/game/config';
import { POOL_CONSTANTS } from '../src/game/constants';
import { ObstacleSystem } from '../src/game/systems/obstacle/ObstacleSystem';
import type { ObstacleRenderBridge } from '../src/game/systems/obstacle/obstacle-motion.types';
import type { ObstacleSpawnAuditSummary } from '../src/game/systems/obstacle/obstacle-spawn-debug';
import { LaneSystem } from '../src/game/systems/lane/LaneSystem';
import type { CoinEntity, LaneIndex, ShieldEntity } from '../src/game/types';
import { createGameLayout } from '../src/game/utils/layout';
import { evaluateDifficulty } from '../src/game/utils/difficulty';

function buildMockRenderBridge(): ObstacleRenderBridge {
  const slots = Array.from({ length: POOL_CONSTANTS.MAX_OBSTACLES }, () => ({
    x: { value: 0 },
    y: { value: 0 },
    opacity: { value: 0 },
    active: false,
    assetId: null as ObstacleRenderBridge['slots'][number]['assetId'],
    width: 0,
    height: 0,
  }));

  return {
    slots,
    revision: { current: 0 },
  };
}

function aggregateSummaries(summaries: readonly ObstacleSpawnAuditSummary[]): ObstacleSpawnAuditSummary {
  const merged: ObstacleSpawnAuditSummary = {
    Tire: { selected: 0, spawned: 0, skipped: 0 },
    Cone: { selected: 0, spawned: 0, skipped: 0 },
    Crate: { selected: 0, spawned: 0, skipped: 0 },
    Barrier: { selected: 0, spawned: 0, skipped: 0 },
    skipReasonsByType: {
      Tire: {
        noValidLane: 0,
        verticalGapFailure: 0,
        fairLaneFailure: 0,
        coinConflict: 0,
        shieldConflict: 0,
        maxObstacleCount: 0,
      },
      Cone: {
        noValidLane: 0,
        verticalGapFailure: 0,
        fairLaneFailure: 0,
        coinConflict: 0,
        shieldConflict: 0,
        maxObstacleCount: 0,
      },
      Crate: {
        noValidLane: 0,
        verticalGapFailure: 0,
        fairLaneFailure: 0,
        coinConflict: 0,
        shieldConflict: 0,
        maxObstacleCount: 0,
      },
      Barrier: {
        noValidLane: 0,
        verticalGapFailure: 0,
        fairLaneFailure: 0,
        coinConflict: 0,
        shieldConflict: 0,
        maxObstacleCount: 0,
      },
    },
    maxObstacleCountBlocked: 0,
    spawnAttempts: 0,
  };

  for (const summary of summaries) {
    for (const label of ['Tire', 'Cone', 'Crate', 'Barrier'] as const) {
      merged[label].selected += summary[label].selected;
      merged[label].spawned += summary[label].spawned;
      merged[label].skipped += summary[label].skipped;

      for (const reason of Object.keys(merged.skipReasonsByType[label]) as Array<
        keyof ObstacleSpawnAuditSummary['skipReasonsByType']['Tire']
      >) {
        merged.skipReasonsByType[label][reason] += summary.skipReasonsByType[label][reason];
      }
    }

    merged.maxObstacleCountBlocked += summary.maxObstacleCountBlocked;
    merged.spawnAttempts += summary.spawnAttempts;
  }

  return merged;
}

const summaries: ObstacleSpawnAuditSummary[] = [];
const originalLog = console.log.bind(console);

console.log = (...args: unknown[]) => {
  if (args[0] === '[ObstacleSpawnAudit] Summary after 50 spawn attempts') {
    summaries.push(args[1] as ObstacleSpawnAuditSummary);
  }

  originalLog(...args);
};

const layout = createGameLayout(390, 844);
const laneSystem = new LaneSystem();
laneSystem.initialize(layout);

const obstacleSystem = new ObstacleSystem(buildMockRenderBridge());
obstacleSystem.initialize(layout, laneSystem);

interface MutablePickup {
  id: string;
  lane: LaneIndex;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

const mockCoins: MutablePickup[] = [];
const mockShields: MutablePickup[] = [];
let coinSpawnMs = COIN_CONFIG.initialDelayMs;
let shieldSpawnMs = SHIELD_CONFIG.initialDelayMs;
let nextCoinIntervalMs = COIN_CONFIG.minSpawnIntervalMs;
let nextShieldIntervalMs = SHIELD_CONFIG.minSpawnIntervalMs;
let coinId = 0;
let shieldId = 0;

function spawnMockCoin(speed: number): void {
  if (mockCoins.length >= POOL_CONSTANTS.MAX_COINS) {
    return;
  }

  const lane = (coinId % 3) as LaneIndex;
  coinId += 1;
  mockCoins.push({
    id: `mock-coin-${coinId}`,
    lane,
    x: layout.laneCenters[lane] ?? layout.laneCenters[1]!,
    y: layout.spawnY,
    width: COIN_CONFIG.size,
    height: COIN_CONFIG.size,
    speed,
  });
}

function spawnMockShield(speed: number): void {
  if (mockShields.length >= POOL_CONSTANTS.MAX_SHIELDS) {
    return;
  }

  const lane = ((shieldId + 1) % 3) as LaneIndex;
  shieldId += 1;
  mockShields.push({
    id: `mock-shield-${shieldId}`,
    lane,
    x: layout.laneCenters[lane] ?? layout.laneCenters[1]!,
    y: layout.spawnY - 20,
    width: SHIELD_CONFIG.size,
    height: SHIELD_CONFIG.size,
    speed,
  });
}

function toCoinEntities(): readonly CoinEntity[] {
  return mockCoins.map(
    (coin): CoinEntity => ({
      id: coin.id,
      assetId: 'COIN',
      lane: coin.lane,
      x: coin.x,
      y: coin.y,
      width: coin.width,
      height: coin.height,
      active: true,
      speed: coin.speed,
    }),
  );
}

function toShieldEntities(): readonly ShieldEntity[] {
  return mockShields.map(
    (shield): ShieldEntity => ({
      id: shield.id,
      assetId: 'SHIELD',
      lane: shield.lane,
      x: shield.x,
      y: shield.y,
      width: shield.width,
      height: shield.height,
      active: true,
      speed: shield.speed,
    }),
  );
}

function scrollPickups(deltaPx: number, despawnY: number): void {
  for (const coin of mockCoins) {
    coin.y += deltaPx;
  }

  for (const shield of mockShields) {
    shield.y += deltaPx;
  }

  while (mockCoins.length > 0 && mockCoins[0]!.y > despawnY) {
    mockCoins.shift();
  }

  while (mockShields.length > 0 && mockShields[0]!.y > despawnY) {
    mockShields.shift();
  }
}

const scenario = process.argv[2] ?? 'with-pickups';
const includePickups = scenario !== 'empty';
const stressDensity = scenario === 'stress';

const FRAME_MS = 1000 / 60;
const TARGET_SUMMARIES = 4;
let elapsedMs = 0;
const MAX_ELAPSED_MS = 360_000;

if (stressDensity) {
  // Pre-fill all lanes near spawn line to force validation pressure.
  const pool = (obstacleSystem as unknown as { pool: Array<{ active: boolean; assetId: string; lane: LaneIndex; x: number; y: number; width: number; height: number; speed: number; id: string; renderIndex: number }> }).pool;
  const activeIds = (obstacleSystem as unknown as { activeIds: Set<string> }).activeIds;
  for (let index = 0; index < 8; index += 1) {
    const lane = (index % 3) as LaneIndex;
    pool.push({
      id: `stress-${index}`,
      active: true,
      assetId: index % 2 === 0 ? 'OBSTACLE_TIRE' : 'OBSTACLE_CONE',
      lane,
      x: layout.laneCenters[lane] ?? layout.laneCenters[1]!,
      y: layout.spawnY + (index % 4) * 40,
      width: 64,
      height: 64,
      speed: 320,
      renderIndex: index,
    });
    activeIds.add(`stress-${index}`);
  }
}

while (summaries.length < TARGET_SUMMARIES && elapsedMs < MAX_ELAPSED_MS) {
  const difficulty = evaluateDifficulty(elapsedMs);
  const deltaPx = (difficulty.speedPxPerSec * FRAME_MS) / 1000;

  if (includePickups) {
    coinSpawnMs += FRAME_MS;
    shieldSpawnMs += FRAME_MS;

    while (coinSpawnMs >= nextCoinIntervalMs) {
      coinSpawnMs -= nextCoinIntervalMs;
      nextCoinIntervalMs =
        COIN_CONFIG.minSpawnIntervalMs +
        Math.floor(
          Math.random() * (COIN_CONFIG.maxSpawnIntervalMs - COIN_CONFIG.minSpawnIntervalMs + 1),
        );
      spawnMockCoin(difficulty.speedPxPerSec);
    }

    while (shieldSpawnMs >= nextShieldIntervalMs) {
      shieldSpawnMs -= nextShieldIntervalMs;
      nextShieldIntervalMs =
        SHIELD_CONFIG.minSpawnIntervalMs +
        Math.floor(
          Math.random() *
            (SHIELD_CONFIG.maxSpawnIntervalMs - SHIELD_CONFIG.minSpawnIntervalMs + 1),
        );
      spawnMockShield(difficulty.speedPxPerSec);
    }

    scrollPickups(deltaPx, layout.despawnY);
  }

  obstacleSystem.updateObstacles(
    FRAME_MS,
    difficulty.speedPxPerSec,
    includePickups ? toCoinEntities() : [],
    includePickups ? toShieldEntities() : [],
  );
  elapsedMs += FRAME_MS;
}

const aggregate = aggregateSummaries(summaries);

originalLog('\n=== Obstacle Spawn Audit (headless simulation) ===');
originalLog(
  `Scenario: ${scenario} | Elapsed: ${Math.round(elapsedMs / 1000)}s | Summaries: ${summaries.length}`,
);
originalLog(JSON.stringify(aggregate, null, 2));

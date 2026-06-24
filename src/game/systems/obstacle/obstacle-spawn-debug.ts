import type { ObstacleAssetId } from '../../types';

const TRACK_LIMIT = 100;
const TYPE_AUDIT_SUMMARY_LIMIT = 50;

/** Obstacle types included in the unified spawn audit. */
export const AUDITED_OBSTACLE_TYPES = [
  'OBSTACLE_TIRE',
  'OBSTACLE_CONE',
  'OBSTACLE_CRATE',
  'OBSTACLE_BARRIER',
] as const;

export type AuditedObstacleType = (typeof AUDITED_OBSTACLE_TYPES)[number];

export type ObstacleAuditLabel = 'Tire' | 'Cone' | 'Crate' | 'Barrier';

export const OBSTACLE_TYPE_LABELS: Record<AuditedObstacleType, ObstacleAuditLabel> = {
  OBSTACLE_TIRE: 'Tire',
  OBSTACLE_CONE: 'Cone',
  OBSTACLE_CRATE: 'Crate',
  OBSTACLE_BARRIER: 'Barrier',
};

/** Dev-only skip reason keys (diagnostic counters only). */
export type ObstacleSkipReasonKey =
  | 'noValidLane'
  | 'verticalGapFailure'
  | 'fairLaneFailure'
  | 'coinConflict'
  | 'shieldConflict'
  | 'maxObstacleCount';

export interface ObstacleTypeSpawnCounts {
  readonly selected: number;
  readonly spawned: number;
  readonly skipped: number;
}

export interface ObstacleTypeSkipReasonCounts {
  readonly noValidLane: number;
  readonly verticalGapFailure: number;
  readonly fairLaneFailure: number;
  readonly coinConflict: number;
  readonly shieldConflict: number;
  readonly maxObstacleCount: number;
}

export interface ObstacleSpawnAuditSummary {
  readonly Tire: ObstacleTypeSpawnCounts;
  readonly Cone: ObstacleTypeSpawnCounts;
  readonly Crate: ObstacleTypeSpawnCounts;
  readonly Barrier: ObstacleTypeSpawnCounts;
  readonly skipReasonsByType: Record<ObstacleAuditLabel, ObstacleTypeSkipReasonCounts>;
  readonly maxObstacleCountBlocked: number;
  readonly spawnAttempts: number;
}

function emptySkipReasons(): ObstacleTypeSkipReasonCounts {
  return {
    noValidLane: 0,
    verticalGapFailure: 0,
    fairLaneFailure: 0,
    coinConflict: 0,
    shieldConflict: 0,
    maxObstacleCount: 0,
  };
}

function emptyTypeCounts(): ObstacleTypeSpawnCounts {
  return { selected: 0, spawned: 0, skipped: 0 };
}

function isAuditedType(assetId: ObstacleAssetId): assetId is AuditedObstacleType {
  return (AUDITED_OBSTACLE_TYPES as readonly ObstacleAssetId[]).includes(assetId);
}

/** Dev-only unified spawn audit for Tire, Cone, Crate, and Barrier. */
export class ObstacleTypeSpawnAuditTracker {
  private spawnAttemptCount = 0;
  private maxObstacleCountBlocked = 0;
  private readonly stats: Record<AuditedObstacleType, ObstacleTypeSpawnCounts> = {
    OBSTACLE_TIRE: emptyTypeCounts(),
    OBSTACLE_CONE: emptyTypeCounts(),
    OBSTACLE_CRATE: emptyTypeCounts(),
    OBSTACLE_BARRIER: emptyTypeCounts(),
  };
  private readonly skipReasonsByType: Record<
    AuditedObstacleType,
    ObstacleTypeSkipReasonCounts
  > = {
    OBSTACLE_TIRE: emptySkipReasons(),
    OBSTACLE_CONE: emptySkipReasons(),
    OBSTACLE_CRATE: emptySkipReasons(),
    OBSTACLE_BARRIER: emptySkipReasons(),
  };

  reset(): void {
    this.spawnAttemptCount = 0;
    this.maxObstacleCountBlocked = 0;

    for (const type of AUDITED_OBSTACLE_TYPES) {
      this.stats[type] = emptyTypeCounts();
      this.skipReasonsByType[type] = emptySkipReasons();
    }
  }

  onSpawnAttempt(): ObstacleSpawnAuditSummary | null {
    if (!__DEV__) {
      return null;
    }

    this.spawnAttemptCount += 1;

    if (this.spawnAttemptCount < TYPE_AUDIT_SUMMARY_LIMIT) {
      return null;
    }

    const summary = this.buildSummary();
    this.printSummary(summary);
    this.reset();
    return summary;
  }

  recordMaxObstacleCount(): void {
    if (!__DEV__) {
      return;
    }

    this.maxObstacleCountBlocked += 1;
  }

  recordSelected(assetId: ObstacleAssetId): void {
    if (!__DEV__ || !isAuditedType(assetId)) {
      return;
    }

    this.stats[assetId].selected += 1;
    console.log(`[ObstacleSelected] type=${OBSTACLE_TYPE_LABELS[assetId]}`);
  }

  recordSpawned(assetId: ObstacleAssetId): void {
    if (!__DEV__ || !isAuditedType(assetId)) {
      return;
    }

    this.stats[assetId].spawned += 1;
    console.log(`[ObstacleSpawned] type=${OBSTACLE_TYPE_LABELS[assetId]}`);
  }

  recordSkipped(assetId: ObstacleAssetId): void {
    if (!__DEV__ || !isAuditedType(assetId)) {
      return;
    }

    this.stats[assetId].skipped += 1;
    console.log(`[ObstacleSkipped] type=${OBSTACLE_TYPE_LABELS[assetId]}`);
  }

  recordRetryFailure(assetId: ObstacleAssetId, reason: ObstacleSkipReasonKey): void {
    if (!__DEV__ || !isAuditedType(assetId)) {
      return;
    }

    this.skipReasonsByType[assetId][reason] += 1;
  }

  buildSummary(): ObstacleSpawnAuditSummary {
    return {
      Tire: { ...this.stats.OBSTACLE_TIRE },
      Cone: { ...this.stats.OBSTACLE_CONE },
      Crate: { ...this.stats.OBSTACLE_CRATE },
      Barrier: { ...this.stats.OBSTACLE_BARRIER },
      skipReasonsByType: {
        Tire: { ...this.skipReasonsByType.OBSTACLE_TIRE },
        Cone: { ...this.skipReasonsByType.OBSTACLE_CONE },
        Crate: { ...this.skipReasonsByType.OBSTACLE_CRATE },
        Barrier: { ...this.skipReasonsByType.OBSTACLE_BARRIER },
      },
      maxObstacleCountBlocked: this.maxObstacleCountBlocked,
      spawnAttempts: this.spawnAttemptCount,
    };
  }

  private printSummary(summary: ObstacleSpawnAuditSummary): void {
    console.log('[ObstacleSpawnAudit] Summary after 50 spawn attempts', summary);
  }
}

/** @deprecated Use ObstacleSkipReasonKey */
export type BarrierSkipReasonKey = ObstacleSkipReasonKey;

interface SpawnDebugEvent {
  readonly selectedType: ObstacleAssetId;
  readonly spawnedType: ObstacleAssetId | null;
  readonly fallbackUsed: boolean;
  readonly skipped: boolean;
}

/** Dev-only spawn audit — logs per attempt and summarizes every 100 spawns. */
export class ObstacleSpawnDebugTracker {
  private attemptCount = 0;
  private spawnedCount = 0;
  private skippedCount = 0;
  private spawnedByType: Partial<Record<ObstacleAssetId, number>> = {};

  reset(): void {
    this.attemptCount = 0;
    this.spawnedCount = 0;
    this.skippedCount = 0;
    this.spawnedByType = {};
  }

  record(event: SpawnDebugEvent): void {
    if (!__DEV__) {
      return;
    }

    this.attemptCount += 1;

    if (event.skipped) {
      this.skippedCount += 1;
    } else if (event.spawnedType) {
      this.spawnedCount += 1;
      this.spawnedByType[event.spawnedType] = (this.spawnedByType[event.spawnedType] ?? 0) + 1;
    }

    console.log(
      `[ObstacleSpawn] SelectedType=${event.selectedType} SpawnedType=${event.spawnedType ?? '—'} FallbackUsed=${event.fallbackUsed} Skipped=${event.skipped}`,
    );

    if (this.attemptCount < TRACK_LIMIT) {
      return;
    }

    console.log('[ObstacleSpawn] Summary after 100 spawn attempts', {
      spawnedCount: this.spawnedCount,
      skippedCount: this.skippedCount,
      spawnedByType: this.spawnedByType,
    });
    this.reset();
  }
}

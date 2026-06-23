import type { ObstacleAssetId } from '../../types';

const TRACK_LIMIT = 100;

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

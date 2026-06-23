import type { CollisionEvent, CollisionPolicy, CollisionProbe } from '../../types';

/** Lane-based collision detection contract (Phase 3 implementation). */
export interface CollisionSystemContract {
  readonly id: 'collision-system';
  readonly setPolicy: (policy: CollisionPolicy) => void;
  readonly evaluate: (
    player: CollisionProbe,
    obstacles: readonly CollisionProbe[],
  ) => CollisionEvent | null;
  readonly reset: () => void;
}

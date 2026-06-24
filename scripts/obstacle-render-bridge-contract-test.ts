import type { ObstacleRenderSlot } from '../src/game/systems/obstacle/obstacle-motion.types';
import type { ObstacleAssetId } from '../src/game/types';

declare const slot: ObstacleRenderSlot;

slot.active satisfies boolean;
slot.assetId satisfies ObstacleAssetId | null;
slot.width satisfies number;
slot.height satisfies number;

// Render metadata must stay top-level so Reanimated worklets never capture a nested
// object that the engine mutates later.
// @ts-expect-error Obstacle render slots must not expose nested metadata.
slot.meta;

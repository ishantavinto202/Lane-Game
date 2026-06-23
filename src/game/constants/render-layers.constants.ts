import { RenderLayer } from '../types/asset.types';

/** Z-index ordering reference for documentation and runtime checks. */
export const RENDER_LAYER_ORDER: readonly RenderLayer[] = [
  RenderLayer.Grass,
  RenderLayer.Sidewalk,
  RenderLayer.Decoration,
  RenderLayer.Road,
  RenderLayer.Obstacle,
  RenderLayer.Player,
  RenderLayer.Controls,
  RenderLayer.Hud,
  RenderLayer.Overlay,
] as const;

export const RENDER_LAYER_LABELS: Record<RenderLayer, string> = {
  [RenderLayer.Grass]: 'grass',
  [RenderLayer.Sidewalk]: 'sidewalk',
  [RenderLayer.Decoration]: 'decoration',
  [RenderLayer.Road]: 'road',
  [RenderLayer.Obstacle]: 'obstacle',
  [RenderLayer.Player]: 'player',
  [RenderLayer.Controls]: 'controls',
  [RenderLayer.Hud]: 'hud',
  [RenderLayer.Overlay]: 'overlay',
} as const;

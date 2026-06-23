/** Render-only world camera zoom — gameplay coordinates stay at scale 1. */
export const WORLD_CAMERA_SCALE = 0.875;

/** Expand road/tile render height so scaled content fills the full screen. */
export function getWorldCameraRenderHeight(screenHeight: number): number {
  return screenHeight / WORLD_CAMERA_SCALE;
}

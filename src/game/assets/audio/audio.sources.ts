/** Bundled SFX sources for expo-audio preload. */
export const AUDIO_SFX_SOURCES = {
  laneChange: require('../../../../assets/audio/lane-change.wav'),
  collision: require('../../../../assets/audio/collision.wav'),
  gameOver: require('../../../../assets/audio/game-over.wav'),
} as const;

export type AudioSfxId = keyof typeof AUDIO_SFX_SOURCES;

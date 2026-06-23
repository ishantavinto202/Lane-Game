import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { AUDIO_SFX_SOURCES, type AudioSfxId } from '../../assets/audio/audio.sources';
import { AUDIO_CONFIG, GAME_CONFIG } from '../../config';

import type { AudioManagerContract } from './audio.contract';

/** Preloaded expo-audio SFX pool — one player per sound, reused each play. */
export class AudioManager implements AudioManagerContract {
  private readonly players = new Map<AudioSfxId, AudioPlayer>();
  private ready = false;

  async preload(): Promise<void> {
    if (!GAME_CONFIG.enableSound || this.ready) {
      return;
    }

    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      interruptionModeAndroid: 'duckOthers',
      allowsRecording: false,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    });

    (Object.keys(AUDIO_SFX_SOURCES) as AudioSfxId[]).forEach((key) => {
      const player = createAudioPlayer(AUDIO_SFX_SOURCES[key]);
      player.loop = false;
      player.volume = this.resolveVolume(key);
      this.players.set(key, player);
    });

    this.ready = true;
  }

  playLaneChange(): void {
    this.replay('laneChange');
  }

  playCollision(): void {
    this.replay('collision');
  }

  playGameOver(): void {
    this.replay('gameOver');
  }

  dispose(): void {
    for (const player of this.players.values()) {
      player.remove();
    }

    this.players.clear();
    this.ready = false;
  }

  private resolveVolume(key: AudioSfxId): number {
    const master = AUDIO_CONFIG.masterVolume * AUDIO_CONFIG.sfxVolume;

    if (key === 'laneChange') {
      return master * AUDIO_CONFIG.laneChangeVolume;
    }

    if (key === 'collision') {
      return master * AUDIO_CONFIG.collisionVolume;
    }

    return master * AUDIO_CONFIG.sfxVolume;
  }

  private replay(key: AudioSfxId): void {
    if (!GAME_CONFIG.enableSound || !this.ready) {
      return;
    }

    const player = this.players.get(key);
    if (!player) {
      return;
    }

    void player.seekTo(0);
    player.play();
  }
}

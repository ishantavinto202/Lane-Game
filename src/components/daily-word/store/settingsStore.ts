import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import type { GameSettings } from '../game/types';

const STORAGE_KEY = '@daily-word/settings';

const DEFAULT_SETTINGS: GameSettings = {
  hardMode: false,
  hapticsEnabled: true,
  soundEnabled: true,
  showTimer: true,
};

export interface SettingsStoreState {
  settings: GameSettings;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setHardMode: (enabled: boolean) => Promise<void>;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  setShowTimer: (enabled: boolean) => Promise<void>;
}

async function persistSettings(settings: GameSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GameSettings;
        set({ settings: { ...DEFAULT_SETTINGS, ...parsed }, hydrated: true });
        return;
      }
    } catch {
      // fall through to defaults
    }
    set({ settings: DEFAULT_SETTINGS, hydrated: true });
  },

  setHardMode: async (enabled) => {
    const settings = { ...get().settings, hardMode: enabled };
    set({ settings });
    await persistSettings(settings);
  },

  setHapticsEnabled: async (enabled) => {
    const settings = { ...get().settings, hapticsEnabled: enabled };
    set({ settings });
    await persistSettings(settings);
  },

  setSoundEnabled: async (enabled) => {
    const settings = { ...get().settings, soundEnabled: enabled };
    set({ settings });
    await persistSettings(settings);
  },

  setShowTimer: async (enabled) => {
    const settings = { ...get().settings, showTimer: enabled };
    set({ settings });
    await persistSettings(settings);
  },
}));

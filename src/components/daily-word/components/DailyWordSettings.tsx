import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SCREEN_COLORS } from '../constants/colors';
import { useSettingsStore } from '../store/settingsStore';

interface SettingToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function SettingToggle({ label, value, onValueChange }: SettingToggleProps) {
  return (
    <View className="mb-6 flex-row items-center justify-between">
      <Text className="text-base" style={{ color: SCREEN_COLORS.textPrimary }}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#3A3A3C', true: SCREEN_COLORS.accent }}
      />
    </View>
  );
}

function DailyWordSettingsComponent() {
  const router = useRouter();
  const settings = useSettingsStore((state) => state.settings);
  const setHardMode = useSettingsStore((state) => state.setHardMode);
  const setHapticsEnabled = useSettingsStore((state) => state.setHapticsEnabled);
  const setSoundEnabled = useSettingsStore((state) => state.setSoundEnabled);
  const setShowTimer = useSettingsStore((state) => state.setShowTimer);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleHardMode = useCallback(
    (value: boolean) => {
      void setHardMode(value);
    },
    [setHardMode],
  );

  const handleHaptics = useCallback(
    (value: boolean) => {
      void setHapticsEnabled(value);
    },
    [setHapticsEnabled],
  );

  const handleSound = useCallback(
    (value: boolean) => {
      void setSoundEnabled(value);
    },
    [setSoundEnabled],
  );

  const handleShowTimer = useCallback(
    (value: boolean) => {
      void setShowTimer(value);
    },
    [setShowTimer],
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SCREEN_COLORS.background }}>
      <View className="flex-1 px-6 pt-4">
        <Pressable onPress={handleBack} className="mb-6 self-start">
          <Text style={{ color: SCREEN_COLORS.textSecondary }}>Back</Text>
        </Pressable>

        <Text className="mb-8 text-3xl font-bold" style={{ color: SCREEN_COLORS.textPrimary }}>
          Settings
        </Text>

        <SettingToggle label="Hard Mode" value={settings.hardMode} onValueChange={handleHardMode} />
        <SettingToggle label="Haptics" value={settings.hapticsEnabled} onValueChange={handleHaptics} />
        <SettingToggle label="Sound" value={settings.soundEnabled} onValueChange={handleSound} />
        <SettingToggle label="Show Timer" value={settings.showTimer} onValueChange={handleShowTimer} />
      </View>
    </SafeAreaView>
  );
}

export const DailyWordSettings = memo(DailyWordSettingsComponent);
export default DailyWordSettings;

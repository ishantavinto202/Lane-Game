import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SCREEN_COLORS } from '../constants/colors';
import { useWordGameActions } from '../game/hooks/useWordGame';

function DailyWordPauseOverlayComponent() {
  const { handleResume, handleRestart } = useWordGameActions();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SCREEN_COLORS.background }}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-8 text-3xl font-bold" style={{ color: SCREEN_COLORS.textPrimary }}>
          Paused
        </Text>

        <Pressable
          onPress={handleResume}
          className="mb-4 w-full items-center rounded-lg py-4"
          style={{ backgroundColor: SCREEN_COLORS.accent }}
        >
          <Text className="text-lg font-bold text-white">Resume</Text>
        </Pressable>

        <Pressable
          onPress={handleRestart}
          className="w-full items-center rounded-lg border py-4"
          style={{ borderColor: SCREEN_COLORS.textSecondary }}
        >
          <Text className="text-base font-semibold" style={{ color: SCREEN_COLORS.textPrimary }}>
            Restart Puzzle
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export const DailyWordPauseOverlay = memo(DailyWordPauseOverlayComponent);
export default DailyWordPauseOverlay;

import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SCREEN_COLORS } from '../constants/colors';
import { useStatsStore } from '../store/statsStore';

function DailyWordLandingComponent() {
  const router = useRouter();
  const gamesPlayed = useStatsStore((state) => state.stats.gamesPlayed);
  const currentStreak = useStatsStore((state) => state.stats.currentStreak);

  const handlePlay = useCallback(() => {
    router.push('/dailyWord/game' as never);
  }, [router]);

  const handleStats = useCallback(() => {
    router.push('/dailyWord/stats' as never);
  }, [router]);

  const handleSettings = useCallback(() => {
    router.push('/dailyWord/settings' as never);
  }, [router]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SCREEN_COLORS.background }}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-4xl font-bold" style={{ color: SCREEN_COLORS.textPrimary }}>
          Daily Word
        </Text>
        <Text className="mb-10 text-center text-base" style={{ color: SCREEN_COLORS.textSecondary }}>
          Guess the five-letter word in six tries.
        </Text>

        <Pressable
          onPress={handlePlay}
          className="mb-4 w-full items-center rounded-lg py-4"
          style={{ backgroundColor: SCREEN_COLORS.accent }}
        >
          <Text className="text-lg font-bold text-white">Play Today</Text>
        </Pressable>

        <Pressable
          onPress={handleStats}
          className="mb-4 w-full items-center rounded-lg border py-4"
          style={{ borderColor: SCREEN_COLORS.textSecondary }}
        >
          <Text className="text-base font-semibold" style={{ color: SCREEN_COLORS.textPrimary }}>
            Stats
          </Text>
        </Pressable>

        <Pressable onPress={handleSettings} className="w-full items-center py-3">
          <Text className="text-base" style={{ color: SCREEN_COLORS.textSecondary }}>
            Settings
          </Text>
        </Pressable>

        <View className="absolute bottom-8 flex-row gap-6">
          <Text style={{ color: SCREEN_COLORS.textSecondary }}>Played: {gamesPlayed}</Text>
          <Text style={{ color: SCREEN_COLORS.textSecondary }}>Streak: {currentStreak}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export const DailyWordLanding = memo(DailyWordLandingComponent);
export default DailyWordLanding;

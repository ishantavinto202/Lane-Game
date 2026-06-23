import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SCREEN_COLORS } from '../constants/colors';
import { useGameStore } from '../store/gameStore';
import { useStatsStore } from '../store/statsStore';

function DailyWordVictoryScreenComponent() {
  const router = useRouter();
  const session = useGameStore((state) => state.session);
  const currentStreak = useStatsStore((state) => state.stats.currentStreak);

  const handleHome = useCallback(() => {
    router.replace('/dailyWord' as never);
  }, [router]);

  const handleShare = useCallback(() => {
    router.replace('/dailyWord' as never);
  }, [router]);

  const guessCount = session ? session.currentRowIndex + 1 : 0;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SCREEN_COLORS.background }}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-3xl font-bold" style={{ color: SCREEN_COLORS.accent }}>
          You Won!
        </Text>
        <Text className="mb-6 text-center text-base" style={{ color: SCREEN_COLORS.textSecondary }}>
          Solved in {guessCount} {guessCount === 1 ? 'guess' : 'guesses'}
        </Text>

        <View className="mb-8 w-full rounded-xl p-6" style={{ backgroundColor: SCREEN_COLORS.surface }}>
          <Text className="mb-2 text-center text-sm" style={{ color: SCREEN_COLORS.textSecondary }}>
            Score
          </Text>
          <Text className="text-center text-4xl font-bold" style={{ color: SCREEN_COLORS.textPrimary }}>
            {session?.score ?? 0}
          </Text>
          <Text className="mt-4 text-center text-sm" style={{ color: SCREEN_COLORS.textSecondary }}>
            Streak: {currentStreak}
          </Text>
        </View>

        <Pressable
          onPress={handleShare}
          className="mb-4 w-full items-center rounded-lg py-4"
          style={{ backgroundColor: SCREEN_COLORS.accent }}
        >
          <Text className="text-lg font-bold text-white">Done</Text>
        </Pressable>

        <Pressable onPress={handleHome} className="w-full items-center py-3">
          <Text className="text-base" style={{ color: SCREEN_COLORS.textSecondary }}>
            Back to Home
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export const DailyWordVictoryScreen = memo(DailyWordVictoryScreenComponent);
export default DailyWordVictoryScreen;

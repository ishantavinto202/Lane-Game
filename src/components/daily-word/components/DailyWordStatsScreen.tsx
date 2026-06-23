import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SCREEN_COLORS } from '../constants/colors';
import { useStatsStore } from '../store/statsStore';

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <Text style={{ color: SCREEN_COLORS.textSecondary }}>{label}</Text>
      <Text className="font-semibold" style={{ color: SCREEN_COLORS.textPrimary }}>
        {value}
      </Text>
    </View>
  );
}

function DailyWordStatsScreenComponent() {
  const router = useRouter();
  const stats = useStatsStore((state) => state.stats);
  const resetStats = useStatsStore((state) => state.resetStats);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleReset = useCallback(() => {
    void resetStats();
  }, [resetStats]);

  const winRate =
    stats.gamesPlayed > 0 ? `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%` : '0%';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SCREEN_COLORS.background }}>
      <View className="flex-1 px-6 pt-4">
        <Pressable onPress={handleBack} className="mb-6 self-start">
          <Text style={{ color: SCREEN_COLORS.textSecondary }}>Back</Text>
        </Pressable>

        <Text className="mb-8 text-3xl font-bold" style={{ color: SCREEN_COLORS.textPrimary }}>
          Statistics
        </Text>

        <StatRow label="Played" value={stats.gamesPlayed} />
        <StatRow label="Win %" value={winRate} />
        <StatRow label="Current Streak" value={stats.currentStreak} />
        <StatRow label="Max Streak" value={stats.maxStreak} />
        <StatRow label="Avg Guesses" value={stats.averageGuesses} />
        <StatRow label="Best Score" value={stats.bestScore} />
        <StatRow label="Total Score" value={stats.totalScore} />

        <Pressable onPress={handleReset} className="mt-8 self-start">
          <Text style={{ color: SCREEN_COLORS.danger }}>Reset Statistics</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export const DailyWordStatsScreen = memo(DailyWordStatsScreenComponent);
export default DailyWordStatsScreen;

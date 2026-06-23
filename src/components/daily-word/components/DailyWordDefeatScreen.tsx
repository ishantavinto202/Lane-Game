import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SCREEN_COLORS } from '../constants/colors';
import { useGameStore } from '../store/gameStore';

function DailyWordDefeatScreenComponent() {
  const router = useRouter();
  const answer = useGameStore((state) => state.session?.answer ?? '');

  const handleHome = useCallback(() => {
    router.replace('/dailyWord' as never);
  }, [router]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SCREEN_COLORS.background }}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-3xl font-bold" style={{ color: SCREEN_COLORS.danger }}>
          Out of Guesses
        </Text>
        <Text className="mb-6 text-center text-base" style={{ color: SCREEN_COLORS.textSecondary }}>
          The word was
        </Text>
        <Text className="mb-10 text-4xl font-bold tracking-widest" style={{ color: SCREEN_COLORS.textPrimary }}>
          {answer}
        </Text>

        <Pressable
          onPress={handleHome}
          className="w-full items-center rounded-lg py-4"
          style={{ backgroundColor: SCREEN_COLORS.accent }}
        >
          <Text className="text-lg font-bold text-white">Back to Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export const DailyWordDefeatScreen = memo(DailyWordDefeatScreenComponent);
export default DailyWordDefeatScreen;

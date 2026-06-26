import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ROAD_COLORS } from '@/src/game/config';

function HomeScreenComponent() {
  const router = useRouter();

  const handlePlay = useCallback(() => {
    router.push('/lane-game');
  }, [router]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: ROAD_COLORS.grassA }}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-4xl font-bold text-white">Lane</Text>
        <Text className="mb-10 text-center text-base text-white/80">
          Endless car avoidance. Dodge obstacles, collect coins, survive.
        </Text>

        <Pressable
          onPress={handlePlay}
          accessibilityLabel="Play Lane"
          className="w-full items-center rounded-lg py-4"
          style={{ backgroundColor: ROAD_COLORS.surface }}
        >
          <Text className="text-lg font-bold text-white">Play</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default memo(HomeScreenComponent);

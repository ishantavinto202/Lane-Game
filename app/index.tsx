import { useFocusEffect, useRouter } from 'expo-router';
import { memo, useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { preloadLaneGameImages } from '@/src/game/assets/preload-lane-game-images';
import { ROAD_COLORS } from '@/src/game/config';

type PlayState = 'idle' | 'loading';

function HomeScreenComponent() {
  const router = useRouter();
  const navigatingRef = useRef(false);
  const [playState, setPlayState] = useState<PlayState>('idle');

  useFocusEffect(
    useCallback(() => {
      navigatingRef.current = false;
      setPlayState('idle');
    }, []),
  );

  const handlePlay = useCallback(async () => {
    if (navigatingRef.current) {
      return;
    }

    navigatingRef.current = true;
    setPlayState('loading');

    try {
      await preloadLaneGameImages();
      router.push('/lane-game');
    } catch {
      navigatingRef.current = false;
      setPlayState('idle');
    }
  }, [router]);

  const isPlayDisabled = playState !== 'idle';
  const isLoading = playState === 'loading';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: ROAD_COLORS.grassA }}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-4xl font-bold text-white">Lane</Text>
        <Text className="mb-10 text-center text-base text-white/80">
          Endless car avoidance. Dodge obstacles, collect coins, survive.
        </Text>

        <Pressable
          onPress={handlePlay}
          disabled={isPlayDisabled}
          accessibilityLabel={isLoading ? 'Loading game' : 'Play Lane'}
          accessibilityState={{ disabled: isPlayDisabled, busy: isLoading }}
          className="w-full items-center rounded-lg py-4"
          style={{
            backgroundColor: ROAD_COLORS.surface,
            opacity: isPlayDisabled ? 0.7 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-lg font-bold text-white">Play</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default memo(HomeScreenComponent);

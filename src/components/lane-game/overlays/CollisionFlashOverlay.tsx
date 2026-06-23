import { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { gameStoreSelectors, useGameStore } from '@/src/game/store';

const FLASH_DURATION_MS = 120;

function CollisionFlashOverlayComponent() {
  const collisionFlashNonce = useGameStore(gameStoreSelectors.collisionFlashNonce);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (collisionFlashNonce === 0) {
      return;
    }

    opacity.value = withSequence(
      withTiming(0.45, { duration: FLASH_DURATION_MS / 2 }),
      withTiming(0, { duration: FLASH_DURATION_MS / 2 }),
    );
  }, [collisionFlashNonce, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.flash, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  flash: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 45000,
    elevation: 45000,
    backgroundColor: '#FF2D2D',
  },
});

export const CollisionFlashOverlay = memo(CollisionFlashOverlayComponent);

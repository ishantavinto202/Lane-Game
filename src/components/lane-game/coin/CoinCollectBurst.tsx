import { memo, useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { COIN_CONFIG } from '@/src/game/config';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';

function CoinCollectBurstComponent() {
  const coinCollectEffect = useGameStore(gameStoreSelectors.coinCollectEffect);
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (coinCollectEffect.nonce === 0) {
      return;
    }

    scale.value = 0.6;
    opacity.value = 1;

    const duration = COIN_CONFIG.collectEffectDurationMs;

    scale.value = withSequence(
      withTiming(1.35, { duration: duration * 0.45 }),
      withTiming(1.6, { duration: duration * 0.55 }),
    );
    opacity.value = withSequence(
      withTiming(1, { duration: duration * 0.2 }),
      withTiming(0, { duration: duration * 0.8 }),
    );
  }, [coinCollectEffect.nonce, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: coinCollectEffect.x - COIN_CONFIG.size / 2,
    top: coinCollectEffect.y - COIN_CONFIG.size / 2,
    width: COIN_CONFIG.size,
    height: COIN_CONFIG.size,
    borderRadius: COIN_CONFIG.size / 2,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    backgroundColor: 'rgba(255, 215, 0, 0.85)',
    borderWidth: 2,
    borderColor: '#FFF8DC',
  }));

  if (coinCollectEffect.nonce === 0) {
    return null;
  }

  return <Animated.View pointerEvents="none" style={animatedStyle} />;
}

export const CoinCollectBurst = memo(CoinCollectBurstComponent);

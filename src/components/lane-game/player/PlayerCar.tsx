import { memo, useCallback, useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { PLAYER_CAR_DEFAULT } from '@/src/game/assets';
import { HEALTH_CONFIG } from '@/src/game/config';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import type { PlayerMotionSharedValues } from '@/src/game/systems/player/PlayerMotionController';
import type { PlayerSnapshot } from '@/src/game/systems/player/PlayerSystem';

const PLAYER_CAR_VISUAL_OFFSET_X = PLAYER_CAR_DEFAULT.visualOffsetX;
const PLAYER_CAR_VISUAL_OFFSET_Y = PLAYER_CAR_DEFAULT.visualOffsetY;
const PLAYER_CAR_SPRITE_WIDTH = PLAYER_CAR_DEFAULT.spriteWidth;
const PLAYER_CAR_SPRITE_HEIGHT = PLAYER_CAR_DEFAULT.spriteHeight;

export interface PlayerCarProps {
  readonly snapshot: PlayerSnapshot;
  readonly motion: PlayerMotionSharedValues;
}

function PlayerCarComponent({ motion }: PlayerCarProps) {
  const damageBlinkNonce = useGameStore(gameStoreSelectors.damageBlinkNonce);
  const health = useGameStore(gameStoreSelectors.health);
  const blinkOpacity = useSharedValue(1);

  const runDamageBlink = useCallback(() => {
    cancelAnimation(blinkOpacity);
    blinkOpacity.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: HEALTH_CONFIG.carBlinkCycleMs / 2 }),
        withTiming(1, { duration: HEALTH_CONFIG.carBlinkCycleMs / 2 }),
      ),
      Math.ceil(HEALTH_CONFIG.invulnerabilityMs / HEALTH_CONFIG.carBlinkCycleMs),
      false,
    );
  }, [blinkOpacity]);

  useEffect(() => {
    if (damageBlinkNonce === 0) {
      return;
    }

    runDamageBlink();
  }, [damageBlinkNonce, runDamageBlink]);

  useEffect(() => {
    if (health !== HEALTH_CONFIG.maxHealth) {
      return;
    }

    cancelAnimation(blinkOpacity);
    blinkOpacity.value = 1;
  }, [blinkOpacity, health]);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: motion.x.value + PLAYER_CAR_VISUAL_OFFSET_X,
    top: motion.y.value + PLAYER_CAR_VISUAL_OFFSET_Y,
    width: PLAYER_CAR_SPRITE_WIDTH,
    height: PLAYER_CAR_SPRITE_HEIGHT,
    opacity: blinkOpacity.value,
    transform: [{ rotateZ: `${motion.tilt.value}deg` }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={animatedStyle}
    >
      <Image source={PLAYER_CAR_DEFAULT.source} style={styles.sprite} resizeMode="contain" />
    </Animated.View>
  );
}

export const PlayerCar = memo(PlayerCarComponent);

const styles = StyleSheet.create({
  sprite: {
    width: PLAYER_CAR_SPRITE_WIDTH,
    height: PLAYER_CAR_SPRITE_HEIGHT,
  },
});

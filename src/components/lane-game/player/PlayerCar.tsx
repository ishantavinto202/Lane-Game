import { memo, useCallback, useEffect, useMemo } from 'react';
import { Text } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { getAssetDefinition } from '@/src/game/assets';
import { HEALTH_CONFIG } from '@/src/game/config';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import type { PlayerMotionSharedValues } from '@/src/game/systems/player/PlayerMotionController';
import type { PlayerSnapshot } from '@/src/game/systems/player/PlayerSystem';

export interface PlayerCarProps {
  readonly snapshot: PlayerSnapshot;
  readonly motion: PlayerMotionSharedValues;
}

function PlayerCarComponent({ snapshot, motion }: PlayerCarProps) {
  const damageBlinkNonce = useGameStore(gameStoreSelectors.damageBlinkNonce);
  const health = useGameStore(gameStoreSelectors.health);
  const asset = useMemo(() => getAssetDefinition('PLAYER_CAR'), []);
  const halfWidth = snapshot.width / 2;
  const halfHeight = snapshot.height / 2;
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
    left: motion.x.value - halfWidth,
    top: motion.y.value - halfHeight,
    width: snapshot.width,
    height: snapshot.height,
    opacity: blinkOpacity.value,
    transform: [{ rotateZ: `${motion.tilt.value}deg` }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        animatedStyle,
        {
          backgroundColor: asset.visual.primaryColor,
          borderColor: asset.visual.borderColor,
          borderWidth: asset.visual.borderWidth ?? 0,
          borderRadius: asset.visual.cornerRadius ?? 0,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 10,
          fontWeight: '700',
        }}
      >
        {asset.visual.label}
      </Text>
    </Animated.View>
  );
}

export const PlayerCar = memo(PlayerCarComponent);

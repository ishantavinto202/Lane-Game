import { memo, useMemo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type ImageStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

export interface TimedPowerUpHudBadgeProps {
  readonly iconSource: ImageSourcePropType;
  readonly remainingSeconds: number;
  readonly blinkOpacity: SharedValue<number>;
  readonly timerColor: string;
  readonly iconSize?: number;
}

/** Icon + countdown badge — icon blinks independently during expiry warning. */
function TimedPowerUpHudBadgeComponent({
  iconSource,
  remainingSeconds,
  blinkOpacity,
  timerColor,
  iconSize = 24,
}: TimedPowerUpHudBadgeProps) {
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: blinkOpacity.value,
  }));

  const iconStyle = useMemo(
    (): ImageStyle => ({
      width: iconSize,
      height: iconSize,
    }),
    [iconSize],
  );

  const timerStyle = useMemo(
    () => [styles.timer, { color: timerColor }],
    [timerColor],
  );

  return (
    <View style={styles.badge}>
      <Animated.View style={iconAnimatedStyle}>
        <Image source={iconSource} style={iconStyle} resizeMode="contain" />
      </Animated.View>
      <Text style={timerStyle}>{remainingSeconds}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timer: {
    fontSize: 14,
    fontWeight: '800',
    minWidth: 24,
    letterSpacing: 0.2,
  },
});

export const TimedPowerUpHudBadge = memo(TimedPowerUpHudBadgeComponent);

import { memo, useCallback, useMemo, type ComponentType } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { IconProps } from 'phosphor-react-native';

import { CONTROLS_CONSTANTS } from '@/src/game/constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ControlButtonProps {
  readonly accessibilityLabel: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly Icon: ComponentType<IconProps>;
}

function ControlButtonComponent({
  accessibilityLabel,
  onPress,
  disabled = false,
  style,
  Icon,
}: ControlButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(CONTROLS_CONSTANTS.BUTTON_ACTIVE_SCALE, { duration: 80 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 120 });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const buttonStyle = useMemo<ViewStyle>(
    () => ({
      width: CONTROLS_CONSTANTS.BUTTON_MIN_SIZE,
      height: CONTROLS_CONSTANTS.BUTTON_MIN_SIZE,
      borderRadius: CONTROLS_CONSTANTS.BUTTON_MIN_SIZE / 2,
      backgroundColor: `rgba(20, 20, 28, ${CONTROLS_CONSTANTS.BUTTON_OPACITY})`,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [],
  );

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[buttonStyle, style, animatedStyle]}
    >
      <Icon size={28} color="#FFFFFF" weight="bold" />
    </AnimatedPressable>
  );
}

export const ControlButton = memo(ControlButtonComponent);

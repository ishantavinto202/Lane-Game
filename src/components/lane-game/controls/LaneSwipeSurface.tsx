import { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { CONTROLS_CONFIG } from '@/src/game/config';
import { resolveSwipeLaneDirection } from '@/src/game/systems/input/resolve-swipe-lane-direction';
import type { LaneDirection } from '@/src/game/types';

export interface LaneSwipeSurfaceProps {
  readonly enabled: boolean;
  readonly onSwipe: (direction: LaneDirection) => void;
}

function LaneSwipeSurfaceComponent({ enabled, onSwipe }: LaneSwipeSurfaceProps) {
  const handleSwipeEnd = useCallback(
    (translationX: number, translationY: number) => {
      const direction = resolveSwipeLaneDirection(translationX, translationY);
      if (!direction) {
        return;
      }

      onSwipe(direction);
    },
    [onSwipe],
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .activeOffsetX([
          -CONTROLS_CONFIG.swipeActiveOffsetX,
          CONTROLS_CONFIG.swipeActiveOffsetX,
        ])
        .failOffsetY([-CONTROLS_CONFIG.swipeFailOffsetY, CONTROLS_CONFIG.swipeFailOffsetY])
        .onEnd((event) => {
          runOnJS(handleSwipeEnd)(event.translationX, event.translationY);
        }),
    [enabled, handleSwipeEnd],
  );

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.capture} />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  capture: {
    ...StyleSheet.absoluteFillObject,
  },
});

export const LaneSwipeSurface = memo(LaneSwipeSurfaceComponent);

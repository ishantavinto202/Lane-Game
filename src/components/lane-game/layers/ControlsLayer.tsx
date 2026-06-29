import { CaretLeft, CaretRight } from 'phosphor-react-native';
import { memo, useCallback, useMemo, type RefObject } from 'react';
import { useWindowDimensions, View, type ViewStyle } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CONTROLS_CONSTANTS } from '@/src/game/constants';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import type { InputManager } from '@/src/game/systems/input/InputManager';
import type { LaneDirection } from '@/src/game/types';
import { GameStatus } from '@/src/game/types';

import { ControlButton } from '../controls/ControlButton';
import { LaneSwipeSurface } from '../controls/LaneSwipeSurface';

export interface ControlsLayerProps {
  readonly inputManagerRef: RefObject<InputManager | null>;
}

function ControlsLayerComponent({ inputManagerRef }: ControlsLayerProps) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const status = useGameStore(gameStoreSelectors.status);
  const isPlaying = status === GameStatus.Playing;
  const isGameOver = status === GameStatus.GameOver;

  const layerStyle = useMemo<ViewStyle>(
    () => ({
      position: 'absolute',
      top: 0,
      left: 0,
      width: windowWidth,
      height: windowHeight,
      zIndex: 9999,
      elevation: 9999,
    }),
    [windowHeight, windowWidth],
  );

  const rowStyle = useMemo<ViewStyle>(() => {
    const playableTop = insets.top;
    const playableBottom = windowHeight - insets.bottom;
    const playableHeight = playableBottom - playableTop;
    const rowTop =
      playableTop + playableHeight / 2 - CONTROLS_CONSTANTS.BUTTON_MIN_SIZE / 2;

    return {
      position: 'absolute',
      top: rowTop,
      left: CONTROLS_CONSTANTS.BUTTON_PADDING,
      right: CONTROLS_CONSTANTS.BUTTON_PADDING,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1,
    };
  }, [insets.top, insets.bottom, windowHeight]);

  const handleMoveLeft = useCallback(() => {
    inputManagerRef.current?.requestLaneChange('left', 'button');
  }, [inputManagerRef]);

  const handleMoveRight = useCallback(() => {
    inputManagerRef.current?.requestLaneChange('right', 'button');
  }, [inputManagerRef]);

  const handleSwipe = useCallback(
    (direction: LaneDirection) => {
      inputManagerRef.current?.requestLaneChange(direction, 'swipe');
    },
    [inputManagerRef],
  );

  return (
    <GestureHandlerRootView
      pointerEvents={isGameOver ? 'none' : 'box-none'}
      style={layerStyle}
    >
      <LaneSwipeSurface enabled={isPlaying} onSwipe={handleSwipe} />
      <View pointerEvents="box-none" style={rowStyle}>
        <ControlButton
          accessibilityLabel="Move left"
          disabled={!isPlaying}
          Icon={CaretLeft}
          onPress={handleMoveLeft}
        />
        <ControlButton
          accessibilityLabel="Move right"
          disabled={!isPlaying}
          Icon={CaretRight}
          onPress={handleMoveRight}
        />
      </View>
    </GestureHandlerRootView>
  );
}

export const ControlsLayer = memo(ControlsLayerComponent);

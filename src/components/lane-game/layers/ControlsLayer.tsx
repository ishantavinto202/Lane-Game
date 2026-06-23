import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { CaretLeft, CaretRight } from 'phosphor-react-native';
import { memo, useCallback, useMemo, type RefObject } from 'react';
import { useWindowDimensions, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CONTROLS_CONSTANTS } from '@/src/game/constants';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import type { InputManager } from '@/src/game/systems/input/InputManager';
import { GameStatus } from '@/src/game/types';

import { ControlButton } from '../controls/ControlButton';

export interface ControlsLayerProps {
  readonly inputManagerRef: RefObject<InputManager | null>;
}

function ControlsLayerComponent({ inputManagerRef }: ControlsLayerProps) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
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
    const playableBottom = windowHeight - tabBarHeight;
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
    };
  }, [insets.top, tabBarHeight, windowHeight]);

  const handleMoveLeft = useCallback(() => {
    inputManagerRef.current?.requestLaneChange('left', 'button');
  }, [inputManagerRef]);

  const handleMoveRight = useCallback(() => {
    inputManagerRef.current?.requestLaneChange('right', 'button');
  }, [inputManagerRef]);

  return (
    <View pointerEvents={isGameOver ? 'none' : 'box-none'} style={layerStyle}>
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
    </View>
  );
}

export const ControlsLayer = memo(ControlsLayerComponent);

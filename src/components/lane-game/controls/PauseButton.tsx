import { Pause, Play } from 'phosphor-react-native';
import { memo, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import { GameStatus } from '@/src/game/types';

import {
  GAME_HUD_HORIZONTAL_INSET,
  GAME_HUD_TOP_OFFSET,
  GAME_HUD_Z_INDEX,
} from '../ui/game-hud.styles';

const PAUSE_BUTTON_SIZE = 44;
const PAUSE_ICON_SIZE = 20;

function PauseButtonComponent() {
  const insets = useSafeAreaInsets();
  const status = useGameStore(gameStoreSelectors.status);
  const pausePlaying = useGameStore(gameStoreSelectors.pausePlaying);
  const startPlaying = useGameStore(gameStoreSelectors.startPlaying);

  const isPlaying = status === GameStatus.Playing;
  const isPaused = status === GameStatus.Paused;
  const isVisible = isPlaying || isPaused;

  const handlePress = useCallback(() => {
    if (isPlaying) {
      pausePlaying();
      return;
    }

    if (isPaused) {
      startPlaying();
    }
  }, [isPaused, isPlaying, pausePlaying, startPlaying]);

  const buttonStyle = useMemo<ViewStyle>(
    () => ({
      top: insets.top + GAME_HUD_TOP_OFFSET,
      right: GAME_HUD_HORIZONTAL_INSET,
    }),
    [insets.top],
  );

  if (!isVisible) {
    return null;
  }

  const accessibilityLabel = isPlaying ? 'Pause game' : 'Resume game';
  const Icon = isPlaying ? Pause : Play;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      style={[styles.button, buttonStyle]}
      hitSlop={8}
    >
      <Icon size={PAUSE_ICON_SIZE} color="#FFFFFF" weight="fill" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: PAUSE_BUTTON_SIZE,
    height: PAUSE_BUTTON_SIZE,
    borderRadius: PAUSE_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: GAME_HUD_Z_INDEX,
    elevation: GAME_HUD_Z_INDEX,
  },
});

export const PauseButton = memo(PauseButtonComponent);

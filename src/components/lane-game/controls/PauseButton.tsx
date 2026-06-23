import { Pause, Play } from 'phosphor-react-native';
import { memo, useCallback, useMemo } from 'react';
import { Pressable, Text, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CONTROLS_CONSTANTS } from '@/src/game/constants';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import { GameStatus } from '@/src/game/types';

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
      position: 'absolute',
      top: insets.top + 12,
      right: CONTROLS_CONSTANTS.BUTTON_PADDING,
      zIndex: 10000,
      elevation: 10000,
      minHeight: 40,
      minWidth: 40,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: `rgba(20, 20, 28, ${CONTROLS_CONSTANTS.BUTTON_OPACITY})`,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.18)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    }),
    [insets.top],
  );

  if (!isVisible) {
    return null;
  }

  const label = isPlaying ? 'Pause' : 'Resume';
  const Icon = isPlaying ? Pause : Play;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      style={buttonStyle}
    >
      <Icon size={18} color="#FFFFFF" weight="bold" />
      <Text className="text-xs font-bold uppercase tracking-wide text-white">{label}</Text>
    </Pressable>
  );
}

export const PauseButton = memo(PauseButtonComponent);

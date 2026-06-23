import * as Haptics from 'expo-haptics';
import { memo, useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { KEY_COLORS } from '../constants/colors';
import { KeyState, TileState } from '../game/types';

import type { Letter } from '../game/types';

const KEYBOARD_ROWS: readonly (readonly string[])[] = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE'],
];

function tileStateToKeyState(state: TileState): KeyState {
  switch (state) {
    case TileState.correct:
      return KeyState.correct;
    case TileState.present:
      return KeyState.present;
    case TileState.absent:
      return KeyState.absent;
    default:
      return KeyState.unused;
  }
}

interface KeyboardKeyProps {
  label: string;
  state: KeyState;
  onPress: (label: string) => void;
  hapticsEnabled: boolean;
}

function KeyboardKeyComponent({ label, state, onPress, hapticsEnabled }: KeyboardKeyProps) {
  const colors = KEY_COLORS[state];
  const isWide = label === 'ENTER' || label === 'DELETE';

  const handlePress = useCallback(() => {
    if (hapticsEnabled) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress(label);
  }, [hapticsEnabled, label, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      className="items-center justify-center rounded-md"
      style={{
        minWidth: isWide ? 64 : 32,
        height: 52,
        paddingHorizontal: isWide ? 8 : 4,
        backgroundColor: colors.bg,
        flex: isWide ? 1.5 : 1,
      }}
    >
      <Text
        className="text-xs font-bold uppercase"
        style={{ color: colors.text }}
        numberOfLines={1}
      >
        {label === 'DELETE' ? '⌫' : label}
      </Text>
    </Pressable>
  );
}

function areKeyPropsEqual(prev: KeyboardKeyProps, next: KeyboardKeyProps): boolean {
  return (
    prev.label === next.label &&
    prev.state === next.state &&
    prev.hapticsEnabled === next.hapticsEnabled &&
    prev.onPress === next.onPress
  );
}

const KeyboardKey = memo(KeyboardKeyComponent, areKeyPropsEqual);

interface KeyboardProps {
  keyStates: Record<Letter, TileState>;
  onKeyPress: (key: string) => void;
  hapticsEnabled: boolean;
  disabled?: boolean;
}

function KeyboardComponent({ keyStates, onKeyPress, hapticsEnabled, disabled = false }: KeyboardProps) {
  const handlePress = useCallback(
    (label: string) => {
      if (disabled) {
        return;
      }
      onKeyPress(label);
    },
    [disabled, onKeyPress],
  );

  const rowElements = useMemo(
    () =>
      KEYBOARD_ROWS.map((row, rowIndex) => (
        <View key={`kb-row-${rowIndex}`} className="mb-1.5 flex-row justify-center gap-1">
          {row.map((label) => {
            const state =
              label.length === 1
                ? tileStateToKeyState(keyStates[label] ?? TileState.empty)
                : KeyState.unused;
            return (
              <KeyboardKey
                key={label}
                label={label}
                state={state}
                onPress={handlePress}
                hapticsEnabled={hapticsEnabled}
              />
            );
          })}
        </View>
      )),
    [handlePress, hapticsEnabled, keyStates],
  );

  return <View className="px-2">{rowElements}</View>;
}

export const Keyboard = memo(KeyboardComponent);

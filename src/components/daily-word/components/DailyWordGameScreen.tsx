import { useRouter } from 'expo-router';
import { GearSix, ChartBar } from 'phosphor-react-native';
import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BoardGrid } from '../puzzle/BoardGrid';
import { CountdownTimer } from '../puzzle/CountdownTimer';
import { Keyboard } from '../puzzle/Keyboard';
import { SCREEN_COLORS } from '../constants/colors';
import { GamePhase } from '../game/types';
import { useGameStore } from '../store/gameStore';
import {
  useWordGameActions,
  useWordGameBoardState,
  useWordGameBootstrap,
} from '../game/hooks/useWordGame';

function DailyWordGameScreenComponent() {
  useWordGameBootstrap();
  const router = useRouter();
  const {
    rows,
    currentRowIndex,
    currentColIndex,
    phase,
    puzzleDate,
    keyStates,
    shakeRowIndex,
    hapticsEnabled,
    showTimer,
  } = useWordGameBoardState();
  const { handleKeyPress, handlePause, handleTick } = useWordGameActions();

  const handleStats = useCallback(() => {
    router.push('/dailyWord/stats' as never);
  }, [router]);

  const handleSettings = useCallback(() => {
    router.push('/dailyWord/settings' as never);
  }, [router]);

  if (!rows) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: SCREEN_COLORS.background }}>
        <Text style={{ color: SCREEN_COLORS.textPrimary }}>Loading puzzle...</Text>
      </SafeAreaView>
    );
  }

  const timerRunning = phase === GamePhase.playing;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SCREEN_COLORS.background }}>
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable onPress={handlePause} hitSlop={8}>
          <Text className="text-sm font-semibold" style={{ color: SCREEN_COLORS.textSecondary }}>
            Pause
          </Text>
        </Pressable>
        <Text className="text-lg font-bold" style={{ color: SCREEN_COLORS.textPrimary }}>
          Daily Word
        </Text>
        <View className="flex-row gap-3">
          <Pressable onPress={handleStats} hitSlop={8}>
            <ChartBar size={22} color={SCREEN_COLORS.textSecondary} />
          </Pressable>
          <Pressable onPress={handleSettings} hitSlop={8}>
            <GearSix size={22} color={SCREEN_COLORS.textSecondary} />
          </Pressable>
        </View>
      </View>

      {showTimer ? (
        <CountdownTimer
          key={puzzleDate}
          initialElapsedMs={useGameStore.getState().elapsedMs}
          running={timerRunning}
          onTick={handleTick}
        />
      ) : null}

      <View className="flex-1 items-center justify-center">
        <BoardGrid
          rows={rows}
          currentRowIndex={currentRowIndex}
          currentColIndex={currentColIndex}
          shakeRowIndex={shakeRowIndex}
        />
      </View>

      <Keyboard
        keyStates={keyStates}
        onKeyPress={handleKeyPress}
        hapticsEnabled={hapticsEnabled}
        disabled={phase !== GamePhase.playing}
      />
    </SafeAreaView>
  );
}

export const DailyWordGameScreen = memo(DailyWordGameScreenComponent);
export default DailyWordGameScreen;

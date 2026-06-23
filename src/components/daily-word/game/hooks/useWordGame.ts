import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import { GamePhase } from '../types';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useStatsStore } from '../../store/statsStore';

export function useWordGameBootstrap() {
  const initSession = useGameStore((state) => state.initSession);
  const hydrateStats = useStatsStore((state) => state.hydrate);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const statsHydrated = useStatsStore((state) => state.hydrated);
  const settingsHydrated = useSettingsStore((state) => state.hydrated);
  const session = useGameStore((state) => state.session);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    void hydrateStats();
    void hydrateSettings();
  }, [hydrateStats, hydrateSettings]);

  useEffect(() => {
    if (!statsHydrated || !settingsHydrated || bootstrappedRef.current) {
      return;
    }
    bootstrappedRef.current = true;
    if (!session) {
      initSession();
    }
  }, [initSession, session, settingsHydrated, statsHydrated]);
}

export function useWordGameActions() {
  const router = useRouter();
  const typeLetter = useGameStore((state) => state.typeLetter);
  const deleteLetter = useGameStore((state) => state.deleteLetter);
  const submitGuess = useGameStore((state) => state.submitGuess);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const resetSession = useGameStore((state) => state.resetSession);
  const tickElapsed = useGameStore((state) => state.tickElapsed);
  const clearShake = useGameStore((state) => state.clearShake);
  const recordWin = useStatsStore((state) => state.recordWin);
  const recordLoss = useStatsStore((state) => state.recordLoss);
  const session = useGameStore((state) => state.session);
  const outcomeRecordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }

    const outcomeKey = `${session.puzzleDate}:${session.phase}`;
    if (outcomeRecordedRef.current === outcomeKey) {
      return;
    }

    if (session.phase === GamePhase.won) {
      outcomeRecordedRef.current = outcomeKey;
      const guessCount = session.currentRowIndex + 1;
      void recordWin(guessCount, session.score);
      router.replace('/dailyWord/victory' as never);
    }

    if (session.phase === GamePhase.lost) {
      outcomeRecordedRef.current = outcomeKey;
      void recordLoss();
      router.replace('/dailyWord/defeat' as never);
    }
  }, [recordLoss, recordWin, router, session]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (key === 'ENTER') {
        const submitted = submitGuess();
        if (!submitted) {
          setTimeout(() => clearShake(), 400);
        }
        return;
      }
      if (key === 'DELETE') {
        deleteLetter();
        return;
      }
      typeLetter(key);
    },
    [clearShake, deleteLetter, submitGuess, typeLetter],
  );

  const handlePause = useCallback(() => {
    pauseGame();
    router.push('/dailyWord/pause' as never);
  }, [pauseGame, router]);

  const handleResume = useCallback(() => {
    resumeGame();
    router.back();
  }, [resumeGame, router]);

  const handleRestart = useCallback(() => {
    resetSession();
    router.replace('/dailyWord/game' as never);
  }, [resetSession, router]);

  const handleTick = useCallback(
    (deltaMs: number) => {
      tickElapsed(deltaMs);
    },
    [tickElapsed],
  );

  return {
    handleKeyPress,
    handlePause,
    handleResume,
    handleRestart,
    handleTick,
  };
}

export function useWordGameBoardState() {
  const rows = useGameStore((state) => state.session?.rows);
  const currentRowIndex = useGameStore((state) => state.session?.currentRowIndex ?? 0);
  const currentColIndex = useGameStore((state) => state.session?.currentColIndex ?? 0);
  const phase = useGameStore((state) => state.session?.phase);
  const puzzleDate = useGameStore((state) => state.session?.puzzleDate ?? '');
  const keyStates = useGameStore((state) => state.keyStates);
  const shakeRowIndex = useGameStore((state) => state.shakeRowIndex);
  const hapticsEnabled = useSettingsStore((state) => state.settings.hapticsEnabled);
  const showTimer = useSettingsStore((state) => state.settings.showTimer);

  return {
    rows,
    currentRowIndex,
    currentColIndex,
    phase,
    puzzleDate,
    keyStates,
    shakeRowIndex,
    hapticsEnabled,
    showTimer,
  };
}

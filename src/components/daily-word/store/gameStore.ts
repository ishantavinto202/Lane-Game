import { create } from 'zustand';

import { pickDailyWord, getPuzzleDateKey } from '../game/wordPicker';
import { calculateScore } from '../game/scoring';
import { evaluateGuess, mergeKeyStates } from '../game/tileFeedback';
import { isValidGuess } from '../game/dictionary';
import { GamePhase, MAX_GUESSES, TileState, WORD_LENGTH } from '../game/types';

import type { DailyWordSession, GuessRow, Letter, TileData } from '../game/types';

const STORAGE_KEY = '@daily-word/game-session';

function createEmptyRow(): GuessRow {
  return {
    tiles: Array.from({ length: WORD_LENGTH }, () => ({
      letter: '',
      state: TileState.empty,
    })),
    submitted: false,
  };
}

function createInitialRows(): GuessRow[] {
  return Array.from({ length: MAX_GUESSES }, () => createEmptyRow());
}

function buildWordFromRow(row: GuessRow): string {
  return row.tiles.map((tile) => tile.letter).join('');
}

function isRowComplete(row: GuessRow): boolean {
  return row.tiles.every((tile) => tile.letter.length === 1);
}

export interface GameStoreState {
  session: DailyWordSession | null;
  elapsedMs: number;
  keyStates: Record<Letter, TileState>;
  shakeRowIndex: number | null;
  initSession: (date?: Date) => void;
  resumeSession: (session: DailyWordSession, keyStates: Record<Letter, TileState>, elapsedMs: number) => void;
  typeLetter: (letter: Letter) => void;
  deleteLetter: () => void;
  submitGuess: () => boolean;
  pauseGame: () => void;
  resumeGame: () => void;
  tickElapsed: (deltaMs: number) => void;
  clearShake: () => void;
  resetSession: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  session: null,
  elapsedMs: 0,
  keyStates: {},
  shakeRowIndex: null,

  initSession: (date = new Date()) => {
    const puzzleDate = getPuzzleDateKey(date);
    const answer = pickDailyWord(date);

    set({
      session: {
        puzzleDate,
        answer,
        rows: createInitialRows(),
        currentRowIndex: 0,
        currentColIndex: 0,
        phase: GamePhase.playing,
        elapsedMs: 0,
        score: 0,
      },
      elapsedMs: 0,
      keyStates: {},
      shakeRowIndex: null,
    });
  },

  resumeSession: (session, keyStates, elapsedMs) => {
    set({ session, keyStates, elapsedMs, shakeRowIndex: null });
  },

  typeLetter: (letter) => {
    const { session } = get();
    if (!session || session.phase !== GamePhase.playing) {
      return;
    }

    const rowIndex = session.currentRowIndex;
    const colIndex = session.currentColIndex;
    if (colIndex >= WORD_LENGTH) {
      return;
    }

    const rows = session.rows.map((row, index) => {
      if (index !== rowIndex) {
        return row;
      }
      const tiles = row.tiles.map((tile, tileIndex) => {
        if (tileIndex !== colIndex) {
          return tile;
        }
        return { letter: letter.toUpperCase(), state: TileState.filled };
      });
      return { ...row, tiles };
    });

    set({
      session: {
        ...session,
        rows,
        currentColIndex: colIndex + 1,
      },
    });
  },

  deleteLetter: () => {
    const { session } = get();
    if (!session || session.phase !== GamePhase.playing) {
      return;
    }

    const rowIndex = session.currentRowIndex;
    let colIndex = session.currentColIndex - 1;
    if (colIndex < 0) {
      return;
    }

    const rows = session.rows.map((row, index) => {
      if (index !== rowIndex) {
        return row;
      }
      const tiles = row.tiles.map((tile, tileIndex) => {
        if (tileIndex !== colIndex) {
          return tile;
        }
        return { letter: '', state: TileState.empty };
      });
      return { ...row, tiles };
    });

    set({
      session: {
        ...session,
        rows,
        currentColIndex: colIndex,
      },
    });
  },

  submitGuess: () => {
    const { session, keyStates, elapsedMs } = get();
    if (!session || session.phase !== GamePhase.playing) {
      return false;
    }

    const rowIndex = session.currentRowIndex;
    const currentRow = session.rows[rowIndex];
    if (!currentRow || !isRowComplete(currentRow)) {
      return false;
    }

    const guess = buildWordFromRow(currentRow);
    if (!isValidGuess(guess)) {
      set({ shakeRowIndex: rowIndex });
      return false;
    }

    const evaluatedTiles: TileData[] = evaluateGuess(session.answer, guess);
    const rows = session.rows.map((row, index) => {
      if (index !== rowIndex) {
        return row;
      }
      return { tiles: evaluatedTiles, submitted: true };
    });

    const nextKeyStates = mergeKeyStates(keyStates, evaluatedTiles);
    const isWin = evaluatedTiles.every((tile) => tile.state === TileState.correct);
    const isLastGuess = rowIndex >= MAX_GUESSES - 1;
    const guessCount = rowIndex + 1;

    let phase: GamePhase = session.phase;
    let score = session.score;

    if (isWin) {
      phase = GamePhase.won;
      score = calculateScore(guessCount, elapsedMs);
    } else if (isLastGuess) {
      phase = GamePhase.lost;
    }

    set({
      session: {
        ...session,
        rows,
        currentRowIndex: isWin || isLastGuess ? rowIndex : rowIndex + 1,
        currentColIndex: 0,
        phase,
        score,
      },
      keyStates: nextKeyStates,
      shakeRowIndex: null,
    });

    return true;
  },

  pauseGame: () => {
    const { session } = get();
    if (!session || session.phase !== GamePhase.playing) {
      return;
    }
    set({ session: { ...session, phase: GamePhase.paused } });
  },

  resumeGame: () => {
    const { session } = get();
    if (!session || session.phase !== GamePhase.paused) {
      return;
    }
    set({ session: { ...session, phase: GamePhase.playing } });
  },

  tickElapsed: (deltaMs) => {
    const { session } = get();
    if (!session || session.phase !== GamePhase.playing) {
      return;
    }
    set((state) => ({ elapsedMs: state.elapsedMs + deltaMs }));
  },

  clearShake: () => set({ shakeRowIndex: null }),

  resetSession: () => {
    const { session } = get();
    if (!session) {
      get().initSession();
      return;
    }
    get().initSession(new Date(session.puzzleDate));
  },
}));

export const GAME_SESSION_STORAGE_KEY = STORAGE_KEY;

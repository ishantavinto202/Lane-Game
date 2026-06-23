export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export enum TileState {
  empty = 'empty',
  filled = 'filled',
  correct = 'correct',
  present = 'present',
  absent = 'absent',
}

export enum GamePhase {
  idle = 'idle',
  playing = 'playing',
  paused = 'paused',
  won = 'won',
  lost = 'lost',
}

export enum KeyState {
  unused = 'unused',
  correct = 'correct',
  present = 'present',
  absent = 'absent',
}

export type Letter = string;

export interface TileData {
  letter: Letter;
  state: TileState;
}

export interface GuessRow {
  tiles: TileData[];
  submitted: boolean;
}

export interface KeyboardKeyData {
  letter: Letter;
  state: KeyState;
}

export interface DailyWordSession {
  puzzleDate: string;
  answer: string;
  rows: GuessRow[];
  currentRowIndex: number;
  currentColIndex: number;
  phase: GamePhase;
  elapsedMs: number;
  score: number;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  totalScore: number;
  bestScore: number;
  averageGuesses: number;
  lastPlayedDate: string | null;
}

export interface GameSettings {
  hardMode: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  showTimer: boolean;
}

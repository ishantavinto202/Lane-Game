import { TileState, WORD_LENGTH } from './types';

import type { Letter, TileData } from './types';

export function evaluateGuess(answer: string, guess: string): TileData[] {
  const normalizedAnswer = answer.toUpperCase();
  const normalizedGuess = guess.toUpperCase();
  const states: TileState[] = Array.from({ length: WORD_LENGTH }, () => TileState.absent);
  const answerLetterCounts = new Map<string, number>();

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    const letter = normalizedAnswer[i] ?? '';
    answerLetterCounts.set(letter, (answerLetterCounts.get(letter) ?? 0) + 1);
  }

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    const guessLetter = normalizedGuess[i] ?? '';
    const answerLetter = normalizedAnswer[i] ?? '';

    if (guessLetter === answerLetter) {
      states[i] = TileState.correct;
      answerLetterCounts.set(guessLetter, (answerLetterCounts.get(guessLetter) ?? 1) - 1);
    }
  }

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (states[i] === TileState.correct) {
      continue;
    }

    const guessLetter = normalizedGuess[i] ?? '';
    const remaining = answerLetterCounts.get(guessLetter) ?? 0;

    if (remaining > 0) {
      states[i] = TileState.present;
      answerLetterCounts.set(guessLetter, remaining - 1);
    }
  }

  return states.map((state, index) => ({
    letter: normalizedGuess[index] ?? '',
    state,
  }));
}

export function mergeKeyStates(
  current: Record<Letter, TileState>,
  tiles: TileData[],
): Record<Letter, TileState> {
  const priority: Record<TileState, number> = {
    [TileState.empty]: 0,
    [TileState.filled]: 0,
    [TileState.absent]: 1,
    [TileState.present]: 2,
    [TileState.correct]: 3,
  };

  const next = { ...current };

  for (const tile of tiles) {
    const letter = tile.letter.toUpperCase();
    const existing = next[letter] ?? TileState.absent;
    if (priority[tile.state] > priority[existing]) {
      next[letter] = tile.state;
    }
  }

  return next;
}

import { MAX_GUESSES } from './types';

export function calculateScore(guessCount: number, elapsedMs: number, maxGuesses = MAX_GUESSES): number {
  const guessesRemaining = Math.max(0, maxGuesses - guessCount);
  const timeBonus = Math.max(0, 600_000 - elapsedMs) / 6000;
  const baseScore = guessesRemaining * 200;
  return Math.round(baseScore + timeBonus);
}

export function updateAverageGuesses(
  currentAverage: number,
  gamesWon: number,
  latestGuessCount: number,
): number {
  if (gamesWon <= 0) {
    return latestGuessCount;
  }
  const total = currentAverage * (gamesWon - 1) + latestGuessCount;
  return Math.round((total / gamesWon) * 10) / 10;
}

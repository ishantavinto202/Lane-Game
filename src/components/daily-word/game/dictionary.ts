import answersData from '../data/answers.json';
import guessesData from '../data/guesses.json';

import { WORD_LENGTH } from './types';

const answers = new Set(
  (answersData as string[]).map((word) => word.toUpperCase()).filter((word) => word.length === WORD_LENGTH),
);

const guesses = new Set(
  (guessesData as string[]).map((word) => word.toUpperCase()).filter((word) => word.length === WORD_LENGTH),
);

export function isValidAnswer(word: string): boolean {
  return answers.has(word.toUpperCase());
}

export function isValidGuess(word: string): boolean {
  const normalized = word.toUpperCase();
  return guesses.has(normalized) || answers.has(normalized);
}

export function getAnswerList(): readonly string[] {
  return Array.from(answers);
}

export function getGuessList(): readonly string[] {
  return Array.from(guesses);
}

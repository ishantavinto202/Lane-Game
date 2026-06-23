import { format } from 'date-fns';

import { getAnswerList } from './dictionary';

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getPuzzleDateKey(date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

export function pickDailyWord(date = new Date()): string {
  const answers = getAnswerList();
  if (answers.length === 0) {
    throw new Error('Daily Word answer list is empty.');
  }

  const dateKey = getPuzzleDateKey(date);
  const index = hashString(dateKey) % answers.length;
  return answers[index] ?? answers[0]!;
}

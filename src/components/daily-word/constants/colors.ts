export const TILE_COLORS = {
  empty: { bg: '#FFFFFF', border: '#D3D6DA', text: '#1A1A1B' },
  filled: { bg: '#FFFFFF', border: '#878A8C', text: '#1A1A1B' },
  correct: { bg: '#6AAA64', border: '#6AAA64', text: '#FFFFFF' },
  present: { bg: '#C9B458', border: '#C9B458', text: '#FFFFFF' },
  absent: { bg: '#787C7E', border: '#787C7E', text: '#FFFFFF' },
} as const;

export const KEY_COLORS = {
  unused: { bg: '#D3D6DA', text: '#1A1A1B' },
  correct: { bg: '#6AAA64', text: '#FFFFFF' },
  present: { bg: '#C9B458', text: '#FFFFFF' },
  absent: { bg: '#787C7E', text: '#FFFFFF' },
} as const;

export const SCREEN_COLORS = {
  background: '#121213',
  surface: '#1A1A1B',
  textPrimary: '#FFFFFF',
  textSecondary: '#818384',
  accent: '#538D4E',
  danger: '#B91C1C',
} as const;

export type HapticKind = 'tap' | 'correct' | 'wrong';

export function vibrate(kind: HapticKind, enabled: boolean) {
  if (!enabled || typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false;
  const pattern = kind === 'wrong' ? [30, 40, 30] : kind === 'correct' ? [35] : [10];
  return navigator.vibrate(pattern);
}

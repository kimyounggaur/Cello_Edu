import { describe, expect, test } from 'vitest';
import {
  POSITIONS,
  SCALES,
  STRINGS,
  displayName,
  freqOfMidi,
  noteFor,
  positionById,
  scaleStepMidi,
  selfTest,
  stringById,
} from './celloData';

const frame = (stringId: 'C' | 'G' | 'D' | 'A', positionId: 'half' | 'p1' | 'p2' | 'p3' | 'p4') =>
  ([1, 2, 3, 4] as const).map((finger) => {
    const note = noteFor(stringById(stringId), positionById(positionId), finger);
    return note.isNatural ? note.sharp : `${note.sharp}/${note.flat}`;
  });

describe('celloData single source of truth', () => {
  test('defines standard cello tuning and open string frequencies', () => {
    expect(STRINGS.map((string) => `${string.id}${string.sci}`)).toEqual(['CC2', 'GG2', 'DD3', 'AA3']);
    expect(STRINGS.map((string) => string.midi)).toEqual([36, 43, 50, 57]);
    expect(freqOfMidi(36)).toBeCloseTo(65.41, 2);
    expect(freqOfMidi(43)).toBeCloseTo(98.0, 2);
    expect(freqOfMidi(50)).toBeCloseTo(146.83, 2);
    expect(freqOfMidi(57)).toBeCloseTo(220.0, 2);
  });

  test('matches source fingering charts for closed-position frames', () => {
    expect(POSITIONS.map((position) => position.firstFingerSemitone)).toEqual([1, 2, 3, 5, 7]);
    expect(frame('A', 'half')).toEqual(['A#/Bb', 'B', 'C', 'C#/Db']);
    expect(frame('G', 'p1')).toEqual(['A', 'A#/Bb', 'B', 'C']);
    expect(frame('G', 'p4')).toEqual(['D', 'D#/Eb', 'E', 'F']);
  });

  test('keeps label systems aligned with Korean fixed-do defaults', () => {
    expect(displayName(0, 'en')).toBe('C');
    expect(displayName(0, 'koLetter')).toBe('다');
    expect(displayName(0, 'solfegeFixed')).toBe('도');
    expect(displayName(9, 'solfegeFixed')).toBe('라');
    expect(displayName(1, 'solfegeFixed', { prefer: 'flat' })).toBe('레♭');
  });

  test('provides ascending beginner-friendly C/G/D major one-octave scales', () => {
    for (const scale of SCALES) {
      const midis = scale.steps.map(scaleStepMidi);
      expect(midis.every((midi, index) => index === 0 || midi > midis[index - 1])).toBe(true);
    }
  });

  test('selfTest reports every verification as passing', () => {
    const result = selfTest();
    expect(result.ok).toBe(true);
    expect(result.logs.every((line) => line.includes('PASS'))).toBe(true);
  });
});

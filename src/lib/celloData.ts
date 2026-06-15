export type StringId = 'C' | 'G' | 'D' | 'A';
export type PositionId = 'half' | 'p1' | 'p2' | 'p3' | 'p4';
export type Finger = 1 | 2 | 3 | 4;
export type FingeringFinger = 0 | Finger;
export type LabelSystem = 'en' | 'koLetter' | 'solfegeFixed' | 'solfegeMovable';
export type AccidentalPreference = 'sharp' | 'flat';

export interface CelloString {
  id: StringId;
  ko: string;
  pc: number;
  midi: number;
  sci: string;
  hz: number;
  color: string;
  gauge: number;
  order: number;
}

export interface Position {
  id: PositionId;
  label: string;
  ko: string;
  firstFingerSemitone: number;
}

export interface NoteName {
  pc: number;
  isNatural: boolean;
  sharp: string;
  flat: string;
}

export interface Placement {
  string: StringId;
  position: PositionId;
  finger: Finger;
  semitone: number;
  midi: number;
}

export interface OpenPlacement {
  string: StringId;
  position: 'open';
  finger: 0;
  semitone: 0;
  midi: number;
}

export type AnyPlacement = Placement | OpenPlacement;

export interface NoteInfo {
  string: CelloString;
  position: Position | { id: 'open'; label: '0'; ko: '개방현'; firstFingerSemitone: 0 };
  finger: FingeringFinger;
  semitone: number;
  midi: number;
  frequencyHz: number;
  pc: number;
  scientific: string;
  note: NoteName;
  noteName: string;
  solfege: string;
  koLetter: string;
  label: string;
}

export interface FingerboardMarker {
  id: string;
  stringId: StringId;
  semitone: number;
  x: number;
  y: number;
  info: NoteInfo;
  placements: Placement[];
  isNatural: boolean;
}

export interface ScaleStep {
  string: StringId;
  finger: FingeringFinger;
}

export interface Scale {
  id: string;
  name: string;
  tonicPc: number;
  steps: ScaleStep[];
}

export const STRINGS: CelloString[] = [
  { id: 'C', ko: 'C현', pc: 0, midi: 36, sci: 'C2', hz: 65.41, color: '#C9A36A', gauge: 6.0, order: 0 },
  { id: 'G', ko: 'G현', pc: 7, midi: 43, sci: 'G2', hz: 98.0, color: '#CBB07A', gauge: 4.6, order: 1 },
  { id: 'D', ko: 'D현', pc: 2, midi: 50, sci: 'D3', hz: 146.83, color: '#D6CDBA', gauge: 3.3, order: 2 },
  { id: 'A', ko: 'A현', pc: 9, midi: 57, sci: 'A3', hz: 220.0, color: '#E0D8C6', gauge: 2.3, order: 3 },
];

export const POSITIONS: Position[] = [
  { id: 'half', label: '½', ko: '하프 포지션', firstFingerSemitone: 1 },
  { id: 'p1', label: 'I', ko: '1포지션', firstFingerSemitone: 2 },
  { id: 'p2', label: 'II', ko: '2포지션', firstFingerSemitone: 3 },
  { id: 'p3', label: 'III', ko: '3포지션', firstFingerSemitone: 5 },
  { id: 'p4', label: 'IV', ko: '4포지션', firstFingerSemitone: 7 },
];

export const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
export const KO_LETTER: Record<string, string> = { C: '다', D: '라', E: '마', F: '바', G: '사', A: '가', B: '나' };
export const SOLFEGE_FIXED: Record<string, string> = { C: '도', D: '레', E: '미', F: '파', G: '솔', A: '라', B: '시' };
const MOVABLE_SHARP = ['도', '도#', '레', '레#', '미', '파', '파#', '솔', '솔#', '라', '라#', '시'] as const;

export const stringById = (id: StringId) => {
  const string = STRINGS.find((candidate) => candidate.id === id);
  if (!string) throw new Error(`Unknown cello string: ${id}`);
  return string;
};

export const positionById = (id: PositionId) => {
  const position = POSITIONS.find((candidate) => candidate.id === id);
  if (!position) throw new Error(`Unknown cello position: ${id}`);
  return position;
};

export function normalizePc(pc: number) {
  return ((pc % 12) + 12) % 12;
}

export function noteNameOf(pc: number): NoteName {
  const index = normalizePc(pc);
  const sharp = SHARP[index];
  const flat = FLAT[index];
  return { pc: index, isNatural: sharp === flat, sharp, flat };
}

export const midiAt = (string: CelloString, semitone: number) => string.midi + semitone;
export const freqOfMidi = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);
export const freqAt = (string: CelloString, semitone: number) => freqOfMidi(midiAt(string, semitone));

export const semitoneFor = (position: Position, finger: Finger) => position.firstFingerSemitone + (finger - 1);
export const semitoneForExtended = (position: Position, finger: Finger) =>
  finger === 1 ? position.firstFingerSemitone : position.firstFingerSemitone + finger;
export const semitoneForBackExt = (position: Position, finger: Finger) =>
  finger === 1 ? position.firstFingerSemitone - 1 : semitoneFor(position, finger);

export const noteFor = (string: CelloString, position: Position, finger: Finger) =>
  noteNameOf(string.pc + semitoneFor(position, finger));

export const midiFor = (string: CelloString, position: Position, finger: Finger) =>
  midiAt(string, semitoneFor(position, finger));

export function scientificPitch(midi: number, prefer: AccidentalPreference = 'sharp') {
  const note = noteNameOf(midi);
  const name = prefer === 'sharp' ? note.sharp : note.flat;
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

export function displayName(
  pc: number,
  system: LabelSystem,
  opts: { tonicPc?: number; prefer?: AccidentalPreference } = {},
): string {
  const note = noteNameOf(pc);
  const prefer = opts.prefer ?? 'sharp';
  const picked = prefer === 'sharp' ? note.sharp : note.flat;
  const natural = picked[0];

  if (system === 'en') return note.isNatural ? note.sharp : picked;
  if (system === 'koLetter') return note.isNatural ? KO_LETTER[note.sharp] : `${KO_LETTER[natural]}${prefer === 'sharp' ? '♯' : '♭'}`;
  if (system === 'solfegeFixed') {
    return note.isNatural ? SOLFEGE_FIXED[note.sharp] : `${SOLFEGE_FIXED[natural]}${prefer === 'sharp' ? '♯' : '♭'}`;
  }
  return MOVABLE_SHARP[normalizePc(pc - (opts.tonicPc ?? 0))];
}

export function placementsForMidi(targetMidi: number): Placement[] {
  const placements: Placement[] = [];
  for (const string of STRINGS) {
    for (const position of POSITIONS) {
      for (const finger of [1, 2, 3, 4] as const) {
        const midi = midiFor(string, position, finger);
        if (midi === targetMidi) placements.push({ string: string.id, position: position.id, finger, semitone: semitoneFor(position, finger), midi });
      }
    }
  }
  return sortPlacements(placements);
}

export function openPlacementsForPc(pc: number): OpenPlacement[] {
  const target = normalizePc(pc);
  return STRINGS.filter((string) => normalizePc(string.pc) === target).map((string) => ({
    string: string.id,
    position: 'open' as const,
    finger: 0 as const,
    semitone: 0,
    midi: string.midi,
  }));
}

export function placementsForPc(pc: number): Placement[] {
  const target = normalizePc(pc);
  const placements: Placement[] = [];
  for (const string of STRINGS) {
    for (const position of POSITIONS) {
      for (const finger of [1, 2, 3, 4] as const) {
        const midi = midiFor(string, position, finger);
        if (normalizePc(midi) === target) {
          placements.push({ string: string.id, position: position.id, finger, semitone: semitoneFor(position, finger), midi });
        }
      }
    }
  }
  return sortPlacements(placements);
}

export function allPlacementsForPc(pc: number): AnyPlacement[] {
  return [...openPlacementsForPc(pc), ...placementsForPc(pc)];
}

export function sortPlacements<T extends AnyPlacement>(placements: T[]): T[] {
  const positionRank: Record<string, number> = { open: -1, half: 0, p1: 1, p2: 2, p3: 3, p4: 4 };
  return [...placements].sort((a, b) => {
    const pos = positionRank[a.position] - positionRank[b.position];
    if (pos !== 0) return pos;
    const finger = a.finger - b.finger;
    if (finger !== 0) return finger;
    return stringById(b.string).order - stringById(a.string).order;
  });
}

export function recommendedPlacement(placements: AnyPlacement[]): AnyPlacement | undefined {
  return sortPlacements(placements)[0];
}

export function placementToNoteInfo(
  placement: AnyPlacement,
  opts: { labelSystem?: LabelSystem; prefer?: AccidentalPreference; tonicPc?: number } = {},
): NoteInfo {
  const string = stringById(placement.string);
  const note = noteNameOf(placement.midi);
  const prefer = opts.prefer ?? 'sharp';
  const noteName = displayName(note.pc, 'en', { prefer });
  const solfege = displayName(note.pc, opts.labelSystem ?? 'solfegeFixed', { prefer, tonicPc: opts.tonicPc });
  const koLetter = displayName(note.pc, 'koLetter', { prefer });
  const position =
    placement.position === 'open'
      ? { id: 'open' as const, label: '0' as const, ko: '개방현' as const, firstFingerSemitone: 0 as const }
      : positionById(placement.position);
  return {
    string,
    position,
    finger: placement.finger,
    semitone: placement.semitone,
    midi: placement.midi,
    frequencyHz: freqOfMidi(placement.midi),
    pc: note.pc,
    scientific: scientificPitch(placement.midi, prefer),
    note,
    noteName,
    solfege,
    koLetter,
    label: `${string.ko} ${placement.finger === 0 ? '개방현' : `${placement.finger}번 손가락`} · ${scientificPitch(placement.midi, prefer)} · ${solfege}`,
  };
}

export function noteInfoAt(stringId: StringId, semitone: number, opts: { labelSystem?: LabelSystem; prefer?: AccidentalPreference; tonicPc?: number } = {}) {
  const string = stringById(stringId);
  const midi = midiAt(string, semitone);
  const exact = semitone === 0 ? undefined : placementsForMidi(midi)[0];
  const placement: AnyPlacement =
    semitone === 0
      ? { string: stringId, position: 'open', finger: 0, semitone: 0, midi: string.midi }
      : exact ?? { string: stringId, position: 'p1', finger: 1, semitone, midi };
  return placementToNoteInfo(placement, opts);
}

export function fingerboardMarkers(
  opts: { maxSemitone?: number; width?: number; height?: number; labelSystem?: LabelSystem; prefer?: AccidentalPreference; tonicPc?: number } = {},
): FingerboardMarker[] {
  const width = opts.width ?? 360;
  const height = opts.height ?? 620;
  const top = 72;
  const bottom = height - 54;
  const stringGap = width / (STRINGS.length + 1);
  const maxSemitone = opts.maxSemitone ?? 10;

  return STRINGS.flatMap((string, stringIndex) =>
    Array.from({ length: maxSemitone + 1 }, (_, semitone) => {
      const x = stringGap * (stringIndex + 1);
      const y = top + (bottom - top) * (semitone / maxSemitone);
      const info = noteInfoAt(string.id, semitone, opts);
      return {
        id: `${string.id}-${semitone}`,
        stringId: string.id,
        semitone,
        x,
        y,
        info,
        placements: placementsForMidi(info.midi),
        isNatural: info.note.isNatural,
      };
    }),
  );
}

export const SCALES: Scale[] = [
  {
    id: 'Cmaj1',
    name: '다장조 (C Major) · 1옥타브',
    tonicPc: 0,
    steps: [
      { string: 'C', finger: 0 },
      { string: 'C', finger: 1 },
      { string: 'C', finger: 3 },
      { string: 'C', finger: 4 },
      { string: 'G', finger: 0 },
      { string: 'G', finger: 1 },
      { string: 'G', finger: 3 },
      { string: 'G', finger: 4 },
    ],
  },
  {
    id: 'Gmaj1',
    name: '사장조 (G Major) · 1옥타브',
    tonicPc: 7,
    steps: [
      { string: 'G', finger: 0 },
      { string: 'G', finger: 1 },
      { string: 'G', finger: 3 },
      { string: 'G', finger: 4 },
      { string: 'D', finger: 0 },
      { string: 'D', finger: 1 },
      { string: 'D', finger: 3 },
      { string: 'D', finger: 4 },
    ],
  },
  {
    id: 'Dmaj1',
    name: '라장조 (D Major) · 1옥타브',
    tonicPc: 2,
    steps: [
      { string: 'D', finger: 0 },
      { string: 'D', finger: 1 },
      { string: 'D', finger: 3 },
      { string: 'D', finger: 4 },
      { string: 'A', finger: 0 },
      { string: 'A', finger: 1 },
      { string: 'A', finger: 3 },
      { string: 'A', finger: 4 },
    ],
  },
];

export function scaleStepMidi(step: ScaleStep): number {
  const string = stringById(step.string);
  return step.finger === 0 ? string.midi : string.midi + 2 + (step.finger - 1);
}

export function selfTest(): { ok: boolean; logs: string[] } {
  const logs: string[] = [];
  let ok = true;
  const approx = (actual: number, expected: number) => Math.abs(actual - expected) < 0.05;
  const expectedFrequency: Record<StringId, number> = { C: 65.41, G: 98.0, D: 146.83, A: 220.0 };

  for (const string of STRINGS) {
    const pass = approx(freqOfMidi(string.midi), expectedFrequency[string.id]);
    ok = ok && pass;
    logs.push(`${string.sci} ${freqOfMidi(string.midi).toFixed(2)}Hz ${pass ? 'PASS' : 'FAIL'}`);
  }

  const frame = (stringId: StringId, positionId: PositionId) =>
    ([1, 2, 3, 4] as const).map((finger) => {
      const note = noteFor(stringById(stringId), positionById(positionId), finger);
      return note.isNatural ? note.sharp : `${note.sharp}/${note.flat}`;
    });
  const equals = (actual: string[], expected: string[]) => actual.length === expected.length && actual.every((item, index) => item === expected[index]);
  const checks = [
    ['½ A', frame('A', 'half'), ['A#/Bb', 'B', 'C', 'C#/Db']],
    ['I G', frame('G', 'p1'), ['A', 'A#/Bb', 'B', 'C']],
    ['IV G', frame('G', 'p4'), ['D', 'D#/Eb', 'E', 'F']],
  ] as const;

  for (const [label, actual, expected] of checks) {
    const pass = equals(actual, [...expected]);
    ok = ok && pass;
    logs.push(`${label} = ${actual.join(',')} ${pass ? 'PASS' : 'FAIL'}`);
  }

  for (const scale of SCALES) {
    const midis = scale.steps.map(scaleStepMidi);
    const pass = midis.every((midi, index) => index === 0 || midi > midis[index - 1]);
    ok = ok && pass;
    logs.push(`${scale.name} asc ${pass ? 'PASS' : 'FAIL'}`);
  }

  return { ok, logs };
}

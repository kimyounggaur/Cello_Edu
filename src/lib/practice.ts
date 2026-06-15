import {
  type AnyPlacement,
  type Placement,
  type StringId,
  type PositionId,
  type Finger,
  allPlacementsForPc,
  displayName,
  noteNameOf,
  placementToNoteInfo,
  placementsForPc,
  recommendedPlacement,
  sortPlacements,
  stringById,
} from './celloData';

export type QuizMode = 'note-to-place' | 'place-to-note' | 'position-drill';
export type AnswerStatus = 'correct' | 'same-string' | 'same-pitch-class' | 'wrong';

export interface QuizQuestion {
  id: string;
  mode: QuizMode;
  pc: number;
  target: AnyPlacement;
  prompt: string;
  acceptedPlacements: AnyPlacement[];
  alternatives: AnyPlacement[];
}

export interface PlacementAnswer {
  string: StringId;
  position: PositionId;
  finger: Finger;
}

export interface QuizResultItem {
  pc: number;
  correct: boolean;
  mode: QuizMode;
}

export function buildQuizQuestion(mode: QuizMode, pc: number, seed = 0): QuizQuestion {
  const playable = allPlacmentsWithOpenFallback(pc);
  const preferred = chooseBeginnerTarget(playable, seed);
  const info = placementToNoteInfo(preferred);
  const acceptedPlacements = [preferred];
  const alternatives = playable.filter((placement) => placementToKey(placement) !== placementToKey(preferred));
  const solfege = displayName(pc, 'solfegeFixed');
  const note = noteNameOf(pc);

  return {
    id: `${mode}-${pc}-${seed}`,
    mode,
    pc,
    target: preferred,
    prompt:
      mode === 'note-to-place'
        ? `${info.string.ko} ${info.finger}번 손가락 ${info.scientific} · ${solfege}를 찾아보세요.`
        : `${note.sharp}/${note.flat} · ${solfege}의 이름을 맞혀보세요.`,
    acceptedPlacements,
    alternatives,
  };
}

export function evaluatePlacementAnswer(question: QuizQuestion, answer: PlacementAnswer) {
  const exact = question.acceptedPlacements.some((placement) => placementToKey(placement) === placementToKey(answer));
  if (exact) {
    return {
      status: 'correct' as const,
      message: `좋아요. ${placementToNoteInfo(question.target).label}예요.`,
    };
  }

  const answerPlacement = answerToPlacement(answer);
  const targetInfo = placementToNoteInfo(question.target);
  const answerInfo = placementToNoteInfo(answerPlacement);

  if (answer.string === question.target.string) {
    return {
      status: 'same-string' as const,
      message: `${targetInfo.string.ko}은 맞아요. 이번 음은 ${targetInfo.finger}번 손가락 자리예요.`,
    };
  }

  if (answerInfo.pc === question.pc) {
    return {
      status: 'same-pitch-class' as const,
      message: `${targetInfo.solfege}는 맞아요. 다만 이번에는 ${targetInfo.scientific} 위치를 사용해요.`,
    };
  }

  return {
    status: 'wrong' as const,
    message: `다시 들어보세요. 목표는 ${targetInfo.label}입니다.`,
  };
}

export function nextReviewQueue(results: QuizResultItem[]): QuizResultItem[] {
  const missed = results.filter((item) => !item.correct);
  const correct = results.filter((item) => item.correct);
  const seedItems: QuizResultItem[] =
    missed.length > 0
      ? missed.flatMap((item) => [item, item])
      : [
          { pc: 0, correct: false, mode: 'note-to-place' },
          { pc: 7, correct: false, mode: 'place-to-note' },
          { pc: 2, correct: false, mode: 'position-drill' },
        ];
  const mixed = [...seedItems, ...correct];
  const output: QuizResultItem[] = [];
  const modes: QuizMode[] = ['note-to-place', 'place-to-note', 'position-drill'];

  for (let index = 0; index < Math.max(6, mixed.length); index += 1) {
    const item = mixed[index % mixed.length];
    const previousTwo = output.slice(-2);
    if (previousTwo.length === 2 && previousTwo.every((prev) => prev.mode === item.mode)) {
      output.push({ ...item, mode: modes[(modes.indexOf(item.mode) + 1) % modes.length] });
    } else {
      output.push(item);
    }
  }

  return output;
}

function allPlacmentsWithOpenFallback(pc: number) {
  const placements = allPlacementsForPc(pc);
  return placements.length > 0 ? placements : placementsForPc(pc);
}

function chooseBeginnerTarget(placements: AnyPlacement[], seed: number) {
  const sorted = sortPlacements(placements);
  const firstPosition = sorted.filter((placement) => placement.position === 'p1');
  const nonOpen = sorted.filter((placement) => placement.position !== 'open');
  const targetPool = firstPosition.length > 0 ? firstPosition : nonOpen.length > 0 ? nonOpen : sorted;
  const recommended = recommendedPlacement(targetPool);
  if (!recommended) throw new Error('No playable cello placement for quiz question');
  return targetPool[(seed + targetPool.indexOf(recommended)) % targetPool.length] ?? recommended;
}

function answerToPlacement(answer: PlacementAnswer): Placement {
  const string = stringById(answer.string);
  const positionRank: Record<PositionId, number> = { half: 1, p1: 2, p2: 3, p3: 5, p4: 7 };
  const semitone = positionRank[answer.position] + (answer.finger - 1);
  return {
    string: answer.string,
    position: answer.position,
    finger: answer.finger,
    semitone,
    midi: string.midi + semitone,
  };
}

function placementToKey(placement: Pick<AnyPlacement, 'string' | 'position' | 'finger'>) {
  return `${placement.string}:${placement.position}:${placement.finger}`;
}

import { describe, expect, test } from 'vitest';
import { buildQuizQuestion, evaluatePlacementAnswer, nextReviewQueue } from './practice';

describe('practice logic', () => {
  test('builds a deterministic note-to-placement quiz question', () => {
    const question = buildQuizQuestion('note-to-place', 11, 0);
    expect(question.prompt).toContain('시');
    expect(question.acceptedPlacements.length).toBeGreaterThan(0);
    expect(question.acceptedPlacements[0]).toMatchObject({ string: 'A', position: 'p1', finger: 1 });
  });

  test('gives specific feedback for correct, same-string, and same-solfege answers', () => {
    const question = buildQuizQuestion('note-to-place', 11, 0);
    expect(evaluatePlacementAnswer(question, { string: 'A', position: 'p1', finger: 1 }).status).toBe('correct');
    expect(evaluatePlacementAnswer(question, { string: 'A', position: 'p1', finger: 2 }).status).toBe('same-string');
    expect(evaluatePlacementAnswer(question, { string: 'G', position: 'p1', finger: 3 }).status).toBe('same-pitch-class');
  });

  test('prioritizes recently missed items without repeating one kind forever', () => {
    const queue = nextReviewQueue([
      { pc: 0, correct: false, mode: 'note-to-place' },
      { pc: 0, correct: false, mode: 'note-to-place' },
      { pc: 7, correct: true, mode: 'place-to-note' },
    ]);
    expect(queue[0].pc).toBe(0);
    expect(new Set(queue.slice(0, 3).map((item) => item.mode)).size).toBeGreaterThan(1);
  });
});

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuizMode } from '../lib/practice';

export interface QuizAttempt {
  pc: number;
  mode: QuizMode;
  correct: boolean;
  at: number;
}

interface ProgressState {
  attempts: QuizAttempt[];
  streak: number;
  completedLessons: string[];
  addAttempt: (attempt: Omit<QuizAttempt, 'at'>) => void;
  completeLesson: (lessonId: string) => void;
  reset: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      attempts: [],
      streak: 0,
      completedLessons: [],
      addAttempt: (attempt) =>
        set((state) => ({
          attempts: [{ ...attempt, at: Date.now() }, ...state.attempts].slice(0, 30),
          streak: attempt.correct ? state.streak + 1 : 0,
        })),
      completeLesson: (lessonId) =>
        set((state) => ({
          completedLessons: state.completedLessons.includes(lessonId) ? state.completedLessons : [...state.completedLessons, lessonId],
        })),
      reset: () => set({ attempts: [], streak: 0, completedLessons: [] }),
    }),
    { name: 'jipan-on-progress-v1' },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccidentalPreference, LabelSystem } from '../lib/celloData';

export type ThemeName = 'dark' | 'light';

interface SettingsState {
  labelSystem: LabelSystem;
  accidental: AccidentalPreference;
  tonicPc: number;
  volume: number;
  muted: boolean;
  bpm: number;
  reduceMotion: boolean;
  haptics: boolean;
  theme: ThemeName;
  setLabelSystem: (labelSystem: LabelSystem) => void;
  setAccidental: (accidental: AccidentalPreference) => void;
  setTonicPc: (tonicPc: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setBpm: (bpm: number) => void;
  setReduceMotion: (reduceMotion: boolean) => void;
  setHaptics: (haptics: boolean) => void;
  setTheme: (theme: ThemeName) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      labelSystem: 'solfegeFixed',
      accidental: 'sharp',
      tonicPc: 0,
      volume: -12,
      muted: false,
      bpm: 76,
      reduceMotion: false,
      haptics: true,
      theme: 'dark',
      setLabelSystem: (labelSystem) => set({ labelSystem }),
      setAccidental: (accidental) => set({ accidental }),
      setTonicPc: (tonicPc) => set({ tonicPc }),
      setVolume: (volume) => set({ volume }),
      setMuted: (muted) => set({ muted }),
      setBpm: (bpm) => set({ bpm }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setHaptics: (haptics) => set({ haptics }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'jipan-on-settings-v1' },
  ),
);

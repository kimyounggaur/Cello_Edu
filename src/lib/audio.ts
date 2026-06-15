import { freqOfMidi } from './celloData';

let audioContext: AudioContext | null = null;
let muted = false;
let volume = -12;

export function setAudioPreferences(next: { muted?: boolean; volume?: number }) {
  if (typeof next.muted === 'boolean') muted = next.muted;
  if (typeof next.volume === 'number') volume = next.volume;
}

export async function ensureStarted() {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextCtor();
  }
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  return audioContext;
}

export async function playFreq(frequencyHz: number, duration = 0.62) {
  if (muted) return;
  const context = await ensureStarted();
  if (!context) return;

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  const linearVolume = Math.pow(10, volume / 20);

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(frequencyHz, now);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, linearVolume * 0.42), now + 0.03);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, linearVolume * 0.2), now + 0.18);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.04);
}

export async function playMidi(midi: number, duration = 0.62) {
  await playFreq(freqOfMidi(midi), duration);
}

export async function playSequence(midis: number[], bpm = 76) {
  if (muted) return;
  const gap = Math.max(220, Math.round((60_000 / bpm) * 0.85));
  for (const midi of midis) {
    await playMidi(midi, 0.5);
    await new Promise((resolve) => window.setTimeout(resolve, gap));
  }
}

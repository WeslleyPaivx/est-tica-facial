// Funções puras de animação: tudo deriva do frame atual (render determinístico).
import {Easing, interpolate, spring} from 'remotion';
import {MOTION, VIDEO} from './config';

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  inOut: Easing.bezier(0.76, 0, 0.24, 1),
  soft: Easing.bezier(0.45, 0, 0.25, 1),
  back: Easing.bezier(0.34, 1.45, 0.64, 1),
  anticipate: Easing.bezier(0.6, -0.3, 0.3, 1),
};

export const tw = (frame: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = EASE.out) =>
  interpolate(frame, [a, b], [from, to], {easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export const sp = (frame: number, start: number, config: {damping?: number; mass?: number; stiffness?: number} = {}) =>
  spring({frame: frame - start, fps: VIDEO.fps, config: {damping: 16, mass: 0.9, stiffness: 110, ...config}});

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const float = (frame: number, seed: number, amp = MOTION.floatAmp) => ({
  x: Math.cos(frame / 61 + seed * 2.3) * amp * 0.5,
  y: Math.sin(frame / 47 + seed * 1.7) * amp,
  r: Math.sin(frame / 73 + seed) * 0.5,
});

// vibração curta e amortecida (notificação)
export const shake = (frame: number, start: number | null, amp = 1.8, dur = 34) => {
  if (start === null) return 0;
  const t = frame - start;
  return t < 0 || t > dur ? 0 : Math.sin(t * 1.15) * amp * (1 - t / dur) ** 2;
};

export const shadow = (e = 1) =>
  `0 ${2 * e}px ${6 * e}px rgba(28,20,48,0.05), 0 ${14 * e}px ${30 * e}px rgba(28,20,48,0.07), 0 ${42 * e}px ${90 * e}px rgba(28,20,48,0.10)`;

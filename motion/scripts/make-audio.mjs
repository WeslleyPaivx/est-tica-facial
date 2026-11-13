// Gera toda a trilha e os efeitos sonoros (originais, síntese procedural determinística).
// Uso: npm run audio  → escreve public/audio/*.wav
import {writeFileSync, mkdirSync} from 'node:fs';

const SR = 48000;
const OUT = new URL('../public/audio/', import.meta.url);
mkdirSync(OUT, {recursive: true});

let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 31) - 1;
const buf = (sec) => ({L: new Float32Array(Math.ceil(sec * SR)), R: new Float32Array(Math.ceil(sec * SR))});
const TAU = Math.PI * 2;
const midi = (m) => 440 * 2 ** ((m - 69) / 12);

// filtro de estado variável (Chamberlin); cutoff por amostra
const svf = (input, cutoff, q, type) => {
  const out = new Float32Array(input.length);
  let low = 0, band = 0;
  for (let i = 0; i < input.length; i++) {
    const f = 2 * Math.sin(Math.PI * Math.min(cutoff(i / SR), SR / 7) / SR);
    low += f * band;
    const high = input[i] - low - q * band;
    band += f * high;
    out[i] = type === 'low' ? low : type === 'high' ? high : band;
  }
  return out;
};
const noise = (sec) => Float32Array.from({length: Math.ceil(sec * SR)}, rnd);

// soma `src` (mono) em `dst` (estéreo) com pan de potência constante
const add = (dst, src, at, gain = 1, pan = 0) => {
  const s = Math.round(at * SR);
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < src.length && s + i < dst.L.length; i++) {
    if (s + i < 0) continue;
    dst.L[s + i] += src[i] * gl;
    dst.R[s + i] += src[i] * gr;
  }
};
const gen = (sec, fn) => Float32Array.from({length: Math.ceil(sec * SR)}, (_, i) => fn(i / SR));

const normalize = (b, peakDb) => {
  let p = 0;
  for (const ch of [b.L, b.R]) for (const v of ch) p = Math.max(p, Math.abs(v));
  const g = 10 ** (peakDb / 20) / (p || 1);
  for (const ch of [b.L, b.R]) for (let i = 0; i < ch.length; i++) ch[i] *= g;
  return b;
};
const fadeEdges = (b, ms = 4) => {
  const n = Math.round(ms / 1000 * SR);
  for (const ch of [b.L, b.R]) for (let i = 0; i < n && i < ch.length; i++) {
    ch[i] *= i / n;
    ch[ch.length - 1 - i] *= i / n;
  }
  return b;
};
const write = (name, b) => {
  const n = b.L.length, d = Buffer.alloc(44 + n * 4);
  d.write('RIFF', 0); d.writeUInt32LE(36 + n * 4, 4); d.write('WAVEfmt ', 8);
  d.writeUInt32LE(16, 16); d.writeUInt16LE(1, 20); d.writeUInt16LE(2, 22);
  d.writeUInt32LE(SR, 24); d.writeUInt32LE(SR * 4, 28); d.writeUInt16LE(4, 32); d.writeUInt16LE(16, 34);
  d.write('data', 36); d.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    d.writeInt16LE(Math.round(Math.max(-1, Math.min(1, b.L[i])) * 32767), 44 + i * 4);
    d.writeInt16LE(Math.round(Math.max(-1, Math.min(1, b.R[i])) * 32767), 46 + i * 4);
  }
  writeFileSync(new URL(`${name}.wav`, OUT), d);
  console.log(`${name}.wav  ${(n / SR).toFixed(2)}s`);
};

// reverb Schroeder curto (4 combs + 2 allpass) aplicado em mono
const reverb = (x, tail = 1.6, fb = 0.78) => {
  const n = x.length + Math.ceil(tail * SR), out = new Float32Array(n);
  for (const ms of [29.7, 37.1, 41.1, 43.7]) {
    const d = Math.round(ms / 1000 * SR), c = new Float32Array(n);
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const fbv = i >= d ? c[i - d] : 0;
      lp = lp * 0.35 + fbv * 0.65; // amortecimento de agudos
      c[i] = (i < x.length ? x[i] : 0) + lp * fb;
      out[i] += c[i] * 0.25;
    }
  }
  for (const ms of [5.0, 1.7]) {
    const d = Math.round(ms / 1000 * SR), y = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const xd = i >= d ? out[i - d] : 0, yd = i >= d ? y[i - d] : 0;
      y[i] = -0.6 * out[i] + xd + 0.6 * yd;
    }
    out.set(y);
  }
  return out;
};

// ───────────── efeitos ─────────────
const sfx = {};

sfx.whoosh = (() => {
  const dur = 0.6, b = buf(dur);
  const n = svf(noise(dur), (t) => 350 + 2600 * Math.sin(Math.PI * t / dur) ** 2, 0.55, 'band');
  for (let i = 0; i < n.length; i++) {
    const t = i / SR, e = Math.sin(Math.PI * t / dur) ** 2.4, pan = -0.7 + 1.4 * t / dur;
    b.L[i] = n[i] * e * Math.cos((pan + 1) * Math.PI / 4);
    b.R[i] = n[i] * e * Math.sin((pan + 1) * Math.PI / 4);
  }
  return normalize(b, -3);
})();

sfx.click = (() => {
  const b = buf(0.07);
  add(b, gen(0.07, (t) => Math.sin(TAU * 1900 * t) * Math.exp(-t * 190) + rnd() * 0.25 * Math.exp(-t * 900)), 0);
  return normalize(fadeEdges(b, 1), -3);
})();

sfx.tick = (() => {
  const b = buf(0.035);
  add(b, svf(gen(0.035, (t) => rnd() * Math.exp(-t * 520)), () => 3200, 0.8, 'band'), 0);
  return normalize(fadeEdges(b, 1), -3);
})();

sfx.notify = (() => {
  const b = buf(0.9);
  const tone = (f) => gen(0.75, (t) => (Math.sin(TAU * f * t) + 0.2 * Math.sin(TAU * 2 * f * t)) * Math.exp(-t * 8) * Math.min(1, t * 400));
  add(b, tone(midi(86)), 0, 0.8, -0.2);
  add(b, tone(midi(93)), 0.1, 0.7, 0.2);
  return normalize(fadeEdges(b), -3);
})();

sfx.pop = (() => {
  const b = buf(0.16);
  let ph = 0;
  add(b, gen(0.16, (t) => { ph += TAU * (480 + 520 * (1 - Math.exp(-t * 40))) / SR; return Math.sin(ph) * Math.exp(-t * 28) * Math.min(1, t * 600); }), 0);
  return normalize(fadeEdges(b, 2), -3);
})();

sfx.buzz = (() => {
  const b = buf(0.3);
  const burst = svf(gen(0.1, (t) => Math.sign(Math.sin(TAU * 155 * t)) * Math.min(1, t * 200) * Math.min(1, (0.1 - t) * 200)), () => 420, 0.9, 'low');
  add(b, burst, 0); add(b, burst, 0.16);
  return normalize(b, -3);
})();

sfx.pulse = (() => {
  const b = buf(0.9);
  const p = gen(0.5, (t) => (Math.sin(TAU * 440 * t) + 0.5 * Math.sin(TAU * 880 * t) + 0.2 * Math.sin(TAU * 1320 * t)) * Math.exp(-t * 9) * Math.min(1, t * 300));
  add(b, p, 0, 1, 0); add(b, p, 0.18, 0.35, -0.6); add(b, p, 0.36, 0.14, 0.6);
  return normalize(fadeEdges(b), -3);
})();

sfx.swell = (() => {
  const dur = 0.75, b = buf(dur);
  const n = svf(noise(dur), (t) => 300 + 5200 * (t / dur) ** 2, 0.5, 'band');
  let ph = 0;
  for (let i = 0; i < n.length; i++) {
    const t = i / SR, e = (t / dur) ** 3;
    ph += TAU * (180 + 260 * (t / dur) ** 2) / SR;
    const v = (n[i] * 0.8 + Math.sin(ph) * 0.35 + Math.sin(ph * 1.5) * 0.2) * e;
    b.L[i] = v; b.R[i] = v;
  }
  return normalize(fadeEdges(b, 6), -3);
})();

sfx.impact = (() => {
  const dur = 1.5, b = buf(dur);
  let ph = 0;
  const sub = gen(dur, (t) => { ph += TAU * (38 + 30 * Math.exp(-t * 14)) / SR; return Math.sin(ph) * Math.exp(-t * 3.4) * Math.min(1, t * 500); });
  const thump = svf(gen(dur, (t) => rnd() * Math.exp(-t * 16)), () => 700, 0.9, 'low');
  add(b, sub, 0, 1); add(b, thump, 0, 0.5);
  return normalize(fadeEdges(b, 3), -3);
})();

sfx.shimmer = (() => {
  const dur = 2.6, b = buf(dur);
  [86, 90, 93, 97, 98, 102].forEach((m, k) => {
    const at = k * 0.07;
    add(b, gen(dur - at, (t) => Math.sin(TAU * midi(m) * t) * Math.exp(-t * 2.6) * Math.min(1, t * 60)), at, 0.5, (k % 2 ? 1 : -1) * 0.5);
  });
  return normalize(fadeEdges(b), -3);
})();

for (const [name, b] of Object.entries(sfx)) write(name, b);

// ───────────── trilha: 120 BPM, compasso = 2s = 120 frames ─────────────
const DUR = 35, BEAT = 0.5;
const CHORDS = [ // [início (s), baixo, vozes do pad]
  [0, 47, [59, 62, 66, 69]],   // Bm7
  [4, 43, [55, 59, 62, 66]],   // Gmaj7
  [8, 38, [54, 57, 62, 64]],   // Dmaj9
  [12, 45, [57, 61, 64, 66]],  // A6
  [16, 47, [59, 62, 66, 69]],  // Bm7
  [20, 43, [55, 59, 62, 66]],  // Gmaj7
  [24, 38, [54, 57, 62, 64]],  // Dmaj9
  [28, 43, [55, 59, 62, 66]],  // Gmaj7 (brand reveal)
  [32, 38, [54, 57, 62, 66]],  // Dmaj (resolução)
];
const chordAt = (t) => CHORDS.findLast((c) => c[0] <= t);
const ramp = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));

const kickEnv = new Float32Array(DUR * SR);
const kick = gen(0.3, (() => { let ph = 0; return (t) => { ph += TAU * (44 + 70 * Math.exp(-t * 28)) / SR; return Math.sin(ph) * Math.exp(-t * 11) * Math.min(1, t * 800); }; })());
const hat = svf(gen(0.05, (t) => rnd() * Math.exp(-t * 120)), () => 7000, 0.7, 'high');

const dry = buf(DUR), padB = buf(DUR), wetSrc = new Float32Array(DUR * SR);

// kick + baixo + chimbal (10s–28s)
for (let t = 10; t < 28; t += BEAT) {
  add(dry, kick, t, 0.5);
  for (let i = 0; i < 0.22 * SR; i++) kickEnv[Math.round(t * SR) + i] = Math.exp(-i / SR * 14);
}
for (let t = 10; t < 28; t += BEAT / 2) {
  const f = midi(chordAt(t)[1]);
  add(dry, gen(0.22, (x) => (Math.sin(TAU * f * x) + 0.25 * Math.sin(TAU * 2 * f * x)) * Math.exp(-x * 9) * Math.min(1, x * 300)), t, 0.2);
}
for (let t = 19 + BEAT / 2; t < 28; t += BEAT) add(dry, hat, t, 0.07, 0.25);
// "relógio" de tensão na cena do problema (0–5s) — para no congelamento
for (let t = 0.5, k = 0; t < 5; t += BEAT / 2, k++) add(dry, sfx.tick.L, t, k % 2 ? 0.04 : 0.08, k % 2 ? 0.4 : -0.4);

// pad aditivo com sidechain
for (const [k, [start, , notes]] of CHORDS.entries()) {
  const end = (CHORDS[k + 1]?.[0] ?? DUR) + 0.9;
  for (const [v, m] of notes.entries()) for (const det of [-4, 4]) {
    const f = midi(m) * 2 ** (det / 1200), pan = (v / 3 - 0.5) * 1.2 * Math.sign(det);
    const tone = gen(end - start, (x) => {
      const t = start + x;
      const bright = 0.15 + 0.85 * ramp(t, 4.5, 11) - 0.4 * ramp(t, 27.5, 29);
      let s = 0;
      for (let h = 1; h <= 6; h++) s += Math.sin(TAU * f * h * x + h * v) / h ** 1.9 * (h > 2 ? bright : 1);
      return s * Math.min(1, x / 0.7) * Math.min(1, (end - start - x) / 0.9);
    });
    add(padB, tone, start, 0.05, pan);
  }
}
for (let i = 0; i < DUR * SR; i++) {
  const duck = 1 - 0.4 * kickEnv[i];
  padB.L[i] *= duck; padB.R[i] *= duck;
}

// arpejo em colcheias (5.5s–28s) e notas esparsas no final
const pluck = (m, len = 0.5) => { const f = midi(m); return gen(len, (x) => (Math.sin(TAU * f * x) + 0.3 * Math.sin(TAU * 2 * f * x) + 0.12 * Math.sin(TAU * 3 * f * x)) * Math.exp(-x * (5 / len)) * Math.min(1, x * 500)); };
const PATTERN = [0, 2, 1, 3, 2, 1, 3, 2];
for (let t = 5.5, k = 0; t < 28; t += BEAT / 2, k++) {
  const notes = chordAt(t)[2];
  const g = 0.11 * ramp(t, 5.3, 7.5) * (k % 2 ? 0.75 : 1);
  const p = pluck(notes[PATTERN[k % 8]] + 12);
  add(dry, p, t, g, k % 2 ? 0.35 : -0.35);
  for (let i = 0; i < p.length; i++) wetSrc[Math.round(t * SR) + i] += p[i] * g;
}
for (const [t, m, g] of [[28, 79, 0.16], [29, 74, 0.1], [30, 78, 0.12], [31, 71, 0.08], [32, 74, 0.16], [32.5, 78, 0.1], [33, 81, 0.1]]) {
  const p = pluck(m, 1.6);
  add(dry, p, t, g, 0);
  for (let i = 0; i < p.length && Math.round(t * SR) + i < wetSrc.length; i++) wetSrc[Math.round(t * SR) + i] += p[i] * g;
}

// delay ping-pong (colcheia pontuada) + reverb no barramento do arpejo
const dl = Math.round(0.375 * SR);
const eL = new Float32Array(DUR * SR), eR = new Float32Array(DUR * SR);
for (let i = 0; i < DUR * SR; i++) {
  eL[i] = wetSrc[i] * 0.5 + (i >= dl ? eR[i - dl] * 0.42 : 0);
  eR[i] = i >= dl ? eL[i - dl] * 0.7 : 0;
}
const rv = reverb(wetSrc.map((v, i) => v + (padB.L[i] + padB.R[i]) * 0.35));

const music = buf(DUR);
for (let i = 0; i < DUR * SR; i++) {
  const t = i / SR, master = Math.min(1, t / 0.4) * Math.min(1, (DUR - t) / 1.6);
  const freeze = 1 - 0.55 * ramp(t, 4.85, 5.0) * (1 - ramp(t, 5.25, 5.6)); // respiro no congelamento
  music.L[i] = Math.tanh((dry.L[i] + padB.L[i] + eL[i] * 0.6 + rv[i] * 0.5) * 1.6) * master * freeze;
  music.R[i] = Math.tanh((dry.R[i] + padB.R[i] + eR[i] * 0.6 + rv[i] * 0.5) * 1.6) * master * freeze;
}
write('music', normalize(music, -4));

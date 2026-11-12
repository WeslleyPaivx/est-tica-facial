// Utilitários determinísticos: tudo é função do tempo t (segundos).
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
export const TAU = Math.PI * 2;

export const ease = {
  linear: (k) => k,
  inOut: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  out: (k) => 1 - Math.pow(1 - k, 3),
  out5: (k) => 1 - Math.pow(1 - k, 5),
  in: (k) => k * k * k,
  back: (k) => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
  elastic: (k) => (k === 0 || k === 1 ? k : Math.pow(2, -9 * k) * Math.sin((k * 10 - 0.75) * (TAU / 3)) + 1),
};

const mix = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], k)) : lerp(a, b, k));

// Trilha de keyframes: [[t, valor, ease?], ...]; o ease da chave vale para o segmento que chega nela.
export function track(keys, def = ease.inOut) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i];
      if (t < t1) {
        const [t0, v0] = keys[i - 1];
        return mix(v0, v1, (e || def)(clamp((t - t0) / (t1 - t0))));
      }
    }
    return keys[keys.length - 1][1];
  };
}

// Estados nomeados com transição ("take"): [[t, {params}, dur?, ease?], ...] sobre uma base.
export function states(base, keys, defDur = 0.28, defEase = ease.out) {
  const full = keys.map(([t, p, d, e]) => [t, { ...base, ...p }, d ?? defDur, e || defEase]);
  return (t) => {
    let i = -1;
    for (let j = 0; j < full.length; j++) if (full[j][0] <= t) i = j;
    if (i < 0) return full.length ? full[0][1] : base;
    const [ti, p, d, e] = full[i];
    const prev = i > 0 ? full[i - 1][1] : p;
    const k = e(clamp((t - ti) / Math.max(d, 1e-4)));
    const out = {};
    for (const key in p) out[key] = typeof p[key] === "number" ? lerp(prev[key] ?? p[key], p[key], k) : k < 0.5 ? prev[key] : p[key];
    return out;
  };
}

// Ruído suave determinístico (soma de senos com frequências incomensuráveis).
export const wobble = (t, seed = 0, f = 1) =>
  (Math.sin(t * f * 1.13 + seed * 12.9898) * 0.5 + Math.sin(t * f * 2.31 + seed * 78.233) * 0.3 + Math.sin(t * f * 4.07 + seed * 37.719) * 0.2);

// PRNG semeado (mulberry32) para construção de cena.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// Piscadas: agenda determinística por personagem + piscadas forçadas.
export function blinkAt(t, seed, forced = []) {
  const r = rng(seed);
  let tt = 0.6 + r() * 1.5;
  const dur = 0.16;
  let b = 0;
  while (tt < 50) {
    const k = (t - tt) / dur;
    if (k >= 0 && k <= 1) b = Math.max(b, Math.sin(k * Math.PI));
    tt += 2.4 + r() * 2.2;
  }
  for (const f of forced) { const k = (t - f) / dur; if (k >= 0 && k <= 1) b = Math.max(b, Math.sin(k * Math.PI)); }
  return b;
}

// Pulso 0..1..0 entre a e b (pico no meio), útil para pops.
export const pulse = (t, a, b) => (t < a || t > b ? 0 : Math.sin(((t - a) / (b - a)) * Math.PI));

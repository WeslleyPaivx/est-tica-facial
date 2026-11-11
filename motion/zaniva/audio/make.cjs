// Sintetiza assets/trilha.wav (música + efeitos) em JS puro.
// Os tempos dos efeitos vêm de window.__cues, preenchido por film.js — imagem e som nunca dessincronizam.
// Uso: node audio/make.cjs
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

// node audio/make.cjs [html] [duração] [saída] — padrão: o filme principal
const [HTML = "index.html", D = "37.5", OUT = "trilha.wav"] = process.argv.slice(2);
const SR = 48000, DUR = +D, N = Math.round(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 7; // PRNG fixo: a trilha sai idêntica a cada execução
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32) * 2 - 1;
const TAU = Math.PI * 2;

// escreve um som: fn(tLocal, i) -> amostra; pan -1..1
function put(t0, dur, pan, gain, fn) {
  const a = Math.max(0, Math.round(t0 * SR)), n = Math.round(dur * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4), gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n && a + i < N; i++) { const v = fn(i / SR, i); L[a + i] += v * gl; R[a + i] += v * gr; }
}
// ruído passa-banda (filtro de estado variável) com frequência variável
function noiseBP(fAt, q) {
  let lo = 0, bd = 0;
  return (t) => { const f = 2 * Math.sin((Math.PI * fAt(t)) / SR); const hi = rnd() - lo - q * bd; bd += f * hi; lo += f * bd; return bd; };
}
const exp = (t, k) => Math.exp(-t * k);
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

const FX = {
  whoosh(t) { const d = 0.8, bp = noiseBP((x) => 300 + 5200 * Math.sin((Math.PI * x) / d) ** 2, 0.5);
    put(t, d, -0.5, 0.5, (x) => bp(x) * Math.sin((Math.PI * x) / d) ** 2 * (1 - x / d));
    put(t, d, 0.5, 0.5, (x) => bp(x) * Math.sin((Math.PI * x) / d) ** 2 * (x / d)); },
  tick(t, p) { put(t, 0.12, 0, 0.16, (x) => Math.sin(TAU * hz(76 + (p % 5) * 2) * x) * exp(x, 45)); },
  key(t, p) { const f = 1700 + ((p * 37) % 9) * 110, pan = ((p % 5) - 2) / 5;
    put(t, 0.035, pan, 0.11, (x) => (rnd() * 0.6 + Math.sin(TAU * f * x)) * exp(x, 160)); },
  click(t) { put(t, 0.06, 0, 0.3, (x) => Math.sin(TAU * 1200 * x) * exp(x, 90) + rnd() * exp(x, 300)); },
  pop(t) { put(t, 0.16, 0, 0.32, (x) => Math.sin(TAU * (380 * x + 1500 * x * x)) * exp(x, 26)); },
  blip(t, p) { const f = hz(72 + [0, 4, 7, 9, 12][p % 5]); put(t, 0.25, (p % 2 ? 0.4 : -0.4), 0.2, (x) => (Math.sin(TAU * f * x) + 0.3 * Math.sin(TAU * 2 * f * x)) * exp(x, 18)); },
  send(t) { put(t, 0.14, 0.3, 0.22, (x) => Math.sin(TAU * (520 * x + 2400 * x * x)) * Math.sin((Math.PI * x) / 0.14)); },
  ding(t) { [[84, 0], [88, 0.09]].forEach(([m, o]) => put(t + o, 0.7, -0.3, 0.2, (x) => (Math.sin(TAU * hz(m) * x) + 0.25 * Math.sin(TAU * hz(m) * 2.76 * x)) * exp(x, 7))); },
  chime(t) { [84, 88, 91, 96].forEach((m, i) => put(t + i * 0.07, 1.1, (i - 1.5) / 3, 0.17, (x) => (Math.sin(TAU * hz(m) * x) + 0.2 * Math.sin(TAU * hz(m) * 3.01 * x)) * exp(x, 5))); },
  slam(t) { put(t, 0.5, 0, 0.8, (x) => Math.sin(TAU * (130 * x - 90 * x * x)) * exp(x, 8)); put(t, 0.12, 0, 0.35, (x) => rnd() * exp(x, 40)); },
  boom(t) { put(t, 1.4, 0, 0.7, (x) => Math.sin(TAU * (62 * x - 9 * x * x)) * exp(x, 2.6) * Math.min(1, x * 200)); },
  shimmer(t) { [91, 96, 98, 103].forEach((m, i) => put(t + i * 0.04, 0.9, (i - 1.5) / 2, 0.05, (x) => Math.sin(TAU * hz(m) * x) * Math.sin((Math.PI * x) / 0.9) ** 2)); },
  riser(t) { const d = 0.75, bp = noiseBP((x) => 400 + 7000 * (x / d) ** 2, 0.35);
    put(t, d, 0, 0.4, (x) => (bp(x) + 0.5 * Math.sin(TAU * (200 * x + 900 * x * x))) * (x / d) ** 2); },
};

// ---------- música: 120 bpm, cortes de cena caem no tempo ----------
const BEAT = 0.5;
const CH = [[45, 57, 60, 64, 67], [41, 57, 60, 65, 69], [48, 55, 60, 64, 67], [43, 55, 59, 62, 67]]; // Am7 F C G
function music() {
  for (let bar = 0; bar * 2 < DUR; bar++) {
    const t = bar * 2, c = CH[bar % 4], on = t >= 4 && t < 32;
    // pad
    c.slice(1).forEach((m, i) => put(t, 2.3, (i - 1.5) / 2.5, 0.05, (x) => {
      const e = Math.min(1, x / 0.5) * Math.min(1, (2.3 - x) / 0.5);
      return (Math.sin(TAU * hz(m) * x) + Math.sin(TAU * hz(m) * 1.004 * x) + 0.3 * Math.sin(TAU * hz(m) * 2 * x)) * e; }));
    if (!on) continue;
    // baixo
    [0, 1.5].forEach((o) => put(t + o, 0.5, 0, 0.3, (x) => Math.sin(TAU * hz(c[0] - 12) * x) * exp(x, 5) * Math.min(1, x * 300)));
    for (let b = 0; b < 4; b++) {
      put(t + b * BEAT, 0.22, 0, 0.42, (x) => Math.sin(TAU * (110 * x - 150 * x * x)) * exp(x, 14)); // bumbo
      put(t + b * BEAT + 0.25, 0.04, 0.3, 0.05, (x) => rnd() * exp(x, 120)); // chimbal
      // arpejo
      [0, 0.25].forEach((o, j) => { const m = c[1 + ((b * 2 + j) * 3) % 4] + 12;
        put(t + b * BEAT + o, 0.3, j ? 0.5 : -0.5, 0.06, (x) => (Math.sin(TAU * hz(m) * x) + 0.4 * Math.sin(TAU * hz(m) * 2 * x)) * exp(x, 12)); });
    }
    if (bar % 2 === 1) put(t + 1.5, 0.12, 0, 0.14, (x) => rnd() * exp(x, 30)); // palma leve
  }
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + path.resolve(__dirname, "..", HTML));
  const cues = await page.evaluate(() => window.__cues);
  await browser.close();
  if (!cues || !cues.length) throw new Error(HTML + " não expôs window.__cues");

  music();
  for (const [k, t, p] of cues) { if (!FX[k]) throw new Error("efeito desconhecido: " + k); FX[k](t, p); }

  // limitador suave + fade final
  const buf = Buffer.alloc(44 + N * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
  let peak = 0;
  for (let i = 0; i < N; i++) {
    const f = Math.min(1, (N - i) / (SR * Math.min(1.2, DUR * 0.05)));
    const l = Math.tanh(L[i] * 1.4) * f, r = Math.tanh(R[i] * 1.4) * f;
    peak = Math.max(peak, Math.abs(l), Math.abs(r));
    buf.writeInt16LE(Math.round(l * 29000), 44 + i * 4); buf.writeInt16LE(Math.round(r * 29000), 46 + i * 4);
  }
  if (!(peak > 0.2 && peak <= 1)) throw new Error("pico fora do esperado: " + peak);
  fs.writeFileSync(path.resolve(__dirname, "../assets", OUT), buf);
  console.log(`${OUT}: ${cues.length} efeitos, pico ${peak.toFixed(2)}`);
})();

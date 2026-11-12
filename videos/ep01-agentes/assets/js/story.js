// Roteiro do episódio: câmera, poses, expressões e eventos como funções puras de t.
// Tudo ancorado nas falas (S = início, E = fim), então trocar o áudio re-sincroniza a coreografia.
import TL from "./timeline-data.js";
import MOUTH from "./mouth-data.js";
import { track, states, ease, clamp, lerp, smooth, wobble, blinkAt, pulse } from "./util.js";
import { LUCAS_POSE, LUCAS_FACE } from "./lucas.js";
import { FACE } from "./robots.js";

const LINE = Object.fromEntries(TL.lines.map((l) => [l.id, l]));
export const S = (id) => LINE[id].start;
export const E = (id) => LINE[id].end;
export const DURATION = TL.duration;

// ---------- eventos-chave ----------
export const EV = {
  ring0: 0.15, ring1: S("l03") - 0.35,
  papers: E("l01") + 0.07,
  nexoIn: E("l02") + 0.05,
  turn: E("l03") + 0.04,
  swivelRoom: E("l03") + 0.1,
  snap: E("l08") + 0.1,
  beams: E("l08") + 0.2,
  tidy: E("l08") + 0.45,
  intro: { blue: S("l09") - 0.25, green: S("l10") - 0.2, purple: S("l11") - 0.2, yellow: S("l12") - 0.2, red: S("l13") - 0.2 },
  regroup: S("l15") - 0.1,
  swivelDesk: S("l16") - 0.15,
  build0: S("l15") + 0.2,
  reveal: E("l16") + 0.13,
  facepalm: E("l18") + 0.05,
  fix: E("l18") + 0.85,
  approve: E("l19") + 0.08,
  swivelBoss: S("l20") + 1.0,
  wide: S("l20") + 1.25,
  final: S("l21") - 0.15,
  wink: E("l21") + 0.1,
};
EV.ctaQ = S("l21") + 0.05;
EV.ctaC = S("l21") + 1.15;

export const AGENT_ORDER = ["blue", "green", "purple", "yellow", "red"];
const CLUSTER = { blue: [-0.6, 0, 1.05], green: [-0.3, 0, 1.42], purple: [0, 0, 1.58], yellow: [0.3, 0, 1.42], red: [0.6, 0, 1.05] };
const WORK = { blue: [-1.1, 0, 0.45], green: [-0.6, 0.74, -1.17], purple: [-0.55, 0, 1.25], yellow: [0.95, 0, 0.6], red: [1.3, 0, -0.35] };
export const BEAMS = CLUSTER;
const HEAD = [0, 1.29, -0.42];

// ---------- câmera: lista de planos (cortes secos entre planos) ----------
const v = (a, b, k) => a.map((x, i) => lerp(x, b[i], k));
function shot(t0, t1, from, to, e = ease.inOut) { return { t0, t1, from, to, e }; }
const C = (pos, target, fov) => ({ pos, target, fov });
const orbitC = [0, 0, 1.25];
// Rostos ficam no terço superior (alvo abaixo da cabeça), longe da faixa de legenda.
const LCU = (z = -2.08, fov = 30, dx = 0.08) => C([dx, 1.78, z], [0, 1.12, -0.45], fov);           // Lucas de frente (de cima dos monitores)
const LRM = (z = 1.25, fov = 30, dx = -0.16) => C([dx, 1.5, z], [0, 1.15, -0.42], fov);            // Lucas virado para a sala
const OTS_SCREEN = (k = 0) => C([0.58 - k * 0.04, 1.86 - k * 0.03, 0.22 - k * 0.06], [-0.33, 1.08, -1.63], 30 - k * 4);
const SHOTS = [
  // C1 — empurrão rápido até o rosto
  shot(0, EV.papers, C([0.0, 2.0, -2.3], [0, 1.2, -0.42], 46), LCU(-2.08, 30), ease.out5),
  shot(EV.papers, EV.nexoIn, C([-1.75, 1.95, 0.85], [0.05, 0.9, -1.3], 50), C([-1.6, 1.85, 0.7], [0.05, 0.9, -1.3], 48)),
  shot(EV.nexoIn, S("l04"), C([-0.5, 1.85, -2.15], [0.17, 1.25, -0.18], 38), C([-0.44, 1.83, -2.08], [0.17, 1.25, -0.18], 35)),
  // C2 — plano / contraplano
  shot(S("l04"), S("l05"), LRM(1.3, 31), LRM(1.22, 29)),
  shot(S("l05"), S("l06"), C([-0.78, 1.62, -1.02], [0.38, 1.3, 0.25], 34), C([-0.74, 1.6, -0.95], [0.38, 1.3, 0.25], 31)),
  shot(S("l06"), S("l07"), LRM(1.15, 28), LRM(1.1, 27)),
  shot(S("l07"), S("l08"), C([-0.74, 1.6, -0.95], [0.38, 1.32, 0.25], 27), C([-0.7, 1.6, -0.9], [0.38, 1.32, 0.25], 25)),
  shot(S("l08"), EV.snap - 0.05, LRM(1.25, 34, -0.15), LRM(1.05, 27, -0.13), ease.out5),
  shot(EV.snap - 0.05, EV.intro.blue, C([0.55, 2.0, -1.95], [0.0, 0.75, 1.0], 50), C([0.52, 1.95, -1.85], [0.0, 0.68, 1.1], 48)),
  // C3 — órbita durante a apresentação dos agentes
  { t0: EV.intro.blue, t1: S("l14"), orbit: true },
  shot(S("l14"), S("l14") + 0.75, LRM(1.25, 31, 0.15), LRM(1.12, 28, 0.13), ease.out5),
  shot(S("l14") + 0.75, EV.regroup, C([2.0, 1.75, -1.75], [0.25, 0.85, 0.5], 54), C([1.92, 1.72, -1.66], [0.25, 0.85, 0.5], 52)),
  // C4 — reviravolta
  shot(EV.regroup, EV.swivelDesk, C([0.62, 1.15, -0.32], [0.05, 0.98, 1.0], 30), C([0.58, 1.15, -0.26], [0.05, 0.98, 1.0], 27)),
  shot(EV.swivelDesk, EV.reveal, C([-1.95, 1.4, -0.35], [-0.6, 0.92, -1.2], 36), C([-1.85, 1.38, -0.4], [-0.6, 0.92, -1.2], 33)),
  shot(EV.reveal, S("l17"), OTS_SCREEN(0), OTS_SCREEN(1.6), ease.out5),
  shot(S("l17"), S("l18"), LCU(-2.08, 31), LCU(-2.02, 28)),
  shot(S("l18"), EV.facepalm, C([-0.45, 1.85, -2.15], [0.24, 1.25, -0.25], 37), C([-0.4, 1.83, -2.08], [0.24, 1.25, -0.25], 34)),
  shot(EV.facepalm, EV.fix, LCU(-2.05, 29), LCU(-2.0, 27)),
  // C5 — solução
  shot(EV.fix, S("l19") + 0.8, OTS_SCREEN(0.3), OTS_SCREEN(0.9)),
  shot(S("l19") + 0.8, EV.approve - 0.05, LCU(-2.08, 31), LCU(-2.03, 29)),
  shot(EV.approve - 0.05, S("l20") + 0.35, OTS_SCREEN(1.0), OTS_SCREEN(1.4)),
  shot(S("l20") + 0.35, EV.wide, C([-0.2, 1.88, -2.15], [0.5, 1.42, -0.08], 37), C([-0.18, 1.86, -2.1], [0.5, 1.42, -0.08], 35)),
  shot(EV.wide, EV.final, C([0.9, 1.7, 1.7], [-0.15, 0.85, -0.45], 46), C([1.7, 2.35, 2.75], [-0.15, 0.8, -0.5], 52), ease.inOut),
  // C6 — final: Lucas à esquerda comandando, Nexo à direita olhando para a câmera
  shot(EV.final, DURATION + 1, C([0.3, 1.52, 3.0], [0.25, 1.2, 0.0], 42), C([0.27, 1.5, 2.88], [0.25, 1.2, 0.0], 40)),
];

function camAt(t, agentPos) {
  const s = SHOTS.find((x) => t >= x.t0 && t < x.t1) || SHOTS[SHOTS.length - 1];
  let pos, target, fov;
  if (s.orbit) {
    const k = clamp((t - s.t0) / (s.t1 - s.t0));
    const th = lerp(-0.95, 0.95, ease.inOut(k));
    pos = [orbitC[0] + Math.sin(th) * 2.05, 1.08 + Math.sin(k * Math.PI) * 0.1, orbitC[2] - Math.cos(th) * 1.3];
    target = agentPos; fov = 40;
  } else {
    const k = s.e(clamp((t - s.t0) / (s.t1 - s.t0)));
    pos = v(s.from.pos, s.to.pos, k); target = v(s.from.target, s.to.target, k); fov = lerp(s.from.fov, s.to.fov, k);
  }
  // câmera na mão sutil; tremida maior no caos e no impacto do erro
  const shake = 0.004 + 0.012 * (t < EV.nexoIn ? 1 : 0) + 0.02 * pulse(t, EV.reveal, EV.reveal + 0.35);
  pos = [pos[0] + wobble(t, 1, 1.3) * shake, pos[1] + wobble(t, 2, 1.1) * shake, pos[2] + wobble(t, 3, 0.9) * shake];
  return { pos, target, fov, cut: s.t0 };
}

// ---------- Lucas ----------
const P = {
  typing: { lean: 0.16, lShX: 0.95, lShZ: 0.18, lElb: 1.25, rShX: 0.95, rShZ: 0.18, rElb: 1.25, headPitch: 0.08 },
  shout: { lean: -0.08, headPitch: -0.12, lShX: 0.75, lShZ: 0.95, lElb: 0.55, rShX: 0.75, rShZ: 0.95, rElb: 0.55 },
  headHands: { lean: 0.1, headPitch: 0.05, lShX: 2.35, lShZ: 0.75, lElb: 2.35, rShX: 2.35, rShZ: 0.75, rElb: 2.35 },
  plead: { lean: 0.05, headPitch: 0.08, headRoll: 0.08, lShX: 1.05, lShZ: 0.35, lElb: 1.5, rShX: 1.05, rShZ: 0.35, rElb: 1.5 },
  turnScared: { torsoYaw: -0.45, headYaw: -0.85, lean: -0.05, lShX: 0.9, lShZ: 0.3, lElb: 1.8, rShX: 0.9, rShZ: 0.5, rElb: 1.6 },
  sitRoom: { lean: 0.02, lShX: 0.35, lShZ: 0.15, lElb: 1.15, rShX: 0.35, rShZ: 0.15, rElb: 1.15 },
  curious: { headRoll: 0.18, headPitch: -0.02, lean: 0.06, lShX: 0.4, lShZ: 0.15, lElb: 1.2, rShX: 1.1, rShZ: 0.2, rElb: 2.2 },
  leanIn: { lean: 0.22, headPitch: -0.12, lShX: 0.7, lShZ: 0.12, lElb: 1.3, rShX: 0.7, rShZ: 0.12, rElb: 1.3 },
  cheer: { lean: -0.06, headPitch: -0.15, lShX: 2.75, lShZ: 0.35, lElb: 0.35, rShX: 2.75, rShZ: 0.35, rElb: 0.35 },
  watch: { lean: 0.12, headPitch: -0.1, lShX: 0.55, lShZ: 0.12, lElb: 1.0, rShX: 0.55, rShZ: 0.12, rElb: 1.0 },
  wow: { lean: -0.1, headPitch: -0.12, lShX: 1.6, lShZ: 0.75, lElb: 0.6, rShX: 1.6, rShZ: 0.75, rElb: 0.6 },
  facepalm: { lean: 0.18, headPitch: 0.22, headRoll: -0.1, lShX: 0.5, lShZ: 0.2, lElb: 1.2, rShX: 1.45, rShZ: -0.9, rShY: 0, rElb: 1.2 },
  typeFast: { lean: 0.2, lShX: 1.0, lShZ: 0.18, lElb: 1.3, rShX: 1.0, rShZ: 0.18, rElb: 1.3, headPitch: 0.02 },
  hopeful: { lean: 0.05, headRoll: 0.12, headYaw: -0.25, lShX: 0.6, lShZ: 0.15, lElb: 1.6, rShX: 0.6, rShZ: 0.15, rElb: 1.6 },
  boss: { lean: -0.05, headPitch: -0.08, lShX: 0.25, lShZ: 0.55, lElb: 2.0, lShY: 0.6, rShX: 1.55, rShZ: 0.25, rElb: 0.15 },
};
const X = {
  neutral: {},
  panic: { brow: 0.6, browIn: 0.9, lid: 0, wide: 1.18, pupil: 0.7, smile: -0.7, open: 0.25, mouthW: 1.15 },
  shout: { brow: 0.9, browIn: 0.5, lid: 0, wide: 1.2, pupil: 0.65, smile: -0.4, open: 0.45, mouthW: 1.2 },
  scared: { brow: 1, browIn: 0.6, lid: 0, wide: 1.25, pupil: 0.55, smile: -0.5, open: 0.35, lookX: -1 },
  puzzled: { brow: 0.4, browIn: -0.3, lid: 0.15, smile: -0.2, lookX: 0.4 },
  hopeful: { brow: 0.6, browIn: 0.5, lid: 0.05, wide: 1.1, smile: 0.5 },
  excited: { brow: 1, browIn: 0, lid: 0, wide: 1.15, smile: 1, open: 0.35 },
  amazed: { brow: 0.85, browIn: 0.2, lid: 0, wide: 1.2, smile: 0.6, open: 0.2 },
  angry: { brow: -0.2, browIn: -0.9, lid: 0.2, wide: 1.12, pupil: 0.6, smile: -0.8, open: 0.4, mouthW: 1.2 },
  tired: { brow: -0.1, browIn: 0.6, lid: 0.7, smile: -0.6 },
  happy: { brow: 0.4, browIn: 0, lid: 0.18, smile: 1, open: 0.12 },
  proud: { brow: 0.5, browIn: -0.1, lid: 0.2, smile: 1.25, open: 0, mouthW: 1.3 },
};
const lucasPose = states(LUCAS_POSE, [
  [0, P.typing], [S("l01") - 0.12, P.shout, 0.2, ease.back], [EV.papers, P.headHands, 0.3], [S("l02") + 0.9, P.plead, 0.35],
  [EV.turn, P.turnScared, 0.22, ease.back], [EV.swivelRoom + 0.32, P.sitRoom, 0.3],
  [S("l04"), P.curious, 0.3], [S("l06"), P.leanIn, 0.3], [S("l08") - 0.05, P.cheer, 0.18, ease.back], [EV.snap + 0.3, P.watch, 0.45],
  [S("l14"), P.wow, 0.2, ease.back], [EV.swivelDesk, P.typing, 0.4], [E("l16") - 0.1, P.watch, 0.25],
  [S("l17"), P.headHands, 0.22, ease.back], [S("l18") + 0.4, P.plead, 0.4], [EV.facepalm, P.facepalm, 0.3, ease.back],
  [EV.fix - 0.1, P.typeFast, 0.3], [S("l19") + 0.5, P.hopeful, 0.35], [EV.approve, P.typing, 0.3], [EV.swivelBoss, P.boss, 0.5, ease.back],
]);
const lucasFace = states(LUCAS_FACE, [
  [0, X.tired], [S("l01") - 0.15, X.shout, 0.15], [S("l02"), X.panic, 0.25], [EV.turn - 0.1, X.scared, 0.12, ease.back],
  [S("l04"), X.puzzled, 0.3], [S("l06"), X.hopeful, 0.25], [S("l08") - 0.1, X.excited, 0.15], [EV.snap + 0.25, X.amazed, 0.35],
  [S("l14") - 0.05, X.excited, 0.15], [S("l15"), X.puzzled, 0.3], [EV.swivelDesk, X.neutral, 0.3], [EV.reveal + 0.05, X.scared, 0.12],
  [S("l17"), X.angry, 0.18], [S("l18") + 0.4, X.tired, 0.5], [EV.fix, { ...X.puzzled, lookX: 0, brow: 0.1 }, 0.3],
  [S("l19"), X.hopeful, 0.3], [EV.approve, X.happy, 0.25], [EV.swivelBoss, X.proud, 0.4],
]);
const chairYaw = track([[0, Math.PI], [EV.swivelRoom, Math.PI], [EV.swivelRoom + 0.35, 0, ease.back], [EV.swivelDesk, 0], [EV.swivelDesk + 0.35, Math.PI, ease.back],
  [EV.swivelBoss, Math.PI], [EV.swivelBoss + 0.45, Math.PI * 2, ease.back]]);

function talkFor(t, who) {
  for (const l of TL.lines) {
    if (l.speaker === who && t >= l.start && t < l.end + 0.05) {
      const env = MOUTH[l.id]; const i = Math.floor((t - l.start) * 30);
      const a = env[Math.min(env.length - 1, i)] || 0, b = env[Math.min(env.length - 1, i + 1)] || 0;
      return lerp(a, b, (t - l.start) * 30 - i);
    }
  }
  return 0;
}

// ---------- Nexo ----------
const nexoPos = track([
  [0, [0.42, 1.55, 0.05]], [EV.swivelRoom + 0.2, [0.42, 1.55, 0.05]], [S("l04") + 0.1, [0.36, 1.44, 0.25]],
  [EV.snap + 0.4, [0.36, 1.44, 0.25]], [EV.intro.blue, [-0.75, 1.2, 1.75]], [EV.intro.green, [-0.4, 1.25, 1.95]],
  [EV.intro.purple, [0.0, 1.3, 2.05]], [EV.intro.yellow, [0.4, 1.25, 1.95]], [EV.intro.red, [0.75, 1.2, 1.75]],
  [S("l14") + 0.6, [0.05, 1.0, 1.0]], [EV.swivelDesk, [0.05, 1.0, 1.0]], [S("l18") - 0.15, [0.5, 1.5, -0.12]],
  [EV.fix, [0.5, 1.5, -0.12]], [S("l20") + 0.3, [0.45, 1.6, -0.08]], [EV.wide - 0.04, [0.45, 1.6, -0.08]], [EV.wide, [-0.6, 1.6, 0.15], ease.linear],
  [EV.final, [-0.2, 1.5, 0.6]], [EV.final + 1.0, [0.38, 1.36, 1.2], ease.out],
], ease.inOut);
const NX = { base: { lx: 0.2, lz: 0.35, rx: 0.2, rz: 0.35, tiltX: 0, tiltZ: 0, squash: 0 } };
const nexoArms = states(NX.base, [
  [0, {}], [S("l03"), { lx: 0.9, lz: 0.6, rx: 0.2, rz: 0.4, tiltZ: 0.15 }, 0.3], [S("l05"), { lx: 1.2, lz: 0.4, rx: 1.2, rz: 0.4 }, 0.3],
  [S("l07"), { rx: 1.4, rz: 0.2, lx: 0.2, lz: 0.35, tiltZ: -0.12 }, 0.3], [EV.snap - 0.25, { rx: 2.3, rz: 0.3, lx: 0.3, lz: 0.4 }, 0.15, ease.back],
  [EV.snap + 0.35, { lx: 0.7, lz: 1.1, rx: 0.7, rz: 1.1 }, 0.3], [S("l09"), { lx: 1.4, lz: 0.5, rx: 0.2, rz: 0.4 }, 0.25],
  [S("l10"), { lx: 1.4, lz: 0.3 }, 0.25], [S("l11"), { rx: 1.4, rz: 0.2, lx: 0.2, lz: 0.4 }, 0.25], [S("l13"), { rx: 1.4, rz: 0.45, lx: 0.2, lz: 0.35 }, 0.25],
  [S("l14") + 0.5, { lx: 0.9, lz: 1.2, rx: 0.9, rz: 1.2 }, 0.35], [S("l15"), { lx: 1.3, lz: -0.55, rx: 1.3, rz: -0.55, tiltZ: 0.12 }, 0.3],
  [S("l18"), { lx: 1.3, lz: -0.55, rx: 1.3, rz: -0.55, tiltZ: -0.1 }, 0.3], [S("l20"), { rx: 1.5, rz: 0.2, lx: 0.2, lz: 0.4 }, 0.3],
  [S("l20") + 1.2, { lx: 0.9, lz: 1.15, rx: 0.9, rz: 1.15 }, 0.35], [EV.final + 0.4, { lx: 0.3, lz: 0.4, rx: 1.6, rz: 0.15 }, 0.35],
  [EV.ctaC, { lx: 0.3, lz: 0.4, rx: 2.4, rz: 0.4 }, 0.3, ease.back],
]);
const nexoFace = states(FACE, [
  [0, {}], [S("l03"), { squint: 0.25, smile: 0.8 }, 0.25], [S("l04"), { smile: 0.6 }], [S("l05"), { smile: 0.9 }],
  [EV.snap - 0.2, { happy: 1 }, 0.1], [EV.snap + 0.4, { smile: 1 }], [S("l14"), { happy: 1 }, 0.1], [S("l15"), { squint: 0.55, smile: 0.5 }, 0.2],
  [E("l16"), { worried: 0.6, smile: -0.5 }, 0.15], [S("l18"), { squint: 0.5, smile: 0.7 }, 0.25], [EV.facepalm, { squint: 0.3, smile: 0.4 }],
  [S("l20"), { smile: 1 }], [EV.final, { smile: 1, squint: 0.1 }], [EV.wink, { wink: 1, smile: 1 }, 0.06], [EV.wink + 0.45, { wink: 0, smile: 1 }, 0.08],
]);

// ---------- agentes ----------
function agentState(kind, t, i, cam) {
  const ti = EV.intro[kind];
  const appear = ease.back(clamp((t - ti) / 0.45));
  const pos = t < EV.regroup ? CLUSTER[kind] : WORK[kind];
  const since = t - ti;
  const hopY = since > 0 && since < 0.7 ? Math.max(0, Math.sin((since / 0.55) * Math.PI)) * 0.16 : 0;
  const land = pulse(t, ti + 0.55, ti + 0.75);
  let st = { hop: hopY, squash: land * 0.18 - (since > 0 && since < 0.12 ? 0.1 : 0), lean: 0, tilt: 0, lx: 0.15, lz: 0.25, rx: 0.15, rz: 0.25 };
  const ph = t * 2 + i * 1.7;
  const working = since > 1.0;
  if (since > 0.25 && since < 1.1) { st.rx = 2.5; st.rz = 0.5 + Math.sin(t * 18) * 0.25; } // aceno
  else if (working) {
    const w = 0.5 + 0.5 * Math.sin(ph * 2.2);
    if (kind === "blue") { st.rx = 1.3 + Math.sin(ph * 1.5) * 0.3; st.rz = 0.2 + Math.sin(ph) * 0.3; st.tilt = Math.sin(ph) * 0.08; }
    if (kind === "green") { st.lx = 1.1 + w * 0.3; st.rx = 1.1 + (1 - w) * 0.3; st.lz = st.rz = 0.15; }
    if (kind === "purple") { st.rx = 1.2 + Math.sin(t * 14) * 0.15; st.rz = 0.1 + Math.cos(t * 11) * 0.15; st.lean = 0.12; }
    if (kind === "yellow") { st.lx = 0.8 + w * 0.8; st.rx = 0.8 + (1 - w) * 0.8; st.lz = st.rz = 0.5; }
    if (kind === "red") { st.lx = 1.0; st.lz = 0.2; st.rx = 0.6 + w * 1.0; st.rz = 0.25; st.hop += w * 0.02; }
  }
  // reviravolta: verde comemora e depois fica sem graça
  if (kind === "green" && t > EV.regroup) {
    if (t > S("l16") - 0.25 && t < EV.reveal + 0.1) { st.rx = 2.8; st.rz = 0.35; st.lx = 0.3; st.lz = 0.5; st.hop = Math.max(0, Math.sin((t - S("l16") + 0.25) * 7)) * 0.05; }
    else if (t >= EV.reveal + 0.1 && t < EV.approve) { st.rx = 2.6; st.rz = -0.2; st.lx = 0.1; st.lz = 0.15; st.tilt = 0.18; st.lean = 0.1; }
  }
  const faceSt = { ...FACE, blink: blinkAt(t, 30 + i, [ti + 0.4]), happy: since > 0.15 && since < 1.2 ? 1 : 0, smile: 1, talk: 0 };
  if (kind === "green") {
    faceSt.talk = talkFor(t, "verde");
    if (t > S("l16") - 0.3 && t < EV.reveal + 0.1) faceSt.happy = faceSt.talk > 0.1 ? 0 : 1;
    if (t >= EV.reveal + 0.1 && t < EV.approve) { faceSt.happy = 0; faceSt.worried = 1; faceSt.smile = -0.6; }
  }
  // encara Lucas durante a apresentação; depois encara a câmera (o verde, na mesa, encara Lucas)
  const look = t < EV.regroup ? HEAD : kind === "green" && t < EV.final ? [-1.2, 1.2, -0.2] : cam.pos;
  const yawFinal = Math.atan2(look[0] - pos[0], look[2] - pos[2]);
  const holoOn = t > ti + 0.3 && !(kind === "green" && t > EV.regroup && t < EV.approve);
  return { visible: t > ti, pos, yaw: yawFinal, scale: appear, st, face: faceSt, holo: holoOn ? clamp((t - ti - 0.3) / 0.35) : 0, holoK: clamp((t - ti - 0.3) / 2.4), workK: (t * 0.2 + i * 0.13) % 1 };
}

// ---------- estado completo por quadro ----------
export function frame(t) {
  const presenting = AGENT_ORDER.find((k, i) => t < (AGENT_ORDER[i + 1] ? EV.intro[AGENT_ORDER[i + 1]] : 1e9)) || "red";
  const ap = CLUSTER[presenting];
  const cam = camAt(t, [ap[0] * 0.8, 0.55, ap[2] - 0.05]);
  const agents = {};
  AGENT_ORDER.forEach((k, i) => (agents[k] = agentState(k, t, i, cam)));

  const lp = lucasPose(t);
  const lf = lucasFace(t);
  // pulinho no "QUERO!" e no "CARACA!"
  const hop = pulse(t, S("l08") - 0.05, S("l08") + 0.35) * 0.06 + pulse(t, S("l14"), S("l14") + 0.32) * 0.05;
  lp.bounce = hop + Math.sin(t * 2.2) * 0.004;
  lp.knee = t < EV.nexoIn ? Math.max(0, Math.sin(t * 22)) * 0.06 : 0;
  lp.headYaw += wobble(t, 9, 0.7) * 0.03; lp.headPitch += wobble(t, 10, 0.6) * 0.02;
  if (t > EV.fix - 0.1 && t < S("l19") + 0.5) { lp.lElb += Math.max(0, Math.sin(t * 26)) * 0.12; lp.rElb += Math.max(0, Math.sin(t * 26 + 2)) * 0.12; }
  if (t < EV.papers - 0.2) { lp.lElb += Math.max(0, Math.sin(t * 20)) * 0.06; lp.rElb += Math.max(0, Math.sin(t * 20 + 1.5)) * 0.06; }
  const lBlink = blinkAt(t, 3, [EV.turn - 0.05, S("l04") - 0.1, EV.reveal - 0.05, EV.approve - 0.1, EV.swivelBoss]);

  const np = nexoPos(t);
  const bob = Math.sin(t * 2.6) * 0.022;
  const nIn = ease.back(clamp((t - EV.nexoIn) / 0.5));
  const na = nexoArms(t);
  const nf = { ...nexoFace(t) };
  nf.blink = blinkAt(t, 7, [EV.nexoIn + 0.5, EV.snap + 0.5]);
  nf.talk = talkFor(t, "nexo");
  const nexoLook = t >= EV.final ? cam.pos : t >= EV.regroup && t < EV.swivelDesk ? cam.pos : t >= EV.intro.blue - 0.1 && t < S("l14") + 0.6 ? [ap[0], 0.4, ap[2]] : HEAD;
  const dx = nexoLook[0] - np[0], dz = nexoLook[2] - np[2];
  const nexo = {
    visible: t > EV.nexoIn,
    pos: [np[0], np[1] + bob + (1 - nIn) * 0.25, np[2]],
    scale: nIn,
    spin: (1 - nIn) * Math.PI * 2,
    st: { ...na, yaw: Math.atan2(dx, dz), tiltX: na.tiltX + Math.sin(t * 1.7) * 0.04, glow: 1 },
    face: nf,
  };

  const L = (k) => clamp(k);
  const screens = {
    left: t < EV.beams ? ["chaosL"] : t < EV.build0 ? ["dash", 0] : t < EV.reveal ? ["build", L((t - EV.build0) / (EV.reveal - EV.build0 - 0.15))] : t < EV.fix + 0.25 ? ["messy"] : ["fixed", L((t - EV.fix - 0.25) / 0.6), L((t - EV.approve) / 0.35)],
    right: t < EV.beams ? ["chaosR"] : ["dash", 1],
  };
  const tech = smooth(EV.beams, EV.beams + 1.1, t);
  const monitorCol = t < EV.beams ? [1.0, 0.35, 0.25] : t < EV.reveal ? [0.3, 0.75, 1.0] : t < EV.fix + 0.25 ? [1.0, 0.85, 0.5] : [0.85, 0.9, 1.0];
  const beams = {};
  AGENT_ORDER.forEach((k) => (beams[k] = clamp((t - EV.beams) / 0.25) * (1 - clamp((t - EV.intro[k] - 0.1) / 0.4))));

  return {
    t, cam,
    chairYaw: chairYaw(t), ring: t > EV.ring0 && t < EV.ring1, paperFall: EV.papers, paperTidy: EV.tidy, tech,
    lucas: { pose: lp, face: lf, blink: lBlink, talk: talkFor(t, "lucas") },
    nexo, agents, beams, screens, monitorCol,
    button: t < EV.reveal ? 0 : t < EV.fix + 0.15 ? ease.elastic(clamp((t - EV.reveal) / 0.6)) : 1 - ease.in(clamp((t - EV.fix - 0.15) / 0.35)),
    badges: t,
    snap: clamp((t - EV.snap) / 0.45),
    magic: clamp((t - EV.nexoIn) / 0.6),
  };
}

// Tudo é função do tempo t (segundos): o mesmo t gera sempre o mesmo quadro.
import * as THREE from "three";
import * as W from "./world.js";
import { VOZ, VOZ_FPS, ANCHORS } from "./voz.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => (x = clamp01(x)) * x * (3 - 2 * x);
const backOut = (x) => { x = clamp01(x); const c = 2.2; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2; };
const EASE = { s: smooth, back: backOut, lin: clamp01, out: (x) => 1 - (1 - clamp01(x)) ** 3 };
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// keys: [[t, valor, ease?]] — valor é número, Vector3, objeto plano, ou função(t) que devolve um deles
function track(keys, t) {
  const val = (k) => (typeof k[1] === "function" ? k[1](t) : k[1]);
  if (t <= keys[0][0]) return val(keys[0]);
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const a = keys[i - 1], b = keys[i];
      const u = (EASE[b[2] || "s"])((t - a[0]) / (b[0] - a[0]));
      return mix(val(a), val(b), u);
    }
  }
  return val(keys[keys.length - 1]);
}
function mix(a, b, u) {
  if (typeof a === "number") return a + (b - a) * u;
  if (a.isVector3) return a.clone().lerp(b, u);
  const o = {};
  for (const k in a) o[k] = mix(a[k], b[k] ?? a[k], u);
  return o;
}

// ---------- renderer / cena ----------
const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
// prévia leve: 3D em meia resolução e sombras menores (render bem mais rápido sem GPU)
const LITE = !!window.__hyperframes?.getVariables?.()?.lite;
renderer.setPixelRatio(LITE ? 0.5 : 1);
renderer.setSize(1080, 1920, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = LITE ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#0b0d1c");
scene.fog = new THREE.Fog("#0b0d1c", 4, 10);
const camera = new THREE.PerspectiveCamera(45, 1080 / 1920, 0.03, 30);

const room = W.buildRoom(scene);

// luzes: ambiente noturno, TV fria, luminária quente, luz de borda acompanhando a câmera
const hemi = new THREE.HemisphereLight("#7a6ad0", "#3a2030", 0.85);
scene.add(hemi);
const tvLight = new THREE.SpotLight("#62c6ff", 14, 0, 0.75, 0.6, 1.6);
tvLight.position.set(0, 1.05, -2.4);
tvLight.target.position.set(0, 1.0, 0);
tvLight.castShadow = true;
tvLight.shadow.mapSize.set(1024, 1024);
tvLight.shadow.radius = 6;
tvLight.shadow.bias = -0.0005;
scene.add(tvLight, tvLight.target);
const rim = new THREE.DirectionalLight("#ff7ad9", 2.2);
scene.add(rim, rim.target);
const moon = new THREE.DirectionalLight("#8fa0ff", 0.5);
moon.position.set(-0.7, 2.5, 3);
scene.add(moon);
const warmKey = new THREE.PointLight("#ffc89a", 1.4, 3, 2); // preenchimento quente vindo da mesa (pele não fica cinza)
warmKey.position.set(0.7, 1.55, -0.6);
scene.add(warmKey);

// mesa: objetos
const lamp = W.buildLamp();
lamp.root.position.set(1.28, 0.74, -0.62);
lamp.root.rotation.y = -0.35;
scene.add(lamp.root);
const lampLight = new THREE.SpotLight("#ffb35a", 6, 0, 0.9, 0.7, 1.6);
scene.add(lampLight, lampLight.target);
lampLight.castShadow = true;
lampLight.shadow.mapSize.set(1024, 1024);
lampLight.shadow.radius = 5;
lampLight.shadow.bias = -0.0005;
lamp.root.updateMatrixWorld(true);
lampLight.position.copy(lamp.root.localToWorld(lamp.bulbLocal.clone()));
lampLight.target.position.set(0.72, 0.74, -0.3);
const lampFill = new THREE.PointLight("#ffb35a", 0.6, 2.2, 2);
lampFill.position.copy(lampLight.position).add(V(-0.1, 0.05, 0.1));
scene.add(lampFill);

const book = W.buildBook();
book.root.position.set(0.8, 0.742, -0.02);
book.root.rotation.y = -0.15;
scene.add(book.root);
const notebook = W.buildNotebook();
notebook.root.position.set(0.58, 0.742, -0.36);
notebook.root.rotation.y = 0.25;
scene.add(notebook.root);
const pen = W.buildPen();
scene.add(pen);
const pile = W.buildPile();
pile.root.position.set(1.22, 0.742, 0.2);
scene.add(pile.root);
const timer = W.buildTimer();
timer.root.position.set(1.02, 0.795, -0.72);
timer.root.rotation.y = -0.6;
scene.add(timer.root);
const ctrl = W.buildController();
scene.add(ctrl);

// personagens
const boy = W.buildBoy();
boy.root.rotation.y = Math.PI; // olha para a TV (-z)
scene.add(boy.root);
boy.arms.forEach((a) => scene.add(a.upper, a.lower, a.cuff, a.hand));
const devil = W.buildDevil();
scene.add(devil.root);
const angel = W.buildAngel();
scene.add(angel.root);

// ciclo: jogar → aliviar → adiar → culpa
const cycle = new THREE.Group();
const cycleTokens = [["JOGAR", "#4fd2ff"], ["ALIVIAR", "#6fe38a"], ["ADIAR", "#ffd34f"], ["CULPA", "#ff5b6e"]].map(([txt, col]) => {
  const ct = W.canvasTex(512, 160);
  const x = ct.ctx;
  x.fillStyle = col;
  x.beginPath();
  x.roundRect(8, 8, 496, 144, 72);
  x.fill();
  x.fillStyle = "#14152a";
  x.font = "700 78px Nunito, sans-serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(txt, 256, 84);
  ct.tex.needsUpdate = true;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ct.tex, transparent: true, depthTest: false }));
  sp.scale.set(0.32, 0.1, 1);
  sp.renderOrder = 5;
  cycle.add(sp);
  return { sp, ct, txt };
});
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.008, 8, 80), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.5 }));
ring.rotation.x = Math.PI / 2;
cycle.add(ring);
cycle.position.set(0, 1.9, 0);
scene.add(cycle);
document.fonts.ready.then(() => cycleTokens.forEach(({ ct, txt }, i) => {
  // redesenha depois que a fonte carregar
  const x = ct.ctx;
  x.clearRect(0, 0, 512, 160);
  x.fillStyle = ["#4fd2ff", "#6fe38a", "#ffd34f", "#ff5b6e"][i];
  x.beginPath();
  x.roundRect(8, 8, 496, 144, 72);
  x.fill();
  x.fillStyle = "#14152a";
  x.font = "700 78px Nunito, sans-serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(txt, 256, 84);
  ct.tex.needsUpdate = true;
}));

// ---------- voz real ----------
// boca = volume da voz de cada personagem (src/voz.js, gerado dos áudios)
function mouthOpen(who, t) {
  const e = VOZ[who], f = t * VOZ_FPS, i = Math.floor(f);
  if (i < 0 || i + 1 >= e.length) return 0;
  const v = e[i] + (e[i + 1] - e[i]) * (f - i);
  return v < 0.08 ? 0 : Math.min(1, v * 1.15);
}
// a animação foi escrita na régua antiga; as âncoras levam o tempo real do áudio até ela
function warp(t) {
  const A = ANCHORS;
  for (let i = 1; i < A.length; i++) if (t <= A[i][0]) return A[i - 1][1] + ((t - A[i - 1][0]) / (A[i][0] - A[i - 1][0])) * (A[i][1] - A[i - 1][1]);
  return A[A.length - 1][1] + (t - A[A.length - 1][0]);
}
const blinkAmt = (t, seed) => {
  const p = 3.1, k = Math.floor((t + seed) / p), off = 0.4 + hash(k + seed * 7) * 2.2;
  const d = (t + seed) - k * p - off;
  return d > 0 && d < 0.16 ? Math.sin((d / 0.16) * Math.PI) : 0;
};

// rosto: state {brow, smile, lookX, lookY, wide}
function applyFace(face, st, open, blink) {
  face.eyes.forEach((e, i) => {
    e.scale.set(1 + st.wide * 0.12, Math.max(0.08, (1 + st.wide * 0.18) * (1 - blink)), 1);
    face.pupils[i].position.set(st.lookX * 0.012, st.lookY * 0.01, 0);
  });
  face.brows.forEach((b) => {
    const s = b.userData.side;
    b.rotation.z = s * st.brow * 0.35; // brow>0: bravo/decidido (interno desce); <0: preocupado
    b.position.y = b.userData.y0 ?? (b.userData.y0 = b.position.y);
    b.position.y = b.userData.y0 + (st.wide * 0.012 - Math.max(0, st.brow) * 0.006) * (face.scale || 1);
  });
  const o = Math.max(open, st.openBase || 0);
  face.open.visible = o > 0.06;
  face.arc.visible = !face.open.visible;
  face.open.scale.set(0.8 + st.smile * 0.25, 0.25 + o * 1.1, 0.3);
  face.arc.scale.set(1 + Math.abs(st.smile) * 0.2, st.smile >= 0 ? Math.max(0.25, st.smile) : Math.min(-0.25, st.smile), 1);
}

// ---------- roteiro de poses ----------
const F = (o) => ({ brow: 0, smile: 0, lookX: 0, lookY: 0, wide: 0, openBase: 0, ...o });
const boyFace = [
  [0, F({ brow: 0.5, smile: 0.25 })],
  [1.6, F({ brow: 0.1, smile: 0, lookX: -1 })],
  [3.2, F({ brow: 0.4, smile: 0.3 })],
  [4.6, F({ brow: 0.2, smile: 0.55, lookX: 1 })],
  [9.5, F({ brow: -0.3, smile: 0, lookX: -1, wide: 0.3 })],
  [12.5, F({ brow: -0.6, smile: -0.2, lookX: -1 })],
  [15.4, F({ brow: -0.9, smile: -0.35, lookX: -1, lookY: -1 })],
  [17.4, F({ brow: -0.9, smile: -0.4, lookX: 1 })],
  [19.6, F({ brow: -0.4, smile: 0, lookY: -1 })],
  [22.6, F({ brow: -0.5, smile: -0.1, lookX: -1, lookY: 0.5 })],
  [29.2, F({ brow: -1, smile: -0.7, lookY: -1 })],
  [37.3, F({ brow: -0.6, smile: -0.3, lookX: 1 })],
  [40.4, F({ brow: -0.3, smile: 0, lookX: -1, lookY: -1 })],
  [46.9, F({ brow: 0.3, smile: 0.2, lookX: 0 })],
  [49.2, F({ brow: 0.1, smile: 0.45, lookY: -1 })],
];
// cabeça: yaw (+ = esquerda do rapaz / -x), pitch (+ = cima), tilt (inclina ao perguntar); tronco
const P = (yaw, pitch, tilt, torso = 0, lean = 0) => ({ yaw, pitch, tilt, torso, lean });
const boyPose = [
  [0, P(0, -0.05, 0)],
  [1.4, P(-0.55, -0.25, 0.05)],
  [3.0, P(0, -0.05, 0)],
  [4.5, P(0.25, 0, -0.1, 0, 0.05)],
  [9.4, P(-0.4, 0.05, 0.05)],
  [15.3, P(-0.6, -0.3, 0.28)],
  [17.3, P(0.15, -0.1, 0.1)],
  [19.5, P(0, -0.35, 0)],
  [21.0, P(0, -0.05, 0)],
  [22.5, P(-0.5, 0.15, 0)],
  [29.1, P(0, -0.55, 0, 0, 0.08)],
  [37.2, P(0.4, -0.1, -0.12)],
  [40.3, P(-0.6, -0.35, 0.1, -0.2)],
  [46.9, P(-0.2, -0.1, 0, -0.35)],
  [49.0, P(-0.25, -0.5, 0, -0.55, 0.08)],
];

const SH = { // posições-chave de mãos (mundo)
  gameL: V(-0.09, 0.8, -0.3), gameR: V(0.09, 0.8, -0.3),
  lapL: V(-0.11, 0.66, -0.2), lapR: V(0.11, 0.66, -0.2),
  deskCtrl: V(0.55, 0.77, 0.12),
  bookCover: V(0.74, 0.78, 0.0),
  rest: V(0.5, 0.77, -0.22),
};
const devilBase = V(-0.36, 1.48, -0.05);
const devilHold = V(-0.08, 1.05, -0.5);
const angelBase = V(0.38, 1.5, -0.05);
const devilPos = (t) => track([
  [0, devilBase], [4.6, V(-0.33, 1.4, -0.07)], [8.8, V(-0.33, 1.4, -0.07)], [9.3, devilBase],
  [19.2, devilBase], [19.8, V(-0.16, 0.98, -0.45)], [20.6, V(-0.16, 0.98, -0.45)], [21.6, devilBase],
  [36.4, devilBase], [37.0, V(-0.05, 0.82, -0.36)], [37.6, devilHold], [46.9, devilHold], [47.7, V(-0.24, 1.6, -0.3)], [50.4, V(-0.24, 1.6, -0.3)], [55, V(0.12, 1.5, -0.95)],
], t).add(V(0, Math.sin(t * 3.1) * 0.018, 0));
const angelPos = (t) => track([
  [0, angelBase], [22.4, angelBase], [23.4, V(0.75, 1.35, 0.05)], [29, V(0.75, 1.35, 0.05)], [30, angelBase],
  [40.3, angelBase], [41.3, V(0.86, 1.12, -0.42)], [47, V(0.86, 1.12, -0.42)], [48, V(0.5, 1.4, -0.32)],
], t).add(V(0, Math.sin(t * 1.7 + 1) * 0.022, 0));
const devilHands = (t) => devilPos(t).add(V(0, -0.06, -0.03));

// mãos: [L, R] e controle
const handL = (t) => track([
  [0, SH.gameL], [15.4, SH.gameL], [16.0, SH.lapL], [19.8, SH.lapL], [20.4, SH.gameL],
  [29.1, SH.gameL], [29.8, SH.lapL], [48.6, SH.lapL], [49.4, V(0.42, 0.78, -0.3)],
], t);
const handR = (t) => track([
  [0, SH.gameR], [15.4, SH.gameR], [16.0, SH.lapR], [19.8, SH.lapR], [20.4, SH.gameR],
  [29.1, SH.gameR], [29.8, SH.lapR], [47.0, SH.lapR], [47.6, (tt) => devilHands(tt).add(V(0.07, 0, 0))],
  [48.5, SH.deskCtrl], [48.8, SH.deskCtrl], [49.2, SH.bookCover], [49.9, V(0.6, 0.84, -0.25)],
  [50.5, (tt) => writePoint(tt)],
], t);
const writePoint = (t) => {
  const p = notebook.root.position;
  const k = Math.max(0, t - 50.5);
  return V(p.x - 0.06 + (k * 0.09) % 0.12, 0.8 + Math.abs(Math.sin(t * 9)) * 0.006, p.z + 0.02 + Math.floor(k / 1.4) * 0.025);
};
const ctrlPos = (t) => track([
  [0, (tt) => handL(tt).lerp(handR(tt), 0.5).add(V(0, 0.02, -0.01))],
  [36.4, (tt) => handL(tt).lerp(handR(tt), 0.5).add(V(0, 0.02, -0.01))],
  [37.0, (tt) => devilHands(tt)], [47.5, (tt) => devilHands(tt)],
  [47.6, (tt) => handR(tt).add(V(-0.06, 0.01, 0))], [48.5, (tt) => handR(tt).add(V(-0.06, 0.01, 0))], [48.6, SH.deskCtrl.clone().add(V(-0.05, -0.005, 0))],
], t);

// ---------- câmera: lista de planos ----------
const S = (a, b, p0, t0, p1, t1, fov = 45, ease = "s") => ({ a, b, p0, t0, p1: p1 || p0, t1: t1 || t0, fov, ease });
// O(alvo, distância, ângulo°, altura): câmera em volta do alvo; 0° = de frente (lado da TV), + = lado da mesa (+x)
const O = (tg, d, deg, h = 0) => { const r = THREE.MathUtils.degToRad(deg); return V(tg.x + Math.sin(r) * d, tg.y + h, tg.z - Math.cos(r) * d); };
const HEAD = V(0, 1.3, 0), DEV = V(-0.33, 1.4, -0.07), ANG = V(0.38, 1.5, -0.05), CLK = V(1.89, 1.85, -0.35);
const shots = [
  S(0, 2.0, O(V(0, 1.18, 0), 2.1, 12, 0.12), V(0, 1.18, 0), O(V(0, 1.2, 0), 1.8, 10, 0.1), V(0, 1.2, 0)), // gancho: rosto + controle
  S(2.0, 4.1, V(-0.55, 2.05, 1.75), V(0.15, 1.0, -2.5), V(-0.5, 2.0, 1.6), V(0.15, 1.0, -2.5), 42), // sobre o ombro: TV ao fundo
  S(4.1, 6.4, O(V(-0.17, 1.38, 0), 1.9, -15, 0.05), V(-0.17, 1.38, 0), O(V(-0.17, 1.38, 0), 1.7, -15, 0.05), V(-0.17, 1.38, 0)),
  S(6.4, 9.1, O(DEV, 1.0, -32, 0.05), DEV, O(DEV, 0.9, -30, 0.05), DEV, 42),
  S(9.1, 12.0, O(ANG, 1.0, 32, 0.02), ANG, O(ANG, 0.9, 30, 0.02), ANG, 42),
  S(12.0, 15.3, V(0.02, 1.45, -2.3), V(0.02, 1.36, 0), V(0.02, 1.45, -2.15), V(0.02, 1.36, 0), 45),
  S(15.3, 19.1, O(HEAD, 1.75, 14, 0.05), HEAD, O(HEAD, 1.55, 12, 0.05), HEAD, 42), // reação: vemos ele olhar o livro
  S(19.1, 22.2, O(V(-0.08, 1.05, -0.25), 1.5, -25, -0.05), V(-0.08, 1.05, -0.25), O(V(-0.08, 1.08, -0.25), 1.3, -22, -0.05), V(-0.08, 1.08, -0.25)),
  S(22.2, 25.6, V(-0.1, 1.55, 1.4), V(1.35, 1.4, -0.25), V(0.0, 1.52, 1.25), V(1.35, 1.4, -0.25), 50),
  S(25.6, 27.0, O(CLK, 0.95, -90, 0), CLK, O(CLK, 0.85, -90, 0), CLK, 40),
  S(27.0, 29.1, V(0.1, 1.5, 1.0), V(1.0, 1.0, -0.2), V(0.2, 1.48, 0.85), V(1.0, 1.0, -0.2), 45),
  S(29.1, 30.3, O(CLK, 0.85, -90, 0), CLK, O(CLK, 0.75, -90, 0), CLK, 40),
  S(30.3, 32.2, V(0.05, 2.05, -1.5), V(0, 1.15, 0), V(0.05, 1.95, -1.35), V(0, 1.15, 0), 45), // de cima: culpa
  { a: 32.2, b: 37.1, orbit: { c: V(0, 1.45, 0), r: 2.15, y: 1.85, a0: Math.PI - 0.85, a1: Math.PI + 0.85 }, fov: 48 }, // órbita no ciclo
  S(37.1, 40.2, O(V(-0.05, 1.18, -0.25), 1.7, -15, 0.05), V(-0.05, 1.18, -0.25), O(V(-0.05, 1.18, -0.25), 1.5, -12, 0.05), V(-0.05, 1.18, -0.25)),
  S(40.2, 47.0, V(0.12, 1.6, 0.6), V(0.85, 0.85, -0.45), V(0.2, 1.5, 0.45), V(0.85, 0.85, -0.45), 45),
  S(47.0, 50.2, V(0.22, 1.0, -2.45), V(0.24, 1.28, 0), V(0.3, 2.15, -2.25), V(0.24, 1.12, -0.1), 50, "s"), // grua
  S(50.2, 53.6, O(V(0.42, 1.05, -0.2), 1.75, 30, 0.35), V(0.42, 1.05, -0.2), O(V(0.42, 1.05, -0.2), 1.5, 28, 0.3), V(0.45, 1.05, -0.2)),
  S(53.6, 60.0, V(0.95, 1.65, -1.95), V(0.4, 1.05, -0.1), V(1.05, 1.85, -2.3), V(0.4, 1.05, -0.1), 45),
];
function cameraAt(t) {
  const s = shots.find((s) => t >= s.a && t < s.b) || shots[shots.length - 1];
  const u = EASE[s.ease || "s"]((t - s.a) / (s.b - s.a));
  if (s.orbit) {
    const o = s.orbit, ang = o.a0 + (o.a1 - o.a0) * u;
    camera.position.set(o.c.x + Math.sin(ang) * o.r, o.y, o.c.z + Math.cos(ang) * o.r);
    camera.lookAt(o.c);
    camera.fov = s.fov;
  } else {
    camera.position.copy(s.p0.clone().lerp(s.p1, u));
    camera.lookAt(s.t0.clone().lerp(s.t1, u));
    camera.fov = s.fov;
  }
  camera.updateProjectionMatrix();
}

// ---------- telas desenhadas ----------
function drawGame(t, paused) {
  const { ctx: x, tex } = room.screen;
  const g = x.createLinearGradient(0, 0, 0, 288);
  g.addColorStop(0, "#2a1d6e");
  g.addColorStop(1, "#d14f9a");
  x.fillStyle = g;
  x.fillRect(0, 0, 512, 288);
  const sc = (t * 120) % 160;
  x.fillStyle = "#3a2a8a";
  for (let i = -1; i < 5; i++) { x.beginPath(); x.arc(i * 160 - sc * 0.4 + 60, 210, 90, Math.PI, 0); x.fill(); }
  x.fillStyle = "#33e0b0";
  for (let i = -1; i < 6; i++) { x.beginPath(); x.roundRect(i * 120 - sc + 10, 220 - (i % 2) * 40, 90, 22, 11); x.fill(); }
  x.fillStyle = "#ffd34f";
  for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(((i * 90 - t * 120) % 540 + 540) % 540, 120 + Math.sin(i + t * 3) * 20, 8, 0, 7); x.fill(); }
  const jy = Math.abs(Math.sin(t * 4.2)) * 50;
  x.fillStyle = "#ffffff";
  x.beginPath(); x.roundRect(140, 175 - jy, 30, 30, 9); x.fill();
  x.fillStyle = "#14152a";
  x.fillRect(158, 184 - jy, 5, 7);
  x.fillStyle = "#ff5b6e";
  x.beginPath(); x.arc(((380 - t * 70) % 520 + 520) % 520, 198, 14, 0, 7); x.fill();
  x.fillStyle = "rgba(0,0,0,.35)";
  x.fillRect(0, 0, 512, 30);
  x.fillStyle = "#ffffff";
  x.font = "700 20px Nunito, sans-serif";
  x.fillText("★ " + String(Math.floor(t * 37) * 10).padStart(6, "0"), 12, 22);
  if (paused > 0) {
    x.fillStyle = `rgba(10,10,30,${0.6 * paused})`;
    x.fillRect(0, 0, 512, 288);
    x.fillStyle = `rgba(255,255,255,${paused})`;
    x.fillRect(226, 110, 20, 68);
    x.fillRect(266, 110, 20, 68);
  }
  tex.needsUpdate = true;
}
function drawTimer(t) {
  const { ctx: x, tex } = timer.disp;
  x.fillStyle = "#14152a";
  x.fillRect(0, 0, 256, 128);
  const left = t < 50 ? 300 : Math.max(0, 300 - Math.floor(t - 50));
  x.fillStyle = "#6fe38a";
  x.font = "700 82px Nunito, monospace";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(`${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`, 128, 68);
  tex.needsUpdate = true;
}
function drawPage(t) {
  const { ctx: x, tex } = notebook.page;
  x.fillStyle = "#fffdf6";
  x.fillRect(0, 0, 256, 336);
  x.strokeStyle = "#b9d6f2";
  x.lineWidth = 2;
  for (let y = 40; y < 336; y += 26) { x.beginPath(); x.moveTo(10, y); x.lineTo(246, y); x.stroke(); }
  // escrita: rabiscos que avançam com o tempo
  const k = Math.max(0, t - 50.5) * 120;
  x.strokeStyle = "#3a3f8f";
  x.lineWidth = 3;
  let drawn = 0;
  for (let row = 0; row < 8 && drawn < k; row++) {
    x.beginPath();
    const y = 34 + row * 26;
    for (let px = 0; px < 210 && drawn < k; px += 3, drawn += 3) {
      const yy = y + Math.sin(px * 0.35 + row) * 4 + Math.sin(px * 0.11) * 2;
      px === 0 ? x.moveTo(20 + px, yy) : x.lineTo(20 + px, yy);
    }
    x.stroke();
  }
  tex.needsUpdate = true;
}

// ---------- IK de 2 ossos ----------
const UP = V(0, 1, 0);
function segment(m, A, B) {
  m.position.copy(A).lerp(B, 0.5);
  m.quaternion.setFromUnitVectors(UP, B.clone().sub(A).normalize());
}
function placeArm(arm, T, t) {
  const S0 = boy.torso.localToWorld(arm.shoulder.clone());
  const a = 0.25, b = 0.25;
  const d = T.clone().sub(S0);
  const L = Math.min(Math.max(d.length(), 0.05), a + b - 0.002);
  const dir = d.normalize();
  const x = (a * a - b * b + L * L) / (2 * L), h = Math.sqrt(Math.max(0, a * a - x * x));
  const out = S0.clone().sub(boy.torso.localToWorld(V(0, 0.43, 0))).setY(0).normalize();
  const hint = out.multiplyScalar(0.7).add(V(0, -1, 0)).add(V(0, 0, 0.35));
  const perp = hint.sub(dir.clone().multiplyScalar(hint.dot(dir))).normalize();
  const E = S0.clone().addScaledVector(dir, x).addScaledVector(perp, h);
  const H = S0.clone().addScaledVector(dir, L);
  segment(arm.upper, S0, E);
  segment(arm.lower, E, H);
  segment(arm.cuff, H.clone().addScaledVector(H.clone().sub(E).normalize(), -0.035), H);
  arm.hand.position.copy(H);
}

// ---------- quadro ----------
function faceToward(obj, from, toBoy, camPos, wBoy = 0.55) {
  const a = toBoy.clone().sub(from).setY(0).normalize();
  const c = camPos.clone().sub(from).setY(0).normalize();
  const d = a.multiplyScalar(wBoy).add(c.multiplyScalar(1 - wBoy));
  obj.rotation.y = Math.atan2(d.x, d.z);
}

function renderAt(tv) {
  const t = warp(tv); // tv = tempo real do vídeo; t = régua da animação
  cameraAt(t);

  // rapaz
  const pose = track(boyPose, t);
  const bOpen = mouthOpen("rapaz", tv);
  const breathe = Math.sin(t * 2.2) * 0.008;
  boy.torso.rotation.set(pose.lean, pose.torso, 0);
  boy.torso.scale.set(1, 1 + breathe, 1);
  boy.head.rotation.set(-pose.pitch, pose.yaw, pose.tilt);
  boy.skull.scale.set(1 - bOpen * 0.02, 1 + bOpen * 0.035, 1 - bOpen * 0.02);
  applyFace(boy.face, track(boyFace, t), bOpen, blinkAmt(t, 0.3));
  boy.root.updateMatrixWorld(true);
  const jitter = (s) => (t < 15.4 || (t > 20.4 && t < 29.1) ? V(0, Math.max(0, Math.sin(t * 13 + s)) * 0.01, 0) : V(0, 0, 0));
  placeArm(boy.arms[0], handR(t).add(jitter(0)), t); // arms[0]: ombro local -x = mundo +x = braço direito
  placeArm(boy.arms[1], handL(t).add(jitter(2)), t);

  // controle
  ctrl.position.copy(ctrlPos(t));
  ctrl.rotation.set(t < 48.6 ? 0.5 : 0, t >= 47.6 && t < 48.6 ? -0.3 : t >= 48.6 ? 0.4 : 0, 0);

  // diabinho
  const dScale = track([[0, 0], [3.95, 0], [4.4, 1, "back"], [50.2, 1], [55.6, 0.38, "s"]], t);
  const dOpen = mouthOpen("diabo", tv);
  devil.root.visible = dScale > 0.01;
  devil.root.position.copy(devilPos(t));
  devil.root.scale.setScalar(Math.max(0.001, dScale));
  devil.body.scale.set(1 - dOpen * 0.06, 1 + dOpen * 0.1 + Math.sin(t * 6) * 0.02, 1 - dOpen * 0.06);
  devil.tail.rotation.z = Math.sin(t * 3.3) * 0.25;
  faceToward(devil.root, devil.root.position, V(0, 1.38, 0), camera.position, 0.5);
  devil.body.rotation.z = Math.sin(t * 2.1) * 0.08 + (t > 4.2 && t < 9 ? -0.15 : 0);
  applyFace(devil.face, track([
    [0, F({ brow: 0.8, smile: 0.9 })],
    [36.8, F({ brow: 0.8, smile: 0.9 })], [37.4, F({ brow: -0.7, smile: 0.35, wide: 0.6 })], // cara de inocente
    [46.9, F({ brow: -0.7, smile: 0.35, wide: 0.6 })], [47.6, F({ brow: -0.4, smile: -0.6, wide: 0.9, openBase: 0.5 })],
    [50.5, F({ brow: -0.9, smile: -0.8, wide: 0.2 })],
  ], t), dOpen, blinkAmt(t, 1.7));
  devil.glow.intensity = 0.35 * dScale;

  // anjo
  const aScale = track([[0, 0], [8.95, 0], [9.45, 1, "back"]], t);
  const aOpen = mouthOpen("anjo", tv);
  angel.root.visible = aScale > 0.01;
  angel.root.position.copy(angelPos(t));
  angel.root.scale.setScalar(Math.max(0.001, aScale));
  angel.body.scale.set(1 - aOpen * 0.05, 1 + aOpen * 0.08, 1 - aOpen * 0.05);
  angel.wings.forEach((w, i) => (w.rotation.y = (i ? -1 : 1) * (0.2 + Math.sin(t * 4.5) * 0.35)));
  angel.halo.rotation.z = t * 0.6;
  const angelLook = t > 22.4 && t < 29 ? V(1.6, 1.4, -0.4) : t > 40.3 && t < 47 ? notebook.root.position : V(0, 1.38, 0);
  faceToward(angel.root, angel.root.position, angelLook, camera.position, 0.5);
  applyFace(angel.face, track([[0, F({ smile: 0.6, brow: -0.2 })], [50, F({ smile: 0.85, brow: -0.1 })]], t), aOpen, blinkAmt(t, 2.9));
  angel.glow.intensity = (0.8 + (t > 50 ? 0.5 : 0)) * aScale;

  // mesa
  book.hinge.rotation.z = -Math.PI * smooth((t - 49.1) / 0.8) * 0.98;
  const penInHand = t >= 50.2;
  if (penInHand) {
    pen.position.copy(boy.arms[0].hand.position).add(V(-0.01, 0.05, 0.0));
    pen.rotation.set(0.5, 0, 0.4);
  } else {
    pen.position.copy(notebook.root.position).add(V(0.07, 0.025, 0));
    pen.rotation.set(Math.PI / 2, 0, 0.3);
  }
  const visibleSheets = 2 + 8 * smooth((t - 22.6) / 5.5);
  pile.items.forEach((it, i) => it.scale.setScalar(clamp01(visibleSheets - i) > 0 ? backOut(clamp01((visibleSheets - i) * 1.5)) : 0.0001));
  const tScale = backOut(clamp01((t - 41) / 0.45));
  timer.root.scale.setScalar(Math.max(0.0001, tScale));
  drawTimer(t);
  drawPage(t);

  // relógio: 23h10 → acelera entre 22–29 s → ~02h
  const mins = t < 22 ? 10 + t * 0.3 : t < 29 ? 16.6 + (180 - 16.6) * smooth((t - 22) / 7) : 180 + (t - 29) * 0.3;
  const total = 11 * 60 + mins;
  room.clock.hour.rotation.z = -(total / 720) * Math.PI * 2;
  room.clock.minute.rotation.z = -((total % 60) / 60) * Math.PI * 2;

  // ciclo
  const cyc = smooth((t - 32.2) / 0.5) * (1 - smooth((t - 36.8) / 0.4));
  cycle.visible = cyc > 0.01;
  cycleTokens.forEach(({ sp }, i) => {
    const a = (i / 4) * Math.PI * 2 + t * 0.9;
    sp.position.set(Math.sin(a) * 0.6, 0, Math.cos(a) * 0.6);
    const active = Math.floor((t - 32.2) / 1.1) % 4 === i;
    const sc = cyc * (active ? 1.25 : 0.9);
    sp.scale.set(0.27 * sc, 0.085 * sc, 1);
    sp.material.opacity = cyc;
  });
  ring.material.opacity = 0.45 * cyc;

  // luz e clima: culpa escurece; no fim a TV pausa e a luminária domina
  const paused = smooth((t - 48.6) / 0.6);
  const guilt = smooth((t - 29.1) / 1) * (1 - smooth((t - 40) / 2));
  drawGame(Math.min(t, 48.6), paused);
  const flick = 0.85 + 0.15 * Math.sin(t * 7.3) * Math.sin(t * 2.9);
  tvLight.intensity = 14 * flick * (1 - 0.65 * paused) * (1 - 0.35 * guilt);
  lampLight.intensity = 6 + 10 * smooth((t - 40.5) / 2) + 6 * paused;
  lampFill.intensity = 0.6 + 1.2 * paused;
  hemi.intensity = 0.9 * (1 - 0.4 * guilt);

  // luz de borda atrás do assunto, oposta à câmera
  const tgt = new THREE.Vector3();
  camera.getWorldDirection(tgt);
  const focus = camera.position.clone().addScaledVector(tgt, 1.2);
  rim.target.position.copy(focus);
  rim.position.copy(focus).addScaledVector(tgt, 2.5).add(V(0, 1.6, 0));
  rim.target.updateMatrixWorld();

  renderer.render(scene, camera);
}

window.__renderAt = renderAt;
window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
renderAt(0);

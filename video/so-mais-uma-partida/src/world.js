// Cenário e personagens montados só com formas simples (3D POLY: arredondado, liso, cara de brinquedo).
import * as THREE from "three";
import { RoundedBoxGeometry } from "../lib/RoundedBoxGeometry.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const mat = (color, o = {}) =>
  new THREE.MeshPhysicalMaterial({ color, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.45, ...o });

function mesh(geo, material, { pos, rot, scale, shadow = true } = {}) {
  const m = new THREE.Mesh(geo, material);
  if (pos) m.position.copy(pos);
  if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
  if (scale) m.scale.set(scale[0], scale[1], scale[2]);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}
export const sphere = (r, m, o) => mesh(new THREE.SphereGeometry(r, 40, 24), m, o);
export const rbox = (w, h, d, r, m, o) => mesh(new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2, h / 2, d / 2)), m, o);
export const capsule = (r, len, m, o) => mesh(new THREE.CapsuleGeometry(r, len, 8, 20), m, o);
export const cyl = (rt, rb, h, m, o) => mesh(new THREE.CylinderGeometry(rt, rb, h, 32), m, o);

// ponto na superfície de uma esfera; frente = +z local
const surf = (r, yawDeg, pitchDeg) => {
  const y = THREE.MathUtils.degToRad(yawDeg), p = THREE.MathUtils.degToRad(pitchDeg);
  return V(r * Math.cos(p) * Math.sin(y), r * Math.sin(p), r * Math.cos(p) * Math.cos(y));
};
const faceOut = (obj, pos) => {
  obj.position.copy(pos);
  obj.quaternion.setFromUnitVectors(V(0, 0, 1), pos.clone().normalize());
};

// Rosto reutilizável: olhos (piscam/olham), sobrancelhas, boca (aberta = elipse, fechada = arco)
function buildFace(head, r, o) {
  const white = mat("#ffffff", { roughness: 0.25, clearcoat: 0.8 });
  const dark = mat(o.pupil || "#1b1426", { roughness: 0.2, clearcoat: 1 });
  const browM = mat(o.brow);
  const face = { eyes: [], pupils: [], brows: [] };
  for (const s of [-1, 1]) {
    const eye = new THREE.Group();
    faceOut(eye, surf(r * 0.9, s * o.eyeYaw, o.eyePitch));
    const ball = sphere(r * o.eyeR, white, { scale: [1, 1.12, 0.55], shadow: false });
    const pupil = new THREE.Group();
    pupil.add(sphere(r * o.eyeR * 0.62, dark, { pos: V(0, 0, r * o.eyeR * 0.36), scale: [1, 1.1, 0.5], shadow: false }));
    pupil.add(sphere(r * o.eyeR * 0.2, white, { pos: V(r * o.eyeR * 0.22, r * o.eyeR * 0.28, r * o.eyeR * 0.62), shadow: false }));
    eye.add(ball, pupil);
    head.add(eye);
    face.eyes.push(eye);
    face.pupils.push(pupil);
    const brow = new THREE.Group();
    faceOut(brow, surf(r * 1.0, s * o.eyeYaw, o.eyePitch + o.browUp));
    brow.add(capsule(r * 0.045, r * 0.22, browM, { rot: [0, 0, Math.PI / 2], shadow: false }));
    brow.userData.side = s;
    head.add(brow);
    face.brows.push(brow);
  }
  const mouth = new THREE.Group();
  faceOut(mouth, surf(r * 0.97, 0, o.mouthPitch));
  const mouthM = mat("#4a1522", { roughness: 0.6, clearcoat: 0 });
  face.open = sphere(r * 0.16, mouthM, { scale: [1, 1, 0.3], shadow: false });
  face.tongue = sphere(r * 0.09, mat("#e2667a"), { pos: V(0, -r * 0.07, r * 0.02), scale: [1.2, 0.6, 0.4], shadow: false });
  face.open.add(face.tongue);
  face.arc = mesh(new THREE.TorusGeometry(r * 0.14, r * 0.028, 10, 28, Math.PI), mouthM, { rot: [0, 0, Math.PI], shadow: false });
  mouth.add(face.open, face.arc);
  head.add(mouth);
  face.mouth = mouth;
  if (o.blush) {
    const bm = mat(o.blush, { transparent: true, opacity: 0.55, roughness: 0.9, clearcoat: 0 });
    for (const s of [-1, 1]) {
      const b = sphere(r * 0.12, bm, { scale: [1.3, 0.75, 0.3], shadow: false });
      faceOut(b, surf(r * 0.97, s * 42, -14));
      head.add(b);
    }
  }
  return face;
}

// ---------- RAPAZ (moletom branco) ----------
export function buildBoy() {
  const skin = mat("#f0bf98", { clearcoat: 0.1, roughness: 0.6 });
  const hoodie = mat("#f7f7f4", { roughness: 0.75, clearcoat: 0.05, sheen: 0.6, sheenColor: new THREE.Color("#ffffff") });
  const hoodieShade = mat("#e3e4e6", { roughness: 0.8, clearcoat: 0 });
  const pants = mat("#2f3e74");
  const shoe = mat("#ff5b6e");
  const sole = mat("#ffffff");
  const hair = mat("#3a2418", { roughness: 0.45, clearcoat: 0.5 });

  const root = new THREE.Group(); // pelve no chão do assento; frente local = +z
  const torso = new THREE.Group();
  torso.position.set(0, 0.52, 0);
  root.add(torso);
  const prof = [[0, 0], [0.19, 0], [0.235, 0.05], [0.25, 0.22], [0.235, 0.38], [0.18, 0.47], [0.08, 0.52], [0, 0.52]].map(([x, y]) => new THREE.Vector2(x, y));
  torso.add(mesh(new THREE.LatheGeometry(prof, 40), hoodie, { scale: [1, 1, 0.68] }));
  torso.add(rbox(0.26, 0.11, 0.05, 0.03, hoodieShade, { pos: V(0, 0.13, 0.15) })); // bolso canguru
  torso.add(mesh(new THREE.TorusGeometry(0.12, 0.055, 14, 32), hoodie, { pos: V(0, 0.5, -0.03), rot: [Math.PI / 2 - 0.25, 0, 0], scale: [1.1, 1, 1] })); // capuz
  torso.add(sphere(0.13, hoodie, { pos: V(0, 0.44, -0.14), scale: [1.2, 0.8, 0.6] }));
  for (const s of [-1, 1]) {
    torso.add(cyl(0.008, 0.008, 0.16, hoodieShade, { pos: V(s * 0.05, 0.4, 0.165), rot: [0.15, 0, 0], shadow: false }));
    torso.add(sphere(0.014, mat("#c9ccd2"), { pos: V(s * 0.05, 0.31, 0.175), shadow: false }));
  }
  const neck = cyl(0.06, 0.07, 0.1, skin, { pos: V(0, 0.55, 0) });
  torso.add(neck);

  const head = new THREE.Group(); // pivô no pescoço
  head.position.set(0, 0.57, 0);
  torso.add(head);
  const R = 0.27;
  const skull = new THREE.Group();
  skull.position.set(0, R * 0.92, 0.01);
  head.add(skull);
  skull.add(sphere(R, skin, { scale: [1, 0.96, 0.95] }));
  for (const s of [-1, 1]) skull.add(sphere(R * 0.2, skin, { pos: V(s * R * 0.97, -R * 0.05, -R * 0.02), scale: [0.5, 1, 0.8] }));
  skull.add(sphere(R * 0.11, mat("#e9a98a"), { pos: V(0, -R * 0.2, R * 0.95), scale: [1.1, 0.85, 0.8] }));
  // cabelo: calota + franja em gomos
  const capGeo = new THREE.SphereGeometry(R * 1.06, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.47);
  skull.add(mesh(capGeo, hair, { rot: [-0.6, 0, 0] }));
  [[-0.45, 0.8, 0.14], [-0.15, 0.86, 0.16], [0.17, 0.85, 0.15], [0.45, 0.79, 0.13]].forEach(([x, y, r], i) =>
    skull.add(sphere(R * r, hair, { pos: V(R * x, R * y, R * 0.5), rot: [0, 0, (i - 1.5) * 0.25], scale: [1.4, 0.9, 1] })),
  );
  const face = buildFace(skull, R, { eyeYaw: 24, eyePitch: 4, eyeR: 0.2, browUp: 26, mouthPitch: -34, brow: "#3a2418", blush: "#ff8f8f" });

  // pernas sentadas
  for (const s of [-1, 1]) {
    root.add(capsule(0.085, 0.3, pants, { pos: V(s * 0.11, 0.55, 0.18), rot: [Math.PI / 2, 0, 0] }));
    root.add(capsule(0.075, 0.32, pants, { pos: V(s * 0.12, 0.3, 0.36), rot: [0, 0, 0] }));
    root.add(rbox(0.13, 0.08, 0.22, 0.04, shoe, { pos: V(s * 0.12, 0.07, 0.42) }));
    root.add(rbox(0.135, 0.03, 0.225, 0.012, sole, { pos: V(s * 0.12, 0.025, 0.42) }));
  }

  // braços: malhas no mundo, posicionadas por IK a cada quadro
  const arms = [-1, 1].map((s) => ({
    side: s, // -1 = direita do rapaz (local -x)
    upper: capsule(0.072, 0.17, hoodie),
    lower: capsule(0.066, 0.17, hoodie),
    cuff: cyl(0.06, 0.06, 0.04, hoodieShade),
    hand: sphere(0.058, skin, { scale: [1, 0.85, 1.1] }),
    shoulder: V(s * 0.215, 0.43, -0.01), // local do torso
  }));
  return { root, torso, head, skull, face, arms, R };
}

// ---------- DIABINHO ----------
export function buildDevil() {
  const red = mat("#e8283a", { clearcoat: 0.6, roughness: 0.35 });
  const dark = mat("#7c0f1f", { clearcoat: 0.6, roughness: 0.35 });
  const horn = mat("#fff1d6", { clearcoat: 0.7, roughness: 0.3 });
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const r = 0.1;
  body.add(sphere(r, red, { scale: [1, 1.05, 0.95] }));
  for (const s of [-1, 1]) {
    const h = mesh(new THREE.ConeGeometry(r * 0.22, r * 0.55, 20), horn, { pos: V(s * r * 0.55, r * 0.95, 0), rot: [0, 0, -s * 0.45] });
    body.add(h);
    body.add(sphere(r * 0.24, red, { pos: V(s * r * 0.95, -r * 0.35, r * 0.1), scale: [0.8, 1, 0.8] })); // mãozinhas
    body.add(sphere(r * 0.26, dark, { pos: V(s * r * 0.45, -r * 1.0, r * 0.1), scale: [1, 0.6, 1.2] })); // pés
    const wing = mesh(new THREE.CircleGeometry(r * 0.55, 3), dark, { pos: V(s * r * 0.95, r * 0.25, -r * 0.6), rot: [0, -s * 0.5, s * 0.6] });
    wing.material = dark.clone();
    wing.material.side = THREE.DoubleSide;
    body.add(wing);
  }
  const tailCurve = new THREE.CatmullRomCurve3([V(0, -r * 0.6, -r * 0.8), V(r * 0.6, -r * 1.2, -r * 1.6), V(r * 1.5, -r * 0.6, -r * 1.7), V(r * 1.7, r * 0.3, -r * 1.3)]);
  const tail = new THREE.Group();
  tail.add(mesh(new THREE.TubeGeometry(tailCurve, 30, r * 0.07, 10), red));
  tail.add(mesh(new THREE.ConeGeometry(r * 0.22, r * 0.4, 4), dark, { pos: V(r * 1.75, r * 0.45, -r * 1.25), rot: [0.3, 0, -0.2] }));
  body.add(tail);
  const face = buildFace(body, r, { eyeYaw: 26, eyePitch: 12, eyeR: 0.26, browUp: 28, mouthPitch: -22, brow: "#5a0712", pupil: "#2a0508" });
  const glow = new THREE.PointLight("#ff3b3b", 0.35, 0.9, 2);
  glow.position.set(0, 0, 0.25);
  g.add(glow);
  return { root: g, body, face, tail, glow, r };
}

// ---------- ANJO ----------
export function buildAngel() {
  const white = mat("#fffaf0", { emissive: new THREE.Color("#fff2c8"), emissiveIntensity: 0.25, clearcoat: 0.6, roughness: 0.35 });
  const wingM = mat("#ffffff", { emissive: new THREE.Color("#fff6dc"), emissiveIntensity: 0.35, roughness: 0.6, clearcoat: 0.2 });
  const gold = new THREE.MeshStandardMaterial({ color: "#ffd45e", emissive: new THREE.Color("#ffc23a"), emissiveIntensity: 1.6, roughness: 0.3 });
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const r = 0.1;
  body.add(sphere(r, white, { scale: [1, 1.05, 0.95] }));
  body.add(sphere(r * 0.25, mat("#ffcf5a", { roughness: 0.4 }), { pos: V(0, r * 1.0, r * 0.1), scale: [1, 0.7, 1] })); // cachinho
  const halo = mesh(new THREE.TorusGeometry(r * 0.62, r * 0.09, 12, 40), gold, { pos: V(0, r * 1.45, 0), rot: [Math.PI / 2 - 0.15, 0, 0], shadow: false });
  body.add(halo);
  const wings = [];
  for (const s of [-1, 1]) {
    const w = new THREE.Group();
    w.position.set(s * r * 0.75, r * 0.15, -r * 0.55);
    [[0, 0.5, 0.62], [0.45, 0.15, 0.52], [0.75, -0.25, 0.4]].forEach(([dx, dy, sz]) =>
      w.add(sphere(r * sz, wingM, { pos: V(s * r * dx, r * dy, 0), scale: [1.25, 0.6, 0.25] })),
    );
    body.add(w);
    wings.push(w);
    body.add(sphere(r * 0.22, white, { pos: V(s * r * 0.95, -r * 0.35, r * 0.1), scale: [0.8, 1, 0.8] }));
    body.add(sphere(r * 0.24, white, { pos: V(s * r * 0.42, -r * 1.0, r * 0.1), scale: [1, 0.6, 1.2] }));
  }
  const face = buildFace(body, r, { eyeYaw: 26, eyePitch: 8, eyeR: 0.25, browUp: 26, mouthPitch: -24, brow: "#c99a3c", blush: "#ffb0b8" });
  const glow = new THREE.PointLight("#fff1cf", 0.8, 1.4, 2);
  glow.position.set(0, 0.05, 0.25);
  g.add(glow);
  return { root: g, body, face, wings, halo, glow, r };
}

// ---------- OBJETOS ----------
export function buildController() {
  const g = new THREE.Group();
  const shell = mat("#2b2f45", { clearcoat: 0.8, roughness: 0.3 });
  g.add(rbox(0.2, 0.045, 0.09, 0.022, shell));
  for (const s of [-1, 1]) g.add(sphere(0.042, shell, { pos: V(s * 0.085, -0.008, 0.03), scale: [1, 0.6, 1.3] }));
  ["#4fd2ff", "#ff5b8a", "#ffd34f", "#6fe38a"].forEach((c, i) => {
    const a = (i * Math.PI) / 2;
    g.add(sphere(0.009, mat(c, { emissive: new THREE.Color(c), emissiveIntensity: 0.4 }), { pos: V(0.055 + Math.cos(a) * 0.016, 0.026, Math.sin(a) * 0.016), shadow: false }));
  });
  g.add(rbox(0.03, 0.01, 0.01, 0.004, mat("#9aa3c7"), { pos: V(-0.055, 0.025, 0), shadow: false }));
  g.add(rbox(0.01, 0.01, 0.03, 0.004, mat("#9aa3c7"), { pos: V(-0.055, 0.025, 0), shadow: false }));
  return g;
}

export function buildBook() {
  // dois "capas" com dobradiça na lombada (x = 0); fechado: capa de cima sobre o miolo
  const g = new THREE.Group();
  const cover = mat("#ff7a3d", { clearcoat: 0.5 });
  const pages = mat("#fff8e7", { roughness: 0.9, clearcoat: 0 });
  const W = 0.2, D = 0.27;
  const left = new THREE.Group();
  left.add(rbox(W, 0.012, D, 0.005, cover, { pos: V(-W / 2, 0.006, 0) }));
  left.add(rbox(W - 0.012, 0.022, D - 0.014, 0.004, pages, { pos: V(-W / 2, 0.022, 0) }));
  const right = new THREE.Group();
  right.position.set(0, 0.034, 0);
  const rc = new THREE.Group();
  rc.add(rbox(W, 0.012, D, 0.005, cover, { pos: V(-W / 2, 0.006, 0) }));
  rc.add(rbox(W - 0.012, 0.012, D - 0.014, 0.004, pages, { pos: V(-W / 2, -0.006, 0) }));
  rc.add(rbox(0.09, 0.002, 0.03, 0.001, mat("#ffffff"), { pos: V(-W / 2, 0.013, -0.05), shadow: false }));
  right.add(rc);
  g.add(left, right);
  return { root: g, hinge: right };
}

export function buildLamp() {
  const g = new THREE.Group();
  const m = mat("#ffd23f", { clearcoat: 0.7, roughness: 0.3 });
  g.add(cyl(0.08, 0.09, 0.03, m, { pos: V(0, 0.015, 0) }));
  g.add(capsule(0.014, 0.32, m, { pos: V(0, 0.2, 0), rot: [0, 0, 0.25] }));
  g.add(capsule(0.014, 0.25, m, { pos: V(-0.12, 0.42, 0), rot: [0, 0, 1.2] }));
  const shade = mesh(new THREE.ConeGeometry(0.075, 0.12, 32, 1, true), m.clone(), { pos: V(-0.25, 0.44, 0), rot: [0, 0, 0.55] });
  shade.material.side = THREE.DoubleSide;
  g.add(shade);
  const bulb = sphere(0.035, new THREE.MeshBasicMaterial({ color: "#fff3cf" }), { pos: V(-0.27, 0.41, 0), shadow: false });
  g.add(bulb);
  return { root: g, bulbLocal: V(-0.27, 0.41, 0), bulb };
}

// textura de canvas atualizada por tempo
export function canvasTex(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { c, ctx: c.getContext("2d"), tex };
}

export function buildRoom(scene) {
  const wall = mat("#29306b", { roughness: 0.9, clearcoat: 0 });
  const wall2 = mat("#232a5e", { roughness: 0.9, clearcoat: 0 });
  const floor = mat("#4a3550", { roughness: 0.8, clearcoat: 0.1 });
  const add = (o) => (scene.add(o), o);
  add(rbox(4.4, 0.1, 5.6, 0.02, floor, { pos: V(0, -0.05, -0.3), shadow: false }));
  add(cyl(1.0, 1.0, 0.02, mat("#2fb9a5", { roughness: 0.95, clearcoat: 0 }), { pos: V(-0.1, 0.01, -0.6), shadow: false, scale: [1.2, 1, 0.9] })); // tapete
  add(rbox(4.4, 3.2, 0.1, 0.02, wall, { pos: V(0, 1.6, -2.85), shadow: false }));
  add(rbox(4.4, 3.2, 0.1, 0.02, wall2, { pos: V(0, 1.6, 2.25), shadow: false }));
  add(rbox(0.1, 3.2, 5.2, 0.02, wall2, { pos: V(-1.95, 1.6, -0.3), shadow: false }));
  add(rbox(0.1, 3.2, 5.2, 0.02, wall2, { pos: V(1.95, 1.6, -0.3), shadow: false }));

  // TV + rack (jogo genérico na tela)
  add(rbox(1.7, 0.45, 0.42, 0.05, mat("#3b2d4f"), { pos: V(0, 0.225, -2.55) }));
  add(rbox(1.58, 0.92, 0.06, 0.03, mat("#14151f", { clearcoat: 0.9, roughness: 0.2 }), { pos: V(0, 1.0, -2.6) }));
  add(cyl(0.03, 0.03, 0.1, mat("#14151f"), { pos: V(0, 0.5, -2.6) }));
  const screen = canvasTex(512, 288);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.844), new THREE.MeshBasicMaterial({ map: screen.tex }));
  scr.position.set(0, 1.0, -2.565);
  add(scr);

  // janela na parede atrás do rapaz: céu noturno, lua e luzes da cidade
  const sky = canvasTex(256, 320);
  {
    const x = sky.ctx;
    const gr = x.createLinearGradient(0, 0, 0, 320);
    gr.addColorStop(0, "#0b1240");
    gr.addColorStop(1, "#3a2a7a");
    x.fillStyle = gr;
    x.fillRect(0, 0, 256, 320);
    x.fillStyle = "#fff4cf";
    x.beginPath();
    x.arc(180, 80, 30, 0, 7);
    x.fill();
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 40; i++) {
      x.fillStyle = `rgba(255,255,255,${0.3 + rnd() * 0.7})`;
      x.fillRect(rnd() * 256, rnd() * 180, 2, 2);
    }
    for (let i = 0; i < 14; i++) {
      const bw = 18 + rnd() * 26, bh = 40 + rnd() * 110, bx = i * 19 - 10;
      x.fillStyle = "#151a45";
      x.fillRect(bx, 320 - bh, bw, bh);
      for (let k = 0; k < 6; k++) {
        x.fillStyle = rnd() > 0.5 ? "#ffcf6b" : "#6fd3ff";
        x.fillRect(bx + 3 + rnd() * (bw - 8), 320 - bh + 6 + rnd() * (bh - 12), 4, 5);
      }
    }
    sky.tex.needsUpdate = true;
  }
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.0), new THREE.MeshBasicMaterial({ map: sky.tex }));
  win.position.set(-0.7, 1.65, 2.19);
  win.rotation.y = Math.PI;
  add(win);
  const frameM = mat("#f2efe6");
  add(rbox(0.9, 0.06, 0.06, 0.02, frameM, { pos: V(-0.7, 2.17, 2.18) }));
  add(rbox(0.9, 0.06, 0.06, 0.02, frameM, { pos: V(-0.7, 1.13, 2.18) }));
  add(rbox(0.06, 1.1, 0.06, 0.02, frameM, { pos: V(-1.13, 1.65, 2.18) }));
  add(rbox(0.06, 1.1, 0.06, 0.02, frameM, { pos: V(-0.27, 1.65, 2.18) }));
  add(rbox(0.04, 1.0, 0.04, 0.02, frameM, { pos: V(-0.7, 1.65, 2.18) }));

  // estante com livros coloridos
  add(rbox(0.9, 0.04, 0.25, 0.015, mat("#f2efe6"), { pos: V(0.75, 1.55, 2.08) }));
  ["#ff5b6e", "#4fd2ff", "#ffd34f", "#6fe38a", "#b48cff", "#ff9a4f"].forEach((c, i) =>
    add(rbox(0.07, 0.2 + (i % 3) * 0.04, 0.17, 0.015, mat(c), { pos: V(0.42 + i * 0.1, 1.67 + (i % 3) * 0.02, 2.06), rot: [0, 0, i === 5 ? 0.25 : 0] })),
  );
  // cama no canto
  add(rbox(1.1, 0.35, 1.9, 0.08, mat("#5a4bb0"), { pos: V(-1.35, 0.2, 1.2) }));
  add(rbox(1.12, 0.12, 1.3, 0.06, mat("#ff8fa3"), { pos: V(-1.35, 0.42, 1.0) }));
  add(rbox(0.5, 0.14, 0.32, 0.07, mat("#ffffff"), { pos: V(-1.35, 0.46, 1.95) }));
  // pôster abstrato (sem marcas)
  add(rbox(0.6, 0.8, 0.02, 0.02, mat("#ffd34f"), { pos: V(-1.89, 1.7, -1.2), rot: [0, Math.PI / 2, 0] }));
  add(sphere(0.16, mat("#ff5b6e"), { pos: V(-1.87, 1.78, -1.2), scale: [0.2, 1, 1] }));

  // mesa à direita do rapaz (+x)
  const desk = new THREE.Group();
  const wood = mat("#f2e2c4", { roughness: 0.6 });
  desk.add(rbox(1.05, 0.05, 1.1, 0.02, wood, { pos: V(0.95, 0.715, -0.15) }));
  for (const [x, z] of [[0.5, -0.65], [1.4, -0.65], [0.5, 0.35], [1.4, 0.35]]) desk.add(cyl(0.025, 0.025, 0.7, mat("#b8a07c"), { pos: V(x, 0.35, z) }));
  add(desk);

  // cadeira gamer
  const chairM = mat("#2fb9a5", { roughness: 0.55 });
  add(rbox(0.56, 0.1, 0.52, 0.05, chairM, { pos: V(0, 0.45, 0.06) }));
  add(rbox(0.54, 0.62, 0.1, 0.05, chairM, { pos: V(0, 0.8, -0.24 + 0.52) })); // encosto atrás (+z)
  add(cyl(0.035, 0.035, 0.38, mat("#333849"), { pos: V(0, 0.2, 0.06) }));
  add(cyl(0.26, 0.26, 0.03, mat("#333849"), { pos: V(0, 0.03, 0.06) }));

  // relógio na parede direita, acima da mesa
  const clock = new THREE.Group();
  clock.position.set(1.89, 1.85, -0.35);
  clock.rotation.y = -Math.PI / 2;
  clock.add(cyl(0.2, 0.2, 0.05, mat("#ff5b6e"), { rot: [Math.PI / 2, 0, 0] }));
  clock.add(cyl(0.17, 0.17, 0.052, mat("#fffaf0", { roughness: 0.6 }), { rot: [Math.PI / 2, 0, 0], pos: V(0, 0, 0.004) }));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    clock.add(rbox(0.012, i % 3 ? 0.02 : 0.035, 0.01, 0.004, mat("#2b2f45"), { pos: V(Math.sin(a) * 0.145, Math.cos(a) * 0.145, 0.03), rot: [0, 0, -a], shadow: false }));
  }
  const hour = new THREE.Group(), minute = new THREE.Group();
  hour.add(rbox(0.018, 0.09, 0.008, 0.004, mat("#2b2f45"), { pos: V(0, 0.04, 0), shadow: false }));
  minute.add(rbox(0.012, 0.13, 0.008, 0.004, mat("#2b2f45"), { pos: V(0, 0.06, 0), shadow: false }));
  hour.position.z = minute.position.z = 0.036;
  clock.add(hour, minute, sphere(0.014, mat("#ff5b6e"), { pos: V(0, 0, 0.04), shadow: false }));
  add(clock);

  return { screen, scr, clock: { root: clock, hour, minute } };
}

// pilha de tarefas (folhas/cadernos) que cresce
export function buildPile() {
  const g = new THREE.Group();
  const cols = ["#ffffff", "#ffd34f", "#4fd2ff", "#ffffff", "#ff8fa3", "#b48cff", "#ffffff", "#6fe38a", "#ffd34f", "#ffffff"];
  const items = cols.map((c, i) => {
    const it = rbox(0.24, 0.035, 0.31, 0.01, mat(c, { roughness: 0.8 }), { pos: V(0, 0.02 + i * 0.037, 0), rot: [0, ((i * 37) % 9) / 30 - 0.15, 0] });
    g.add(it);
    return it;
  });
  return { root: g, items };
}

export function buildTimer() {
  const g = new THREE.Group();
  g.add(rbox(0.2, 0.11, 0.07, 0.03, mat("#6fe38a", { clearcoat: 0.7 })));
  const disp = canvasTex(256, 128);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.075), new THREE.MeshBasicMaterial({ map: disp.tex }));
  face.position.set(0, 0, 0.0365);
  g.add(face);
  g.add(cyl(0.018, 0.018, 0.02, mat("#ff5b6e"), { pos: V(0.06, 0.063, 0) }));
  return { root: g, disp };
}

export function buildNotebook() {
  const g = new THREE.Group();
  g.add(rbox(0.22, 0.016, 0.29, 0.006, mat("#4fd2ff"), { pos: V(0, 0.008, 0) }));
  const page = canvasTex(256, 336);
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.27), new THREE.MeshStandardMaterial({ map: page.tex, roughness: 0.9 }));
  p.rotation.x = -Math.PI / 2;
  p.position.y = 0.0175;
  g.add(p);
  return { root: g, page };
}

export function buildPen() {
  const g = new THREE.Group();
  g.add(cyl(0.007, 0.007, 0.13, mat("#b48cff", { clearcoat: 0.8 })));
  g.add(mesh(new THREE.ConeGeometry(0.007, 0.018, 16), mat("#2b2f45"), { pos: V(0, -0.074, 0), rot: [Math.PI, 0, 0] }));
  return g;
}

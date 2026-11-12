// NEXO (mascote da série) e os cinco AGENTES, sobre a mesma base de rosto-tela.
import * as THREE from "../lib/three.module.js";
import { mat, mesh, group, sphere, capsule, roundedBox, basic, glowSprite, glowMat } from "./mat.js";
import { clamp } from "./util.js";

export const FACE = { blink: 0, happy: 0, wink: 0, squint: 0, worried: 0, talk: 0, smile: 1, lookX: 0, lookY: 0 };

// Rosto em tela escura: olhos emissivos (abertos ou em arco "feliz") e boca emissiva.
function screenFace(parent, { w, h, z, eyeColor, eyeR, eyeGap, mouthY }) {
  const screen = mat("#0c1220", { rough: 0.12, clearcoat: 1, rim: "#5a7cff", rimStrength: 0.25 });
  mesh(sphere(1, 40, 28), screen, { scale: [w, h, 0.42 * w], pos: [0, 0, z], parent, shadow: false });
  const eyeM = basic(eyeColor);
  const front = z + 0.42 * w * 0.93;
  const eyes = [];
  for (const side of [1, -1]) {
    const g = group(parent, [side * eyeGap, eyeR * 0.6, front]);
    const open = mesh(capsule(eyeR, eyeR * 1.3, 6, 16), eyeM, { parent: g, shadow: false });
    const arc = mesh(new THREE.TorusGeometry(eyeR * 1.05, eyeR * 0.36, 8, 20, Math.PI), eyeM, { parent: g, shadow: false });
    glowSprite(eyeColor, eyeR * 7, 0.35, g);
    eyes.push({ g, open, arc, side });
  }
  const mg = group(parent, [0, mouthY, front - 0.002]);
  const talk = mesh(sphere(eyeR * 0.9, 20, 14), eyeM, { scale: [1.2, 1, 0.35], parent: mg, shadow: false });
  const smile = mesh(new THREE.TorusGeometry(eyeR * 0.95, eyeR * 0.28, 8, 20, Math.PI), eyeM, { rot: [0, 0, Math.PI], parent: mg, shadow: false });

  return (f) => {
    for (const e of eyes) {
      const isWink = f.wink > 0.5 && e.side === -1;
      const happy = Math.max(f.happy, isWink ? 1 : 0);
      e.open.visible = happy < 0.5;
      e.arc.visible = happy >= 0.5;
      const lidY = clamp(1 - f.blink) * (1 - f.squint * 0.5);
      e.open.scale.set(1, Math.max(0.08, lidY), 1);
      e.g.rotation.z = e.side * (f.worried * 0.35 - f.squint * 0.12);
      e.g.position.x = e.side * eyeGap + f.lookX * eyeR * 0.6;
      e.g.position.y = eyeR * 0.6 + f.lookY * eyeR * 0.5;
    }
    const t = clamp(f.talk);
    talk.visible = t > 0.06;
    talk.scale.set(1.25 - t * 0.2, 0.25 + t * 1.5, 0.35);
    smile.visible = t <= 0.06;
    smile.scale.set(1, f.smile >= 0 ? Math.max(0.3, f.smile) : Math.min(-0.3, f.smile), 1);
  };
}

// Braço curto articulado: rotX (frente), rotZ (abrir/levantar).
function arm(parent, side, { at, r, len, handR, color, handColor }) {
  const sh = group(parent, at);
  mesh(sphere(r * 1.15, 16, 12), color, { parent: sh });
  mesh(capsule(r, len), color, { pos: [0, -len / 2 - r * 0.5, 0], parent: sh });
  const hand = group(sh, [0, -len - r * 1.6, 0]);
  mesh(sphere(handR, 20, 14), handColor, { parent: hand });
  return {
    sh, hand,
    set(x, z) { sh.rotation.set(-x, 0, side * z); },
  };
}

export function buildNexo() {
  const orange = mat("#ff7a1a", { rough: 0.32, clearcoat: 0.7, rim: "#ffc48a", rimStrength: 0.6 });
  const cream = mat("#f4ede2", { rough: 0.45, rim: "#cfe0ff", rimStrength: 0.4 });
  const root = new THREE.Group();
  const body = group(root);
  mesh(sphere(0.16, 48, 36), orange, { scale: [1.06, 0.96, 1.0], parent: body });
  mesh(new THREE.TorusGeometry(0.128, 0.022, 12, 40), cream, { pos: [0, -0.1, 0], rot: [Math.PI / 2, 0, 0], parent: body });
  for (const s of [1, -1]) {
    mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.034, 28), cream, { pos: [s * 0.162, 0.02, 0], rot: [0, 0, Math.PI / 2], parent: body });
    mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.038, 20), glowMat("#ffb35c", 0.9), { pos: [s * 0.165, 0.02, 0], rot: [0, 0, Math.PI / 2], parent: body, shadow: false });
  }
  mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.07, 10), cream, { pos: [0.02, 0.18, -0.01], rot: [0, 0, -0.18], parent: body });
  const tip = mesh(sphere(0.018, 16, 12), basic("#ffd27a"), { pos: [0.033, 0.218, -0.01], parent: body, shadow: false });
  const tipGlow = glowSprite("#ffb35c", 0.11, 0.8, tip);
  const face = screenFace(body, { w: 0.128, h: 0.092, z: 0.112, eyeColor: "#c8fbff", eyeR: 0.024, eyeGap: 0.047, mouthY: -0.04 });
  const L = arm(body, 1, { at: [0.15, -0.045, 0.01], r: 0.022, len: 0.045, handR: 0.03, color: cream, handColor: cream });
  const R = arm(body, -1, { at: [-0.15, -0.045, 0.01], r: 0.022, len: 0.045, handR: 0.03, color: cream, handColor: cream });
  // Propulsor: anel e cone de luz suaves
  mesh(new THREE.TorusGeometry(0.05, 0.012, 10, 28), basic("#7fe7ff"), { pos: [0, -0.155, 0], rot: [Math.PI / 2, 0, 0], parent: body, shadow: false });
  const thrustGlow = glowSprite("#6fdcff", 0.32, 0.7, body); thrustGlow.position.y = -0.17;
  const coneM = glowMat("#6fdcff", 0.16);
  const cone = mesh(new THREE.ConeGeometry(0.06, 0.22, 24, 1, true), coneM, { pos: [0, -0.27, 0], rot: [Math.PI, 0, 0], parent: body, shadow: false });

  root.traverse((o) => { if (o.isMesh) o.receiveShadow = false; });

  return {
    root, body, hands: { l: L.hand, r: R.hand },
    apply(st, f, t) {
      body.rotation.set(st.tiltX || 0, st.yaw || 0, st.tiltZ || 0);
      body.scale.set(1 + (st.squash || 0) * 0.4, 1 - (st.squash || 0), 1 + (st.squash || 0) * 0.4);
      L.set(st.lx ?? 0.2, st.lz ?? 0.35);
      R.set(st.rx ?? 0.2, st.rz ?? 0.35);
      face(f);
      const fl = 0.75 + 0.25 * Math.sin(t * 23) * Math.sin(t * 7.1);
      thrustGlow.material.opacity = 0.55 * fl * (st.glow ?? 1);
      coneM.opacity = 0.14 * fl * (st.glow ?? 1);
      tipGlow.material.opacity = 0.6 + 0.3 * Math.sin(t * 4);
    },
  };
}

export const AGENT_KINDS = {
  blue: { color: "#2f7bff", light: "#bcd6ff", label: "Pesquisador" },
  green: { color: "#21b860", light: "#bff2d2", label: "Desenvolvedor" },
  purple: { color: "#8b54f0", light: "#ded0ff", label: "Conteúdo" },
  yellow: { color: "#f7c21b", light: "#fff0bd", label: "Atendimento" },
  red: { color: "#ec3d3d", light: "#ffd0cc", label: "Organizador" },
};

export function buildAgent(kind) {
  const K = AGENT_KINDS[kind];
  const shell = mat(K.color, { rough: 0.35, clearcoat: 0.5, rim: "#ffffff", rimStrength: 0.45 });
  const light = mat(K.light, { rough: 0.5, rim: "#ffffff", rimStrength: 0.3 });
  const dark = mat("#2a2f3c", { rough: 0.5 });
  const root = new THREE.Group();
  const hop = group(root);
  const legs = [];
  for (const s of [1, -1]) {
    const leg = group(hop, [s * 0.062, 0.11, 0]);
    mesh(capsule(0.034, 0.03), light, { pos: [0, -0.035, 0], parent: leg });
    mesh(sphere(0.046, 20, 14), light, { pos: [0, -0.075, 0.018], scale: [1, 0.62, 1.3], parent: leg });
    legs.push(leg);
  }
  const body = group(hop, [0, 0.3, 0]);
  mesh(capsule(0.135, 0.13, 12, 32), shell, { scale: [1, 1, 0.9], parent: body });
  mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.012, 28), light, { pos: [0, -0.08, 0.118], rot: [Math.PI / 2 - 0.25, 0, 0], parent: body });
  mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.06, 8), dark, { pos: [0, 0.225, 0], parent: body });
  const tip = mesh(sphere(0.02, 14, 10), basic(K.light), { pos: [0, 0.262, 0], parent: body, shadow: false });
  glowSprite(K.color, 0.12, 0.7, tip);
  const face = screenFace(body, { w: 0.105, h: 0.07, z: 0.095, eyeColor: "#eafcff", eyeR: 0.019, eyeGap: 0.04, mouthY: -0.032 });
  const L = arm(body, 1, { at: [0.13, 0.0, 0.0], r: 0.026, len: 0.06, handR: 0.036, color: shell, handColor: light });
  const R = arm(body, -1, { at: [-0.13, 0.0, 0.0], r: 0.026, len: 0.06, handR: 0.036, color: shell, handColor: light });

  // Acessórios
  const acc = group(root);
  if (kind === "blue") { // lupa na mão direita
    const g = group(R.hand, [0, -0.02, 0.03], [0.3, 0, 0]);
    mesh(capsule(0.012, 0.07), dark, { pos: [0, -0.04, 0], parent: g });
    const lens = group(g, [0, 0.04, 0]);
    mesh(new THREE.TorusGeometry(0.05, 0.011, 12, 32), mat("#c9d2e0", { rough: 0.25, metal: 0.6 }), { parent: lens });
    mesh(new THREE.CircleGeometry(0.05, 32), new THREE.MeshPhysicalMaterial({ color: "#bfe3ff", transparent: true, opacity: 0.35, roughness: 0.05 }), { parent: lens, shadow: false });
  }
  if (kind === "green") { // visor tecnológico
    const v = new THREE.CylinderGeometry(0.142, 0.142, 0.045, 32, 1, true, -0.85, 1.7);
    mesh(v, glowMat("#5dff9c", 0.45), { pos: [0, 0.012, 0], parent: body, shadow: false });
    mesh(new THREE.CylinderGeometry(0.143, 0.143, 0.008, 32, 1, true, -0.85, 1.7), basic("#9dffc2"), { pos: [0, 0.036, 0], parent: body, shadow: false });
    for (const s of [1, -1]) mesh(sphere(0.022, 14, 10), dark, { pos: [s * 0.135, 0.012, 0.02], parent: body });
  }
  if (kind === "purple") { // lápis na mão direita
    const g = group(R.hand, [0, 0.0, 0.03], [1.1, 0, 0]);
    mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.15, 6), mat("#ffb02e", { rough: 0.5 }), { parent: g });
    mesh(new THREE.ConeGeometry(0.016, 0.04, 6), mat("#f2d6a8", { rough: 0.6 }), { pos: [0, -0.095, 0], rot: [Math.PI, 0, 0], parent: g });
    mesh(new THREE.ConeGeometry(0.006, 0.014, 8), dark, { pos: [0, -0.112, 0], rot: [Math.PI, 0, 0], parent: g });
    mesh(capsule(0.016, 0.012), mat("#ff8fb1", { rough: 0.6 }), { pos: [0, 0.085, 0], parent: g });
  }
  if (kind === "yellow") { // ícone de conversa flutuando
    const g = group(body, [0.0, 0.36, 0]);
    mesh(roundedBox(0.15, 0.1, 0.035, 0.03), mat("#ffffff", { rough: 0.4 }), { parent: g });
    mesh(new THREE.ConeGeometry(0.022, 0.04, 12), mat("#ffffff", { rough: 0.4 }), { pos: [-0.03, -0.06, 0], rot: [0, 0, 0.5], parent: g });
    for (const x of [-0.035, 0, 0.035]) mesh(sphere(0.012, 12, 8), mat("#c99300", { rough: 0.5 }), { pos: [x, 0, 0.02], parent: g });
    acc.userData.bubble = g;
  }
  if (kind === "red") { // prancheta na mão esquerda
    const g = group(L.hand, [0.01, 0.04, 0.05], [-0.25, 0, 0]);
    mesh(roundedBox(0.13, 0.17, 0.012, 0.01), mat("#8a5a36", { rough: 0.7 }), { parent: g });
    mesh(new THREE.PlaneGeometry(0.11, 0.14), mat("#fbfbf8", { rough: 0.9, rimStrength: 0 }), { pos: [0, -0.008, 0.0075], parent: g, shadow: false });
    for (let i = 0; i < 5; i++) mesh(new THREE.PlaneGeometry(0.075, 0.006), basic("#9aa3b2"), { pos: [0, 0.035 - i * 0.022, 0.008], parent: g, shadow: false });
    mesh(roundedBox(0.05, 0.02, 0.02, 0.006), mat("#c9d2e0", { rough: 0.3, metal: 0.6 }), { pos: [0, 0.085, 0.01], parent: g });
  }

  return {
    root, body, hop, kind, color: K.color, hands: { l: L.hand, r: R.hand },
    apply(st, f, t) {
      hop.position.y = st.hop || 0;
      const sq = st.squash || 0;
      hop.scale.set(1 + sq * 0.5, 1 - sq, 1 + sq * 0.5);
      body.rotation.set(st.lean || 0, st.bodyYaw || 0, st.tilt || 0);
      L.set(st.lx ?? 0.15, st.lz ?? 0.25);
      R.set(st.rx ?? 0.15, st.rz ?? 0.25);
      legs[0].rotation.x = st.stepL || 0; legs[1].rotation.x = st.stepR || 0;
      if (acc.userData.bubble) acc.userData.bubble.position.y = 0.36 + Math.sin(t * 3.1) * 0.015;
      face(f);
    },
  };
}

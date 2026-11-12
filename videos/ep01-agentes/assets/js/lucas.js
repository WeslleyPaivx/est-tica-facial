// LUCAS — jovem empreendedor sentado. Rig: parâmetros numéricos aplicados por quadro.
import * as THREE from "../lib/three.module.js";
import { mat, mesh, group, sphere, capsule, roundedBox, basic } from "./mat.js";
import { clamp } from "./util.js";

export const LUCAS_POSE = {
  lean: 0, torsoYaw: 0, torsoRoll: 0, bounce: 0, squash: 0,
  headYaw: 0, headPitch: 0, headRoll: 0,
  lShX: 0.25, lShZ: 0.12, lShY: 0, lElb: 0.9,
  rShX: 0.25, rShZ: 0.12, rShY: 0, rElb: 0.9,
  knee: 0,
};
export const LUCAS_FACE = { brow: 0, browIn: 0, lid: 0.12, wide: 1, pupil: 1, smile: 0.3, open: 0, mouthW: 1, lookX: 0, lookY: 0 };

export function buildLucas() {
  const skin = mat("#e7b08a", { rough: 0.62, rim: "#ffd2b0", rimStrength: 0.35 });
  const skinDark = mat("#e0a580", { rough: 0.62, rim: "#ffd2b0", rimStrength: 0.3 });
  const hoodie = mat("#e6e4de", { rough: 0.9, rim: "#a8c8ff", rimStrength: 0.28 });
  const hoodieShade = mat("#d3d1ca", { rough: 0.9, rim: "#a8c8ff", rimStrength: 0.22 });
  const pants = mat("#1f2c50", { rough: 0.8, rim: "#7fa6ff", rimStrength: 0.5 });
  const shoe = mat("#f7f7f4", { rough: 0.55, rim: "#a8c8ff", rimStrength: 0.4 });
  const sole = mat("#c4c8d0", { rough: 0.6 });
  const hair = mat("#17181d", { rough: 0.62, rim: "#6f8cff", rimStrength: 0.4, rimPower: 2.4 });
  const white = mat("#fbfbfa", { rough: 0.25, rimStrength: 0.05 });
  const iris = mat("#3a2417", { rough: 0.3, rimStrength: 0 });
  const pupilM = basic("#0b0806");
  const shine = basic("#ffffff");
  const mouthM = mat("#5a1a1e", { rough: 0.7, rimStrength: 0 });
  const tongue = mat("#d86a6a", { rough: 0.7, rimStrength: 0 });
  const lip = mat("#7a2e2a", { rough: 0.6, rimStrength: 0 });
  const accent = mat("#ff7a1a", { rough: 0.5, rimStrength: 0.2 });

  const root = new THREE.Group(); // origem = topo do assento; frente = +z
  const body = group(root);

  // Pernas (quadril → joelho → pé)
  const legs = [];
  for (const side of [1, -1]) {
    const hip = group(body, [side * 0.095, 0.075, 0.0]);
    mesh(capsule(0.078, 0.3), pants, { pos: [0, 0, 0.19], rot: [Math.PI / 2, 0, 0], parent: hip });
    const knee = group(hip, [0, 0, 0.38]);
    mesh(capsule(0.068, 0.3), pants, { pos: [0, -0.2, 0], parent: knee });
    const foot = group(knee, [0, -0.46, 0.05]);
    mesh(roundedBox(0.11, 0.075, 0.22, 0.035), shoe, { parent: foot });
    mesh(roundedBox(0.115, 0.022, 0.225, 0.01), sole, { pos: [0, -0.035, 0], parent: foot });
    legs.push({ hip, knee, side });
  }
  mesh(sphere(0.16, 32, 20), pants, { pos: [0, 0.07, 0.0], scale: [1.12, 0.6, 0.85], parent: body });

  // Tronco (moletom branco)
  const torso = group(body, [0, 0.08, 0]);
  mesh(capsule(0.165, 0.2, 10, 28), hoodie, { pos: [0, 0.27, 0], scale: [1.06, 1, 0.8], parent: torso });
  mesh(new THREE.TorusGeometry(0.105, 0.048, 14, 32), hoodieShade, { pos: [0, 0.5, -0.07], rot: [1.25, 0, 0], parent: torso });
  mesh(roundedBox(0.21, 0.085, 0.03, 0.012), hoodieShade, { pos: [0, 0.15, 0.124], rot: [-0.12, 0, 0], parent: torso });
  for (const s of [1, -1]) mesh(capsule(0.006, 0.07), hoodieShade, { pos: [s * 0.035, 0.39, 0.133], parent: torso });
  mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.006, 20), accent, { pos: [0.085, 0.4, 0.128], rot: [Math.PI / 2 - 0.2, 0, 0], parent: torso });

  // Braços
  const arms = {};
  for (const [k, side] of [["l", 1], ["r", -1]]) {
    const sh = group(torso, [side * 0.19, 0.43, 0]);
    mesh(sphere(0.07, 24, 16), hoodie, { parent: sh });
    mesh(capsule(0.06, 0.14), hoodie, { pos: [0, -0.1, 0], parent: sh });
    const elb = group(sh, [0, -0.2, 0]);
    mesh(capsule(0.054, 0.12), hoodie, { pos: [0, -0.085, 0], parent: elb });
    mesh(new THREE.TorusGeometry(0.044, 0.016, 10, 24), hoodieShade, { pos: [0, -0.17, 0], rot: [Math.PI / 2, 0, 0], parent: elb });
    const hand = group(elb, [0, -0.215, 0]);
    mesh(sphere(0.052, 24, 18), skin, { scale: [0.95, 1.12, 0.78], parent: hand });
    mesh(sphere(0.024, 16, 12), skin, { pos: [-side * 0.0, 0.0, 0.042], scale: [1, 1.2, 1], parent: hand });
    arms[k] = { sh, elb, hand, side };
  }

  // Pescoço e cabeça (ligeiramente grande)
  mesh(new THREE.CylinderGeometry(0.048, 0.054, 0.09, 20), skin, { pos: [0, 0.54, 0], parent: torso });
  const head = group(torso, [0, 0.56, 0]);
  const hc = group(head, [0, 0.165, 0.005]);
  mesh(sphere(0.168, 48, 36), skin, { scale: [1.0, 1.05, 0.96], parent: hc });
  for (const s of [1, -1]) mesh(sphere(0.038, 16, 12), skin, { pos: [s * 0.164, -0.005, -0.012], scale: [0.45, 1, 0.75], parent: hc });
  mesh(sphere(0.021, 20, 14), skinDark, { pos: [0, -0.026, 0.163], scale: [1, 0.85, 0.85], parent: hc });

  // Cabelo preto curto: calota fosca + franja em mechas arredondadas + tufos suaves no topo
  const hairCap = new THREE.SphereGeometry(0.179, 48, 24, 0, Math.PI * 2, 0, 1.36);
  mesh(hairCap, hair, { pos: [0, 0.014, -0.016], rot: [-0.5, 0, 0], parent: hc });
  const fringe = [[-0.1, 0.112, 0.1, 0.45, 1.0], [-0.04, 0.128, 0.112, 0.15, 1.1], [0.03, 0.13, 0.11, -0.2, 1.1], [0.095, 0.112, 0.095, -0.55, 1.0], [-0.14, 0.075, 0.07, 0.95, 0.8], [0.14, 0.07, 0.06, -1.0, 0.8]];
  for (const [x, y, z, rz, k] of fringe) mesh(sphere(0.068, 24, 16), hair, { pos: [x, y + 0.004, z - 0.004], rot: [0.85, 0, rz], scale: [1.0 * k, 0.3, 0.85], parent: hc });
  for (const s of [1, -1]) mesh(sphere(0.03, 12, 10), hair, { pos: [s * 0.156, 0.035, 0.025], scale: [0.5, 1.3, 0.8], parent: hc });

  // Olhos expressivos com pálpebras
  const eyes = [];
  for (const side of [1, -1]) {
    const eg = group(hc, [side * 0.062, 0.016, 0.126], [0, side * 0.24, 0]);
    const ball = group(eg);
    mesh(sphere(0.04, 32, 24), white, { scale: [1, 1.14, 0.62], parent: ball, shadow: false });
    const ir = group(ball, [0, 0, 0.0195]);
    mesh(sphere(0.025, 24, 18), iris, { scale: [1, 1.05, 0.35], parent: ir, shadow: false });
    const pu = mesh(sphere(0.0135, 16, 12), pupilM, { pos: [0, 0, 0.004], scale: [1, 1.05, 0.35], parent: ir, shadow: false });
    mesh(sphere(0.0065, 10, 8), shine, { pos: [side * 0.007 + 0.002, 0.011, 0.005], parent: ir, shadow: false });
    const lidGeo = new THREE.SphereGeometry(0.0445, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const lid = mesh(lidGeo, skin, { scale: [1, 1.14, 0.76], parent: ball, shadow: false });
    lid.material = skin.clone(); lid.material.side = THREE.DoubleSide;
    const brow = mesh(capsule(0.0115, 0.046), hair, { pos: [side * 0.062, 0.082, 0.142], rot: [0, side * 0.25, Math.PI / 2], parent: hc, shadow: false });
    eyes.push({ eg, ball, ir, pu, lid, brow, side });
  }

  // Boca: arco (fechada) e elipse (aberta)
  const mouthPos = [0, -0.074, 0.147];
  const arcG = group(hc, mouthPos);
  const arc = mesh(new THREE.TorusGeometry(0.03, 0.0062, 8, 28, Math.PI * 0.72), lip, { pos: [0, 0.03, 0], rot: [0, 0, -Math.PI / 2 - Math.PI * 0.36], parent: arcG, shadow: false });
  const openG = group(hc, mouthPos);
  mesh(sphere(0.034, 28, 20), mouthM, { scale: [1, 1, 0.42], parent: openG, shadow: false });
  mesh(roundedBox(0.044, 0.012, 0.012, 0.005), white, { pos: [0, 0.022, 0.006], parent: openG, shadow: false });
  mesh(sphere(0.021, 16, 12), tongue, { pos: [0, -0.016, 0.006], scale: [1, 0.5, 0.6], parent: openG, shadow: false });

  root.traverse((o) => { if (o.isMesh && o.castShadow) o.receiveShadow = true; });

  function apply(p, f, blink = 0, talk = 0) {
    body.position.y = p.bounce;
    body.scale.set(1 + p.squash * 0.5, 1 - p.squash, 1 + p.squash * 0.5);
    torso.rotation.set(p.lean, p.torsoYaw, p.torsoRoll);
    head.rotation.set(p.headPitch, p.headYaw, p.headRoll);
    for (const [k, a] of Object.entries(arms)) {
      a.sh.rotation.set(-p[k + "ShX"], a.side * p[k + "ShY"], a.side * p[k + "ShZ"]);
      a.elb.rotation.x = -p[k + "Elb"];
    }
    for (const l of legs) l.hip.rotation.x = -p.knee * (l.side > 0 ? 1 : -0.6);

    const lidC = clamp(Math.max(f.lid, blink));
    for (const e of eyes) {
      e.ball.scale.setScalar(f.wide);
      e.lid.rotation.x = -Math.PI / 2 + lidC * Math.PI * 0.98;
      e.ir.position.x = f.lookX * 0.012;
      e.ir.position.y = f.lookY * 0.01;
      e.pu.scale.set(f.pupil, f.pupil * 1.05, 0.35);
      e.brow.position.y = 0.082 + f.brow * 0.02;
      e.brow.rotation.z = Math.PI / 2 - e.side * f.browIn * 0.42;
    }
    const open = clamp(f.open + talk * 0.95);
    openG.visible = open > 0.07;
    openG.scale.set(f.mouthW * (1 - open * 0.2), 0.25 + open * 1.0, 1);
    arcG.visible = open <= 0.07;
    const s = f.smile;
    arcG.scale.set(f.mouthW, Math.sign(s || 1) * Math.max(0.2, Math.abs(s)), 1);
    arcG.position.y = mouthPos[1] + (s < 0 ? -0.03 * Math.abs(s) : 0);
  }

  return { root, apply, head, hc, hands: { l: arms.l.hand, r: arms.r.hand } };
}

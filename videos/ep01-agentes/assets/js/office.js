// Escritório de startup à noite + camada tecnológica ativada pelos agentes.
import * as THREE from "../lib/three.module.js";
import { mat, mesh, group, sphere, capsule, roundedBox, basic, glowMat, glowSprite, canvasTex, rr } from "./mat.js";
import { rng, clamp, lerp, ease, smooth } from "./util.js";

export const ROOM = { x0: -2.3, x1: 2.3, z0: -2.5, z1: 2.9, h: 2.75 };
export const DESK = { y: 0.74, z: -1.45 };
export const CHAIR_POS = [0, 0, -0.42];

function woodTexture(seed) {
  const { c, ctx, tex } = canvasTex(512, 256);
  const r = rng(seed);
  ctx.fillStyle = "#8b5a3a"; ctx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 70; i++) {
    ctx.strokeStyle = `rgba(${60 + r() * 30},${35 + r() * 15},${20},${0.12 + r() * 0.18})`;
    ctx.lineWidth = 1 + r() * 3;
    const y = r() * 256; ctx.beginPath(); ctx.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 4 + (r() - 0.5) * 2);
    ctx.stroke();
  }
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function floorTexture() {
  const { ctx, tex } = canvasTex(512, 512);
  const r = rng(7);
  for (let i = 0; i < 8; i++) {
    const v = 52 + r() * 10;
    ctx.fillStyle = `rgb(${v + 6},${v - 4},${v - 14})`;
    ctx.fillRect(0, i * 64, 512, 64);
    ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(0, i * 64, 512, 2);
    const off = r() * 512; ctx.fillRect(off, i * 64, 2, 64);
  }
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 4);
  return tex;
}

function cityWindowsTexture(seed) {
  const { ctx, tex } = canvasTex(256, 512);
  const r = rng(seed);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 256, 512);
  for (let y = 8; y < 512; y += 22) for (let x = 8; x < 256; x += 20) {
    const k = r();
    if (k > 0.55) {
      ctx.fillStyle = k > 0.93 ? "#7fd3ff" : k > 0.8 ? "#ffe2a8" : "#ffb35c";
      ctx.globalAlpha = 0.5 + r() * 0.5; ctx.fillRect(x, y, 11, 13);
    }
  }
  ctx.globalAlpha = 1;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function skyTexture() {
  const { ctx, tex } = canvasTex(64, 512);
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, "#050914"); g.addColorStop(0.55, "#0e1a3a"); g.addColorStop(0.8, "#26386a"); g.addColorStop(1, "#4a4f86");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 512);
  return tex;
}

function wallPanelUI(color) {
  const { ctx, tex } = canvasTex(512, 320);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
  rr(ctx, 6, 6, 500, 308, 18); ctx.globalAlpha = 0.9; ctx.stroke();
  ctx.globalAlpha = 0.18; ctx.fill(); ctx.globalAlpha = 0.85;
  for (let i = 0; i < 6; i++) { rr(ctx, 30, 40 + i * 42, 140 + ((i * 53) % 120), 18, 9); ctx.fill(); }
  ctx.beginPath(); ctx.arc(390, 160, 80, -1.2, 3.6); ctx.lineWidth = 16; ctx.stroke();
  return tex;
}

export function buildOffice(scene) {
  const wall = mat("#2b3554", { rough: 0.92, rimStrength: 0 });
  const wallTrim = mat("#222a44", { rough: 0.85, rimStrength: 0 });
  const darkMetal = mat("#2a2d36", { rough: 0.45, metal: 0.4, rimStrength: 0.2 });
  const fabric = mat("#30343f", { rough: 0.95, rim: "#8fb0ff", rimStrength: 0.35 });
  const plastic = mat("#17191f", { rough: 0.35, rimStrength: 0.25 });
  const wood = mat("#ffffff", { rough: 0.55, rim: "#ffcf9a", rimStrength: 0.2 });
  wood.map = woodTexture(3);
  const { x0, x1, z0, z1, h } = ROOM;
  const W = x1 - x0, D = z1 - z0;

  // Piso, teto, paredes
  const floorM = mat("#ffffff", { rough: 0.7, rimStrength: 0 }); floorM.map = floorTexture();
  mesh(new THREE.PlaneGeometry(W, D), floorM, { rot: [-Math.PI / 2, 0, 0], pos: [0, 0, (z0 + z1) / 2], shadow: false, receive: true, parent: scene });
  mesh(new THREE.PlaneGeometry(W, D), mat("#1f2740", { rough: 1, rimStrength: 0 }), { rot: [Math.PI / 2, 0, 0], pos: [0, h, (z0 + z1) / 2], shadow: false, parent: scene });
  const wallBox = (w, hh, d, x, y, z) => mesh(new THREE.BoxGeometry(w, hh, d), wall, { pos: [x, y, z], receive: true, parent: scene });
  // Parede da janela (z0) com abertura
  const win = { x0: -1.3, x1: 1.3, y0: 0.95, y1: 2.35 };
  wallBox(win.x0 - x0, h, 0.1, (x0 + win.x0) / 2, h / 2, z0 - 0.05);
  wallBox(x1 - win.x1, h, 0.1, (x1 + win.x1) / 2, h / 2, z0 - 0.05);
  wallBox(win.x1 - win.x0, win.y0, 0.1, 0, win.y0 / 2, z0 - 0.05);
  wallBox(win.x1 - win.x0, h - win.y1, 0.1, 0, (h + win.y1) / 2, z0 - 0.05);
  wallBox(0.1, h, D, x0 - 0.05, h / 2, (z0 + z1) / 2);
  wallBox(0.1, h, D, x1 + 0.05, h / 2, (z0 + z1) / 2);
  wallBox(W, h, 0.1, 0, h / 2, z1 + 0.05);
  // Rodapés
  for (const [w, x, z, ry] of [[W, 0, z0 + 0.01, 0], [W, 0, z1 - 0.01, 0], [D, x0 + 0.01, (z0 + z1) / 2, Math.PI / 2], [D, x1 - 0.01, (z0 + z1) / 2, Math.PI / 2]])
    mesh(new THREE.BoxGeometry(w, 0.08, 0.02), wallTrim, { pos: [x, 0.04, z], rot: [0, ry, 0], parent: scene });

  // Janela: caixilhos, vidro e peitoril
  const frame = mat("#151a2a", { rough: 0.5, rimStrength: 0.2 });
  const fx = (w, hh, x, y) => mesh(roundedBox(w, hh, 0.12, 0.015), frame, { pos: [x, y, z0], parent: scene });
  fx(win.x1 - win.x0 + 0.08, 0.06, 0, win.y0); fx(win.x1 - win.x0 + 0.08, 0.06, 0, win.y1);
  fx(0.06, win.y1 - win.y0, win.x0, (win.y0 + win.y1) / 2); fx(0.06, win.y1 - win.y0, win.x1, (win.y0 + win.y1) / 2);
  fx(0.04, win.y1 - win.y0, 0, (win.y0 + win.y1) / 2); fx(win.x1 - win.x0, 0.035, 0, 1.65);
  mesh(roundedBox(win.x1 - win.x0 + 0.2, 0.04, 0.22, 0.012), mat("#d9d4cb", { rough: 0.6 }), { pos: [0, win.y0 - 0.02, z0 + 0.08], parent: scene });
  mesh(new THREE.PlaneGeometry(win.x1 - win.x0, win.y1 - win.y0), new THREE.MeshPhysicalMaterial({ color: "#9fb8ff", transparent: true, opacity: 0.06, roughness: 0.05, metalness: 0 }), { pos: [0, (win.y0 + win.y1) / 2, z0 - 0.02], shadow: false, parent: scene });

  // Cidade noturna lá fora
  const sky = mesh(new THREE.PlaneGeometry(90, 50), new THREE.MeshBasicMaterial({ map: skyTexture(), fog: false }), { pos: [0, 10, -42], shadow: false, parent: scene });
  const r = rng(11);
  const bodyM = (seed) => { const m = new THREE.MeshStandardMaterial({ color: "#121a2e", roughness: 0.9, emissive: "#ffffff", emissiveIntensity: 0.9 }); m.emissiveMap = cityWindowsTexture(seed); return m; };
  const cityMats = [bodyM(21), bodyM(22), bodyM(23)];
  for (let i = 0; i < 26; i++) {
    const z = -6.5 - r() * 22, x = (r() - 0.5) * (12 + -z * 0.9), w = 1.6 + r() * 3, d = 1.6 + r() * 2.5, top = 1 + r() * 13 - (i % 3) * 2;
    const m = cityMats[i % 3].clone(); m.emissiveMap = cityMats[i % 3].emissiveMap.clone(); m.emissiveMap.needsUpdate = true;
    m.emissiveMap.repeat.set(w / 3, (top + 25) / 8);
    mesh(new THREE.BoxGeometry(w, top + 25, d), m, { pos: [x, (top - 25) / 2, z], shadow: false, parent: scene });
    if (r() > 0.6) glowSprite("#ff4d4d", 0.5, 0.8, scene).position.set(x, top + 0.2, z);
  }

  // Mesa de madeira
  const desk = group(scene, [0, 0, DESK.z]);
  mesh(roundedBox(1.9, 0.05, 0.8, 0.022), wood, { pos: [0, DESK.y - 0.025, 0], receive: true, parent: desk });
  for (const [x, z] of [[-0.88, -0.34], [0.88, -0.34], [-0.88, 0.34], [0.88, 0.34]])
    mesh(roundedBox(0.05, DESK.y - 0.05, 0.05, 0.012), darkMetal, { pos: [x, (DESK.y - 0.05) / 2, z], parent: desk });
  mesh(roundedBox(1.76, 0.24, 0.02, 0.008), darkMetal, { pos: [0, DESK.y - 0.17, -0.35], parent: desk });

  // Monitores (telas são texturas de canvas emissivas)
  const monitors = [];
  for (const [x, ry] of [[-0.37, 0.2], [0.37, -0.2]]) {
    const g = group(desk, [x, DESK.y, -0.2], [0, ry, 0]);
    mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.015, 32), darkMetal, { pos: [0, 0.008, 0], parent: g });
    mesh(roundedBox(0.05, 0.3, 0.025, 0.01), darkMetal, { pos: [0, 0.16, -0.03], parent: g });
    const head = group(g, [0, 0.39, 0]);
    mesh(roundedBox(0.66, 0.41, 0.035, 0.016), plastic, { parent: head });
    const sc = canvasTex(640, 400);
    const screen = mesh(new THREE.PlaneGeometry(0.62, 0.3875), new THREE.MeshBasicMaterial({ map: sc.tex, toneMapped: false }), { pos: [0, 0, 0.0185], shadow: false, parent: head });
    monitors.push({ g, head, screen, ...sc });
  }
  mesh(roundedBox(0.46, 0.022, 0.15, 0.008), plastic, { pos: [0, DESK.y + 0.012, 0.18], parent: desk });
  const keysM = mat("#2e323d", { rough: 0.5, rimStrength: 0.1 });
  for (let i = 0; i < 4; i++) mesh(roundedBox(0.42, 0.008, 0.026, 0.003), keysM, { pos: [0, DESK.y + 0.026, 0.13 + i * 0.033], parent: desk, shadow: false });
  mesh(sphere(0.03, 20, 14), plastic, { pos: [0.34, DESK.y + 0.012, 0.18], scale: [0.85, 0.5, 1.3], parent: desk });

  // Luminária quente
  const lamp = group(desk, [-0.74, DESK.y, -0.15]);
  const lampM = mat("#e8e2d6", { rough: 0.4, rimStrength: 0.25 });
  mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.022, 28), lampM, { pos: [0, 0.011, 0], parent: lamp });
  const a1 = group(lamp, [0, 0.02, 0], [0, 0, -0.25]);
  mesh(capsule(0.012, 0.32), lampM, { pos: [0, 0.17, 0], parent: a1 });
  const a2 = group(a1, [0, 0.34, 0], [0, 0, 1.25]);
  mesh(capsule(0.011, 0.26), lampM, { pos: [0, 0.14, 0], parent: a2 });
  const shade = group(a2, [0, 0.29, 0], [0, 0, 1.0]);
  const shadeM = mat("#e8e2d6", { rough: 0.4, rimStrength: 0.2 }); shadeM.side = THREE.DoubleSide;
  mesh(new THREE.ConeGeometry(0.085, 0.13, 28, 1, true), shadeM, { pos: [0, -0.04, 0], parent: shade });
  const bulb = mesh(sphere(0.03, 16, 12), basic("#fff1d0"), { pos: [0, -0.07, 0], parent: shade, shadow: false });
  glowSprite("#ffb15e", 0.45, 0.9, bulb);
  const lampLight = new THREE.SpotLight("#ffae5e", 9, 6, 0.95, 0.65, 1.6);
  lampLight.castShadow = true; lampLight.shadow.mapSize.set(1024, 1024); lampLight.shadow.radius = 5; lampLight.shadow.bias = -0.0008;
  lampLight.shadow.camera.near = 0.05;
  bulb.add(lampLight); lampLight.position.set(0, 0, 0);
  const lampTarget = new THREE.Object3D(); desk.add(lampTarget); lampTarget.position.set(0.05, DESK.y, 0.25); lampLight.target = lampTarget;

  // Telefone, caneca, papéis
  const phone = group(desk, [0.55, DESK.y + 0.006, 0.23], [0, -0.35, 0]);
  mesh(roundedBox(0.075, 0.009, 0.15, 0.008), plastic, { parent: phone });
  const phoneScreenM = new THREE.MeshBasicMaterial({ color: "#1a2238", toneMapped: false });
  mesh(new THREE.PlaneGeometry(0.066, 0.135), phoneScreenM, { pos: [0, 0.0052, 0], rot: [-Math.PI / 2, 0, 0], parent: phone, shadow: false });
  const phoneGlow = glowSprite("#4dff9a", 0.3, 0, phone); phoneGlow.position.y = 0.03;
  const rings = [0, 1, 2].map(() => mesh(new THREE.TorusGeometry(0.06, 0.004, 6, 32), glowMat("#7dffb2", 0), { rot: [-Math.PI / 2, 0, 0], parent: phone, shadow: false }));
  const mug = group(desk, [0.75, DESK.y, -0.02]);
  mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.1, 28), mat("#ff7a1a", { rough: 0.4 }), { pos: [0, 0.05, 0], parent: mug });
  mesh(new THREE.TorusGeometry(0.028, 0.008, 8, 20), mat("#ff7a1a", { rough: 0.4 }), { pos: [0.045, 0.055, 0], rot: [0, 0, 0], parent: mug });
  const paperM = mat("#f6f4ee", { rough: 0.9, rimStrength: 0.15 }); paperM.side = THREE.DoubleSide;
  const stack = group(desk, [-0.55, DESK.y, 0.22], [0, 0.3, 0]);
  for (let i = 0; i < 6; i++) mesh(new THREE.BoxGeometry(0.21, 0.004, 0.29), paperM, { pos: [(i % 2) * 0.01, 0.003 + i * 0.005, 0], rot: [0, (i % 3) * 0.06, 0], parent: stack });
  const pr = rng(5);
  const papers = [];
  for (let i = 0; i < 10; i++) {
    const p = mesh(new THREE.PlaneGeometry(0.21, 0.29), paperM, { parent: scene, shadow: true });
    const start = [-0.75 + pr() * 1.5, DESK.y + 0.04 + i * 0.002, DESK.z + 0.1 + pr() * 0.25];
    const end = [start[0] * 1.3 + (pr() - 0.5) * 0.8, 0.004 + i * 0.0015, -0.9 + pr() * 0.7];
    const tidy = [-0.55, DESK.y + 0.035 + i * 0.004, DESK.z + 0.22];
    papers.push({ m: p, start, end, tidy, rs: pr() * Math.PI * 2, re: pr() * Math.PI * 2, delay: i * 0.06, seed: pr() * 10 });
  }

  // Cadeira giratória
  const chair = group(scene, CHAIR_POS);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    mesh(capsule(0.018, 0.26), darkMetal, { pos: [Math.sin(a) * 0.14, 0.05, Math.cos(a) * 0.14], rot: [Math.PI / 2, 0, 0], parent: group(chair, [0, 0, 0], [0, a, 0]) });
    mesh(sphere(0.03, 12, 10), plastic, { pos: [Math.sin(a) * 0.28, 0.03, Math.cos(a) * 0.28], parent: chair });
  }
  const swivel = group(chair);
  mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.36, 16), darkMetal, { pos: [0, 0.24, 0], parent: swivel });
  mesh(roundedBox(0.5, 0.075, 0.48, 0.035), fabric, { pos: [0, 0.445, 0.0], parent: swivel });
  mesh(roundedBox(0.46, 0.55, 0.07, 0.035), fabric, { pos: [0, 0.82, -0.25], rot: [-0.12, 0, 0], parent: swivel });
  mesh(roundedBox(0.04, 0.3, 0.03, 0.01), darkMetal, { pos: [0, 0.58, -0.25], parent: swivel });
  for (const s of [1, -1]) mesh(roundedBox(0.05, 0.03, 0.26, 0.012), plastic, { pos: [s * 0.27, 0.63, -0.02], parent: swivel });
  const seatTop = group(swivel, [0, 0.483, 0.0]);

  // Parede frontal (z1): relógio, porta, pôster, quadro
  const clock = group(scene, [0.75, 2.02, z1 - 0.03], [0, Math.PI, 0]);
  mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 48), mat("#f3efe6", { rough: 0.5 }), { rot: [Math.PI / 2, 0, 0], parent: clock });
  mesh(new THREE.TorusGeometry(0.2, 0.018, 12, 48), mat("#ff7a1a", { rough: 0.4 }), { parent: clock });
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; mesh(new THREE.BoxGeometry(0.012, i % 3 ? 0.025 : 0.045, 0.006), basic("#222630"), { pos: [Math.sin(a) * 0.165, Math.cos(a) * 0.165, 0.022], rot: [0, 0, -a], parent: clock, shadow: false }); }
  const hand = (len, w, color) => { const g = group(clock, [0, 0, 0.026]); mesh(new THREE.BoxGeometry(w, len, 0.006), basic(color), { pos: [0, len / 2 - 0.015, 0], parent: g, shadow: false }); return g; };
  const hHour = hand(0.1, 0.014, "#222630"), hMin = hand(0.15, 0.009, "#222630"), hSec = hand(0.16, 0.004, "#ff5a1a");
  const door = group(scene, [-1.5, 0, z1 - 0.02]);
  mesh(roundedBox(0.9, 2.1, 0.05, 0.012), mat("#3a3346", { rough: 0.7, rimStrength: 0.15 }), { pos: [0, 1.05, 0], parent: door });
  mesh(sphere(0.03, 12, 10), mat("#c9c3b5", { rough: 0.3, metal: 0.7 }), { pos: [0.35, 1.0, -0.04], parent: door });
  const poster = canvasTex(256, 360);
  { const c = poster.ctx; c.fillStyle = "#123c33"; c.fillRect(0, 0, 256, 360); c.fillStyle = "#ffb35c"; c.beginPath(); c.arc(128, 140, 60, 0, 7); c.fill(); c.fillStyle = "#f4ede2"; c.font = "700 30px 'Inter Ep', sans-serif"; c.textAlign = "center"; c.fillText("SONHE", 128, 260); c.fillText("GRANDE", 128, 298); }
  mesh(roundedBox(0.5, 0.7, 0.03, 0.01), mat("#111", { rough: 0.5 }), { pos: [-0.3, 1.55, z1 - 0.025], parent: scene });
  mesh(new THREE.PlaneGeometry(0.44, 0.62), new THREE.MeshStandardMaterial({ map: poster.tex, roughness: 0.8 }), { pos: [-0.3, 1.55, z1 - 0.045], rot: [0, Math.PI, 0], parent: scene, shadow: false });
  const board = group(scene, [1.6, 1.45, z1 - 0.03], [0, Math.PI, 0]);
  mesh(roundedBox(1.0, 0.7, 0.03, 0.015), mat("#e9ecef", { rough: 0.35 }), { parent: board });
  const sr = rng(9);
  for (let i = 0; i < 9; i++) mesh(new THREE.PlaneGeometry(0.11, 0.11), mat(["#fce88b", "#ffbbfc", "#abcbf9", "#ffb35c"][i % 4], { rough: 0.8, rimStrength: 0 }), { pos: [-0.38 + (i % 5) * 0.18 + sr() * 0.04, 0.18 - Math.floor(i / 5) * 0.22 + sr() * 0.05, 0.017], rot: [0, 0, (sr() - 0.5) * 0.4], parent: board, shadow: false });

  // Estante (parede esquerda) e planta
  const shelf = group(scene, [x0 + 0.2, 0, 0.3], [0, Math.PI / 2, 0]);
  const shelfM = mat("#6e4a33", { rough: 0.6, rimStrength: 0.15 });
  for (const y of [0.02, 0.5, 0.98, 1.46, 1.9]) mesh(roundedBox(1.1, 0.035, 0.32, 0.01), shelfM, { pos: [0, y, 0], parent: shelf });
  for (const x of [-0.54, 0.54]) mesh(roundedBox(0.035, 1.92, 0.32, 0.01), shelfM, { pos: [x, 0.96, 0], parent: shelf });
  const br = rng(13); const bookCols = ["#ff7a1a", "#2f7bff", "#21b860", "#f7c21b", "#8b54f0", "#e9e2d6", "#1f2c50"];
  for (const y of [0.04, 0.52, 1.0, 1.48]) { let x = -0.5; while (x < 0.45) { const w = 0.03 + br() * 0.04, hh = 0.25 + br() * 0.16; if (br() > 0.15) mesh(roundedBox(w, hh, 0.22, 0.006), mat(bookCols[Math.floor(br() * 7)], { rough: 0.7, rimStrength: 0.15 }), { pos: [x + w / 2, y + 0.018 + hh / 2, 0], rot: [0, 0, br() > 0.85 ? 0.2 : 0], parent: shelf }); x += w + 0.008; } }
  const plant = group(scene, [x0 + 0.35, 0, z0 + 0.4]);
  mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.36, 28), mat("#d9d4cb", { rough: 0.6 }), { pos: [0, 0.18, 0], parent: plant });
  const leafM = mat("#2f8a52", { rough: 0.6, rim: "#a8ffcf", rimStrength: 0.3 });
  const lr = rng(17);
  for (let i = 0; i < 11; i++) { const a = lr() * 6.28; mesh(sphere(0.12, 16, 10), leafM, { pos: [Math.sin(a) * 0.15, 0.55 + lr() * 0.55, Math.cos(a) * 0.15], scale: [0.45, 1, 0.18], rot: [Math.cos(a) * 0.5, a, Math.sin(a) * 0.5], parent: plant }); }
  // Arquivo/gaveteiro na parede direita
  mesh(roundedBox(0.45, 0.7, 0.5, 0.02), mat("#3d4560", { rough: 0.6, rimStrength: 0.2 }), { pos: [x1 - 0.3, 0.35, -1.2], parent: scene });
  mesh(roundedBox(0.4, 0.3, 0.3, 0.03), mat("#c9a77c", { rough: 0.8 }), { pos: [x1 - 0.3, 0.86, -1.2], rot: [0, 0.2, 0], parent: scene });

  // Camada tecnológica (opacidade = fator tech)
  const techMats = [];
  const led = glowMat("#4fe3ff", 0); techMats.push([led, 0.9]);
  for (const [w, x, z, ry, y] of [[W, 0, z0 + 0.03, 0, 0.09], [W, 0, z1 - 0.03, 0, 0.09], [D, x0 + 0.03, (z0 + z1) / 2, Math.PI / 2, 0.09], [D, x1 - 0.03, (z0 + z1) / 2, Math.PI / 2, 0.09],
    [W, 0, z1 - 0.03, 0, h - 0.06], [D, x0 + 0.03, (z0 + z1) / 2, Math.PI / 2, h - 0.06], [D, x1 - 0.03, (z0 + z1) / 2, Math.PI / 2, h - 0.06]])
    mesh(new THREE.BoxGeometry(w, 0.018, 0.012), led, { pos: [x, y, z], rot: [0, ry, 0], parent: scene, shadow: false });
  const panels = [];
  for (const [x, y, z, ry, col] of [[x1 - 0.02, 1.55, 0.6, -Math.PI / 2, "#4fe3ff"], [x1 - 0.02, 1.55, -0.6, -Math.PI / 2, "#7dffb2"], [x0 + 0.02, 2.25, 0.3, Math.PI / 2, "#b99bff"], [1.6, 2.25, z1 - 0.04, Math.PI, "#ffd166"]]) {
    const m = new THREE.MeshBasicMaterial({ map: wallPanelUI(col), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    panels.push(mesh(new THREE.PlaneGeometry(0.9, 0.56), m, { pos: [x, y, z], rot: [0, ry, 0], parent: scene, shadow: false }));
    techMats.push([m, 0.85]);
  }
  const ringTex = canvasTex(512, 512);
  { const c = ringTex.ctx; c.strokeStyle = "#7fe7ff"; for (const [rad, lw, a] of [[240, 6, 0.8], [200, 2, 0.5], [150, 3, 0.35]]) { c.globalAlpha = a; c.lineWidth = lw; c.beginPath(); c.arc(256, 256, rad, 0, 7); c.stroke(); } }
  const floorRingM = new THREE.MeshBasicMaterial({ map: ringTex.tex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  mesh(new THREE.PlaneGeometry(2.1, 2.1), floorRingM, { rot: [-Math.PI / 2, 0, 0], pos: [0, 0.006, 1.1], parent: scene, shadow: false });
  techMats.push([floorRingM, 0.6]);

  return {
    monitors, chair, swivel, seatTop, phone, phoneScreenM, phoneGlow, rings, papers, desk, lampLight,
    clockHands: { hHour, hMin, hSec },
    update(t, s) {
      // relógio: 23:47 e correndo
      const secs = 23 * 3600 + 47 * 60 + 12 + t;
      hSec.rotation.z = -((secs % 60) / 60) * Math.PI * 2;
      hMin.rotation.z = -(((secs / 60) % 60) / 60) * Math.PI * 2;
      hHour.rotation.z = -(((secs / 3600) % 12) / 12) * Math.PI * 2;
      swivel.rotation.y = s.chairYaw;
      // telefone tocando
      const ringOn = s.ring;
      phone.position.x = 0.55 + (ringOn ? Math.sin(t * 90) * 0.004 : 0);
      phoneScreenM.color.set(ringOn ? (Math.sin(t * 12) > 0 ? "#3dff92" : "#1fbf6a") : "#1a2238");
      phoneGlow.material.opacity = ringOn ? 0.6 + 0.3 * Math.sin(t * 12) : 0;
      rings.forEach((m, i) => { const k = ((t * 1.6 + i / 3) % 1); m.scale.setScalar(1 + k * 2.5); m.position.y = 0.02 + k * 0.05; m.material.opacity = ringOn ? (1 - k) * 0.8 : 0; });
      // papéis: em cima da mesa → caem → voltam organizados
      for (const p of papers) {
        const fallT = clamp((t - s.paperFall - p.delay) / 0.95);
        const tidyT = clamp((t - s.paperTidy - p.delay * 0.6) / 0.7);
        let pos, rx, ry, rz;
        if (tidyT > 0) {
          const k = ease.inOut(tidyT);
          pos = p.end.map((v, i) => lerp(v, p.tidy[i], k)); pos[1] += Math.sin(k * Math.PI) * 0.6;
          rx = lerp(-Math.PI / 2, -Math.PI / 2, k); ry = 0; rz = lerp(p.re, 0.3, k) + Math.sin(k * Math.PI) * 2;
        } else if (fallT > 0) {
          const k = fallT;
          pos = [lerp(p.start[0], p.end[0], ease.out(k)) + Math.sin(k * 9 + p.seed) * 0.08 * (1 - k), lerp(p.start[1], p.end[1], ease.in(k) * 0.6 + k * 0.4), lerp(p.start[2], p.end[2], ease.out(k))];
          rx = -Math.PI / 2 + Math.sin(k * 11 + p.seed) * 0.9 * (1 - k); ry = Math.cos(k * 7 + p.seed) * 0.5 * (1 - k); rz = lerp(p.rs, p.re, k);
        } else { pos = p.start; rx = -Math.PI / 2; ry = 0; rz = p.rs; }
        p.m.position.set(...pos); p.m.rotation.set(rx, ry, rz, "XZY");
      }
      for (const [m, max] of techMats) m.opacity = max * s.tech * (0.85 + 0.15 * Math.sin(t * 3 + max * 10));
    },
  };
}

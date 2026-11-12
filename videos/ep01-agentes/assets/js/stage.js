// Palco 3D: monta cena, aplica o estado do roteiro e desenha o quadro de t.
import * as THREE from "../lib/three.module.js";
import { RoomEnvironment } from "../lib/RoomEnvironment.js";
import { buildOffice } from "./office.js";
import { buildLucas } from "./lucas.js";
import { buildNexo, buildAgent, AGENT_KINDS } from "./robots.js";
import { frame, AGENT_ORDER, BEAMS, EV } from "./story.js";
import { drawChaosLeft, drawChaosRight, drawDashboard, drawBuilding, drawMessy, drawFixed, drawHolo, drawBadge } from "./screens.js";
import { mesh, group, roundedBox, mat, glowMat, glowSprite, canvasTex, rr } from "./mat.js";
import { clamp, ease, rng } from "./util.js";

export async function createStage(canvas, W = 1080, H = 1920) {
  await Promise.all([document.fonts.load("700 20px 'Inter Ep'"), document.fonts.load("400 20px 'Inter Ep'")]).catch(() => {});

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0c1428");
  scene.fog = new THREE.FogExp2("#1d2a4a", 0.045);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.22;

  const camera = new THREE.PerspectiveCamera(40, W / H, 0.03, 120);

  // Luz: noite azul + pontos laranja
  scene.add(new THREE.HemisphereLight("#4a66b8", "#1a1424", 0.75));
  const moon = new THREE.DirectionalLight("#9db7ff", 1.7);
  moon.position.set(1.2, 4.6, -6.5); moon.castShadow = true;
  Object.assign(moon.shadow.camera, { left: -3.5, right: 3.5, top: 4, bottom: -3.5, near: 1, far: 16 });
  moon.shadow.mapSize.set(2048, 2048); moon.shadow.radius = 4; moon.shadow.bias = -0.0005; moon.shadow.normalBias = 0.02;
  scene.add(moon);
  const rimFront = new THREE.DirectionalLight("#7fa8ff", 0.9); rimFront.position.set(-2, 2.6, 3.2); scene.add(rimFront);
  const rimWarm = new THREE.DirectionalLight("#ffb46b", 0.35); rimWarm.position.set(2.2, 2, -2); scene.add(rimWarm);
  const monitorLight = new THREE.PointLight("#5fb8ff", 1.6, 3.6, 2); monitorLight.position.set(0, 1.15, -1.3); scene.add(monitorLight);
  const techLight = new THREE.PointLight("#4fe3ff", 0, 6, 2); techLight.position.set(0, 2.2, 1.0); scene.add(techLight);

  const office = buildOffice(scene);
  const lucas = buildLucas();
  office.seatTop.add(lucas.root);

  const nexo = buildNexo();
  const nexoHolder = group(scene);
  nexoHolder.add(nexo.root);

  const agents = {};
  for (const k of AGENT_ORDER) {
    const a = buildAgent(k);
    const holder = group(scene); holder.add(a.root);
    const hc = canvasTex(384, 288);
    const holo = mesh(new THREE.PlaneGeometry(0.44, 0.33), new THREE.MeshBasicMaterial({ map: hc.tex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }), { parent: scene, shadow: false });
    // feixe de luz de ativação
    const beamM = glowMat(AGENT_KINDS[k].color, 0), coreM = glowMat("#ffffff", 0);
    const beam = group(scene, [BEAMS[k][0], 0, BEAMS[k][2]]);
    mesh(new THREE.CylinderGeometry(0.16, 0.2, 2.75, 32, 1, true), beamM, { pos: [0, 1.375, 0], parent: beam, shadow: false });
    mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.75, 12, 1, true), coreM, { pos: [0, 1.375, 0], parent: beam, shadow: false });
    const floorGlow = glowSprite(AGENT_KINDS[k].color, 0.8, 0, beam); floorGlow.position.y = 0.05;
    agents[k] = { a, holder, holo, hc, beamM, coreM, beam, floorGlow };
  }

  // Botão gigante fora do lugar (site com bug)
  const leftHead = office.monitors[0].head;
  const btnG = group(leftHead, [0.22, -0.13, 0.06], [0, -0.25, -0.32]);
  mesh(roundedBox(0.4, 0.13, 0.06, 0.05), mat("#ff3d6e", { rough: 0.35, clearcoat: 0.6, rim: "#ffd0dc", rimStrength: 0.5 }), { parent: btnG });
  const btnTex = canvasTex(512, 160);
  { const c = btnTex.ctx; c.fillStyle = "#ffffff"; c.font = "700 84px 'Inter Ep', sans-serif"; c.textAlign = "center"; c.fillText("COMPRAR!!!", 256, 110); }
  mesh(new THREE.PlaneGeometry(0.36, 0.11), new THREE.MeshBasicMaterial({ map: btnTex.tex, transparent: true, toneMapped: false }), { pos: [0, 0, 0.031], parent: btnG, shadow: false });

  // Badges de notificação saltando dos monitores
  const br = rng(19);
  const badges = ["!", "3", "!", "99+", "!", "7"].map((label, i) => {
    const bc = canvasTex(128, 128); drawBadge(bc.ctx, label, i % 2 ? "#ff8a1a" : "#ff3b3b");
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: bc.tex, transparent: true, depthWrite: false, toneMapped: false }));
    sp.position.set(-0.75 + i * 0.3 + (br() - 0.5) * 0.1, 1.35 + br() * 0.3, -1.55 + br() * 0.15);
    scene.add(sp);
    return { sp, base: sp.position.clone(), t0: EV.papers + 0.05 + i * 0.32 };
  });

  // Faíscas (aparição do Nexo e estalo de dedos)
  const sparks = Array.from({ length: 12 }, (_, i) => glowSprite(i % 2 ? "#ffd27a" : "#9ff3ff", 0.08, 0, scene));

  const tmp = new THREE.Vector3();
  const lastScreen = ["", ""];

  function render(t) {
    const s = frame(t);
    // câmera
    camera.position.set(...s.cam.pos);
    camera.fov = s.cam.fov; camera.updateProjectionMatrix();
    camera.lookAt(...s.cam.target);

    office.update(t, s);
    lucas.apply(s.lucas.pose, s.lucas.face, s.lucas.blink, s.lucas.talk);

    // Nexo
    nexoHolder.visible = s.nexo.visible;
    nexoHolder.position.set(...s.nexo.pos);
    nexoHolder.scale.setScalar(Math.max(0.001, s.nexo.scale));
    nexoHolder.rotation.y = s.nexo.spin;
    nexo.apply(s.nexo.st, s.nexo.face, t);

    // Agentes, hologramas e feixes
    for (const k of AGENT_ORDER) {
      const A = agents[k], st = s.agents[k];
      A.holder.visible = st.visible && st.scale > 0.001;
      A.holder.position.set(...st.pos);
      A.holder.rotation.y = st.yaw;
      A.holder.scale.setScalar(Math.max(0.001, st.scale));
      A.a.apply(st.st, st.face, t);
      A.holo.visible = st.holo > 0.01;
      if (A.holo.visible) {
        drawHolo(A.hc.ctx, k, t, st.holoK); A.hc.tex.needsUpdate = true;
        A.holo.material.opacity = st.holo * (0.85 + 0.1 * Math.sin(t * 9 + k.length));
        A.holo.position.set(st.pos[0], st.pos[1] + 0.74 + (AGENT_ORDER.indexOf(k) % 2) * 0.2, st.pos[2]);
        A.holo.quaternion.copy(camera.quaternion);
        A.holo.scale.setScalar((0.6 + 0.4 * st.holo) * 0.78);
      }
      const b = s.beams[k];
      A.beam.visible = b > 0.001;
      A.beamM.opacity = b * 0.16; A.coreM.opacity = b * 0.32; A.floorGlow.material.opacity = b * 0.9;
      A.beam.scale.set(0.6 + 0.4 * b + Math.sin(t * 20) * 0.03, 1, 0.6 + 0.4 * b);
    }

    // Telas dos monitores
    const [ml, mr] = office.monitors;
    const L = s.screens.left, R = s.screens.right;
    if (L[0] === "chaosL") drawChaosLeft(ml.ctx, t);
    else if (L[0] === "dash") drawDashboard(ml.ctx, t, 0);
    else if (L[0] === "build") drawBuilding(ml.ctx, t, L[1]);
    else if (L[0] === "messy") drawMessy(ml.ctx, t);
    else drawFixed(ml.ctx, t, L[1], L[2]);
    if (R[0] === "chaosR") drawChaosRight(mr.ctx, t); else drawDashboard(mr.ctx, t, 1);
    ml.tex.needsUpdate = mr.tex.needsUpdate = true;
    monitorLight.color.setRGB(...s.monitorCol);
    monitorLight.intensity = 1.6 * (L[0] === "chaosL" ? 0.85 + 0.25 * Math.sin(t * 10) : 1);
    techLight.intensity = 2.2 * s.tech;

    btnG.visible = s.button > 0.001;
    btnG.scale.setScalar(Math.max(0.001, s.button));
    btnG.rotation.z = -0.32 + Math.sin(t * 9) * 0.04 * s.button;

    for (const B of badges) {
      const k = clamp((t - B.t0) / 0.3), out = 1 - clamp((t - EV.nexoIn) / 0.25);
      B.sp.visible = k > 0 && out > 0;
      const sc = ease.back(k) * out * 0.13;
      B.sp.scale.setScalar(Math.max(0.001, sc));
      B.sp.position.set(B.base.x, B.base.y + Math.max(0, t - B.t0) * 0.03, B.base.z);
    }

    // faíscas
    const sparkSrc = s.snap > 0 && s.snap < 1 ? (nexo.hands.r.getWorldPosition(tmp), 1) : s.magic > 0 && s.magic < 1 ? (tmp.set(...s.nexo.pos), 2) : 0;
    const prog = sparkSrc === 1 ? s.snap : s.magic;
    sparks.forEach((sp, i) => {
      sp.visible = !!sparkSrc;
      if (!sparkSrc) return;
      const a = (i / sparks.length) * Math.PI * 2, rad = (sparkSrc === 1 ? 0.18 : 0.32) * ease.out(prog);
      sp.position.set(tmp.x + Math.cos(a) * rad, tmp.y + Math.sin(a) * rad * 0.8 + (sparkSrc === 2 ? 0 : 0.03), tmp.z + Math.sin(a * 2) * 0.03);
      sp.material.opacity = Math.sin(prog * Math.PI);
      sp.scale.setScalar((sparkSrc === 1 ? 0.07 : 0.1) * (1 - prog * 0.5));
    });

    renderer.render(scene, camera);
  }

  await renderer.compileAsync(scene, camera);
  return { render, renderer, scene, camera };
}

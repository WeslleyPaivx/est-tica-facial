// Materiais e geometrias do estilo "3D poly" arredondado: smooth shading, chanfros e rim light.
import * as THREE from "../lib/three.module.js";

// Material plástico/tecido com luz de borda (fresnel) somada à emissão.
export function mat(color, { rough = 0.55, metal = 0, rim = "#9cc4ff", rimStrength = 0.55, rimPower = 2.6, clearcoat = 0, emissive = "#000000", emissiveIntensity = 1, transparent = false, opacity = 1 } = {}) {
  const Ctor = clearcoat ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial;
  const m = new Ctor({ color, roughness: rough, metalness: metal, emissive, emissiveIntensity, transparent, opacity });
  if (clearcoat) { m.clearcoat = clearcoat; m.clearcoatRoughness = 0.35; }
  m.userData.rim = { value: new THREE.Color(rim).multiplyScalar(rimStrength) };
  m.userData.rimPower = { value: rimPower };
  m.onBeforeCompile = (s) => {
    s.uniforms.uRim = m.userData.rim;
    s.uniforms.uRimPower = m.userData.rimPower;
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uRim;\nuniform float uRimPower;")
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\n{ float f = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), uRimPower); totalEmissiveRadiance += uRim * f; }"
      );
  };
  m.customProgramCacheKey = () => "rim" + (clearcoat ? "p" : "s");
  return m;
}

export const basic = (color, o = {}) => new THREE.MeshBasicMaterial({ color, ...o });
export const glowMat = (color, opacity = 1) =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });

// Caixa com cantos arredondados e chanfro suave (extrusão com bevel).
export function roundedBox(w, h, d, r = 0.02, seg = 3) {
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const s = new THREE.Shape();
  const x = -w / 2 + r, y = -h / 2 + r, W = w - 2 * r, H = h - 2 * r;
  s.moveTo(x, y - r);
  s.lineTo(x + W, y - r); s.quadraticCurveTo(x + W + r, y - r, x + W + r, y);
  s.lineTo(x + W + r, y + H); s.quadraticCurveTo(x + W + r, y + H + r, x + W, y + H + r);
  s.lineTo(x, y + H + r); s.quadraticCurveTo(x - r, y + H + r, x - r, y + H);
  s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(1e-3, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.98, bevelSegments: seg, curveSegments: 6 });
  g.translate(0, 0, -(d - 2 * r) / 2);
  g.computeVertexNormals();
  return g;
}

export const sphere = (r, ws = 40, hs = 28) => new THREE.SphereGeometry(r, ws, hs);
export const capsule = (r, len, cs = 8, rs = 20) => new THREE.CapsuleGeometry(r, len, cs, rs);

export function mesh(geo, material, { pos, rot, scale, shadow = true, receive = false, parent } = {}) {
  const m = new THREE.Mesh(geo, material);
  if (pos) m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  if (scale) (typeof scale === "number" ? m.scale.setScalar(scale) : m.scale.set(...scale));
  m.castShadow = shadow;
  m.receiveShadow = receive;
  if (parent) parent.add(m);
  return m;
}

export function group(parent, pos, rot) {
  const g = new THREE.Group();
  if (pos) g.position.set(...pos);
  if (rot) g.rotation.set(...rot);
  if (parent) parent.add(g);
  return g;
}

// Textura radial para brilhos (sprites aditivos), sem pós-processamento.
let _glowTex;
export function glowTexture() {
  if (_glowTex) return _glowTex;
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(255,255,255,0.45)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  _glowTex = new THREE.CanvasTexture(c);
  _glowTex.colorSpace = THREE.SRGBColorSpace;
  return _glowTex;
}

export function glowSprite(color, size, opacity = 1, parent) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.setScalar(size);
  if (parent) parent.add(s);
  return s;
}

// Canvas 2D como textura (telas, hologramas, letreiros).
export function canvasTex(w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { c, ctx: c.getContext("2d"), tex };
}

export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

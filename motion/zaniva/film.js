// Timeline única do filme. Cada sfx(tipo, t) também alimenta audio/make.cjs,
// que lê window.__cues pra sintetizar a trilha no mesmo tempo da imagem.
const tl = gsap.timeline({ paused: true });
const cues = (window.__cues = []);
const sfx = (k, t, p) => cues.push([k, +t.toFixed(3), p || 0]);
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const DUR = 37.5;

function split(el) {
  const txt = el.textContent;
  el.textContent = "";
  return [...txt].map((c) => {
    const s = document.createElement("span");
    s.className = "ch";
    s.textContent = c === " " ? " " : c;
    el.appendChild(s);
    return s;
  });
}
const rise = (els, t, o = {}) =>
  tl.fromTo(els, { yPercent: 115, rotation: o.rot ?? 7 }, { yPercent: 0, rotation: 0, duration: o.d ?? 0.7, ease: "expo.out", stagger: o.st ?? 0.03 }, t);
const pop = (els, t, o = {}) =>
  tl.fromTo(els, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: o.d ?? 0.5, ease: "back.out(1.8)", stagger: o.st ?? 0 }, t);
const up = (els, t, o = {}) =>
  tl.fromTo(els, { y: o.y ?? 60, opacity: 0 }, { y: 0, opacity: 1, duration: o.d ?? 0.6, ease: "power3.out", stagger: o.st ?? 0 }, t);

/* ---------- fundo ---------- */
[
  ["#bg .b1", 260, 4.5, 0.55],
  ["#bg .b2", -300, 6, 0.9],
  ["#bg .b3", 380, 7.2, 0.5],
  ["#bg .b4", -520, 5.1, 0.7],
  ["#bg .b5", 640, 9, 0.6],
].forEach(([s, x, d, o], i) => {
  const n = Math.ceil(DUR / d);
  tl.fromTo(s, { x: 0, scaleX: 1 }, { x, scaleX: 1.5, duration: d, ease: "sine.inOut", repeat: n, yoyo: true }, 0);
  tl.fromTo(s, { opacity: 0.15 }, { opacity: o, duration: d * 0.62, ease: "sine.inOut", repeat: Math.ceil(DUR / (d * 0.62)), yoyo: true }, i * 0.2);
});
tl.fromTo("#bg .dots", { x: 0, y: 0 }, { x: -54, y: -54, duration: DUR, ease: "none" }, 0);

/* ---------- cortes entre cenas ---------- */
const CUTS = [4, 9.5, 14.5, 21, 25.5, 28.5, 32];
CUTS.forEach((t) => {
  tl.fromTo("#wB", { x: -2100 }, { x: 2100, duration: 0.86, ease: "power3.inOut" }, t - 0.5);
  tl.fromTo("#wA", { x: -2100 }, { x: 2100, duration: 0.8, ease: "power3.inOut" }, t - 0.4);
  sfx("whoosh", t - 0.4);
});
$$("#hud .pg i").forEach((d, i) => {
  tl.set(d, { backgroundColor: "#ea36c2" }, CUTS[i]);
  tl.fromTo(d, { scaleX: 0.3 }, { scaleX: 1, duration: 0.5, ease: "expo.out" }, CUTS[i]);
});

/* ---------- cabeçalho padrão ---------- */
function head(id, t) {
  const s = "#" + id;
  up(`${s} .num`, t + 0.12, { y: 0, d: 0.4 });
  $$(`${s} .ttl .ln`).forEach((ln, i) => rise(split(ln), t + 0.18 + i * 0.12));
  tl.fromTo(`${s} .rule`, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "expo.inOut" }, t + 0.3);
  up(`${s} .desc`, t + 0.55, { y: 30 });
  sfx("shimmer", t + 0.2);
}

function logo(id, t) {
  const cs = split($(`${id} .w`));
  rise(cs, t, { st: 0.07, d: 0.9, rot: 10 });
  cs.forEach((_, i) => sfx("tick", t + i * 0.07, i));
  pop(`${id} .dot`, t + 0.62, { d: 0.6 });
  sfx("pop", t + 0.62);
  sfx("boom", t + 0.62);
  const sub = split($(`${id} .sub`));
  tl.fromTo(sub, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", stagger: 0.025 }, t + 0.9);
  sfx("shimmer", t + 0.9);
}

/* ---------- 0 abertura ---------- */
logo("#logo0", 0.25);
tl.to("#logo0", { y: -250, scale: 0.72, duration: 0.9, ease: "expo.inOut" }, 1.9);
$$("#s0 .tag .ln").forEach((ln, i) => up(ln, 2.3 + i * 0.16, { y: 70, d: 0.7 }));
sfx("pop", 2.3);
tl.to("#s0 .tag em", { color: "#ffffff", duration: 0.01 }, 2.3);
tl.to("#s0 .tag em", { color: "#ea36c2", duration: 0.4 }, 2.9);

/* ---------- 1 sites ---------- */
{
  const t = 4;
  head("s1", t);
  tl.fromTo("#br", { y: 260, opacity: 0, rotationX: 38, rotationY: -14, transformPerspective: 1400 }, { y: 0, opacity: 1, rotationX: 0, rotationY: 0, duration: 1, ease: "expo.out" }, t + 0.35);
  split($("#url")).forEach((c, i) => { tl.set(c, { opacity: 1 }, t + 0.7 + i * 0.03); gsap.set(c, { opacity: 0 }); if (i % 2 === 0) sfx("key", t + 0.7 + i * 0.03, i); });
  pop("#s1 .nav b", t + 0.9);
  tl.fromTo("#s1 .nav span", { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power3.out", stagger: 0.07 }, t + 0.95);
  $$("#s1 .hero .ln").forEach((ln, i) => rise(split(ln), t + 1.05 + i * 0.1, { st: 0.02, rot: 0 }));
  pop("#cta", t + 1.4);
  up("#s1 .cards div", t + 1.5, { st: 0.09 });
  sfx("pop", t + 1.4);
  // cursor clica no botão
  tl.fromTo("#cur", { x: 900, y: 1300, opacity: 0 }, { x: 250, y: 1085, opacity: 1, duration: 0.7, ease: "power3.inOut" }, t + 1.6);
  tl.to("#cur", { scale: 0.8, duration: 0.08, yoyo: true, repeat: 1 }, t + 2.32);
  tl.to("#cta", { scale: 0.93, duration: 0.08, yoyo: true, repeat: 1 }, t + 2.32);
  tl.fromTo("#cta .ripple", { scale: 0, opacity: 0.8 }, { scale: 12, opacity: 0, duration: 0.6, ease: "power2.out" }, t + 2.36);
  sfx("click", t + 2.34);
  tl.to("#cur", { x: 760, y: 1010, opacity: 0, duration: 0.6, ease: "power2.in" }, t + 2.6);
  // editor com código sendo escrito
  tl.fromTo("#ed", { y: 240, opacity: 0, rotation: 4 }, { y: 0, opacity: 1, rotation: 0, duration: 0.8, ease: "expo.out" }, t + 2.5);
  const CW = 31 * 0.6, LH = 50;
  let row = 0, col = 0, k = 0;
  const t0 = t + 3;
  const type = (node) => [...node.childNodes].forEach((n) => {
    if (n.nodeType !== 3) return type(n);
    const f = document.createDocumentFragment();
    for (const c of n.textContent) {
      const at = t0 + k * 0.0155 + row * 0.07; // pausa curta a cada linha, como alguém digitando
      if (c === "\n") { f.appendChild(document.createTextNode("\n")); row++; col = 0; tl.set("#caret", { x: 0, y: row * LH }, at); continue; }
      const s = document.createElement("span");
      s.textContent = c; s.style.opacity = 0; f.appendChild(s);
      col++; k++;
      tl.set(s, { opacity: 1 }, at);
      tl.set("#caret", { x: col * CW, y: row * LH }, at);
      if (c !== " " && k % 3 === 0) sfx("key", at, k);
    }
    n.replaceWith(f);
  });
  type($("#code"));
  tl.fromTo("#caret", { opacity: 1 }, { opacity: 0, duration: 0.25, repeat: 3, yoyo: true, ease: "steps(1)" }, t + 4.75);
  pop("#pub", t + 4.75);
  sfx("chime", t + 4.75);
}

/* ---------- 2 automações ---------- */
{
  const t = 9.5;
  head("s2", t);
  const wire = $("#wire"), L = wire.getTotalLength();
  gsap.set(wire, { strokeDasharray: L, strokeDashoffset: L });
  const nodes = $$("#s2 .node");
  const T0 = t + 0.9, SPAN = 2.9;
  tl.to(wire, { strokeDashoffset: 0, duration: SPAN, ease: "none" }, T0);
  const p = { v: 0 };
  const place = () => { const q = wire.getPointAtLength(p.v * L); gsap.set("#pulse", { x: q.x, y: q.y }); };
  tl.fromTo(p, { v: 0 }, { v: 1, duration: SPAN, ease: "none", onUpdate: place }, T0);
  pop("#pulse", T0 - 0.2, { d: 0.3 });
  nodes.forEach((n, i) => {
    const at = T0 + (i / 4) * SPAN;
    tl.fromTo(n, { opacity: 0, scale: 0.7, x: i % 2 ? 80 : -80 }, { opacity: 1, scale: 1, x: 0, duration: 0.55, ease: "back.out(1.6)" }, at - 0.25);
    tl.to(n, { borderColor: "#ea36c2", duration: 0.25 }, at);
    tl.to(n.querySelector("i"), { backgroundColor: "#ea36c2", borderColor: "#ea36c2", rotation: 90, duration: 0.4, ease: "back.out(2)" }, at);
    sfx(i === 4 ? "chime" : "blip", at, i);
  });
  tl.to("#pulse", { scale: 3, opacity: 0, duration: 0.5, ease: "power2.out" }, T0 + SPAN);
  tl.to(nodes[4], { scale: 1.06, duration: 0.18, yoyo: true, repeat: 1 }, T0 + SPAN);
}

/* ---------- 3 chatbot ---------- */
{
  const t = 14.5;
  head("s3", t);
  tl.fromTo("#ph", { y: 500, opacity: 0, rotation: -5 }, { y: 0, opacity: 1, rotation: 0, duration: 0.9, ease: "expo.out" }, t + 0.35);
  up("#rb", t + 0.8, { y: 20, d: 0.4 });
  tl.fromTo("#rb i", { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power3.inOut" }, t + 1.5);
  tl.to("#rb", { opacity: 0.35, duration: 0.3 }, t + 1.8);
  gsap.set("#s3 .m, #s3 .typing", { opacity: 0 });
  const say = (id, at, kind) => { pop(id, at, { d: 0.45 }); sfx(kind, at); };
  const typing = (id, a, b) => {
    pop(id, a, { d: 0.3 });
    tl.fromTo(`${id} i`, { y: 0 }, { y: -10, duration: 0.2, ease: "sine.inOut", stagger: { each: 0.1, repeat: Math.round((b - a) / 0.2), yoyo: true } }, a);
    tl.set(id, { opacity: 0 }, b);
  };
  say("#m1", t + 0.9, "send");
  typing("#t1", t + 1.3, t + 2.1);
  say("#m2", t + 2.1, "ding");
  say("#m3", t + 3.4, "send");
  typing("#t2", t + 3.75, t + 4.4);
  say("#m4", t + 4.4, "ding");
}

/* ---------- 4 motion ---------- */
{
  const t = 21;
  head("s4", t);
  tl.fromTo("#ad", { scale: 0.6, opacity: 0, rotation: 6 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: "expo.out" }, t + 0.35);
  up("#s4 .adtop", t + 0.7, { y: -30, d: 0.4 });
  tl.fromTo("#off", { scale: 3.2, opacity: 0, rotation: -8 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.45, ease: "power4.in" }, t + 0.75);
  tl.fromTo("#ad", { x: 0, y: 0 }, { x: 10, y: -8, duration: 0.05, repeat: 5, yoyo: true, ease: "none" }, t + 1.2);
  sfx("slam", t + 1.2);
  tl.fromTo("#s4 .strip", { xPercent: 110 }, { xPercent: 0, duration: 0.5, ease: "expo.out" }, t + 1.35);
  tl.fromTo("#mq", { x: 0 }, { x: -520, duration: 3.2, ease: "none" }, t + 1.3);
  tl.fromTo("#bag", { y: 400, rotation: -30 }, { y: 0, rotation: -6, duration: 0.7, ease: "back.out(1.4)" }, t + 1.6);
  tl.to("#bag", { rotation: 5, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 2 }, t + 2.3);
  tl.fromTo("#price", { scale: 0, rotation: 40, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: "back.out(2)" }, t + 1.9);
  sfx("pop", t + 1.9);
  pop("#buy", t + 2.3);
  tl.to("#buy", { scale: 1.08, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 5 }, t + 2.8);
  sfx("blip", t + 2.3, 3);
  $$("#s4 .star").forEach((s, i) => {
    tl.fromTo(s, { scale: 0, rotation: 0 }, { scale: 1, rotation: 90, duration: 0.5, ease: "back.out(2)" }, t + 1.4 + i * 0.25);
    tl.to(s, { scale: 0.4, rotation: 180, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: 4 }, t + 1.9 + i * 0.25);
  });
  up("#s4 .tline", t + 0.6);
  tl.fromTo("#s4 .trk i", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "expo.out", stagger: 0.06 }, t + 0.8);
  pop("#s4 .trk b", t + 1.1, { st: 0.08, d: 0.3 });
  tl.fromTo("#playhead", { x: 0 }, { x: 852, duration: 3.6, ease: "none" }, t + 0.7);
}

/* ---------- 5 design ---------- */
{
  const t = 25.5;
  head("s5", t);
  up("#s5 .dcard", t + 0.35, { st: 0.1, y: 120 });
  tl.fromTo("#s5 .type b", { scale: 0.4, opacity: 0, transformOrigin: "0 100%" }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.6)" }, t + 0.6);
  $$("#s5 .gl").forEach((g, i) => {
    const L = g.getTotalLength();
    gsap.set(g, { strokeDasharray: L, strokeDashoffset: L });
    tl.to(g, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, t + 0.55 + i * 0.12);
  });
  pop("#s5 .mark b", t + 1.0);
  sfx("pop", t + 1.0);
  tl.fromTo("#s5 .sw div", { y: 140, opacity: 0, rotation: 12 }, { y: 0, opacity: 1, rotation: 0, duration: 0.55, ease: "back.out(1.5)", stagger: 0.07 }, t + 0.9);
  $$("#s5 .sw div").forEach((_, i) => sfx("blip", t + 0.9 + i * 0.07, i));
  const c = $("#curve"), L = c.getTotalLength();
  gsap.set(c, { strokeDasharray: L, strokeDashoffset: L });
  tl.to(c, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }, t + 1.4);
  pop("#s5 .an", t + 1.4, { st: 0.45, d: 0.3 });
  tl.fromTo("#s5 .hl", { opacity: 0 }, { opacity: 1, duration: 0.4 }, t + 1.9);
  sfx("shimmer", t + 1.4);
}

/* ---------- 6 crm ---------- */
{
  const t = 28.5;
  head("s6", t);
  up("#s6 .col", t + 0.3, { st: 0.07 });
  pop("#s6 .kc", t + 0.5, { st: 0.06, d: 0.4 });
  gsap.set("#kmove .ok", { scale: 0 });
  const hop = (x, y, at) => {
    tl.to("#kmove", { x, y, duration: 0.55, ease: "power3.inOut" }, at);
    tl.to("#kmove", { rotation: 5, scale: 1.08, duration: 0.27, yoyo: true, repeat: 1, ease: "sine.inOut" }, at);
    sfx("send", at);
  };
  hop(310, 150, t + 1.1);
  tl.to("#s6 .kc.up", { y: -150, duration: 0.5, ease: "power3.inOut", stagger: 0.05 }, t + 1.2);
  hop(620, 150, t + 1.9);
  pop("#kmove .ok", t + 2.4, { d: 0.4 });
  sfx("chime", t + 2.4);
  up("#s6 .chart", t + 0.5, { y: 120 });
  tl.fromTo("#s6 .bars i", { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: "expo.out", stagger: 0.08 }, t + 0.9);
  tl.to("#s6 .bars .hot", { scaleY: 1.08, duration: 0.25, yoyo: true, repeat: 1 }, t + 2.4);
}

/* ---------- 7 fechamento ---------- */
{
  const t = 32;
  const ls = $$("#s7 .list .ln");
  ls.forEach((ln, i) => {
    const at = t + 0.15 + i * 0.2;
    tl.fromTo(ln, { x: -200, opacity: 0, skewX: -18 }, { x: 0, opacity: 1, skewX: 0, duration: 0.45, ease: "expo.out" }, at);
    sfx("tick", at, i + 2);
    tl.to(ln, { x: 300, opacity: 0, duration: 0.35, ease: "power3.in" }, t + 1.75 + i * 0.04);
  });
  sfx("riser", t + 1.5);
    logo("#logo7", t + 2.2);
  pop("#cta7", t + 3.4, { d: 0.6 });
  sfx("chime", t + 3.4);
  tl.to("#cta7", { scale: 1.05, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 1 }, t + 4);
}

window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
tl.seek(0);

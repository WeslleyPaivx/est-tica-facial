// O mundo: céu, cordilheira e a faixa contínua da montanha, fixos atrás do conteúdo.
// O scroll da página vira uma posição Y no mundo por uma curva monotônica que casa o centro de cada
// seção com o "foco" dela no cenário (cena.js). Assim o cenário nunca descola das seções, seja qual for
// a altura do conteúdo, e anda mais devagar que o texto (profundidade).
// Camadas: céu (0,12), cordilheira (0,38), faixa (1), primeiro plano desfocado (1,6–1,9).
// Tudo por transform; nada de scrub com atraso: a única suavização é o Lenis.
import { SRC_W, SEG_H, BAND, SEGMENTOS, STRIP_H, FOCO, DECOR, TRILHA, MARCOS } from './cena.js';

const F_SKY = 0.12;
const SKY_FOLGA = 12; // px de céu acima da tela, para o mouse e a entrada não abrirem fresta no topo
const F_RIDGE = 0.38;
const DESK_Y = 480;

export function createWorld({ reduced = false } = {}) {
  const $ = (s) => document.querySelector(s);
  const skyL = $('.world__sky'), ridgeL = $('.world__ridges'), stripL = $('.world__strip'), decorL = $('.world__decor');
  const shade = $('.world__shade');
  const skyImg = skyL.querySelector('img'), ridgeImg = ridgeL.querySelector('img');
  const strip = stripL.querySelector('[data-strip]');
  const marks = $('.world__marks');

  // ---------- montagem da faixa ----------
  strip.style.width = SRC_W + 'px';
  strip.style.height = STRIP_H + 'px';
  const segs = SEGMENTOS.map((s, i) => {
    const img = new Image();
    img.decoding = 'async';
    img.alt = '';
    img.className = 'seg' + (i ? ' seg--emenda' : '');
    img.style.top = s.top + 'px';
    img.style.setProperty('--band', BAND * 0.92 + 'px');
    img.dataset.src = s.src;
    // a colina e a encosta aparecem já no hero: vêm antes da entrada (a colina é pré-carregada no HTML)
    if (i < 2) img.src = s.src;
    strip.appendChild(img);
    return { el: img, top: s.top, loaded: i < 2, shown: true };
  });

  // trilha vetorial (pen tool) em coordenadas da faixa
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'trail');
  svg.setAttribute('viewBox', `0 0 ${SRC_W} ${STRIP_H}`);
  svg.setAttribute('width', SRC_W);
  svg.setAttribute('height', STRIP_H);
  const d = catmull(TRILHA);
  const ghost = document.createElementNS(NS, 'path');
  ghost.setAttribute('d', d);
  ghost.setAttribute('class', 'trail__ghost');
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('class', 'trail__line');
  svg.append(ghost, path);
  strip.appendChild(svg);
  const total = path.getTotalLength();
  // tabela comprimento ↔ y (a trilha sempre desce)
  const LUT = [];
  for (let i = 0; i <= 600; i++) {
    const l = (total * i) / 600;
    const p = path.getPointAtLength(l);
    LUT.push({ l, x: p.x, y: p.y });
  }
  path.setAttribute('stroke-dasharray', `${total} ${total}`);
  path.setAttribute('stroke-dashoffset', total);

  // nós da caneta ao longo do caminho + cabeça da caneta
  const nodes = [];
  for (let l = 140; l < total - 60; l += 330) {
    const p = path.getPointAtLength(l);
    const el = document.createElement('i');
    el.className = 'mk-node';
    marks.appendChild(el);
    nodes.push({ el, x: p.x, y: p.y, l, on: false });
  }
  const pins = MARCOS.map((m) => {
    const x = trailXAt(m.y);
    const el = document.createElement('div');
    el.className = 'mk-pin';
    el.innerHTML = `<span>${m.n}</span>`;
    el.dataset.step = String(Number(m.n));
    marks.appendChild(el);
    return { el, x, y: m.y, on: false };
  });
  const pen = document.createElement('div');
  pen.className = 'mk-pen';
  pen.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.6-5.4L15.8 4.4a1.9 1.9 0 0 1 2.7 0l1.1 1.1a1.9 1.9 0 0 1 0 2.7L9.4 18.4z" fill="#fff" stroke="#0d0f14" stroke-width="1.4" stroke-linejoin="round"/><path d="M5.6 14.6l3.8 3.8" stroke="#0d0f14" stroke-width="1.4"/></svg>`;
  marks.appendChild(pen);

  // primeiro plano
  const decor = DECOR.map((o) => {
    const img = new Image();
    img.decoding = 'async';
    img.alt = '';
    img.className = 'decor';
    img.dataset.src = `/img/d-${o.img}.webp`;
    if (o.blur) img.style.filter = `blur(${o.blur}px)`;
    if (o.at === 0) img.src = img.dataset.src; // primeiro plano do hero: antes da entrada
    decorL.appendChild(img);
    return { ...o, el: img, loaded: o.at === 0, h: 0 };
  });

  // ---------- geometria ----------
  let vw = 0, vh = 0, k = 1, stripW = 0, baseTop = 0, mobile = false;
  let anchors = [];
  let lastS = -1, lastKey = '';
  const intro = { sky: 0, ridge: 0, strip: 0 }; // deslocamentos da entrada (px de tela)
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  function measure() {
    vw = document.documentElement.clientWidth;
    vh = window.innerHeight;
    mobile = vw < 760;
    stripW = mobile ? Math.max(vw, vh * 1.25) : Math.max(vw * 1.02, vh * 1.05);
    k = stripW / SRC_W;
    // a mesa do cume (y≈480 na faixa) fica a 66% da altura da tela; a faixa continua abaixo, então
    // a colina pode passar do pé da tela sem buraco
    baseTop = Math.min(vh * 0.66 - DESK_Y * k, vh - SEG_H * k * 0.82);

    // céu: cobre a tela com folga para subir
    const skyH = Math.max(vh * 1.32, (stripW * SEG_H) / SRC_W);
    const skyW = Math.max((skyH * SRC_W) / SEG_H, vw * 1.04);
    skyImg.style.width = skyW + 'px';
    skyImg.style.height = (skyW * SEG_H) / SRC_W + 'px';
    skyImg.style.left = (vw - skyW) / 2 + 'px';
    skyImg.style.top = -SKY_FOLGA + 'px';
    ridgeImg.style.width = stripW + 'px';
    ridgeImg.style.height = SEG_H * k + 'px';

    path.style.strokeWidth = 2 / k;
    ghost.style.strokeWidth = 1.25 / k;
    ghost.style.strokeDasharray = `${3 / k} ${7 / k}`;

    decor.forEach((o) => { o.el.style.width = o.w * k + 'px'; });

    // âncoras: centro da seção ↔ foco no mundo
    const toY = (focus) => focus - (vh / 2 - baseTop) / k;
    const maxS = Math.max(document.documentElement.scrollHeight - vh, 1);
    // no fim, a faixa passa 3 px do pé da tela: a última linha da imagem sai meio transparente na reamostragem
    const yEnd = STRIP_H - (vh + 3 - baseTop) / k;
    const list = [{ s: 0, y: 0 }];
    document.querySelectorAll('[data-scene]').forEach((sec) => {
      const f = FOCO[sec.dataset.scene];
      if (f == null) return;
      const r = sec.getBoundingClientRect();
      const s = r.top + window.scrollY + r.height / 2 - vh / 2;
      list.push({ s, y: Math.min(toY(f), yEnd) });
    });
    list.push({ s: maxS, y: yEnd });
    // monotônico nos dois eixos
    anchors = [];
    for (const a of list) {
      const prev = anchors[anchors.length - 1];
      if (prev && (a.s <= prev.s + 1 || a.y < prev.y)) {
        if (a.s > prev.s + 1) anchors.push({ s: a.s, y: prev.y });
        continue;
      }
      anchors.push({ ...a });
    }
    tangents(anchors);
    lastKey = '';
  }

  // Fritsch–Carlson: curva monotônica e suave entre as âncoras (sem quina de velocidade)
  function tangents(a) {
    const n = a.length;
    const dl = [];
    for (let i = 0; i < n - 1; i++) dl.push((a[i + 1].y - a[i].y) / (a[i + 1].s - a[i].s));
    for (let i = 0; i < n; i++) {
      if (i === 0) a[i].m = dl[0];
      else if (i === n - 1) a[i].m = dl[n - 2];
      else a[i].m = dl[i - 1] * dl[i] <= 0 ? 0 : (dl[i - 1] + dl[i]) / 2;
    }
    for (let i = 0; i < n - 1; i++) {
      if (dl[i] === 0) { a[i].m = 0; a[i + 1].m = 0; continue; }
      const al = a[i].m / dl[i], be = a[i + 1].m / dl[i];
      const h = al * al + be * be;
      if (h > 9) { const t = 3 / Math.sqrt(h); a[i].m = t * al * dl[i]; a[i + 1].m = t * be * dl[i]; }
    }
  }
  function worldY(s) {
    const a = anchors;
    if (s <= a[0].s) return a[0].y;
    if (s >= a[a.length - 1].s) return a[a.length - 1].y;
    let i = 0;
    while (s > a[i + 1].s) i++;
    const h = a[i + 1].s - a[i].s, t = (s - a[i].s) / h;
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * a[i].y + (t3 - 2 * t2 + t) * h * a[i].m + (-2 * t3 + 3 * t2) * a[i + 1].y + (t3 - t2) * h * a[i + 1].m;
  }
  function trailXAt(y) {
    if (y <= TRILHA[0][1]) return TRILHA[0][0];
    for (let i = 1; i < TRILHA.length; i++) {
      if (TRILHA[i][1] >= y) {
        const [x0, y0] = TRILHA[i - 1], [x1, y1] = TRILHA[i];
        return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0 || 1);
      }
    }
    return TRILHA[TRILHA.length - 1][0];
  }
  function lengthAtY(y) {
    if (y <= LUT[0].y) return 0;
    let lo = 0, hi = LUT.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (LUT[mid].y <= y) lo = mid; else hi = mid - 1; }
    return LUT[lo].l;
  }

  // ---------- carregamento ----------
  function load(o) {
    if (o.loaded) return;
    o.loaded = true;
    o.el.src = o.el.dataset.src;
  }
  // o resto vem em fila, um por vez e decodificado antes do próximo, para não brigar com a animação
  async function loadAll() {
    for (const o of [...segs, ...decor]) {
      if (o.loaded) continue;
      load(o);
      await o.el.decode().catch(() => {});
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
  }

  // ---------- quadro ----------
  function render(force = false) {
    const s = window.scrollY;
    const key = `${s}|${intro.sky}|${intro.ridge}|${intro.strip}|${mouse.x.toFixed(2)}|${mouse.y.toFixed(2)}`;
    if (!force && key === lastKey) return;
    lastKey = key;
    const Y = worldY(s); // px da faixa
    const Ypx = Y * k;

    // câmera horizontal: no celular segue a trilha (mistura com o centro)
    const yCenter = Y + (vh / 2 - baseTop) / k;
    let x = (vw - stripW) / 2;
    if (mobile) {
      const tx = trailXAt(yCenter);
      const target = vw / 2 - (tx * 0.72 + (SRC_W / 2) * 0.28) * k;
      x = Math.min(0, Math.max(vw - stripW, target));
    }
    const mx = mouse.x, my = mouse.y; // -1..1, só no desktop

    shade.style.opacity = Math.min(1, Math.max(0, (Ypx - vh * 0.35) / (vh * 0.6))).toFixed(3);

    // céu e cordilheira só enquanto aparecem acima da colina
    const skyOn = Ypx < vh * 1.4;
    skyL.style.visibility = skyOn ? '' : 'hidden';
    ridgeL.style.visibility = skyOn ? '' : 'hidden';
    if (skyOn) {
      // a borda de cima do céu nunca desce abaixo do topo da tela (mouse no alto, entrada)
      const skyY = Math.min(SKY_FOLGA, -Ypx * F_SKY + intro.sky - my * 4);
      skyImg.style.transform = `translate3d(${(-mx * 6).toFixed(2)}px, ${skyY.toFixed(2)}px, 0)`;
      const rx = (vw - stripW) / 2 + (x - (vw - stripW) / 2) * F_RIDGE;
      ridgeImg.style.transform = `translate3d(${(rx - mx * 10).toFixed(2)}px, ${(baseTop - Ypx * F_RIDGE + intro.ridge - my * 5).toFixed(2)}px, 0)`;
    }
    const sx = x - mx * 18, sy = baseTop - Ypx + intro.strip - my * 6;
    strip.style.transform = `translate3d(${sx.toFixed(2)}px, ${sy.toFixed(2)}px, 0) scale(${k})`;

    // recorte das faixas fora da tela (economiza composição)
    for (const g of segs) {
      const top = sy + g.top * k, bot = top + SEG_H * k;
      const on = bot > -vh * 0.5 && top < vh * 1.5;
      if (on !== g.shown) { g.shown = on; g.el.style.visibility = on ? '' : 'hidden'; }
      if (on) load(g); // quem rola antes da fila terminar não vê buraco
    }

    // trilha: desenhada até a altura de 62% da tela
    const head = Y + (vh * 0.62 - baseTop) / k;
    const L = Math.min(lengthAtY(head), total);
    path.setAttribute('stroke-dashoffset', (total - L).toFixed(1));
    const toScreen = (px, py) => [sx + px * k, sy + py * k];
    const hp = L > 0 ? path.getPointAtLength(L) : null;
    if (hp) {
      const [hx, hy] = toScreen(hp.x, hp.y);
      pen.style.transform = `translate3d(${hx.toFixed(1)}px, ${hy.toFixed(1)}px, 0)`;
      pen.classList.toggle('is-on', L > 4 && L < total - 4);
    } else pen.classList.remove('is-on');
    for (const nd of nodes) {
      const on = L >= nd.l;
      if (on !== nd.on) { nd.on = on; nd.el.classList.toggle('is-on', on); }
      const [nx, ny] = toScreen(nd.x, nd.y);
      nd.el.style.transform = `translate3d(${nx.toFixed(1)}px, ${ny.toFixed(1)}px, 0)`;
    }
    for (const p of pins) {
      const on = head >= p.y;
      if (on !== p.on) {
        p.on = on;
        p.el.classList.toggle('is-on', on);
        document.querySelector(`.step[data-step="${p.el.dataset.step}"]`)?.classList.toggle('is-lit', on);
      }
      const [px, py] = toScreen(p.x, p.y);
      p.el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
    }

    // primeiro plano: anda f vezes o chão, alinhado no Y "at"
    for (const o of decor) {
      if (mobile && o.mobile === false) { o.el.style.visibility = 'hidden'; continue; }
      const h = o.el.naturalHeight ? (o.el.naturalHeight / o.el.naturalWidth) * o.w : o.w * 0.7;
      const at = o.at ?? o.y + h / 2 - (vh / 2 - baseTop) / k;
      const yy = baseTop + (o.y - Y) * k - (o.f - 1) * (Y - at) * k + intro.strip * o.f;
      const xx = x + o.x * k - mx * 18 * o.f;
      const on = yy < vh + 50 && yy + h * k > -50;
      if (yy < vh * 2 && yy + h * k > -vh) load(o);
      o.el.style.visibility = on ? '' : 'hidden';
      if (on) o.el.style.transform = `translate3d(${xx.toFixed(1)}px, ${yy.toFixed(1)}px, 0)`;
    }
  }

  // ponteiro: o mundo cede alguns pixels ao mouse (desktop), por mola no ticker
  function onPointer(e) {
    if (mobile) return;
    mouse.tx = (e.clientX / vw) * 2 - 1;
    mouse.ty = (e.clientY / vh) * 2 - 1;
  }
  function tick() {
    if (!reduced) {
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      if (Math.abs(mouse.tx - mouse.x) < 0.0005) mouse.x = mouse.tx;
      if (Math.abs(mouse.ty - mouse.y) < 0.0005) mouse.y = mouse.ty;
    }
    render();
  }

  measure();
  render(true);
  window.addEventListener('pointermove', onPointer, { passive: true });
  let rz;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { measure(); render(true); }); });
  new ResizeObserver(() => { measure(); render(true); }).observe(document.querySelector('main'));

  return { tick, measure, render, loadAll, intro, firstImages: [skyImg, ridgeImg, segs[0].el, segs[1].el, ...decor.filter((o) => o.at === 0).map((o) => o.el)], debug: () => ({ anchors, k, baseTop, stripW }) };
}

// caminho suave (Catmull-Rom → Bézier) pelos pontos da trilha
function catmull(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

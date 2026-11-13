// Carregamento: um ponto cruza os dois picos deixando a trilha; cada pico, recortado pela própria forma,
// engrossa o traço para dentro até ficar sólido. O ponto desce até o canto e vira a alça, e dela sai a caixa
// de seleção arrastada até o outro canto, como num editor. Depois a marca encosta à esquerda, o nome aparece
// por trás dela e tudo pousa na marca da nav (FLIP).
// Mesma base da skill logo-intro: CSS crítico inline no <head>, falha segura e scroll preso sem sumir a barra.
import { gsap } from 'gsap';

export function carregamento({ target, ready, speed = 1 }) {
  const root = document.documentElement;
  const el = document.querySelector('[data-ld]');
  let revealed, finished;
  const reveal = new Promise((r) => (revealed = r));
  const done = new Promise((r) => (finished = r));
  // no pouso a camada só some de vista; tirá-la do DOM recompõe a tela inteira (~20 ms de GPU), então isso
  // fica para quando a entrada do hero já terminou
  const finish = () => {
    root.classList.add('ld-done');
    if (el) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; setTimeout(() => el.remove(), 4000); }
    finished();
  };
  window.__ldBooted = true;
  if (!el || !root.classList.contains('ld-on')) { finish(); revealed(); return { reveal, done }; }

  const logo = el.querySelector('[data-ld-logo]');
  const mark = el.querySelector('[data-ld-mark]');
  const word = el.querySelector('[data-ld-word]');
  const [tracoA, tracoB] = el.querySelectorAll('[data-ld-traco]');
  const guia = el.querySelector('[data-ld-guia]');
  const caixa = el.querySelector('[data-ld-caixa]');
  const alcas = el.querySelectorAll('[data-ld-alca]'); // sup. esq., sup. dir., inf. esq., inf. dir.
  const canto = alcas[3]; // a alça de baixo à direita é o próprio ponto que caminha
  const nav = document.querySelector(target);
  const k = 1 / speed;

  window.scrollTo(0, 0);
  const pin = () => window.scrollY && window.scrollTo(0, 0);
  window.addEventListener('scroll', pin);

  // trilha: o progresso t corre a guia. O traço A vai do pé esquerdo ao vale (e segue escondido até o pé
  // direito, para cobrir o canto ao engrossar); o B começa no vale e, ao engrossar, desce também até o pé esquerdo dele.
  const LG = guia.getTotalLength();
  const LA = tracoA.getTotalLength(), LAv = 22.3 + 19.3; // até o vale
  const LB = tracoB.getTotalLength(), LB0 = 2.99; // do pé esquerdo do pico menor até o vale
  const fa = LAv / (LAv + LB - LB0);
  const trilha = { t: 0 };
  const dash = { a: 0, b: 0, b0: LB0 };
  const ponto = { x: 0, y: 0, s: 0, r: 0.9 };
  const desenharPonto = () => {
    canto.setAttribute('x', ponto.x - ponto.s / 2); canto.setAttribute('y', ponto.y - ponto.s / 2);
    canto.setAttribute('width', ponto.s); canto.setAttribute('height', ponto.s);
    canto.setAttribute('rx', ponto.r);
  };
  const tracar = () => {
    tracoA.setAttribute('stroke-dasharray', `${dash.a} ${LA * 2}`);
    tracoB.setAttribute('stroke-dasharray', `0 ${dash.b0} ${dash.b + (LB0 - dash.b0)} ${LB * 2}`);
  };
  const andar = () => {
    if (trilha.t < fa) dash.a = LAv * (trilha.t / fa); else dash.a = Math.max(dash.a, LAv); // depois, quem estende é o tween
    dash.b = (LB - LB0) * Math.max(0, (trilha.t - fa) / (1 - fa));
    tracar();
    const pt = guia.getPointAtLength(LG * trilha.t);
    ponto.x = pt.x; ponto.y = pt.y;
    desenharPonto();
  };

  // seleção: arrastada do canto de baixo à direita até o de cima à esquerda
  const sel = { p: 0 };
  const arrastar = () => {
    const x = 28.5 - 25 * sel.p, y = 24.5 - 17.5 * sel.p;
    caixa.setAttribute('x', x); caixa.setAttribute('y', y);
    caixa.setAttribute('width', 25 * sel.p); caixa.setAttribute('height', 17.5 * sel.p);
    [[x, y], [28.5, y], [x, 24.5]].forEach(([cx, cy], i) => {
      alcas[i].setAttribute('x', cx - 1.6); alcas[i].setAttribute('y', cy - 1.6);
    });
  };
  andar(); arrastar();
  gsap.set([alcas[0], alcas[1], alcas[2]], { opacity: 0 });

  const fonte = Promise.race([document.fonts.load('500 100px Satoshi'), new Promise((r) => setTimeout(r, 800))]);
  const pronto = Promise.race([
    Promise.resolve(ready).catch(() => {}),
    new Promise((r) => setTimeout(r, 4000)),
  ]);

  fonte.then(() => {
    // a marca começa no centro da tela e maior; o nome fica escondido atrás dela
    const W = logo.offsetWidth;
    gsap.set(mark, { x: W / 2 - mark.getBoundingClientRect().width / 2, scale: 1.6, transformOrigin: '50% 50%', opacity: 1 });
    gsap.set(word, { '--reveal': '-20%', filter: 'blur(6px)' });

    // instante em que o ponto deixa o primeiro pico (inverso do power1.inOut)
    const T0 = 0.15, TD = 0.95;
    const xa = fa < 0.5 ? Math.sqrt(fa / 2) : 1 - Math.sqrt((1 - fa) / 2);
    const fimA = T0 + xa * TD, fim = T0 + TD;

    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
    tl.to(ponto, { s: 1.8, duration: 0.25 * k, ease: 'power2.out', onUpdate: desenharPonto }, 0)
      .to(trilha, { t: 1, duration: TD * k, ease: 'power1.inOut', onUpdate: andar }, T0 * k)
      // o traço engrossa para dentro: o pico se enche das bordas para o centro
      .to(tracoA, { attr: { 'stroke-width': 22 }, duration: 0.6 * k, ease: 'power2.inOut' }, (fimA - 0.04) * k)
      .to(dash, { a: LA, duration: 0.3 * k, ease: 'none', onUpdate: tracar }, (fimA - 0.04) * k)
      .to(tracoB, { attr: { 'stroke-width': 14 }, duration: 0.5 * k, ease: 'power2.inOut' }, (fim - 0.08) * k)
      .to(dash, { b0: 0, duration: 0.25 * k, ease: 'power2.out', onUpdate: tracar }, (fim - 0.08) * k)
      // o ponto segue descendo até o canto e vira a alça quadrada
      .to(ponto, { x: 28.5, y: 24.5, s: 3.2, r: 0, duration: 0.3 * k, ease: 'power2.inOut', onUpdate: desenharPonto }, (fim - 0.02) * k)
      .set([alcas[0], alcas[1], alcas[2]], { opacity: 1 }, (fim + 0.26) * k)
      .to(sel, { p: 1, duration: 0.6 * k, ease: 'power3.out', onUpdate: arrastar }, (fim + 0.26) * k)
      .to(mark, { x: 0, scale: 1, duration: 0.7 * k }, (fim + 0.66) * k)
      .fromTo(word, { x: -W * 0.06 }, { x: 0, '--reveal': '120%', filter: 'blur(0px)', duration: 0.7 * k, ease: 'power2.out' }, (fim + 1.02) * k);

    Promise.all([pronto, tl.then()]).then(() => {
      const from = logo.getBoundingClientRect();
      const to = nav.getBoundingClientRect();
      gsap.timeline({
        delay: 0.1 * k,
        onComplete: () => { window.removeEventListener('scroll', pin); finish(); },
      })
        .add(() => revealed(), 0.15 * k)
        .to(logo, { x: to.left - from.left, y: to.top - from.top, scale: to.width / from.width, duration: 1 * k, ease: 'expo.inOut' }, 0)
        .to(el, { backgroundColor: 'rgba(248,247,242,0)', duration: 0.9 * k, ease: 'power2.inOut' }, 0.25 * k)
        .to(logo, { color: '#fff', duration: 0.6 * k, ease: 'none' }, 0.45 * k);
    });
  });

  return { reveal, done };
}

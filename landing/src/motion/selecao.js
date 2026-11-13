// O cursor que seleciona "ser visto": chega em curva, aperta, arrasta (a seleção cresce com ele e o texto
// vira azul onde ela passa), solta (a seleção vira caixa de editor com alças e medida) e descansa no canto.
// Tudo por tempo, uma vez na entrada; depois só flutua de leve.
import { gsap } from 'gsap';

export function selecao({ reduced = false } = {}) {
  const hero = document.querySelector('.hero');
  const sel = document.querySelector('[data-sel]');
  const txt = sel.querySelector('.sel__txt');
  const box = sel.querySelector('[data-sel-box]');
  const size = sel.querySelector('[data-sel-size]');
  const handles = sel.querySelectorAll('.sel__h');
  const cur = document.querySelector('[data-cursor]');
  const arrow = cur.querySelector('.cursor__arrow');
  const tag = cur.querySelector('.cursor__tag');

  const rel = (r) => { const h = hero.getBoundingClientRect(); return { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height }; };
  const geo = () => {
    const t = rel(txt.getBoundingClientRect());
    const b = rel(box.getBoundingClientRect());
    const fs = parseFloat(getComputedStyle(sel).fontSize);
    return { t, b, fs };
  };
  // onde o cursor descansa: no desktop o texto continua à direita da seleção, então ele desce para a alça de
  // baixo e a etiqueta fica no céu, sob a linha; no celular "ser visto" fica sozinho e ele descansa ao lado
  const mobile = matchMedia('(max-width: 760px)');
  const rest = ({ t, fs }) => (mobile.matches
    ? { x: t.x + t.w + fs * 0.12, y: t.y + t.h * 0.5 }
    : { x: t.x + t.w + fs * 0.02, y: t.y + t.h + fs * 0.1 });
  const setP = (p) => sel.style.setProperty('--p', p.toFixed(4));
  const measureSize = () => {
    const r = box.getBoundingClientRect();
    size.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
  };

  function finalState() {
    sel.dataset.state = 'done';
    setP(1);
    gsap.set(handles, { scale: 1 });
    gsap.set(size, { opacity: 1 });
    measureSize();
    gsap.set(cur, { ...rest(geo()), opacity: 1 });
    gsap.set(tag, { opacity: 1 });
  }

  if (reduced) { finalState(); return { play: () => {} }; }

  function play() {
    const { t, fs } = geo();
    const start = { x: t.x - fs * 0.04, y: t.y + t.h * 0.52 };
    const end = { x: t.x + t.w + fs * 0.05, y: t.y + t.h * 0.56 };
    const vw = hero.clientWidth, vh = hero.clientHeight;
    const from = { x: Math.min(vw * 0.86, t.x + t.w + vw * 0.34), y: Math.min(vh * 0.8, t.y + t.h * 3.2) };
    const pos = { x: from.x, y: from.y };
    const put = () => gsap.set(cur, { x: pos.x, y: pos.y });
    put();

    const tl = gsap.timeline();
    tl.to(cur, { opacity: 1, duration: 0.35, ease: 'power1.out' }, 0)
      .fromTo(arrow, { scale: 0.7 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0)
      // chegada em curva: x e y com curvas diferentes
      .to(pos, { x: start.x, duration: 1.15, ease: 'power3.inOut', onUpdate: put }, 0.05)
      .to(pos, { y: start.y, duration: 1.15, ease: 'expo.inOut', onUpdate: put }, 0.05)
      // aperta
      .to(arrow, { scale: 0.86, duration: 0.14, ease: 'power2.out' }, '>-0.02')
      .add(() => { sel.dataset.state = 'drag'; setP(0); }, '<')
      // arrasta: a seleção segue o cursor
      .to({ p: 0 }, {
        p: 1, duration: 0.95, ease: 'power2.inOut',
        onUpdate() {
          const p = this.targets()[0].p;
          setP(p);
          pos.x = start.x + (end.x - start.x) * p;
          pos.y = start.y + (end.y - start.y) * p + Math.sin(p * Math.PI) * fs * 0.03;
          put();
        },
      }, '>+0.06')
      // solta: vira caixa de editor
      .to(arrow, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, '>+0.02')
      .add(() => { sel.dataset.state = 'done'; measureSize(); }, '<')
      .to(handles, { scale: 1, duration: 0.55, ease: 'back.out(2.4)', stagger: 0.045 }, '<+0.05')
      .fromTo(size, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, '<+0.12')
      // descansa no canto de baixo, com a etiqueta de quem selecionou
      .to(pos, { ...rest({ t, fs }), duration: 0.9, ease: 'expo.out', onUpdate: put }, '<+0.1')
      .fromTo(tag, { opacity: 0, x: -6, y: -4 }, { opacity: 1, x: 0, y: 0, duration: 0.6, ease: 'expo.out' }, '<+0.25')
      .add(idle);
    return tl;
  }

  function idle() {
    gsap.to(arrow, { x: 2.5, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to(arrow, { y: -3, duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to(tag, { x: 2.5, y: -3, duration: 2.3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  // se a tela mudar depois do fim, reposiciona o cursor no canto da caixa
  window.addEventListener('resize', () => {
    if (sel.dataset.state !== 'done') return;
    gsap.set(cur, rest(geo()));
    measureSize();
  });

  return { play };
}

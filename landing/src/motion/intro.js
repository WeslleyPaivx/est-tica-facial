// Entrada: céu acende, cordilheira e colina sobem em profundidades diferentes, o título sobe linha a linha.
import { gsap } from 'gsap';

export function intro({ world, reduced = false }) {
  const root = document.documentElement;
  const lines = document.querySelectorAll('.hero__title .ln__in');
  const fade = ['.nav', '.hero__foot', '.hero__scroll'];
  root.classList.remove('is-loading');
  if (reduced) { document.querySelector('.hero__title').classList.add('is-open'); return gsap.timeline(); }
  const vh = window.innerHeight;
  const w = world.intro;
  w.sky = vh * 0.06; w.ridge = vh * 0.12; w.strip = vh * 0.22;
  gsap.set(lines, { yPercent: 108 });
  gsap.set(fade, { opacity: 0.001, y: 12 }); // quase zero: continua rasterizado (zero faria o 1º quadro visível pesar)
  const tl = gsap.timeline();
  tl.fromTo('.world__sky', { opacity: 0.001 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
    .to(w, { sky: 0, duration: 2.4, ease: 'expo.out' }, 0)
    .fromTo('.world__ridges', { opacity: 0.001 }, { opacity: 1, duration: 1.1, ease: 'power2.out' }, 0.12)
    .to(w, { ridge: 0, duration: 2.2, ease: 'expo.out' }, 0.12)
    .fromTo(['.world__strip', '.world__decor'], { opacity: 0.001 }, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.26)
    .to(w, { strip: 0, duration: 2.0, ease: 'expo.out' }, 0.26)
    .to(lines, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.09 }, 0.45)
    .add(() => document.querySelector('.hero__title').classList.add('is-open'), 1.5)
    .to(fade, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }, 1.0);
  return tl;
}

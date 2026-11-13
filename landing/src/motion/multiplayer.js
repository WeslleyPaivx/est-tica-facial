// Depoimentos: o cursor de cada pessoa chega voando e "toca" o frame da própria citação.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function multiplayer({ reduced = false } = {}) {
  const quotes = document.querySelectorAll('.quote');
  if (reduced) { quotes.forEach((q) => q.classList.add('is-touched')); return; }
  quotes.forEach((q, i) => {
    const mp = q.querySelector('.mp');
    const dir = i % 2 ? -1 : 1;
    gsap.set(mp, { x: 140 * dir, y: 90, opacity: 0 });
    ScrollTrigger.create({
      trigger: q, start: 'top 78%', once: true,
      onEnter: () => {
        gsap.timeline({ delay: 0.35 + i * 0.18 })
          .to(mp, { opacity: 1, duration: 0.3 }, 0)
          .to(mp, { x: 0, duration: 1.2, ease: 'power3.inOut' }, 0)
          .to(mp, { y: 0, duration: 1.2, ease: 'expo.inOut' }, 0)
          .add(() => q.classList.add('is-touched'), '-=0.15')
          .to(mp, { x: '+=3', y: '-=4', duration: 2 + i * 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      },
    });
  });
}

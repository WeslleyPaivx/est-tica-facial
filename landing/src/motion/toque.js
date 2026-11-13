// No toque, o mesmo estado de clique do mouse: .apertou entra 70 ms depois do dedo (um arrasto que começa num botão
// não faz ele piscar) e sai logo depois de soltar.
export function toque() {
  const alvos = '.botao, .chip, .nav__link, .nav__logo, .nota, .logos__item, .periodo__op, .depo__rosto, .social';
  let el = null, t = 0, x0 = 0, y0 = 0;
  addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    el = e.target.closest(alvos);
    if (!el) return;
    x0 = e.clientX; y0 = e.clientY;
    t = setTimeout(() => el?.classList.add('apertou'), 70);
  }, { passive: true });
  addEventListener('pointermove', (e) => {
    if (el && Math.hypot(e.clientX - x0, e.clientY - y0) > 8) { clearTimeout(t); el.classList.remove('apertou'); el = null; }
  }, { passive: true });
  const solta = () => {
    clearTimeout(t);
    const alvo = el; el = null;
    if (alvo) setTimeout(() => alvo.classList.remove('apertou'), 140);
  };
  addEventListener('pointerup', solta, { passive: true });
  addEventListener('pointercancel', solta, { passive: true });
}

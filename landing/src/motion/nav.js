// Nav: ganha vidro depois do topo; some ao descer e volta ao subir.
export function nav({ getScroll = () => window.scrollY } = {}) {
  const el = document.querySelector('[data-nav]');
  let last = 0;
  return () => {
    const y = getScroll();
    el.classList.toggle('is-scrolled', y > 40);
    if (Math.abs(y - last) > 6) {
      el.classList.toggle('is-hidden', y > last && y > window.innerHeight * 0.6);
      last = y;
    }
  };
}

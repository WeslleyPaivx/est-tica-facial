// Rolagem suave com Lenis só no desktop (mouse ou trackpad); no toque e com movimento reduzido, a rolagem é a nativa.
// A posição continua sendo o scrollY da página. Quem segue a rolagem (camadas do hero, nav, rodapé) recebe o scrollY:
// com o Lenis, no aviso dele; sem ele, num laço de rAF que dorme quando a página para e acorda no evento de scroll.
// Os links de âncora (#produto, #precos...) também deslizam até a seção.
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const mq = matchMedia('(prefers-reduced-motion: reduce)');
export const reduzido = () => mq.matches;

const desktop = matchMedia('(hover: hover) and (pointer: fine)').matches;
export const lenis = desktop && !reduzido() ? new Lenis({ autoRaf: true, lerp: 0.1, anchors: true }) : null;

const quem = new Set();
let vivo = false;
let ultimo = -1;
function aplica() {
  const y = scrollY;
  if (y === ultimo) return false;
  ultimo = y;
  for (const f of quem) f(y);
  return true;
}
function laco() {
  if (aplica()) requestAnimationFrame(laco);
  else vivo = false;
}
// O Lenis move a página dentro do próprio quadro e o evento de scroll só chega no quadro seguinte: com ele, quem segue
// a rolagem roda no aviso do Lenis (que também avisa da rolagem nativa: teclado, barra), no mesmo quadro da página.
lenis?.on('scroll', aplica);
export function acorda() {
  if (vivo) return;
  vivo = true;
  ultimo = -1;
  requestAnimationFrame(laco);
}
/** fn(scrollY) roda a cada quadro em que a página andou */
export function rolagem(fn) {
  quem.add(fn);
  fn(scrollY);
}

// .is-scrolling: rolando com o cursor parado, o hover não acende (é assim que a prévia é gravada).
// Sai no primeiro movimento real do mouse (o Safari zera movementX, então compara a posição).
const html = document.documentElement;
let px = -1, py = -1;
addEventListener('scroll', () => { html.classList.add('is-scrolling'); if (!lenis) acorda(); }, { passive: true });
addEventListener('resize', acorda, { passive: true });
addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  if (px >= 0 && Math.abs(e.clientX - px) + Math.abs(e.clientY - py) > 2) html.classList.remove('is-scrolling');
  px = e.clientX; py = e.clientY;
}, { passive: true });

/** espera ms milissegundos */
export const espera = (ms) => new Promise((r) => setTimeout(r, ms));

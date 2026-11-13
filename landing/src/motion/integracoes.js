// Integrações: os apps em volta da Zaniva, ligados por fios curvos (desenhados aqui a partir das posições de design).
// Sozinho, um fio por vez acende em laranja e uma luz corre por ele: do app para a Zaniva (dado entrando) ou da Zaniva
// para o app (ação saindo, o app ganha um check). No hover, o fio do app acende e o nome aparece.
import { reduzido, espera } from './rolagem.js';

// No celular o palco fica em pé (600 × 700): outras posições (data-xm, data-ym) e outro centro, redesenhados ao virar
// a tela.
const PALCO = { w: 1200, h: 480, hub: { x: 600, y: 218 } };
const PALCO_CELULAR = { w: 600, h: 700, hub: { x: 300, y: 300 } };
const celular = matchMedia('(max-width: 760px)');
const NS = 'http://www.w3.org/2000/svg';

export function integracoes() {
  const palco = document.querySelector('[data-integra]');
  if (!palco) return;
  const svg = palco.querySelector('[data-fios]');
  const hub = palco.querySelector('.integra__hub');
  const tiles = [...palco.querySelectorAll('.app-tile')];

  const fios = tiles.map((t) => {
    const p = document.createElementNS(NS, 'path');
    svg.append(p);
    t.addEventListener('pointerenter', () => p.classList.add('aceso'));
    t.addEventListener('pointerleave', () => { if (!p.dataset.vivo) p.classList.remove('aceso'); });
    return p;
  });
  const desenha = () => {
    const cel = celular.matches;
    const { w, h, hub: c } = cel ? PALCO_CELULAR : PALCO;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    tiles.forEach((t, i) => {
      const x = +(cel ? t.dataset.xm : t.dataset.x), y = +(cel ? t.dataset.ym : t.dataset.y);
      t.style.left = `${x}px`;
      t.style.top = `${y}px`;
      const meio = (x + c.x) / 2;
      fios[i].setAttribute('d', `M${x} ${y} C${meio} ${y} ${meio} ${c.y} ${c.x} ${c.y}`);
    });
  };
  desenha();
  celular.addEventListener('change', desenha);
  const luz = document.createElementNS(NS, 'circle');
  luz.setAttribute('r', '5');
  luz.style.opacity = '0';
  svg.append(luz);

  // estado parado (o do conceito): pagamentos entrando, loja virtual com o check
  const nome = (n) => tiles.findIndex((t) => t.dataset.nome === n);
  const fixo = [nome('Pagamentos'), nome('Loja virtual')];
  fixo.forEach((i) => fios[i].classList.add('aceso'));
  tiles[nome('Loja virtual')].classList.add('feito');
  if (reduzido()) return;

  let visivel = false;
  new IntersectionObserver(([e]) => (visivel = e.isIntersecting), { threshold: 0.25 }).observe(palco);
  const quando = async () => { while (!visivel || document.hidden) await espera(350); };

  const corre = (path, dur, volta) => new Promise((res) => {
    const L = path.getTotalLength();
    const t0 = performance.now();
    luz.style.opacity = '1';
    const q = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const pt = path.getPointAtLength((volta ? 1 - e : e) * L);
      luz.setAttribute('cx', pt.x.toFixed(1));
      luz.setAttribute('cy', pt.y.toFixed(1));
      if (k < 1) requestAnimationFrame(q); else { luz.style.opacity = '0'; res(); }
    };
    requestAnimationFrame(q);
  });

  (async () => {
    await espera(900);
    fixo.forEach((i) => fios[i].classList.remove('aceso'));
    tiles.forEach((t) => t.classList.remove('feito'));
    const ordem = [4, 10, 0, 7, 2, 11, 5, 1, 9, 3, 8, 6];
    let k = 0;
    for (;;) {
      await quando();
      const i = ordem[k % ordem.length];
      const saida = k % 2 === 1; // alterna: entra um dado, sai uma ação
      const p = fios[i];
      p.dataset.vivo = '1';
      p.classList.add('aceso');
      await corre(p, 1100, saida);
      if (saida) {
        tiles[i].classList.add('feito');
        setTimeout(() => tiles[i].classList.remove('feito'), 2200);
      } else {
        hub.classList.remove('recebe'); void hub.offsetWidth; hub.classList.add('recebe');
      }
      setTimeout(() => { delete p.dataset.vivo; p.classList.remove('aceso'); }, 1400);
      k += 1;
      await espera(500);
    }
  })();
}

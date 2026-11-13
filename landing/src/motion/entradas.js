// Texto e blocos entram por marco: uma vez, com duração fixa, quando o topo passa de 88% da tela. A checagem é pela
// posição a cada quadro de rolagem (rolando 1200 px a cada 80 ms um bloco atravessa a tela entre dois quadros e um
// IntersectionObserver não o veria). Quem já passou da tela entra direto no estado final.
import { rolagem } from './rolagem.js';

export function entradas() {
  const fila = new Set(document.querySelectorAll('[data-entra], [data-titulo]'));
  // o texto do hero entra pelo hero.js (com a paisagem carregada)
  for (const el of fila) if (el.closest('.hero__texto')) fila.delete(el);
  const confere = () => {
    if (!fila.size) return;
    const h = innerHeight;
    for (const el of fila) {
      const r = el.getBoundingClientRect();
      if (r.top < h * 0.88) {
        // passou direto (rolagem rápida): entra sem esperar o atraso
        if (r.bottom < 0) el.style.setProperty('--atraso', '0s');
        el.classList.add('entrou');
        fila.delete(el);
      }
    }
  };
  rolagem(confere);
  // Tab caindo num bloco que ainda não entrou: entra na hora
  document.addEventListener('focusin', (e) => {
    const el = e.target.closest?.('[data-entra], [data-titulo]');
    if (el && fila.has(el)) { el.classList.add('entrou'); fila.delete(el); }
  });
}

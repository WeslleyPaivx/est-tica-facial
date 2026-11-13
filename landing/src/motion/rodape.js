// Rodapé: o nome gigante sobe de trás da copa quando chega à tela (por marco, uma vez).
import { rolagem } from './rolagem.js';

export function rodape() {
  const g = document.querySelector('[data-gigante]');
  if (!g) return;
  // o pingo do i é um nó redondo: fica em cima do ı (medido depois que a fonte carrega)
  const texto = g.querySelector('[data-gigante-texto]');
  const pingo = g.querySelector('[data-gigante-pingo]');
  const poe = () => {
    try {
      const b = texto.getExtentOfChar(3);
      pingo.setAttribute('cx', (b.x + b.width / 2).toFixed(1));
      pingo.setAttribute('cy', (b.y + b.height * 0.2).toFixed(1));
    } catch { /* sem layout ainda */ }
  };
  poe();
  document.fonts?.ready.then(poe);
  let foi = false;
  rolagem(() => {
    if (foi) return;
    if (g.getBoundingClientRect().top < innerHeight * 0.92) { g.classList.add('entrou'); foi = true; }
  });
}

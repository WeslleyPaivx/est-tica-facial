import { rolagem } from './rolagem.js';

// A nav sai para cima quando o rodapé encosta nela: o rodapé (grade + nome gigante) é mais alto que a tela de um
// notebook menos a nav, e o vidro dela por cima da linha do logo repetiria o "Zaniva". Volta quando o rodapé desce.
export function nav() {
  const el = document.querySelector('[data-nav]');
  if (!el) return;
  const rodape = document.querySelector('.rodape');
  let limite = Infinity;
  const mede = () => {
    if (rodape) limite = rodape.getBoundingClientRect().top + scrollY - el.offsetHeight;
  };
  mede();
  new ResizeObserver(mede).observe(document.body);
  rolagem((y) => {
    el.classList.toggle('rolou', y > 24);
    el.classList.toggle('saiu', y > limite);
  });
  requestAnimationFrame(() => el.classList.add('entrou'));
}

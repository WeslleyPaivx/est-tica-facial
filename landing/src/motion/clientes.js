// Clientes: três depoimentos que trocam pelos rostos (clique, toque ou setas) e sozinhos a cada 8 s com o card na
// tela. Parar o mouse em cima do card pausa a troca automática.
import { reduzido, espera } from './rolagem.js';

const DEPOS = [
  {
    nome: 'Marina Couto', cargo: 'Gerente de operações, Ateliê Linho', foto: 'marina',
    frase: '“Trocamos catorze planilhas por seis fluxos. O cadastro de um cliente novo caiu de dois dias para nove minutos.”',
    numeros: [['–72%', 'de tempo em tarefas manuais'], ['9 min', 'para cadastrar um cliente'], ['99,9%', 'das execuções sem erro']],
  },
  {
    nome: 'Rafael Nunes', cargo: 'Diretor financeiro, Studio Raiz', foto: 'rafa',
    frase: '“A cobrança saía no braço todo dia 5. Agora a Zaniva emite, envia e avisa quem atrasou, e eu só confiro o relatório.”',
    numeros: [['–38%', 'de inadimplência no trimestre'], ['0', 'boletos emitidos à mão'], ['6 h', 'a menos de trabalho por semana']],
  },
  {
    nome: 'Nina Albuquerque', cargo: 'Coordenadora de pessoas, Casa Nômade', foto: 'nina',
    frase: '“A admissão tinha onze etapas e três planilhas. Hoje quem chega recebe tudo no primeiro dia, sem ninguém correr atrás.”',
    numeros: [['1 dia', 'para admitir uma pessoa'], ['11 → 2', 'etapas feitas à mão'], ['100%', 'dos documentos conferidos']],
  },
];

export function clientes() {
  const card = document.querySelector('[data-depo]');
  if (!card) return;
  const frase = card.querySelector('[data-depo-frase]');
  const nome = card.querySelector('[data-depo-nome]');
  const cargo = card.querySelector('[data-depo-cargo]');
  const foto = card.querySelector('[data-depo-foto]');
  const numeros = [...card.querySelectorAll('[data-depo-numeros] li')];
  const rostos = [...document.querySelectorAll('.depo__rosto')];
  let atual = 0;
  let trocando = false;

  const mostra = async (i, foco = false) => {
    if (i === atual || trocando) return;
    trocando = true;
    atual = i;
    rostos.forEach((r, k) => { r.setAttribute('aria-selected', String(k === i)); r.tabIndex = k === i ? 0 : -1; });
    if (foco) rostos[i].focus();
    const d = DEPOS[i];
    if (!reduzido()) { card.classList.add('trocando'); await espera(420); }
    frase.textContent = d.frase;
    nome.textContent = d.nome;
    cargo.textContent = d.cargo;
    foto.src = `/img/avatar/${d.foto}.webp`;
    numeros.forEach((li, k) => {
      li.querySelector('strong').textContent = d.numeros[k][0];
      li.querySelector('span').textContent = d.numeros[k][1];
    });
    card.classList.remove('trocando');
    trocando = false;
  };

  let pausa = 0;
  rostos.forEach((r, k) => {
    r.tabIndex = k === 0 ? 0 : -1;
    r.addEventListener('click', () => { pausa = performance.now() + 15000; mostra(k); });
    r.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      pausa = performance.now() + 15000;
      mostra((k + (e.key === 'ArrowRight' ? 1 : -1) + rostos.length) % rostos.length, true);
    });
  });
  let emCima = false;
  card.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') emCima = true; });
  card.addEventListener('pointerleave', () => (emCima = false));

  if (reduzido()) return;
  let visivel = false;
  new IntersectionObserver(([e]) => (visivel = e.isIntersecting), { threshold: 0.4 }).observe(card);
  (async () => {
    for (;;) {
      await espera(8000);
      if (!visivel || document.hidden || emCima || performance.now() < pausa) continue;
      mostra((atual + 1) % DEPOS.length);
    }
  })();
}

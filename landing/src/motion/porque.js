// "Por que": três colegas mexendo no mesmo fluxo. O Caio liga um bloco no outro (o fio se desenha), o Davi pega um
// bloco e arrasta um pouco, a Nina digita e o balão troca de frase. Só anima com o card na tela.
import { reduzido, espera } from './rolagem.js';

const FRASES = ['pode publicar!', 'ficou claro agora', 'testei, tá rodando'];

export function porque() {
  const raiz = document.querySelector('[data-ilustra]');
  if (!raiz || reduzido()) return;
  const q = (s) => raiz.querySelector(s);
  const caio = q('[data-colega="caio"]');
  const davi = q('[data-colega="davi"]');
  const balao = q('[data-balao]');
  const balaoTxt = q('[data-balao-txt]');
  const blocoB = q('[data-bloco="b"]');
  const fio = q('[data-fio-ilustra]');
  let visivel = false;
  new IntersectionObserver(([e]) => (visivel = e.isIntersecting), { threshold: 0.2 }).observe(raiz);
  const quandoVisivel = async () => { while (!visivel || document.hidden) await espera(400); };
  const vai = (el, x, y) => { el.style.left = `${x}px`; el.style.top = `${y}px`; };

  async function caioLiga() {
    for (;;) {
      await quandoVisivel();
      vai(caio, 206, 330);                    // vai até o bloco laranja
      await espera(1700);
      fio.style.transition = 'none';
      fio.style.strokeDashoffset = '220';
      void fio.getBoundingClientRect();
      fio.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.65, 0, 0.35, 1)';
      vai(caio, 300, 248);                    // puxa o fio até o bloco de cima
      fio.style.strokeDashoffset = '0';
      await espera(2600);
      vai(caio, 196, 196);
      await espera(3400);
    }
  }

  async function daviArrasta() {
    await espera(1200);
    for (;;) {
      await quandoVisivel();
      vai(davi, 86, 360);
      await espera(1700);
      blocoB.classList.add('pega');
      blocoB.style.transform = 'translate(14px, -10px)';
      vai(davi, 100, 350);
      await espera(1500);
      blocoB.style.transform = '';
      vai(davi, 86, 360);
      await espera(700);
      blocoB.classList.remove('pega');
      vai(davi, 112, 384);
      await espera(3800);
    }
  }

  async function ninaFala() {
    let i = 0;
    for (;;) {
      await quandoVisivel();
      await espera(2600);
      balao.classList.add('some');
      await espera(450);
      balao.classList.add('digitando');
      balao.classList.remove('some');
      await espera(1500);
      i = (i + 1) % FRASES.length;
      balaoTxt.textContent = FRASES[i];
      balao.classList.remove('digitando');
      await espera(2400);
    }
  }

  caioLiga();
  daviArrasta();
  ninaFala();
}

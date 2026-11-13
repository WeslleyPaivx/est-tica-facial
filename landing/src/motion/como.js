// "Como funciona": cada passo tem um pedaço de interface que se mexe sozinho, só com o card na tela.
// 1. os três fios acendem até a Zaniva e a chave vira "Conectado"; 2. a Lu arrasta um bloco até o encaixe e o fio novo
// se desenha; 3. "Refazer" é apertado, a execução que falhou fica verde e uma nova entra no topo.
import { reduzido, espera } from './rolagem.js';

const vigia = (el) => {
  const estado = { visivel: false };
  new IntersectionObserver(([e]) => (estado.visivel = e.isIntersecting), { threshold: 0.35 }).observe(el);
  estado.quando = async () => { while (!estado.visivel || document.hidden) await espera(350); };
  return estado;
};

function conecta(fig) {
  const fios = [...fig.querySelectorAll('[data-fio-passo]')];
  const chave = fig.querySelector('[data-chave]');
  const txt = fig.querySelector('[data-chave-txt]');
  const v = vigia(fig);
  (async () => {
    for (;;) {
      await v.quando();
      for (const f of fios) {
        f.style.transition = 'none'; f.style.strokeDashoffset = '140'; void f.getBoundingClientRect();
        f.style.transition = 'stroke-dashoffset 0.9s cubic-bezier(0.65, 0, 0.35, 1), stroke 0.4s';
        f.classList.add('aceso'); f.style.strokeDashoffset = '0';
        await espera(420);
      }
      await espera(500);
      chave.classList.add('ligada'); txt.textContent = 'Conectado';
      await espera(3600);
      fios.forEach((f) => f.classList.remove('aceso'));
      chave.classList.remove('ligada'); txt.textContent = 'Conectar';
      await espera(900);
    }
  })();
}

function monta(fig) {
  const bloco = fig.querySelector('[data-arrasta]');
  const cursor = fig.querySelector('[data-colega-mini]');
  const fantasma = fig.querySelector('.bloco--fantasma');
  const fio = fig.querySelector('[data-fio-novo]');
  const v = vigia(fig);
  const vai = (el, x, y) => { el.style.left = `${x}px`; el.style.top = `${y}px`; };
  (async () => {
    for (;;) {
      await v.quando();
      vai(cursor, 282, 182);                 // chega no bloco solto
      await espera(1300);
      bloco.classList.add('pega');
      await espera(300);
      vai(bloco, 40, 174); vai(cursor, 144, 196); // arrasta até o encaixe
      await espera(1250);
      bloco.classList.remove('pega');
      fantasma.style.opacity = '0';
      fio.classList.add('desenhado');
      vai(cursor, 210, 120);
      await espera(3200);
      // volta ao começo sem animação de volta do bloco (ele "some" e volta solto)
      bloco.style.opacity = '0';
      await espera(400);
      bloco.style.transition = 'none'; vai(bloco, 196, 160); void bloco.offsetWidth; bloco.style.transition = '';
      fio.classList.remove('desenhado'); fantasma.style.opacity = '';
      bloco.style.opacity = '';
      vai(cursor, 268, 190);
      await espera(1200);
    }
  })();
}

function acompanha(fig) {
  const lista = fig.querySelector('[data-lista-exec]');
  const v = vigia(fig);
  (async () => {
    for (;;) {
      await v.quando();
      await espera(1400);
      const erro = lista.querySelector('[data-erro]');
      const refaz = erro?.querySelector('[data-refaz]');
      if (refaz) {
        refaz.classList.add('aperta');
        await espera(220);
        refaz.classList.remove('aperta');
        await espera(500);
        const i = erro.querySelector('i');
        i.className = 'ok'; i.innerHTML = '<svg><use href="#i-check"/></svg>';
        erro.classList.remove('erro'); erro.removeAttribute('data-erro');
        refaz.className = ''; refaz.removeAttribute('data-refaz'); refaz.textContent = 'agora';
      }
      await espera(2400);
      // uma execução nova entra no topo; a mais antiga sai; de vez em quando uma falha para refazer
      const nova = lista.firstElementChild.cloneNode(true);
      const falha = Math.random() < 0.5;
      nova.classList.add('nova');
      if (falha) {
        nova.classList.add('erro'); nova.dataset.erro = '';
        nova.querySelector('i').className = 'nao';
        nova.querySelector('i').innerHTML = '<svg><use href="#i-x"/></svg>';
        nova.querySelector('span').className = 'mini__refaz'; nova.querySelector('span').dataset.refaz = '';
        nova.querySelector('span').textContent = 'Refazer';
      } else {
        nova.removeAttribute('data-erro'); nova.classList.remove('erro');
        nova.querySelector('span').textContent = 'agora';
      }
      [...lista.children].forEach((li) => { const s = li.querySelector('span'); if (s.textContent === 'agora') s.textContent = '1 min'; });
      lista.prepend(nova);
      lista.lastElementChild.remove();
      setTimeout(() => nova.classList.remove('nova'), 800);
    }
  })();
}

export function como() {
  if (reduzido()) {
    document.querySelector('[data-chave]')?.classList.add('ligada');
    return;
  }
  const f1 = document.querySelector('[data-passo="conecta"]');
  const f2 = document.querySelector('[data-passo="monta"]');
  const f3 = document.querySelector('[data-passo="acompanha"]');
  if (f1) conecta(f1);
  if (f2) monta(f2);
  if (f3) acompanha(f3);
}

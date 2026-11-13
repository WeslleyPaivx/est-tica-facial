// O fluxo do hero roda sozinho: o gatilho pisca, uma luz anda pelo fio até "Validar", os campos ganham check um a um,
// o caminho "se válido" acende até a ação (alterna plano anual e mensal), o contador de execuções sobe, um aviso
// confirma e o cliente da vez entra na lista de execuções do pé da tela. A Bia passeia pela tela. Só anima com o painel na tela; com movimento reduzido fica no estado final.
import { reduzido, espera } from './rolagem.js';

const CAMINHOS = [
  { acao: 'anual', fios: ['v-anual', 'anual-erp', 'erp-bv'], nos: ['anual', 'erp', 'boas-vindas'], tempo: '1,2' },
  { acao: 'mensal', fios: ['v-mensal', 'mensal-bv'], nos: ['mensal', 'boas-vindas'], tempo: '0,9' },
];
// por onde a Bia anda (px de design da tela) e o que ela diz em cada parada
// clientes que entram pelo gatilho, um por volta
const CLIENTES = ['Ateliê Linho', 'Studio Raiz', 'Casa Nômade', 'Ótica Prisma', 'Café do Largo', 'Tinturaria Vila'];
const BIA = [
  { x: 112, y: 322, txt: 'ficou redondo' },
  { x: 330, y: 418, txt: 'testei o mensal' },
  { x: 498, y: 40, txt: 'ERP conectado' },
  { x: 236, y: 470, txt: 'ficou redondo' },
];

export function painel() {
  const app = document.querySelector('[data-app]');
  if (!app) return {};
  // no toque o painel é só vitrine: os controles miúdos da maquete não pegam o dedo de quem está rolando
  if (matchMedia('(hover: none)').matches) app.inert = true;
  const q = (s) => app.querySelector(s);
  const luz = q('[data-luz]');
  const fio = (n) => q(`[data-fio="${n}"]`);
  const no = (n) => q(`[data-no="${n}"]`);
  const campos = [...app.querySelectorAll('[data-campo]')];
  const contador = q('[data-execucoes]');
  const aviso = q('[data-aviso]');
  const avisoTxt = q('[data-aviso-txt]');
  const salvo = q('[data-salvo]');
  const ponto = q('[data-ponto]');
  const bia = q('[data-cursor-bia]');
  const biaTxt = q('[data-bia-txt]');
  const etiqueta = bia.querySelector('.cursor__etiqueta');
  const zoomValor = q('[data-zoom-valor]');
  const mundo = q('[data-mundo]');
  const log = q('[data-log]');
  let execucoes = 1284;
  let volta = 0;
  let visivel = true;

  // estado final (movimento reduzido e antes da primeira volta)
  const final = () => {
    campos.forEach((c) => c.classList.add('ok'));
    ['anual', 'erp', 'boas-vindas'].forEach((n) => no(n).classList.add('feito'));
  };
  if (reduzido()) { final(); return {}; }

  new IntersectionObserver(([e]) => (visivel = e.isIntersecting), { rootMargin: '80px' }).observe(app);
  const quandoVisivel = async () => { while (!visivel || document.hidden) await espera(400); };

  // a luz anda pelo fio (devagar nas pontas)
  const anda = (path, dur) => new Promise((res) => {
    const L = path.getTotalLength();
    const t0 = performance.now();
    path.classList.add('fio--aceso');
    luz.style.opacity = 1;
    const quadro = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const p = path.getPointAtLength(e * L);
      luz.setAttribute('cx', p.x.toFixed(1));
      luz.setAttribute('cy', p.y.toFixed(1));
      if (k < 1) requestAnimationFrame(quadro); else res();
    };
    requestAnimationFrame(quadro);
  });

  const limpa = () => {
    app.querySelectorAll('.fio--aceso').forEach((f) => f.classList.remove('fio--aceso'));
    app.querySelectorAll('.no.aceso, .no.feito').forEach((n) => n.classList.remove('aceso', 'feito'));
    campos.forEach((c) => c.classList.remove('ok'));
    ponto.classList.remove('vivo');
  };

  async function rodada() {
    const cam = CAMINHOS[volta % CAMINHOS.length];
    limpa();
    await espera(700);
    ponto.classList.add('vivo');
    no('gatilho').classList.add('aceso');
    await espera(450);
    await anda(fio('g-v'), 800);
    no('gatilho').classList.remove('aceso');
    for (const c of campos) { c.classList.add('ok'); await espera(240); }
    for (let i = 0; i < cam.fios.length; i++) {
      await anda(fio(cam.fios[i]), 720);
      const n = no(cam.nos[i]);
      n.classList.add('aceso', 'feito');
      setTimeout(() => n.classList.remove('aceso'), 900);
      await espera(160);
    }
    luz.style.opacity = 0;
    execucoes += 1;
    contador.textContent = execucoes.toLocaleString('pt-BR');
    // o cliente da vez entra na lista; os outros envelhecem
    const idade = ['agora', '1 min', '3 min', '6 min'];
    [...log.children].forEach((li, i) => (li.querySelector('span').textContent = idade[i + 1] ?? `${i * 3 + 3} min`));
    const novo = log.firstElementChild.cloneNode(true);
    novo.childNodes[1].textContent = CLIENTES[volta % CLIENTES.length];
    novo.querySelector('span').textContent = 'agora';
    novo.classList.add('nova');
    log.prepend(novo);
    if (log.children.length > 3) log.lastElementChild.remove();
    avisoTxt.textContent = `Execução nº ${execucoes.toLocaleString('pt-BR')} concluída em ${cam.tempo} s`;
    aviso.classList.add('mostra');
    salvo.classList.add('girou');
    await espera(2600);
    aviso.classList.remove('mostra');
    salvo.classList.remove('girou');
    await espera(900);
    volta += 1;
  }

  async function passeio() {
    let i = 0;
    for (;;) {
      await quandoVisivel();
      i = (i + 1) % BIA.length;
      const p = BIA[i];
      bia.style.left = `${p.x}px`;
      bia.style.top = `${p.y}px`;
      await espera(1500);
      if (biaTxt.textContent !== p.txt) {
        etiqueta.classList.add('troca');
        await espera(180);
        biaTxt.textContent = p.txt;
        etiqueta.classList.remove('troca');
      }
      await espera(2600 + Math.random() * 1200);
    }
  }

  // zoom − / +: só o número e a escala do mundo (60% a 120%)
  let zoom = 80;
  app.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => {
    zoom = Math.max(60, Math.min(120, zoom + 10 * +b.dataset.zoom));
    zoomValor.textContent = `${zoom}%`;
    mundo.style.transform = `scale(${(zoom / 80).toFixed(3)})`;
  }));
  // clicar num nó seleciona ele
  app.querySelectorAll('.no').forEach((n) => n.addEventListener('click', () => {
    app.querySelectorAll('.no--selecionado').forEach((s) => s.classList.remove('no--selecionado'));
    n.classList.add('no--selecionado');
  }));

  let comecou = false;
  return {
    comeca() {
      if (comecou) return;
      comecou = true;
      (async () => { for (;;) { await quandoVisivel(); await rodada(); } })();
      setTimeout(passeio, 1800);
    },
  };
}

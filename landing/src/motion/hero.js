// Hero: a entrada ao carregar e as camadas no scroll.
// Céu e morros andam a 0,5 da página, a copa a 0,86, e o painel e o texto a 1,22: relativo à copa, o painel sobe
// 0,36 px por px rolado e sai quase inteiro de trás das árvores em ~650 px (as copas mais altas seguram o pé dele), antes de chegar ao degradê do pé (hero::after,
// parado, que garante o preto na emenda com a seção seguinte). A copa sobe mais rápido que os morros, então nunca
// descobre o que está atrás dela.
// No celular a copa quase acompanha a página (0,94): a crista nunca desce até a frase dos logos, então o painel não
// passa por trás dela, e ele ainda sai das árvores a 0,28 px por px rolado.
import { rolagem, reduzido } from './rolagem.js';

const VEL = { fundo: 0.5, copa: 0.14, painel: -0.22, texto: -0.22 }; // translateY = k × scrollY
const VEL_CELULAR = { ...VEL, copa: 0.06 };
const celular = matchMedia('(max-width: 760px)');

export function hero({ aoEntrar } = {}) {
  const el = document.querySelector('[data-hero]');
  if (!el) return;
  const camadas = Object.keys(VEL).map((nome) => ({ el: el.querySelector(`[data-camada="${nome}"]`), nome }));
  const textos = el.querySelectorAll('.hero__texto [data-entra], .hero__texto [data-titulo]');

  // o painel começa no lugar de design (532; 574 no celular) ou logo abaixo do texto, se o texto (que tem piso de
  // tamanho) passar dali em telas baixas ou estreitas. A copa e a paisagem seguem o topo do painel pelo CSS.
  const texto = el.querySelector('.hero__texto');
  const sonda = document.createElement('i');
  sonda.style.cssText = 'position:absolute;visibility:hidden;width:0;height:calc(var(--hu) * 1000)';
  el.append(sonda);
  const ajusta = () => {
    el.style.removeProperty('--painel-topo');
    const hu = sonda.offsetHeight / 1000;
    const base = matchMedia('(max-width: 760px)').matches ? 574 : 532;
    const fim = texto.offsetTop + texto.offsetHeight + 44 * hu;
    if (fim > base * hu) el.style.setProperty('--painel-topo', `${fim.toFixed(1)}px`);
  };
  ajusta();
  addEventListener('resize', ajusta, { passive: true });
  document.fonts?.ready.then(ajusta);

  // entra quando as duas imagens da paisagem estão prontas (ou em 1,2 s, o que vier primeiro)
  const imgs = [...el.querySelectorAll('.hero__paisagem, .hero__copa-img')];
  const prontas = Promise.all(imgs.map((i) => (i.complete ? Promise.resolve() : i.decode().catch(() => {}))));
  Promise.race([prontas, new Promise((r) => setTimeout(r, 1200))]).then(() => {
    requestAnimationFrame(() => {
      el.classList.add('entrou');
      textos.forEach((t) => t.classList.add('entrou'));
      aoEntrar?.();
    });
  });

  if (reduzido()) return;
  let altura = el.offsetHeight;
  addEventListener('resize', () => (altura = el.offsetHeight), { passive: true });
  rolagem((y) => {
    if (y > altura + 200) return;
    const vel = celular.matches ? VEL_CELULAR : VEL;
    for (const c of camadas) c.el.style.transform = `translate3d(0, ${(vel[c.nome] * y).toFixed(2)}px, 0)`;
  });
}

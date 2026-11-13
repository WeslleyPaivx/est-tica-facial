// Peças desenhadas num tamanho fixo (o painel em 1180, a ilustração em 520) e reduzidas inteiras, como um print:
// --escala = largura do contêiner ÷ largura de design. Quando a peça muda de desenho no celular (o painel sem o menu
// lateral, o palco das integrações em pé), o CSS dá a largura de design dela em --de, que vence a do HTML.
export function escala() {
  const pecas = [
    ...[...document.querySelectorAll('[data-moldura]')].map((el) => ({ el, alvo: el, w: 1180 })),
    ...[...document.querySelectorAll('[data-escala-de]')].map((el) => ({ el: el.parentElement, alvo: el, w: +el.dataset.escalaDe })),
  ];
  const de = (p) => parseFloat(getComputedStyle(p.alvo).getPropertyValue('--de')) || p.w;
  const ro = new ResizeObserver(() => {
    for (const p of pecas) p.alvo.style.setProperty('--escala', (p.el.clientWidth / de(p)).toFixed(4));
  });
  for (const p of pecas) ro.observe(p.el);
}

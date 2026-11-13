// Planos: o alternador mensal/anual. O fundo branco desliza para a opção, os preços trocam com o número novo subindo
// (o anual mostra o valor por mês, 20% menor). Setas do teclado trocam como num grupo de rádio.
export function planos() {
  const grupo = document.querySelector('[data-periodo]');
  if (!grupo) return;
  const ops = [...grupo.querySelectorAll('[data-op]')];
  const fundo = grupo.querySelector('.periodo__fundo');
  const precos = [...document.querySelectorAll('[data-preco]')];

  const posiciona = (op) => {
    grupo.style.setProperty('--w', `${op.offsetWidth}px`);
    grupo.style.setProperty('--x', `${op.offsetLeft - 4}px`);
  };
  const escolhe = (op, foco = false) => {
    if (op.getAttribute('aria-checked') === 'true') return;
    ops.forEach((o) => {
      const sim = o === op;
      o.setAttribute('aria-checked', String(sim));
      o.tabIndex = sim ? 0 : -1;
    });
    posiciona(op);
    if (foco) op.focus();
    const per = op.dataset.op;
    for (const p of precos) {
      const novo = p.dataset[per];
      if (p.textContent === novo) continue;
      p.textContent = novo;
      p.classList.remove('preco-troca'); void p.offsetWidth; p.classList.add('preco-troca');
    }
  };
  ops.forEach((o, i) => {
    o.tabIndex = o.getAttribute('aria-checked') === 'true' ? 0 : -1;
    o.addEventListener('click', () => escolhe(o));
    o.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      escolhe(ops[(i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + ops.length) % ops.length], true);
    });
  });
  const inicial = () => posiciona(ops.find((o) => o.getAttribute('aria-checked') === 'true'));
  inicial();
  document.fonts?.ready.then(inicial);
  new ResizeObserver(inicial).observe(grupo);
}

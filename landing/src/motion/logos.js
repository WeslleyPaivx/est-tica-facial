// No celular a faixa de logos rola sozinha: a lista é duplicada (a cópia fica fora da leitura de tela).
export function logos() {
  const lista = document.querySelector('.logos');
  if (!lista || lista.dataset.dobrou) return;
  const mq = matchMedia('(max-width: 760px)');
  const aplica = () => {
    if (!mq.matches || lista.dataset.dobrou) return;
    for (const li of [...lista.children]) {
      const c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.removeAttribute('tabindex');
      lista.append(c);
    }
    lista.dataset.dobrou = '1';
  };
  aplica();
  mq.addEventListener('change', aplica);
}

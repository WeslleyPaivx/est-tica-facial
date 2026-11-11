# Prova — Módulo 2: Efeitos básicos: o nome de cada coisa

**Instruções:** 5 perguntas. Nas de múltipla escolha, marque **uma** alternativa. Nas abertas, responda com suas palavras, em poucas linhas.

---

**1.** Você está montando o hero de uma clínica. Segundo a aula, nem todo hero tem tudo, mas dois elementos são quase sempre obrigatórios. Quais são eles, e por quê?

- A) Vídeo de fundo e navbar, porque são o que dá cara de site premium.
- B) Título (headline) e botão CTA, porque a pessoa precisa entender o que é e saber o que fazer.
- C) Elemento 3D e subtítulo, porque prendem a atenção nos primeiros segundos.
- D) Animação de entrada e custom cursor, porque mostram que o site é caprichado.

**2.** Numa seção de um site, conforme você rola para baixo, um título vai se preenchendo de cor. Se você rola para cima, a cor volta a sumir. Que efeito é esse, e o que o diferencia do efeito de scroll mais comum?

- A) Scroll reveal (fade up): ele dispara de novo toda vez que você rola, para cima ou para baixo.
- B) Scrub (animação que acompanha a rolagem): avança e volta junto com o scroll, enquanto o scroll reveal dispara uma vez quando o elemento entra na tela.
- C) Sticky: o título gruda na tela enquanto o resto da seção passa.
- D) Hover: a cor muda porque o mouse passa por cima do título enquanto você rola.

**3.** No portfólio de um fotógrafo, o nome de cada ensaio só aparece quando o mouse passa por cima da foto, e o site tem um custom cursor em forma de círculo. O que a aula manda fazer no celular?

- A) Nada: o celular transforma o toque em hover, então funciona igual.
- B) Deixar o nome do ensaio sempre visível (ou aparecendo com um toque) e desligar o custom cursor.
- C) Trocar o hover por um custom cursor maior, que funciona melhor no toque.
- D) Esconder a galeria no celular para o site não pesar.

**4. (aberta/prática)** Uma clínica de estética tem a seção "Tratamentos" com 4 cards. Numa referência, você viu, na terceira seção, cards aparecendo um depois do outro quando a pessoa rola. Escreva o pedido ao Claude para esse efeito usando a estrutura de quatro partes da aula, e **marque cada parte** entre parênteses.

**5. (aberta/prática)** Uma loja de tênis quer o **tênis dela** girando em 3D no hero, reagindo ao mouse. Responda:
(a) Qual é o nome desse tipo de elemento e qual tecnologia/biblioteca a aula diz que é usada no navegador?
(b) O que precisa existir para o Claude conseguir mostrar **o tênis da loja**, e não um objeto qualquer? Em que formato, normalmente? Cite os caminhos para conseguir isso e o que fazer se não houver como.
(c) Como você deve abrir o site no computador para conferir essa cena 3D, e por quê?
(d) Que cuidados tomar com esse efeito no celular?

---
---

# Gabarito explicado — Módulo 2

> Uso do professor. Os trechos entre aspas são literais de `curso/roteiros/modulo-2.md`; a marcação de negrito foi removida.

### Pergunta 1 — Aula 2.1 (Hero: a primeira dobra)

**Resposta correta: B.**

**Por que está certa:** a aula diz que título e CTA são quase sempre obrigatórios. Sem eles, a pessoa não entende o que é o negócio nem o que fazer, e o hero é justamente onde ela decide se continua olhando.

**Por que as outras estão erradas:**
- A) Vídeo de fundo é opcional e pesado (aula 2.2). A navbar faz parte da lista do que "costuma ter", mas não é um dos dois obrigatórios.
- C) O elemento 3D é só uma das opções de elemento visual. O subtítulo complementa o título, mas não é um dos obrigatórios.
- D) Animação de entrada e custom cursor são enfeites opcionais, e o cursor é efeito de mouse (aula 2.4), não item de hero.

**Fonte:** Aula 2.1, seção Explicação: "Mas título e CTA são quase sempre obrigatórios: a pessoa precisa entender o que é e saber o que fazer." e "é onde a pessoa decide se continua olhando ou fecha o site."

**Auditoria:** OK.

### Pergunta 2 — Aula 2.3 (Efeitos de scroll)

**Resposta correta: B.**

**Por que está certa:** o texto que se preenche de cor está citado literalmente como exemplo de scrub. A aula também diz que essa diferença "cai em prova": o reveal dispara uma vez, o scrub vai e volta com a rolagem.

**Por que as outras estão erradas:**
- A) O scroll reveal "dispara uma vez quando o elemento entra na tela". Ele não acompanha a rolagem nos dois sentidos.
- C) Sticky é algo que gruda na tela. Aqui nada grudou: o título mudou de cor.
- D) Hover é reação ao mouse parado sobre o elemento. No exemplo, o que causa a mudança é a rolagem.

**Fonte:** Aula 2.3, seção Explicação, item 4: "Exemplos: um objeto 3D que gira conforme você rola, um texto que vai se preenchendo de cor" e "Diferença que cai em prova: scroll reveal dispara uma vez quando o elemento entra na tela; scrub acompanha a rolagem o tempo todo, para a frente e para trás."

**Auditoria:** OK. O passo a passo da 2.3 agora também separa scrub de parallax ("no parallax, camadas andam em velocidades diferentes; no scrub, uma animação (...) é controlada pela rolagem"), o que reforça a alternativa B.

### Pergunta 3 — Aula 2.4 (Efeitos de mouse)

**Resposta correta: B.**

**Por que está certa:** no celular não existe hover de verdade. Informação que só aparece no hover precisa ficar visível sempre ou aparecer com um toque, e o custom cursor deve ser desligado. O exemplo do fotógrafo na própria aula faz isso.

**Por que as outras estão erradas:**
- A) A aula diz que no celular "não tem cursor e não tem hover de verdade".
- C) O cursor personalizado deve ser desligado no celular: "Não faz sentido e pode atrapalhar."
- D) A aula não manda esconder conteúdo. Manda deixar a informação visível. Esconder a galeria tiraria justamente o portfólio.

**Fonte:** Aula 2.4, seção Explicação, item 4: "Hover: nada importante pode depender só do hover. Se uma informação só aparece quando passa o mouse, no celular ela precisa estar visível sempre ou aparecer com um toque." e "Cursor personalizado e cursor follower: desligue no celular." Seção Exemplo: "No celular: cursor desligado e o nome do ensaio sempre visível embaixo de cada foto."

**Auditoria:** OK.

### Pergunta 4 — Aula 2.5 (Do nome ao pedido) — aberta/prática

**Resposta esperada (modelo):**

> Na seção "Tratamentos", quero os 4 cards aparecendo com fade up em stagger, um depois do outro, quando chegarem na tela **(nome + onde)**. Igual à terceira seção desse site: [link] **(referência)**. Só uma vez, sem exagero no movimento, e no celular deixa mais sutil ou desativa se pesar **(o que não quero)**.

**Critérios de correção (as 4 partes, na ordem da aula):**
1. **Nome do efeito** correto: "fade up em stagger" (aceitar "scroll reveal em stagger", "fade in on scroll em stagger"). Não vale "efeito de aparecer".
2. **Onde fica:** seção "Tratamentos" e elemento "os 4 cards".
3. **Referência:** o link **e o ponto exato** ("terceira seção").
4. **O que não quer:** um limite claro (ex.: "só uma vez", "sem exagero", comportamento no celular).

Falta qualquer uma das 4 partes, ou o nome do efeito está errado: resposta incompleta.

**Fonte:** Aula 2.5, seção Explicação: "Estrutura para lembrar: nome do efeito + onde fica + referência + o que não quer." e "de preferência o ponto exato (ex.: "igual à segunda seção desse link")". Aula 2.3, item 1: "Quando vários itens aparecem um depois do outro, em sequência, isso se chama stagger (escalonado)."

**Auditoria:** OK.

### Pergunta 5 — Aulas 2.2, 2.4 e 2.5 (Elementos 3D) — aberta/prática

**Resposta esperada:**
- (a) **Elemento 3D**. No navegador ele usa **WebGL**, e uma biblioteca muito usada é **Three.js**.
- (b) Um **modelo 3D do produto**, como arquivo, normalmente no formato **glTF/GLB**. O Claude escreve o código da cena, mas não tem o tênis da loja. Caminhos: (1) o cliente ou o fabricante já tem o modelo; (2) você compra ou contrata um modelo, conferindo a licença de uso; (3) formas que o próprio Claude cria por código (esferas, ondas, partículas, formas abstratas), que não precisam de arquivo. Sem arquivo, não se pede "o produto do cliente em 3D": pede-se uma forma abstrata ou usa-se foto.
- (c) Por um **servidor local** (pedindo ao Claude Code para subir um), e não com dois cliques no index.html, porque aberto direto do disco o navegador costuma bloquear o arquivo 3D e a cena fica em branco.
- (d) 3D é um dos efeitos **mais pesados**, principalmente no celular: use com motivo e teste no celular sempre que adicionar. O giro que **acompanha o mouse** não existe no celular: desligue ou troque por um efeito de rolagem leve, e diga isso no pedido (ex.: "desativa no celular").

**Critérios de correção:** (a) nome + WebGL/Three.js (1 ponto). (b) arquivo de modelo do produto, formato glTF/GLB, pelo menos dois dos três caminhos e a saída "forma abstrata ou foto" (2 pontos). (c) servidor local com o motivo (1 ponto). (d) peso no celular e plano para o efeito de mouse (1 ponto). Dizer só "pedir ao Claude para fazer o tênis em 3D" na parte (b) zera a parte (b).

**Erros comuns:** achar que o Claude "desenha" o produto do cliente sozinho; abrir com dois cliques e concluir que o código está errado porque a cena ficou em branco; esquecer que no celular não tem mouse.

**Fonte:**
- Aula 2.2, seção Explicação, item 6: "Elementos 3D: um objeto ou cena em três dimensões no fundo, que pode girar ou reagir ao mouse e à rolagem. No navegador isso usa uma tecnologia chamada WebGL, e uma biblioteca muito usada para isso se chama Three.js."
- Aula 2.2, quadro "De onde vem o objeto 3D?": "O Claude escreve o código da cena 3D (por exemplo, com Three.js), mas ele não tem o produto do seu cliente. Para mostrar aquele tênis ou aquela garrafa em 3D, o modelo do produto precisa existir como arquivo, normalmente no formato glTF/GLB." e "Sem arquivo, não peça "o produto do cliente em 3D": peça uma forma abstrata ou use foto."
- Aula 2.2, quadro "Atenção": "site com 3D precisa ser aberto por um servidor local (peça ao Claude Code para subir um), e não com dois cliques no index.html. Aberto direto do disco, o navegador costuma bloquear o arquivo 3D e a cena fica em branco."
- Aula 2.2: "Vídeo e 3D são os mais pesados."
- Aula 2.4, item 3 de "Elementos que seguem ou reagem ao mouse": "Em cenas 3D, é comum o objeto ou a "câmera" girar levemente acompanhando o mouse." E em "E no celular?": "Tilt, magnético e parallax de mouse: desligue no celular, ou troque por um efeito de rolagem leve."
- Aula 2.5, seção Explicação: "Prefira os leves (scroll reveal, hover) e use os pesados (vídeo, 3D, pin) com motivo." e "Teste no celular sempre que adicionar um efeito."

**Auditoria:** OK (reauditada após a correção do roteiro; antes era FALHA). A parte (b), que não tinha fonte, agora está no quadro da aula 2.2.

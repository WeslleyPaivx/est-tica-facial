# Prova — Módulo 4: Construindo com o Claude

**Instruções:** 5 perguntas. Nas de múltipla escolha, marque **uma** alternativa. Na aberta, responda com suas palavras, em poucas linhas.

---

**1.** Você vai mandar a primeira mensagem do projeto de um estúdio de tatuagem. Já colocou contexto, referência, plano de site, o que não copiar e a tecnologia. Como a mensagem deve terminar?

- A) "Faz o site completo, com as 6 seções e todos os efeitos, que depois eu ajusto."
- B) "Antes de escrever qualquer código, me explica com suas palavras o que você entendeu do plano. Depois a gente começa só pelo hero."
- C) "Copia o código da referência e troca os textos pelos do meu cliente."
- D) "Faz um site lindo pro meu cliente, capricha."

**2.** Qual é a ordem de construção que a aula recomenda?

- A) Efeitos de scroll e de mouse → hero → estrutura → celular, começando pelo que impressiona o cliente.
- B) Estrutura básica (seções vazias, na ordem) → hero → background → seções de conteúdo, uma por vez → efeitos, um por vez (primeiro scroll, depois mouse) → versão do celular.
- C) O site inteiro num pedido só → ajuste fino → celular.
- D) Hero → efeitos → estrutura → background → seções de conteúdo → celular.

**3.** Qual destes pedidos de ajuste fino segue o jeito certo de pedir?

- A) "Melhora o hero aí, tá meio feio."
- B) "Por gentileza, poderia, se possível, revisar o layout do site?"
- C) "No hero, o título tá colado no botão. Quero mais espaço entre os dois, segue o print."
- D) "Refaz o site inteiro com outro estilo, esse não ficou bom."

**4. (aberta/prática)** Depois que você colocou a imagem sticky na seção "Como funciona", a página ficou em branco do meio para baixo. Liste **tudo** o que vai na sua mensagem de correção ao Claude e explique **onde e como** você acha a mensagem de erro no navegador.

**5.** Você já mandou print, erro e link, e o Claude errou a mesma coisa quatro vezes. Cada correção quebra outra parte. O que a aula manda fazer?

- A) Mandar o mesmo pedido de novo, em letras maiúsculas, até ele acertar.
- B) Levar print, erro, link, referência e o que você já tentou para outra IA, pedir a análise e um prompt de correção, ler esse prompt e mandá-lo ao Claude (se preciso, numa conversa nova, explicando o estado do projeto).
- C) Pedir para a outra IA refazer o site inteiro e abandonar o projeto feito com o Claude.
- D) Copiar o prompt da outra IA e mandar direto ao Claude, sem ler, porque ela vê o problema de fora e não erra.

---
---

# Gabarito explicado — Módulo 4

> Uso do professor. Os trechos entre aspas são literais de `curso/roteiros/modulo-4.md`; a marcação de negrito foi removida.

### Pergunta 1 — Aula 4.1 (Referência primeiro, pedido depois)

**Resposta correta: B.**

**Por que está certa:** o sexto item da primeira mensagem é o primeiro passo. Não se pede o site inteiro: pede-se que o Claude repita o plano com as palavras dele e comece só pela primeira parte.

**Por que as outras estão erradas:**
- A) Pedir tudo de uma vez é o erro que a aula combate: "você não pede o site inteiro".
- C) Copiar código de outro site é proibido: o item 4 da mensagem é justamente "o que não copiar".
- D) É o pedido vago que a abertura critica ("faz um site lindo pra minha cliente" e "espera milagre").

**Fonte:** Aula 4.1, seção Explicação, item 6: "você não pede o site inteiro. Pede para ele entender o plano e começar só pela primeira parte." e "Uma dica ótima é pedir para o Claude repetir o plano com as palavras dele antes de começar."

**Auditoria:** OK.

### Pergunta 2 — Aula 4.2 (Construir por partes)

**Resposta correta: B.**

**Por que está certa:** é a ordem literal da aula, com efeitos um por vez (scroll antes de mouse) e o celular no fim, conferindo depois de cada passo.

**Por que as outras estão erradas:**
- A) Começa pelos efeitos, antes de existir estrutura e conteúdo. É o contrário da "fundação, depois as paredes, depois a pintura".
- C) É o "pedidão" que a aula proíbe ("Nada de pedidão").
- D) Põe os efeitos antes da estrutura e do background, fora da ordem da aula.

**Fonte:** Aula 4.2, seção Explicação: "1. Estrutura básica (...) 2. Hero (...) 3. Background (...) 4. Seções de conteúdo: uma por vez (...) 5. Efeitos: um efeito por vez. Primeiro os de scroll, depois os de mouse. 6. Versão do celular".

**Auditoria:** OK.

### Pergunta 3 — Aula 4.3 (Ajuste fino)

**Resposta correta: C.**

**Por que está certa:** um ajuste só, diz **onde** (hero, título e botão), **como está** (colado), **como quer** (mais espaço) e manda **print**.

**Por que as outras estão erradas:**
- A) Não diz onde exatamente, nem como está, nem o que quer. "Feio" não é instrução.
- B) O problema não é a formalidade em si, e sim a falta de clareza: não diz onde, como está nem como quer. A aula também diz que não precisa de "por gentileza": "O que importa é ser claro, não ser formal."
- D) Não é ajuste fino, é refazer tudo. A aula pede "um ajuste por vez".

**Fonte:** Aula 4.3, seção Explicação: "Um ajuste por vez (ou poucos, numerados).", "Diga onde: qual seção, qual elemento.", "Diga o que está e o que você quer: "está assim, quero assado".", "Mande print quando for visual." e "O que importa é ser claro, não ser formal."

**Auditoria:** OK.

### Pergunta 4 — Aula 4.4 (Quando quebra: print, erro e link) — aberta/prática

**Resposta esperada:**
1. **O que você fez:** o último pedido antes de quebrar (colocar a imagem sticky em "Como funciona").
2. **O que esperava:** a imagem parada à esquerda enquanto os passos rolam, como na referência.
3. **O que aconteceu:** a página em branco do meio para baixo.
4. **Print** (ou gravação de tela, se for movimento).
5. **Mensagem de erro** inteira.
6. **Link** de onde acontece **e** link da referência.
7. **A referência em detalhes:** como deveria funcionar (o que aparece, onde, como se mexe).
8. Pedir para **corrigir só aquilo**, sem mexer no resto.

**Onde achar o erro:** abrir o **DevTools** com **F12** (ou Ctrl+Shift+I no Windows/Linux, Cmd+Option+I no Mac), ir na aba **Console**. Os erros aparecem **em vermelho**. Copiar o texto inteiro.

**Critérios de correção:** tem os 3 itens obrigatórios (print, erro, link), o trio fez/esperava/aconteceu, a descrição da referência, o pedido de "só isso", e o caminho DevTools → Console.

**Fonte:** Aula 4.4, seção Explicação: "Uma mensagem de correção completa diz: o que você fez (o último pedido antes de quebrar), o que esperava, o que aconteceu, e anexa print, erro e link." e "abra as ferramentas do desenvolvedor (DevTools) com a tecla F12 (ou Ctrl+Shift+I no Windows/Linux, Cmd+Option+I no Mac) e vá na aba Console. Erros aparecem em vermelho. Copie o texto inteiro." Passo a passo, item 7: "peça para corrigir só aquilo, sem mexer no resto."

**Auditoria:** OK. Ressalva de redação ("pedir a referência em detalhes") em auditoria.md (item 15).

### Pergunta 5 — Aula 4.5 (Quando o Claude insiste no erro)

**Resposta correta: B.**

**Por que está certa:** é o fluxo da aula. Outra IA analisa e reescreve o prompt, você lê esse prompt e leva de volta ao Claude, de preferência numa conversa nova se a atual ficou longa.

**Por que as outras estão erradas:**
- A) Repetir o mesmo pedido é o que já não funcionou: "é hora de mudar de estratégia".
- C) A aula manda levar o prompt **de volta ao Claude**, não abandonar o projeto.
- D) A aula manda ler antes: "leia o prompt que a outra IA escreveu antes de mandar".

**Fonte:** Aula 4.5, seção Explicação: "peço para outra IA analisar o problema e refazer um prompt, e levo esse prompt de volta para o Claude corrigir." / "Às vezes vale começar uma conversa nova com o Claude" / "leia o prompt que a outra IA escreveu antes de mandar, e confira se ele não pede para mudar coisa que você não quer mudar."

**Auditoria:** OK.

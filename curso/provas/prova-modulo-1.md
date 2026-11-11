# Prova — Módulo 1: Antes do primeiro prompt: mentalidade e ferramentas

**Instruções:** 5 perguntas. Nas de múltipla escolha, marque **uma** alternativa. Nas abertas, responda com suas palavras, em poucas linhas.

---

**1.** Na aula, o autor compara o pedido "Faz um site incrível e profissional pra uma barbearia que venda muito" com um pedido que descreve o hero (foto escura de fundo, nome grande no centro, botão "Agendar horário", texto subindo de leve, nada piscando, link de referência). Por que o segundo pedido funciona melhor?

- A) Porque usa palavras-chave que ativam um "modo profissional" escondido no Claude.
- B) Porque é claro: quem escreveu sabia o que queria e sabia o nome das coisas.
- C) Porque é um prompt pronto, testado pelo autor, que pode ser reaproveitado em qualquer site.
- D) Porque é mais longo, e quanto mais longo o pedido, melhor o site.

**2.** Qual sequência descreve corretamente o fluxo do autor, do zero ao site no ar?

- A) Referências → estudo da base → construção com o Claude → GitHub → Vercel → domínio, que só entra se o cliente fechar e fica por conta dele.
- B) Construção com o Claude → referências → GitHub → Vercel → domínio, que você compra antes para poder mostrar o site.
- C) Referências → estudo da base → construção com o Claude → Vercel → GitHub → domínio, que fica por conta do cliente.
- D) Domínio, comprado por você → referências → estudo da base → construção com o Claude → GitHub → Vercel.

**3.** Você salvou um site premiado e agora quer listar as seções dele, na ordem, e os efeitos de cada uma. Em que etapa do fluxo você está, e o Claude participa dela?

- A) Etapa 1 (referências); o Claude ainda não participa.
- B) Etapa 2 (estudo da base); o Claude não participa, porque ele só entra na etapa 3.
- C) Etapa 2 (estudo da base); você pode usar o claude.ai para ajudar a listar as seções e os efeitos.
- D) Etapa 3 (construção); é o Claude Code que lista os efeitos, dentro da pasta do projeto.

**4.** Seu site já está conectado à Vercel. Você corrigiu o título do hero e enviou essa mudança para o GitHub. O que acontece?

- A) Você precisa baixar os arquivos do GitHub e enviá-los manualmente para a Vercel.
- B) A Vercel publica o site de novo automaticamente, porque pega o código do GitHub.
- C) Nada muda no link até você comprar um domínio.
- D) Você precisa mandar o arquivo novo para o cliente pelo WhatsApp para ele ver a mudança.

**5. (aberta)** Você vai observar um site de referência de nível, como o pear.no. Em quais **quatro situações** você precisa observá-lo, e qual delas a aula diz que não pode faltar de jeito nenhum? Para que serve essa observação: copiar ou outra coisa?

---
---

# Gabarito explicado — Módulo 1

> Uso do professor. Os trechos entre aspas são literais dos roteiros (`curso/roteiros/modulo-1.md`); a marcação de negrito foi removida.

### Pergunta 1 — Aula 1.1 (Não existe prompt milagroso)

**Resposta correta: B.**

**Por que está certa:** a aula diz que o segundo pedido não tem nada de mágico. Ele só é claro: quem escreveu sabia o que queria e sabia o nome das coisas (hero, foto de fundo, CTA, animação de entrada, o que não quer, referência).

**Por que as outras estão erradas:**
- A) A aula nega que exista palavra mágica: "Não tem palavra mágica que faz o Claude entregar um site incrível sozinho."
- C) O autor diz que não usa prompt pronto, e que os exemplos do curso são "ilustração de como estruturar o pedido, não uma fórmula mágica", porque "cada site é diferente".
- D) A aula não usa o tamanho do pedido como critério. O que ela aponta é clareza e saber o nome das coisas.

**Fonte:** Aula 1.1, seção Exemplo: "O segundo pedido não é mágico. Ele só é claro, porque quem escreveu sabia o que queria e sabia o nome das coisas." Seção Explicação: "Por isso eu não uso prompt pronto."

**Auditoria:** OK.

### Pergunta 2 — Aula 1.2 (O fluxo completo)

**Resposta correta: A.**

**Por que está certa:** são 6 etapas, nesta ordem: referências, estudo da base, construção com o Claude, GitHub, Vercel e domínio. O domínio só entra se o cliente fechar e é pago por ele.

**Por que as outras estão erradas:**
- B) Começa pelo Claude, sem referência, que é justamente o erro que a aula aponta ("pula direto para o Claude sem referência"). Além disso, você não compra o domínio para mostrar o site.
- C) Inverte GitHub e Vercel. A Vercel pega o que já está no GitHub, então o GitHub vem antes.
- D) Põe o domínio no começo e no seu bolso. A aula diz que o domínio é a última etapa e fica por conta do cliente.

**Fonte:** Aula 1.2, seção Explicação: "6. Domínio: se o cliente fechar a compra, vem a compra do domínio (...), que fica por conta do cliente." e "5. Vercel: a Vercel pega o que está no GitHub". Também: "Você não precisa gastar com domínio para mostrar o site. O link da Vercel já serve para apresentar."

**Auditoria:** OK.

### Pergunta 3 — Aulas 1.2 e 1.3 (Etapa 2 e o uso do claude.ai)

**[FALHA NA AUDITORIA — não aplicar até o roteiro ser corrigido]**

**Resposta pretendida pela aula 1.2: B.** A aula 1.3 sustenta a **C** com a mesma força.

**Por que B estaria certa:** a aula 1.2 diz que o Claude só entra na etapa 3 e que as duas primeiras são estudo seu. O critério do exercício da 1.2 ainda cobra que o aluno diga que "o Claude entra na etapa 3".

**Por que C também estaria certa:** a aula 1.3 usa o claude.ai exatamente para essa tarefa, listando as seções e os efeitos de uma referência, que é o trabalho da etapa 2. (A aula 3.2 repete: "você pode usar o claude.ai para te ajudar a estudar.")

**Por que A e D estão erradas:** A) a etapa 1 é juntar referências, e listar seções e efeitos já é estudo da base. D) a etapa 3 é construir o site, e a 1.3 diz que o claude.ai (não o Claude Code) é a ferramenta para "estudar uma referência".

**Fonte do conflito:**
- Aula 1.2, seção Explicação: "Repara numa coisa: o Claude só entra na etapa 3. As duas primeiras são você estudando."
- Aula 1.3, seção Explicação: "claude.ai = conversar, pensar, planejar. Ótimo para estudar uma referência". Seção Exemplo: "Você achou uma referência e quer entender os efeitos dela. Abre o claude.ai, manda o print e o link e pergunta".

**Auditoria:** FALHA. Há duas alternativas defensáveis pelo próprio módulo. Ver auditoria.md.

### Pergunta 4 — Aula 1.4 (GitHub e Vercel em uma frase)

**Resposta correta: B.**

**Por que está certa:** com o repositório conectado à Vercel, cada mudança enviada ao GitHub é publicada de novo automaticamente.

**Por que as outras estão erradas:**
- A) A aula diz o contrário: "Você não precisa ficar mandando arquivo para lugar nenhum."
- C) O domínio não é necessário para o site funcionar ou atualizar. O link da Vercel já serve (aula 1.2).
- D) Mandar arquivo pelo WhatsApp é justamente o que a aula descarta: "arquivo no celular dele não é site no ar."

**Fonte:** Aula 1.4, seção Explicação: "A partir daí, cada vez que você manda uma mudança para o GitHub, a Vercel publica de novo automaticamente. Você não precisa ficar mandando arquivo para lugar nenhum."

**Auditoria:** OK.

### Pergunta 5 — Aula 1.5 (O nível que a gente quer: pear.no) — aberta

**Resposta esperada:**
1. As quatro situações: **a primeira tela** (sem rolar), **rolando** a página, **passando o mouse** sobre botões, imagens e textos, e **no celular**.
2. A que não pode faltar é o **celular**: revisar no celular é "uma das coisas mais importantes do curso inteiro".
3. A observação serve para **estudar e se inspirar, não para copiar**.

**Critérios de correção:** cita as 4 situações (1 ponto cada, até 4), destaca o celular (1 ponto) e diz que é para estudar e se inspirar, não copiar (1 ponto).

**Erros comuns:** esquecer o celular, ou dizer que é para "copiar o estilo".

**Fonte:** Aula 1.5, seção Exercício: "sua lista tem observações das quatro situações (primeira tela, rolando, mouse e celular). Se faltou o celular, volta lá: revisar no celular é uma das coisas mais importantes do curso inteiro." Seção Explicação: "a gente usa ele para estudar e se inspirar, não para copiar."

**Auditoria:** OK.

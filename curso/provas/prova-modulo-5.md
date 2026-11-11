# Prova — Módulo 5: Revisão e site no ar

**Instruções:** 5 perguntas. Nas de múltipla escolha, marque **uma** alternativa. Na aberta, responda com suas palavras, em poucas linhas.

---

**1.** Você abriu o site no modo de dispositivo do DevTools, escolheu um modelo de celular e a rolagem ficou lisa. O que você pode concluir?

- A) Que o site está sem lag no celular, porque o modo de dispositivo simula o aparelho escolhido.
- B) Só que o layout parece ok. O lag precisa ser testado num celular de verdade, porque no modo de dispositivo quem roda o site continua sendo o computador.
- C) Que precisa testar em mais dois modelos no DevTools para ter certeza do lag.
- D) Que pode pular o teste no celular, desde que o computador seja fraco.

**2.** O cliente mandou 12 fotos tiradas no celular, cada uma com vários megabytes, e a galeria ficou lenta. O que a aula manda pedir ao Claude?

- A) Manter as originais, para não perder qualidade, e avisar o cliente que site premium demora um pouco mesmo.
- B) Redimensionar para o tamanho em que aparecem, comprimir, converter para WebP e colocar lazy loading nas que ficam abaixo da primeira dobra.
- C) Converter tudo para PNG, que é o formato mais leve.
- D) Trocar as fotos por um vídeo de fundo, que carrega mais rápido que várias imagens.

**3.** Você vai subir o site de um cliente para o GitHub. Qual combinação segue a aula?

- A) Repositório público, para a Vercel conseguir ler, com o "index.html" dentro de uma pasta chamada "site".
- B) Repositório privado, com o "index.html" na raiz (no primeiro nível) junto com as pastas de CSS, JavaScript e imagens, e nenhum arquivo com senha ou chave.
- C) Repositório privado. Pode subir o arquivo com as senhas do cliente, porque ninguém mais vê.
- D) Repositório público, porque a Vercel não publica a partir de repositório privado.

**4. (aberta)** O deploy na Vercel terminou. Segundo a aula, quais **três conferências** provam que o site está publicado e pronto para mostrar ao cliente? E, se o deploy der erro, onde você encontra a mensagem e o que faz com ela?

**5.** O estúdio de tatuagem fechou e quer o site em "estudioexemplo.com.br". Qual conduta segue a aula?

- A) Você registra o domínio no seu CPF, para ter controle, e cobra do cliente depois.
- B) O cliente registra o domínio (de preferência no nome dele). Você adiciona o domínio no projeto na Vercel, e no painel do registrador são criados exatamente os registros de DNS que a Vercel mostrou. Depois você espera a propagação e confere o HTTPS.
- C) Você pede o login e a senha do Registro.br do cliente pelo WhatsApp, para fazer mais rápido.
- D) Você usa os valores de DNS de um tutorial do YouTube, que são sempre os mesmos.

---
---

# Gabarito explicado — Módulo 5

> Uso do professor. Os trechos entre aspas são literais de `curso/roteiros/modulo-5.md`; a marcação de negrito foi removida.

### Pergunta 1 — Aula 5.1 (Lag no celular)

**Resposta correta: B.**

**Por que está certa:** o modo de dispositivo serve para ver o layout. Ele não mostra o desempenho real, porque o computador continua rodando o site. O teste de lag é o celular de verdade.

**Por que as outras estão erradas:**
- A) A aula diz que o modo de dispositivo "não mostra o desempenho real do celular".
- C) Trocar de modelo no DevTools continua sendo o computador rodando. Não resolve.
- D) A aula manda usar **os dois** testes, sempre. Não existe exceção para computador fraco.

**Fonte:** Aula 5.1, seção Explicação: "Serve para ver o layout (...). Mas atenção: ele não mostra o desempenho real do celular, porque quem está rodando continua sendo o computador." e "Celular de verdade: (...) Esse é o teste de lag." Também: "São dois jeitos de testar, e você usa os dois".

**Auditoria:** OK.

### Pergunta 2 — Aula 5.2 (Imagem pesada)

**Resposta correta: B.**

**Por que está certa:** as três coisas que resolvem (dimensão, compressão, formato) mais a técnica extra de lazy loading abaixo da primeira dobra. É o pedido de exemplo da própria aula.

**Por que as outras estão erradas:**
- A) Imagem pesada "deixa o site lento para abrir", e o celular é o teste que importa. Não se avisa o cliente: corrige-se.
- C) A aula diz que WebP e AVIF ficam "bem mais leve[s] que JPG e PNG". PNG não é o formato leve.
- D) Vídeo de fundo também precisa ser curto e comprimido e, "se pesar, trocado por imagem no celular". Não é solução para peso.

**Fonte:** Aula 5.2, seção Explicação: "Tamanho adequado (dimensão)", "Compressão", "formatos modernos como WebP (e também AVIF) costumam deixar a imagem bem mais leve que JPG e PNG com qualidade parecida" e "vídeo de fundo segue a mesma lógica: curto, comprimido e, se pesar, trocado por imagem no celular." Passo a passo, item 4: "Peça lazy loading nas imagens abaixo da primeira dobra."

**Auditoria:** OK.

### Pergunta 3 — Aula 5.3 (GitHub)

**Resposta correta: B.**

**Por que está certa:** para site de cliente, a aula prefere repositório privado. O "index.html" vai na raiz com as pastas, e nunca se sobem senhas ou chaves.

**Por que as outras estão erradas:**
- A) Público não é o recomendado para cliente, e "index.html" dentro de uma subpasta contraria o item 7 do caminho A.
- C) "nunca suba senhas, chaves ou dados privados para o repositório", seja privado ou público.
- D) Falso: "A Vercel consegue publicar a partir de repositório privado."

**Fonte:** Aula 5.3, seção Explicação: "nunca suba senhas, chaves ou dados privados para o repositório." e "Para site de cliente, prefira privado. A Vercel consegue publicar a partir de repositório privado." Passo a passo, caminho A, item 7: "o "index.html" precisa ficar na raiz (no primeiro nível), junto com as pastas de CSS, JavaScript e imagens."

**Auditoria:** OK.

### Pergunta 4 — Aula 5.4 (Vercel: deploy e hospedagem) — aberta

**Resposta esperada:**
1. O link (terminado em .vercel.app) **abre no computador e no celular**.
2. **No celular de verdade, a rolagem está sem lag.**
3. **Uma mudança enviada ao GitHub apareceu no link sozinha**, sem você fazer nada na Vercel.

(Também vale citar rodar de novo o checklist da aula 5.2 no site publicado.)

**Se der erro:** a Vercel mostra os **registros (logs) do build**. Você copia a mensagem de erro, tira print e manda ao Claude junto com o link, como na aula 4.4.

**Critérios de correção:** as 3 conferências (1 ponto cada) e o caminho do erro, logs → copiar erro + print + link → Claude (1 ponto).

**Fonte:** Aula 5.4, seção Exercício: "o link abre no computador e no celular, a rolagem no celular está sem lag, e uma mudança enviada ao GitHub apareceu no link sem você fazer nada na Vercel." Seção Explicação: "Se der erro no deploy, a Vercel mostra os registros (logs) do build. Lembra da aula 4.4: copie a mensagem de erro, tire print e mande ao Claude junto com o link."

**Auditoria:** OK. Ressalva: quem subiu pelo caminho A (site do GitHub) não aprendeu como "enviar uma mudança" depois. Ver auditoria.md (item 8).

### Pergunta 5 — Aula 5.5 (Domínio)

**Resposta correta: B.**

**Por que está certa:** o domínio fica por conta do cliente, de preferência no nome dele. Ele é adicionado na Vercel, e no registrador se criam exatamente os registros mostrados pela Vercel. Depois vêm a propagação e a conferência do HTTPS.

**Por que as outras estão erradas:**
- A) "A compra do domínio fica por conta do cliente", e é boa prática ficar no nome dele, "porque o endereço é dele".
- C) "Não peça senha por mensagem." O certo é o cliente criar os registros com a sua orientação, ou te dar acesso pelo próprio sistema do registrador.
- D) "Não use valores de tutorial antigo, porque eles podem mudar." Copie da tela da Vercel.

**Fonte:** Aula 5.5, seção Explicação: "A compra do domínio fica por conta do cliente. É uma boa prática o domínio ficar no nome do próprio cliente", "copie os valores dos registros direto da tela da Vercel. Não use valores de tutorial antigo" e "Não peça senha por mensagem."

**Auditoria:** OK.

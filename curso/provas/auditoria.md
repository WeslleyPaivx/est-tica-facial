# Auditoria das provas — "Como criar sites 3D com Claude"

**Critério:** uma pergunta é **OK** só se dá para respondê-la apenas com o que está escrito numa aula do próprio módulo, sem ambiguidade e com uma única alternativa defensável. É **FALHA** se a resposta exige algo que não está escrito, se o roteiro é ambíguo ou contraditório, ou se duas alternativas podem estar certas pelo texto. Nenhuma FALHA foi "consertada" com uma pergunta mais fácil: as FALHAs apontam buracos do roteiro em conceitos importantes.

Fonte auditada: `curso/roteiros/modulo-1.md` a `modulo-6.md`. Slides e Word não foram auditados.

## Resultado por módulo

| Módulo | OK | FALHA |
|---|---|---|
| 1 | 4 | 1 |
| 2 | 4 | 1 |
| 3 | 5 | 0 |
| 4 | 5 | 0 |
| 5 | 5 | 0 |
| 6 | 3 | 2 |
| **Total** | **26** | **4** |

## Tabela por pergunta

| Módulo | Pergunta | Aula(s) | Tema | Status | Justificativa |
|---|---|---|---|---|---|
| 1 | 1 | 1.1 | Por que um pedido claro funciona | OK | Resposta literal no Exemplo da 1.1. Distratores negados pelo texto. |
| 1 | 2 | 1.2 | Ordem das 6 etapas e domínio | OK | Lista literal na Explicação da 1.2. |
| 1 | 3 | 1.2 + 1.3 | Etapa 2 e uso do Claude | **FALHA** | A 1.2 diz "o Claude só entra na etapa 3". A 1.3 manda usar o claude.ai para estudar a referência (etapa 2). As alternativas B e C são defensáveis. |
| 1 | 4 | 1.4 | Publicação automática GitHub → Vercel | OK | Literal na Explicação da 1.4. |
| 1 | 5 | 1.5 | As 4 situações de observação; inspirar, não copiar | OK | Literal no Exercício e na Explicação da 1.5. |
| 2 | 1 | 2.1 | Título e CTA obrigatórios no hero | OK | Literal na Explicação da 2.1. |
| 2 | 2 | 2.3 | Scrub x scroll reveal | OK | Exemplo e diferença literais. O teste de identificação do passo a passo tem ressalva (item 10), mas a pergunta não depende dele. |
| 2 | 3 | 2.4 | Hover e cursor no celular | OK | Literal no item 4 da Explicação e no Exemplo da 2.4. |
| 2 | 4 | 2.5 | Pedido em 4 partes | OK | Estrutura literal na 2.5. Stagger definido na 2.3. |
| 2 | 5 | 2.2 + 2.5 | 3D do produto do cliente | **FALHA** | (a) e (c) são respondíveis. (b), de onde vem o objeto 3D do cliente, não existe em nenhum roteiro. É o conceito central do título do curso. |
| 3 | 1 | 3.1 | Como guardar referência | OK | Literal na Explicação e no Exemplo da 3.1. |
| 3 | 2 | 3.2 | Estrutura x efeitos | OK | Literal na 3.2. |
| 3 | 3 | 3.3 | Caso da ótica (certo x errado) | OK | O Exemplo da 3.3 dá o "Certo" e o "Errado" quase palavra por palavra. |
| 3 | 4 | 3.4 | 4 filtros aplicados à advocacia | OK | Filtros literais. O caso da advocacia é citado na própria aula. |
| 3 | 5 | 3.2 + 3.3 | Conferir o que a IA diz | OK | Literal na dica da 3.2. A alternativa C é negada pela 3.3. |
| 4 | 1 | 4.1 | Final da primeira mensagem | OK | Literal no item 6 e na dica de repetir o plano. |
| 4 | 2 | 4.2 | Ordem de construção | OK | Lista literal na 4.2. |
| 4 | 3 | 4.3 | Pedido de ajuste fino | OK | Regras literais (onde, como está, como quer, print, claro em vez de formal). |
| 4 | 4 | 4.4 | Mensagem de correção e DevTools/Console | OK | Literal na 4.4. Ressalva de redação no item 15. |
| 4 | 5 | 4.5 | Outra IA reescreve o prompt | OK | Fluxo literal na 4.5. |
| 5 | 1 | 5.1 | Modo de dispositivo x celular real | OK | Literal na 5.1. |
| 5 | 2 | 5.2 | Otimização de imagem | OK | Literal na Explicação e no Passo a passo da 5.2. |
| 5 | 3 | 5.3 | Repositório privado, index.html na raiz, sem senhas | OK | Literal na 5.3. |
| 5 | 4 | 5.4 | As 3 conferências do deploy; logs | OK | Literal no Exercício e na Explicação da 5.4. Ressalva no item 8: o caminho A não ensina como enviar mudanças depois. |
| 5 | 5 | 5.5 | Domínio do cliente, DNS da tela da Vercel, sem senha | OK | Literal na 5.5. |
| 6 | 1 | 6.1 | Quem entra na lista de prospecção | OK | Literal na 6.1. |
| 6 | 2 | 6.2 | Regras do combo | OK | Literal na 6.2. |
| 6 | 3 | 6.3 | Pisos, prazo e condição | OK | Literal na 6.3. Ressalva no item 11: a resposta-modelo ao cliente omite o pagamento. |
| 6 | 4 | 6.4 (x 1.2 e 5.5) | Construir antes ou depois do contrato | **FALHA** | A 6.4 manda começar só depois de briefing, contrato e pagamento. As aulas 1.2 e 5.5 ensinam construir, mostrar o link da Vercel e então o cliente "fechar". A e B são defensáveis pelo curso. |
| 6 | 5 | 6.4 | Domínio e hospedagem no briefing | **FALHA** | A parte do domínio é respondível. A parte da hospedagem (conta, plano, custo, quem paga) não existe em nenhum roteiro, apesar do alerta da 1.4 sobre uso comercial do plano gratuito. |

---

## DEVOLVER AO ROTEIRISTA

Ordem: gravidade (Alta, Média, Baixa). Os itens 1 a 4 derrubaram perguntas. Os itens 5 a 15 são erros, contradições ou buracos vistos fora das perguntas, mas que afetam o aluno que vai criar e vender o site.

### 1. [Alta] O "3D" do título do curso não é ensinado
- **Arquivo:** `curso/roteiros/modulo-2.md`. **Aula:** 2.2 — Background: o fundo que trabalha. **Seção:** Explicação, item 6 "Elementos 3D". Reflexos em `modulo-4.md` (aula 4.2, Exemplo) e `modulo-5.md` (aula 5.1, Explicação).
- **O que falta:** o curso se chama "Como criar sites 3D com Claude", mas o 3D aparece só como um tipo de fundo, em duas frases (WebGL/Three.js, "é pesado"). Nenhuma aula diz de onde vem o objeto 3D (o produto do cliente precisa existir como arquivo 3D), como pedir uma cena 3D ao Claude, que formato pedir, quanto ela pode pesar nem como abrir o site para o 3D carregar. Nenhum exemplo de construção do módulo 4 tem 3D. O aluno sai sem conseguir entregar o que o título promete.
- **Texto sugerido** (novo bloco ao fim do item 6 da 2.2, ou uma aula nova "2.6 — 3D no site: o que pedir e o que providenciar"):
  > **De onde vem o objeto 3D?** O Claude escreve o código da cena 3D (com Three.js), mas ele não tem o produto do seu cliente. Para mostrar **aquele** tênis, **aquela** garrafa ou **aquele** imóvel em 3D, alguém precisa fornecer um **modelo 3D**: um arquivo com o objeto, normalmente no formato **glTF/GLB**. Os caminhos: (1) o cliente ou o fabricante já tem o modelo; (2) você compra ou contrata um modelo, conferindo a licença de uso; (3) você usa formas que o próprio Claude cria por código (esferas, ondas, partículas, formas abstratas), que não precisam de arquivo e costumam ser mais leves. Sem arquivo, não peça "o produto do cliente em 3D". Peça uma forma abstrata ou use foto.
  > **Como pedir:** "No hero, quero o modelo 3D [arquivo .glb que vou te mandar] girando devagar e inclinando um pouco conforme o mouse (nome + onde). Referência: [link] (referência). Arquivo leve, no máximo alguns MB; no celular, troca por uma imagem estática do produto (o que não quero)."
  > **Atenção:** site com 3D precisa ser aberto por um servidor local (peça ao Claude Code), não clicando duas vezes no index.html. Aberto direto do disco, o navegador costuma bloquear o arquivo 3D e a cena fica em branco.
- **Também:** incluir no Exemplo da aula 4.2 um passo "efeito 3D no hero" e, na aula 5.1, uma linha sobre limitar o peso do modelo e pausar a animação 3D quando ela sai da tela.

### 2. [Alta] Dois modelos de venda incompatíveis: construir antes ou depois do contrato
- **Arquivos e aulas:** `modulo-1.md`, aula 1.2, seções Explicação (etapa 6 e "o domínio é a última coisa, e só acontece se o cliente fechar") e Exemplo (doceria). `modulo-5.md`, aula 5.5, seções Abertura, Explicação (regra 1) e Exemplo ("O estúdio de tatuagem fechou"). `modulo-6.md`, aula 6.4, seção Explicação ("Ordem certa") e Passo a passo, item 7.
- **O que está errado:** os módulos 1 e 5 ensinam construir o site, publicar, mostrar o link da Vercel e então o cliente "fechar". A aula 6.4 diz que o site só começa depois de briefing, contrato e pagamento. O curso não diz quando vale cada um. Para quem vende, isso decide se trabalha de graça. A fonte (entrevista, perguntas 4 e 9) também é ambígua. **Confirmar com o autor qual é o modelo real antes de reescrever.**
- **Texto sugerido** (para reconciliar; inserir na 1.2, logo após a etapa 6, e repetir uma frase na 5.5 e na 6.4):
  > **Dois sites diferentes, dois momentos diferentes.** Existe o **seu site de portfólio**, que você faz por conta própria, sem cliente, para mostrar o seu nível na prospecção (aula 6.1). E existe o **site do cliente**, que só começa depois que ele escolhe a opção do combo, preenche o briefing, assina o contrato e faz o pagamento combinado (aula 6.4). No site do cliente, o "fechar" da etapa 6 é a **aprovação final**: você mostra a versão pronta no link da Vercel, ele aprova, e só então entra o domínio, comprado por ele.
- Ajustar o Exemplo da 1.2 ("só se uma doceria de verdade comprar...") para deixar claro que se trata do portfólio. Na 5.5, trocar "O domínio só entra quando o cliente fecha" por "O domínio só entra quando o cliente aprova o site (no link da Vercel)".

### 3. [Alta] Hospedagem do site vendido: conta, plano, custo e quem paga
- **Arquivos e aulas:** `modulo-6.md`, aula 6.4, seção Exemplo, bloco "10. Domínio". `modulo-6.md`, aula 6.3, seção Explicação. `modulo-5.md`, aula 5.4, seção Explicação. `modulo-1.md`, aula 1.4, Passo a passo, item 7.
- **O que falta:** a aula 1.4 sugere o plano gratuito "para uso pessoal (hobby)" e só pede para "ler os termos sobre uso comercial". Depois o curso manda publicar o site do cliente pagante na conta do aluno (5.4) e ligar o domínio do cliente nela (5.5), sem nunca voltar ao assunto. O briefing cobre domínio, mas não hospedagem. O preço (6.3) não considera custo de hospedagem. E ninguém diz quem fica com o acesso ao GitHub e à Vercel depois da entrega. Pelos termos da Vercel na data desta revisão, o plano Hobby é restrito a uso pessoal e não comercial. **Confirmar nos termos atuais antes de gravar.**
- **Texto sugerido** (na 5.4, Explicação, depois do parágrafo do link .vercel.app):
  > **Site de cliente pagante e o plano da Vercel.** O plano gratuito (Hobby) serve para estudar e para o seu portfólio, mas os termos da Vercel o limitam a uso pessoal e não comercial (confira os termos atuais). Para o site de um cliente que te pagou, use um caminho que permita uso comercial: publicar na **conta da Vercel do próprio cliente** (você configura com acesso dado por ele) ou num **plano pago** seu que permita isso. Esse custo, se houver, entra no preço (aula 6.3) e no briefing (aula 6.4).
- **Texto sugerido** (6.4, renomear o bloco 10 para "Domínio e hospedagem" e acrescentar):
  > 5. Conta onde o site ficará hospedado: conta do cliente / conta do prestador.
  > 6. Plano de hospedagem, custo mensal (se houver) e responsável pelo pagamento:
  > 7. Quem fica com o acesso ao repositório (GitHub) e à hospedagem após a entrega:
- Na 6.3, acrescentar a "O que faz o preço subir": "custo de hospedagem e manutenção, se ficarem por sua conta".

### 4. [Média] "O Claude só entra na etapa 3" contradiz o uso do claude.ai para estudar
- **Arquivo:** `curso/roteiros/modulo-1.md`. **Aula:** 1.2. **Seções:** Explicação ("Repara numa coisa: o Claude só entra na etapa 3. As duas primeiras são você estudando.") e Exercício ("disse que o Claude entra na etapa 3"). Conflita com a aula 1.3 (Explicação e Exemplo) e com a aula 3.2 (Dica).
- **O que está errado:** a mesma aula que cobra "o Claude entra na etapa 3" é seguida por uma aula (1.3) que usa o claude.ai justamente na etapa 2.
- **Texto sugerido** (substituir o parágrafo da 1.2):
  > Repara numa coisa: o Claude só começa a **construir** na etapa 3. Nas etapas 1 e 2, quem estuda é você. Você pode usar o claude.ai como ajudante para listar seções e efeitos de uma referência (aula 1.3), mas quem escolhe a referência, confere com os próprios olhos e decide é você. É por isso que tanta gente se dá mal: pula direto para o Claude construir, sem referência e sem saber o que quer.
- Ajustar o critério do Exercício: "disse que o Claude começa a construir na etapa 3".

### 5. [Média] Caminho "só claude.ai" sem instrução de como o código vira arquivo
- **Arquivos e aulas:** `modulo-1.md`, aula 1.3, seções Passo a passo e Exercício ("No Claude Code (ou no claude.ai, se ainda não tiver o Claude Code), peça a criação de um "index.html" simples"). `modulo-4.md`, aula 4.1, Passo a passo, item 4 ("ou uma conversa nova no claude.ai, se ainda estiver sem o Claude Code").
- **O que falta:** o curso oferece o claude.ai como alternativa, mas nunca ensina a transformar a resposta em arquivos numa pasta. E o resultado do módulo 4 exige o "site rodando no próprio computador". Também não avisa que vários passos seguintes dependem do Claude Code (servidor local na 4.2 e na 5.1, conversão de imagens na 5.2, caminho B na 5.3). Para o público "iniciante que só usou o GPT para dúvida simples", é um bloqueio real.
- **Texto sugerido** (na 1.3, depois do item 5 do Passo a passo):
  > **Se você ainda está só no claude.ai:** ele te devolve o código, e você cria o arquivo. Crie uma pasta para o site. Abra um editor de texto simples (Bloco de Notas no Windows; no Mac, o TextEdit em modo "texto simples"), cole o código e salve com o nome exato que o Claude indicou (ex.: index.html), escolhendo "Todos os arquivos" e codificação UTF-8. Dê dois cliques no arquivo para abrir no navegador. Quando o site tiver mais de um arquivo (ex.: style.css, script.js, pasta de imagens), peça ao Claude o nome de cada arquivo e em que pasta ele fica. Esse caminho funciona para começar, mas o curso usa o Claude Code nas etapas seguintes (servidor local, imagens, GitHub). Planeje ter acesso a ele até o módulo 4.

### 6. [Média] "Abrir o index.html no navegador" apresentado como equivalente ao servidor local
- **Arquivo:** `curso/roteiros/modulo-4.md`. **Aula:** 4.2. **Seção:** Explicação ("você pode abrir o arquivo principal (normalmente o "index.html") no navegador, ou pedir para o Claude Code subir um servidor local").
- **O que está errado:** as duas opções não são equivalentes. Abrindo o arquivo direto do disco, o navegador bloqueia scripts do tipo módulo e o carregamento de arquivos (modelos 3D, JSON). A página fica em branco ou o efeito some sem o aluno ter errado nada. Num curso de "sites 3D", é a primeira coisa que vai quebrar.
- **Texto sugerido:**
  > Se o site é só HTML e CSS, abrir o index.html direto funciona. Se ele usa JavaScript de bibliotecas, carrega arquivos ou tem 3D, use sempre o servidor local: aberto direto do disco, o navegador bloqueia parte desses recursos e a página pode ficar em branco, mesmo com o código certo.

### 7. [Média] Ferramenta de build (npm/Vite) quebra o "index.html na raiz" e o "Other" da Vercel
- **Arquivos e aulas:** `modulo-4.md`, aula 4.1, seção Explicação, item 5 (tecnologia). `modulo-5.md`, aula 5.3 (Passo a passo, caminho A, item 7) e aula 5.4 (Explicação: "Para um site em HTML e CSS puro, a Vercel não precisa de configuração especial" / "Other").
- **O que está errado:** o curso cita GSAP, Lenis e Three.js. Para usar essas bibliotecas, o Claude Code frequentemente monta um projeto com npm e Vite. Nesse caso não existe "index.html pronto na raiz" para subir pelo site do GitHub, e escolher "Other" na Vercel publica os arquivos sem o build: o site sai quebrado. O roteiro não avisa o aluno de que deve evitar isso nem diz o que fazer se acontecer.
- **Texto sugerido** (4.1, item 5):
  > ...HTML e CSS (com JavaScript quando o efeito precisar). Diga também: "sem ferramenta de build: carrega as bibliotecas (como GSAP, Lenis ou Three.js) por link direto no HTML". Assim o site continua sendo uma pasta simples, que você sobe para o GitHub e a Vercel publica sem configuração.
- **Texto sugerido** (5.4, Explicação):
  > Se a pasta do projeto tiver um arquivo package.json, o site usa ferramenta de build. Não escolha "Other": deixe a Vercel detectar o framework e, se o deploy der erro, mande o log ao Claude (aula 4.4).

### 8. [Média] Caminho A (upload pelo site) não ensina a enviar mudanças depois
- **Arquivos e aulas:** `modulo-5.md`, aula 5.3 (Caminho A) e aula 5.4 (Passo a passo, item 10 "Faça uma pequena mudança, envie para o GitHub e confira se a Vercel publicou sozinha"; Exercício).
- **O que falta:** quem subiu pelo site do GitHub não sabe como "enviar uma mudança". O exercício da 5.4 cobra exatamente isso.
- **Texto sugerido** (5.3, ao fim do Caminho A):
  > **Para mandar uma mudança depois:** abra o repositório, vá em **Add file** → **Upload files** e envie de novo o arquivo alterado, com o mesmo nome e na mesma pasta. O GitHub substitui o antigo e cria uma nova versão (commit), e a Vercel publica sozinha. Se a mudança mexer em muitos arquivos, prefira o caminho B.

### 9. [Baixa] "Token" nunca é definido
- **Arquivos e aulas:** `modulo-1.md`, aula 1.1, seção Exemplo ("você vai gastar token à toa"). `modulo-2.md`, Objetivo e aula 2.1 (Abertura). `modulo-4.md`, aula 4.1.
- **O que falta:** "gastar token à toa" é um dos quatro erros centrais do curso (6.5), mas a palavra nunca é explicada para um público que só usou o GPT para dúvida simples.
- **Texto sugerido** (1.1, Explicação, logo após a definição de prompt):
  > **Token** é a unidade que a IA usa para medir o texto que ela lê e escreve. Os planos do Claude têm limite de uso: cada pedido confuso que precisa ser refeito consome esse limite (e o seu tempo). Por isso o curso insiste tanto em pedir certo da primeira vez.

### 10. [Baixa] O teste "vai e volta = scrub" também vale para parallax
- **Arquivo:** `curso/roteiros/modulo-2.md`. **Aula:** 2.3. **Seções:** Passo a passo, item 6 ("A animação vai e volta quando você rola para baixo e para cima? É scrub") e Exercício ("para o scrub, você testou rolar para cima e a animação voltou").
- **O que está errado:** o parallax também acompanha a rolagem nos dois sentidos. O teste ensinado não separa os dois, e o aluno pode classificar um parallax como scrub.
- **Texto sugerido** (acrescentar ao item 6):
  > ...É scrub. Cuidado: o parallax também anda junto com a rolagem, para baixo e para cima. A diferença: no parallax, **camadas andam em velocidades diferentes**; no scrub, **uma animação** (girar, preencher, avançar etapas, encher uma barra) é controlada pela rolagem.

### 11. [Baixa] Resposta-modelo ao cliente omite o pagamento na condição do prazo
- **Arquivo:** `curso/roteiros/modulo-6.md`. **Aula:** 6.3. **Seção:** Exemplo ("contado a partir do recebimento dos textos e das fotos").
- **O que está errado:** a Explicação da 6.3 e o briefing da 6.4 dizem "recebimento do conteúdo **e do pagamento combinado**". A frase que o aluno vai copiar para o cliente esquece o pagamento.
- **Texto sugerido:**
  > O prazo de entrega costuma ser de uma semana, contado a partir do recebimento dos textos e das fotos e do pagamento combinado.

### 12. [Baixa] A revisão no celular não aparece no fluxo de 6 etapas, e o teste real depende de etapa posterior
- **Arquivos e aulas:** `modulo-1.md`, aula 1.2, seção Explicação (6 etapas e mapa dos módulos). `modulo-5.md`, aula 5.1, seção Explicação, item 2 ("O jeito mais fácil é com o link da Vercel, que você vai ter nas aulas 5.3 e 5.4").
- **O que está errado:** o próprio curso chama o lag no celular de "o erro principal", mas ele não aparece no fluxo da 1.2. E a 5.1 manda testar com um link que só existe duas aulas depois.
- **Texto sugerido** (1.2, depois da lista de etapas):
  > Dentro da etapa 3, e de novo depois da etapa 5, vem a **revisão**: testar no celular de verdade (lag) e rodar o checklist (aula 5.2). Ela não é uma etapa separada porque acontece o tempo todo, mas é a que mais faz perder cliente quando é pulada.
- Na 5.1, deixar explícito: "Se ainda não tem o link da Vercel, use o servidor local na Wi-Fi agora e repita o teste com o link na aula 5.4."

### 13. [Baixa] "pear.no foi feito todo em HTML e CSS": verificar antes de gravar
- **Arquivo:** `curso/roteiros/modulo-1.md`. **Aula:** 1.5. **Seção:** Explicação ("Ele foi feito todo em HTML e CSS").
- **O que verificar:** a frase vem do autor (entrevista, pergunta 8), mas a mesma aula manda o aluno observar o que se mexe ao rolar e ao passar o mouse. Sites com esse tipo de efeito costumam usar JavaScript também. O aluno curioso que abrir o DevTools pode ver scripts e perder confiança no material. Confirmar com o autor.
- **Texto sugerido** (se não for 100% HTML e CSS):
  > Ele foi feito com as tecnologias básicas da web (HTML, CSS e JavaScript), sem ferramenta complicada. O que faz diferença é o capricho.

### 14. [Baixa] "Imagens com licença que permita o uso": falta dizer onde achar e como conferir
- **Arquivo:** `curso/roteiros/modulo-3.md`. **Aula:** 3.3. **Seção:** Explicação, "O que você nunca copia", item 3.
- **O que falta:** quando o cliente não tem fotos boas (caso comum), o aluno precisa saber onde buscar imagem que pode usar comercialmente.
- **Texto sugerido:**
  > Se o cliente não tiver fotos, use bancos de imagens que permitam uso comercial e **leia a licença de cada imagem** antes de usar (algumas exigem crédito, outras proíbem certos usos). Guarde o link de onde veio cada imagem. Se usar imagem gerada por IA, confira os termos da ferramenta. Na dúvida, prefira as fotos reais do negócio: elas vendem mais.

### 15. [Baixa] "Pedir a referência em detalhes" sugere o contrário do que a aula quer
- **Arquivo:** `curso/roteiros/modulo-4.md`. **Aula:** 4.4. **Seções:** Explicação (primeira frase e "E o quarto ponto: pedir a referência em detalhes") e Resumo.
- **O que está errado:** "pedir a referência" dá a entender que se pede algo ao Claude. A própria aula explica que o aluno é quem **descreve** a referência ("Você explica, com detalhe, como aquilo deveria funcionar"). A redação literal da fala do autor confunde o aluno numa aula de procedimento.
- **Texto sugerido:**
  > E o quarto ponto: **descrever a referência em detalhes**. Não basta dizer "quebrou": explique como aquilo deveria funcionar, apontando na referência o que deveria aparecer, onde e como se mexe.
  (Manter a fala original do autor entre aspas, se quiser, seguida dessa explicação.)

---

## Observações fora dos roteiros (para o time, não para o roteirista)

- `curso/grade.md`, aula 2.5, descreve o pedido em **3 partes** ("nome do efeito + onde ele fica + referência"). O roteiro usa **4 partes** (acrescenta "o que não quer"). As provas seguem o roteiro. Vale conferir se slides e Word seguem as 4 partes.
- As provas marcadas com FALHA (M1-P3, M2-P5, M6-P4, M6-P5) não devem ser aplicadas a alunos até o roteiro correspondente ser corrigido. Depois da correção, reauditar essas quatro perguntas.

# Módulo 4 — Construindo com o Claude

**Objetivo:** transformar a referência estudada num site de verdade, conversando com o Claude do jeito certo e sabendo sair do buraco quando algo quebra.

**Resultado do módulo:** o aluno tem rodando no próprio computador um site com hero, background e pelo menos um efeito de scroll e um de mouse, construído a partir de uma referência, e já corrigiu ao menos um erro mandando print, mensagem de erro e link.

## Aula 4.1 — Referência primeiro, pedido depois

*Duração estimada: 6 a 8 minutos.*

### Abertura

Chegou a hora de construir! Mas antes de abrir o Claude, deixa eu te contar o erro mais comum que eu vejo: querer pedir tudo de uma vez para o Claude sem antes mandar uma referência do que quer. A pessoa escreve "faz um site lindo pra minha cliente" e espera milagre. Não vai rolar. Bora ver como abrir a conversa do jeito certo.

### Explicação

O Claude não enxerga a sua cabeça. Se você não mostrar o que quer, ele vai inventar, e o que ele inventar provavelmente não é o que você imaginou. Aí você pede de novo, e de novo, e de novo. Você só vai gastar token à toa.

Por isso a regra é: **referência primeiro, pedido depois.**

A primeira mensagem de um projeto deve ter:

1. **O contexto:** que tipo de negócio é e o objetivo do site (o que ele precisa fazer).
2. **A referência:** o link e os prints do site que você estudou.
3. **A estrutura estudada:** o plano de site do módulo 3 (seções na ordem e efeitos de cada uma).
4. **O que não copiar:** deixar claro que da referência vem só estrutura e efeitos.
5. **A tecnologia:** por exemplo, HTML e CSS (com JavaScript quando o efeito precisar), que é simples e roda em qualquer lugar, inclusive na Vercel.
6. **O primeiro passo:** e aqui está o segredo, você **não** pede o site inteiro. Pede para ele entender o plano e começar só pela primeira parte.

Essa primeira mensagem serve para alinhar. Uma dica ótima é pedir para o Claude **repetir o plano com as palavras dele** antes de começar. Se ele entendeu errado, você corrige ali, antes de ter código para jogar fora.

Se você estiver no Claude Code, abra ele na pasta do projeto. Ele vai criar os arquivos ali dentro.

### Exemplo

Primeira mensagem para o Claude (ilustração de como estruturar, não fórmula):

> Fala, Claude! Bora fazer um site pra um estúdio de tatuagem. O objetivo é mostrar o portfólio e levar a pessoa pro agendamento no WhatsApp.
>
> Referência que eu estudei: [link], e seguem os prints. Quero esse tipo de estrutura e de efeito, mas sem copiar nada deles: nem código, nem texto, nem imagem, nem marca.
>
> Plano do site: (1) hero escuro com CTA "Agendar pelo WhatsApp"; (2) estilos em cards com fade up em stagger; (3) galeria com hover de zoom, no celular com legenda fixa; (4) como funciona, com imagem sticky; (5) contato; (6) rodapé.
>
> Vamos fazer em HTML e CSS, com JavaScript só onde o efeito precisar. Antes de escrever qualquer código, me explica com suas palavras o que você entendeu do plano. Depois a gente começa só pelo hero.

### Passo a passo

1. Separe o plano de site e a ficha de referência do módulo 3.
2. Separe o link e os prints da referência.
3. Crie uma pasta vazia para o projeto no seu computador (ex.: "site-estudio-tatuagem").
4. Abra o Claude Code nessa pasta (ou uma conversa nova no claude.ai, se ainda estiver sem o Claude Code).
5. Escreva a primeira mensagem com os 6 itens: contexto, referência, estrutura, o que não copiar, tecnologia e primeiro passo.
6. Peça para ele repetir o plano com as palavras dele.
7. Leia a resposta. Se algo estiver errado, corrija antes de deixar ele começar.

### Exercício

**Tarefa:** escreva e mande a primeira mensagem do seu projeto.

**O que entregar:** o texto da primeira mensagem e a resposta do Claude repetindo o plano.

**Como saber que fez certo:** sua mensagem tem os 6 itens, você não pediu o site inteiro de uma vez, e o plano que o Claude repetiu bate com o seu.

### Resumo

- O erro mais comum é pedir tudo de uma vez sem mandar referência; isso gasta token à toa.
- A primeira mensagem tem contexto, referência, estrutura estudada, o que não copiar, tecnologia e primeiro passo.
- Peça para o Claude repetir o plano antes de começar e comece só pela primeira parte.

## Aula 4.2 — Construir por partes

*Duração estimada: 7 a 9 minutos.*

### Abertura

O Claude entendeu o plano. E agora? Agora a gente constrói por partes. Seção por seção, como quem monta uma casa: primeiro a fundação, depois as paredes, depois a pintura. Nada de pedidão. Olha só como fica.

### Explicação

Construir por partes é fazer **uma coisa de cada vez** e **conferir antes de seguir**. Por quê?

- Quando algo quebra, você sabe exatamente o que causou: foi a última coisa que você pediu.
- O Claude se concentra melhor num pedido pequeno e claro.
- Você vai vendo o site nascer e ajustando no caminho.

A ordem que funciona bem:

1. **Estrutura básica:** os arquivos do site e as seções vazias na ordem certa, só com os títulos. É o esqueleto.
2. **Hero:** título, subtítulo, CTA, imagem e navbar.
3. **Background:** o fundo de cada seção.
4. **Seções de conteúdo:** uma por vez, com os textos e as imagens (os do cliente ou textos provisórios para treino).
5. **Efeitos:** um efeito por vez. Primeiro os de scroll, depois os de mouse.
6. **Versão do celular:** conferir cada seção no celular e ajustar.

Depois de **cada** passo, você abre o site e confere. Para ver o site rodando no seu computador, você pode abrir o arquivo principal (normalmente o "index.html") no navegador, ou pedir para o Claude Code subir um servidor local e te passar o endereço para abrir (algo como "localhost" com um número). Depois de cada mudança, recarregue a página.

Use o pedido de efeito que você aprendeu no módulo 2: **nome do efeito + onde fica + referência + o que não quer.**

Para o resultado deste módulo, o site precisa ter, no mínimo: hero, background, pelo menos **um efeito de scroll** e pelo menos **um efeito de mouse**.

### Exemplo

Sequência de pedidos para o estúdio de tatuagem (ilustração):

> Passo 1: Cria a estrutura do site com as 6 seções do plano, na ordem, só com o título de cada uma. Sem estilo ainda.

> Passo 2: Agora o hero: fundo escuro, título "Arte na pele, com hora marcada", subtítulo curto e o botão "Agendar pelo WhatsApp". Navbar com logo à esquerda e links à direita.

> Passo 5: Bora pro primeiro efeito. Na seção de estilos, os cards aparecem com fade up em stagger quando chegarem na tela, só uma vez. Igual à seção de serviços da referência. Sem exagero no movimento.

> Passo 5 de novo: Agora um efeito de mouse: hover com zoom leve nas fotos da galeria. No celular, desativa o hover e deixa a legenda sempre visível.

Entre um pedido e outro: abrir o site, conferir, ajustar.

### Passo a passo

1. Peça a estrutura básica com as seções vazias e confira se a ordem está certa.
2. Peça o hero e confira.
3. Peça os backgrounds e confira se o texto continua legível.
4. Peça uma seção de conteúdo por vez e confira cada uma.
5. Peça um efeito de scroll, usando nome + onde + referência + o que não quer, e confira.
6. Peça um efeito de mouse do mesmo jeito, dizendo o que fazer no celular, e confira.
7. A cada passo que deu certo, anote numa lista "feito".
8. Se algo quebrou, pare e vá para a aula 4.4 antes de seguir.

### Exercício

**Tarefa:** construa o seu site por partes até ele ter hero, background, um efeito de scroll e um efeito de mouse.

**O que entregar:** a lista dos pedidos que você fez, na ordem, e um print do site rodando no seu computador.

**Como saber que fez certo:** você fez um pedido por parte, conferiu depois de cada um, e o site tem os quatro itens mínimos (hero, background, efeito de scroll e efeito de mouse).

### Resumo

- Construa uma parte por vez e confira antes de seguir: assim você sabe o que quebrou.
- Ordem: estrutura, hero, background, seções, efeitos (um por vez) e celular.
- O site do módulo precisa ter hero, background, um efeito de scroll e um de mouse.

## Aula 4.3 — Ajuste fino

*Duração estimada: 6 a 8 minutos.*

### Abertura

O site está de pé. Mas "de pé" não é "pronto". Agora é a fase que separa o site amador do site que o cliente recomenda: o ajuste fino. É conversar com o Claude acertando detalhes visuais, travamentos e afins. E aqui pode ser na resenha: com a IA, o tom pode ser descontraído.

### Explicação

**Ajuste fino** é corrigir os detalhes que fazem diferença. Três tipos:

1. **Detalhes visuais:** espaçamento entre as coisas, tamanho de texto, alinhamento, cor de botão, contraste do texto com o fundo, imagem cortada errado, velocidade de uma animação.
2. **Travamentos:** animação engasgando, rolagem pesada, efeito que demora para aparecer. (No módulo 5 a gente caça lag no celular com calma; aqui você já corrige o que vê no computador.)
3. **Afins:** botão que não leva para lugar nenhum, link quebrado, texto com erro de digitação, coisa que aparece estranha numa tela menor.

Como pedir ajuste fino do jeito certo:

1. **Um ajuste por vez** (ou poucos, numerados).
2. **Diga onde:** qual seção, qual elemento.
3. **Diga o que está e o que você quer:** "está assim, quero assado".
4. **Mande print** quando for visual. Uma imagem economiza muita explicação.
5. **Use a referência** como régua: "quero o espaçamento parecido com o da referência".

Sobre o tom: com a IA eu falo descontraído, do meu jeito. Não precisa de linguagem formal, nem de "por gentileza". O que importa é ser **claro**, não ser formal. Já com o cliente, a gente vai ver no módulo 6, o tom é sempre sério.

E lembra: ajuste fino é estudo também. Quanto mais nome de efeito e de detalhe você souber, menos voltas você dá.

### Exemplo

Pedidos de ajuste fino (ilustração do jeito de pedir):

> Mano, olha esse print do hero. O título tá colado no botão, dá uma respirada aí, coloca mais espaço entre os dois. E o subtítulo tá meio apagado no fundo escuro, deixa ele mais claro pra dar pra ler.

> O fade up dos cards tá lento demais, parece que tá travando. Deixa mais rápido e com menos distância de movimento. Quero mais sutil, tipo a referência.

> Três coisinhas: (1) o botão do WhatsApp do rodapé não abre nada; (2) "tatuajem" tá escrito errado na seção de estilos; (3) a foto da galeria tá cortando a cabeça da pessoa, centraliza melhor.

### Passo a passo

1. Abra o site e percorra do começo ao fim com olhar de cliente exigente.
2. Anote tudo que incomoda, seção por seção, separando em: visual, travamento e afins.
3. Tire print de cada problema visual.
4. Ordene a lista: primeiro o que mais aparece (hero), depois o resto.
5. Mande um ajuste por vez (ou poucos, numerados), dizendo onde, como está e como quer.
6. Confira cada ajuste antes de mandar o próximo.
7. Risque da lista o que ficou bom.

### Exercício

**Tarefa:** faça uma rodada de ajuste fino com pelo menos 5 ajustes.

**O que entregar:** a lista dos 5 ajustes (com o tipo de cada um: visual, travamento ou afins), o pedido que você mandou para cada um e um print de antes e depois de pelo menos um.

**Como saber que fez certo:** cada pedido diz onde, como está e como você quer, e os 5 itens estão riscados da lista porque ficaram bons.

### Resumo

- Ajuste fino é acertar detalhes visuais, travamentos e afins.
- Peça um ajuste por vez, dizendo onde, como está e como quer, com print e usando a referência como régua.
- Com a IA o tom pode ser descontraído; o que importa é ser claro.

## Aula 4.4 — Quando quebra: print, erro e link

*Duração estimada: 7 a 9 minutos.*

### Abertura

Vai quebrar. Eu te garanto. Uma hora a página fica em branco, o efeito some, o layout desmonta. Isso é normal e acontece com todo mundo. A diferença é saber o que mandar para o Claude. E eu sempre mando três coisas. Bora ver quais são e onde achar cada uma.

### Explicação

Quando algo quebra, eu mando para o Claude: **o print, a mensagem de erro e o link, e peço a referência em detalhes.**

1. **O print:** a captura de tela mostrando o problema. O Claude vê o que você está vendo. Se o problema é um movimento (animação travando), uma gravação de tela curta ou vários prints ajudam.
2. **A mensagem de erro:** o texto que o sistema mostra quando algo dá errado. Onde achar:
   - No navegador: abra as **ferramentas do desenvolvedor (DevTools)** com a tecla **F12** (ou Ctrl+Shift+I no Windows/Linux, Cmd+Option+I no Mac) e vá na aba **Console**. Erros aparecem em vermelho. Copie o texto inteiro.
   - No Claude Code ou no terminal: copie a mensagem que aparecer na tela.
   - Na Vercel (depois do módulo 5): na tela do deploy existem os registros do build (logs), onde aparece o erro.
3. **O link:** o endereço onde o problema acontece (o link do site no ar, se já estiver na Vercel) e o link da **referência** que mostra como deveria ser.

E o quarto ponto: **pedir a referência em detalhes.** Ou seja, não basta dizer "quebrou". Você explica, com detalhe, como aquilo deveria funcionar, apontando na referência: o que deveria aparecer, onde e como se mexe.

Uma mensagem de correção completa diz: **o que você fez** (o último pedido antes de quebrar), **o que esperava**, **o que aconteceu**, e anexa **print, erro e link**.

Por isso construir por partes (aula 4.2) é tão importante: você sabe qual foi o último passo antes de quebrar.

### Exemplo

Mensagem de correção (ilustração de como estruturar):

> Claude, deu ruim. Depois que a gente colocou a imagem sticky na seção "Como funciona", a página ficou em branco do meio pra baixo.
>
> O que eu esperava: a imagem da esquerda ficar parada enquanto os 3 passos da direita rolam, igual na terceira seção da referência: [link da referência].
>
> O que aconteceu: tudo some depois da galeria. Segue o print.
>
> Erro que apareceu no Console: [cola aqui a mensagem inteira].
>
> Link de onde tá acontecendo: [link].
>
> Corrige só isso, sem mexer no resto do site, e me explica rapidinho o que tava errado.

### Passo a passo

1. Pare de pedir coisas novas assim que algo quebrar.
2. Tire o print (ou grave a tela) mostrando o problema.
3. Abra o DevTools (F12), vá na aba Console e copie a mensagem de erro inteira. Se o erro foi no Claude Code ou no terminal, copie de lá.
4. Separe o link de onde o problema acontece e o link da referência.
5. Escreva: o que você fez, o que esperava e o que aconteceu.
6. Descreva a referência em detalhes: como deveria funcionar.
7. Mande tudo junto e peça para corrigir só aquilo, sem mexer no resto.
8. Confira se corrigiu. Se não corrigiu depois de algumas tentativas, vá para a aula 4.5.

### Exercício

**Tarefa:** corrija pelo menos um erro do seu site usando print, mensagem de erro e link. Se nada quebrou ainda, abra o Console e procure qualquer mensagem de erro ou de aviso, ou corrija algo que não está funcionando como na referência.

**O que entregar:** a mensagem de correção que você mandou (com print, erro e link) e um print do problema resolvido.

**Como saber que fez certo:** sua mensagem tinha os três itens (print, mensagem de erro, link), descrevia em detalhes como deveria ser, e o problema sumiu sem quebrar outra parte. Isso completa o resultado do módulo 4.

### Resumo

- Quando quebra, mande ao Claude o print, a mensagem de erro e o link, e peça a referência em detalhes.
- A mensagem de erro do navegador fica no DevTools (F12), na aba Console.
- Diga o que fez, o que esperava e o que aconteceu, e peça para corrigir só aquilo.

## Aula 4.5 — Quando o Claude insiste no erro

*Duração estimada: 5 a 7 minutos.*

### Abertura

Às vezes você manda print, erro, link, explica tudo direitinho… e o Claude continua errando. Corrige uma coisa, quebra outra. Volta no mesmo erro. Calma, mano, tem saída. Eu faço uma coisa simples quando isso acontece.

### Explicação

Quando eu vejo que ele continua errando, **peço para outra IA analisar o problema e refazer um prompt**, e **levo esse prompt de volta para o Claude** corrigir.

Por que isso funciona? Porque às vezes o problema não é o Claude: é o jeito como o pedido está escrito, ou a conversa ficou longa e confusa. Outra IA olha de fora, sem o "vício" daquela conversa, e escreve um pedido mais claro e organizado.

O fluxo, na ordem:

1. **Perceba o padrão:** o mesmo erro voltou depois de algumas tentativas, ou cada correção quebra outra coisa.
2. **Leve o problema para outra IA** (por exemplo, o GPT, que você já usa): mande o print, a mensagem de erro, o link, a referência e o que você já tentou.
3. **Peça para ela analisar** o que pode estar causando o problema.
4. **Peça para ela escrever um prompt** de correção, claro e organizado, para você mandar ao Claude.
5. **Leve esse prompt de volta ao Claude** e mande.
6. **Confira** se corrigiu.

Duas dicas extras:

- Às vezes vale começar uma **conversa nova** com o Claude, colando o prompt reescrito e explicando o estado atual do projeto. Conversa muito longa pode atrapalhar.
- Guarde os prompts reescritos que funcionaram. Você aprende com eles a escrever pedidos melhores. Tudo é questão de estudo.

Lembra que a decisão final é sua: leia o prompt que a outra IA escreveu antes de mandar, e confira se ele não pede para mudar coisa que você não quer mudar.

### Exemplo

Pedido para a outra IA (ilustração):

> E aí! Tô fazendo um site em HTML e CSS com o Claude e ele tá preso num erro. Na seção "Como funciona", a imagem devia ficar sticky enquanto os passos rolam, mas ela não gruda, rola junto. Já pedi 4 vezes. Segue o print, o erro do Console e o link da referência que mostra como devia ser. Analisa o que pode estar causando e escreve um prompt bem claro pra eu mandar pro Claude corrigir, sem mexer no resto do site.

Depois você copia o prompt que ela escreveu e manda para o Claude.

### Passo a passo

1. Conte as tentativas: se o mesmo erro voltou depois de algumas correções, é hora de mudar de estratégia.
2. Junte print, mensagem de erro, link, referência e o que você já tentou.
3. Abra outra IA e mande tudo isso.
4. Peça a análise do problema e um prompt de correção para o Claude.
5. Leia o prompt e confira se ele não pede mudanças que você não quer.
6. Mande o prompt para o Claude (na mesma conversa ou numa nova, explicando o estado do projeto).
7. Confira a correção e guarde o prompt que funcionou.

### Exercício

**Tarefa:** pratique o fluxo com um problema do seu site (um erro que voltou, ou um ajuste que o Claude não acertou de primeira).

**O que entregar:** o pedido que você fez para a outra IA, o prompt que ela escreveu e o resultado depois de mandar esse prompt ao Claude.

**Como saber que fez certo:** você seguiu a ordem (outra IA analisa, reescreve o prompt, você leva de volta ao Claude) e conferiu o resultado no site.

### Resumo

- Se o Claude continua errando, peça para outra IA analisar o problema e reescrever o prompt.
- Leve esse prompt de volta ao Claude, de preferência lendo antes e, se preciso, numa conversa nova.
- Guarde os prompts que funcionaram: tudo é questão de estudo.

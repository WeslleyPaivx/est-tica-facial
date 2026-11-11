# Módulo 1 — Antes do primeiro prompt: mentalidade e ferramentas

**Objetivo:** tirar da cabeça a ideia do prompt milagroso, conhecer as ferramentas do fluxo do autor e entender o nível de site que se quer alcançar.

**Resultado do módulo:** o aluno tem contas no Claude, no GitHub e na Vercel e sabe explicar, na ordem, cada etapa do caminho entre a ideia e o site no ar.

## Aula 1.1 — Não existe prompt milagroso

*Duração estimada: 6 a 7 minutos.*

### Abertura

Fala, bora começar! Antes de abrir qualquer ferramenta, eu preciso tirar uma coisa da sua cabeça. Você provavelmente já viu vídeo por aí prometendo "o prompt que cria um site de 10 mil reais em 5 minutos". Olha só: não existe prompt milagroso. E se você entrar neste curso esperando um, vai se frustrar. Mas se você entrar sabendo disso, vai longe.

### Explicação

**Prompt** é o pedido que você escreve para a IA. Só isso. Não tem palavra mágica que faz o Claude entregar um site incrível sozinho.

E já que a gente vai falar muito em "gastar token à toa": **token** é a unidade que a IA usa para medir o texto que ela lê e escreve. Os planos do Claude têm limite de uso, e cada pedido confuso que precisa ser refeito come esse limite (e o seu tempo). Por isso o curso insiste tanto em pedir certo da primeira vez.

Por isso eu não uso prompt pronto. O site sai de três coisas:

1. **Imaginação:** você precisa ter na cabeça o que quer ver na tela.
2. **Estudo:** você precisa saber o nome das coisas (efeitos, seções, tipos de fundo) para pedir direito.
3. **Prática:** você precisa conversar com o Claude, testar, ajustar e repetir.

Então guarda esta frase: **não acredite em prompt milagroso que vai fazer seu site vender rios. Tudo é questão de estudo.** Estudar os efeitos e usar na prática.

E tem um exercício mental que eu faço sempre: **quando você olha algo, imagine aquilo virando um produto que vende.** Viu um site bonito? Uma animação legal no TikTok? Pensa: "isso aqui, no site de uma barbearia, de uma clínica, de uma loja, ficaria como?". É assim que a referência vira dinheiro.

Um aviso importante: neste curso, todo exemplo de pedido ao Claude que eu mostrar é uma **ilustração de como estruturar o pedido**, não uma fórmula mágica. Você vai aprender o jeito de montar o pedido (nome do efeito, onde ele fica, referência, o que você não quer), e aí cada pedido seu vai ser diferente, porque cada site é diferente.

### Exemplo

Compara dois pedidos para o Claude.

Pedido de quem acredita em prompt milagroso:

> Faz um site incrível e profissional pra uma barbearia que venda muito.

O que é "incrível"? O que é "profissional"? O Claude vai chutar. E você vai gastar token à toa pedindo de novo.

Pedido de quem estudou (é só ilustração, tá?):

> Bora montar o hero de um site de barbearia. Quero uma foto de fundo escura ocupando a tela inteira, o nome da barbearia grande no centro e um botão "Agendar horário" logo abaixo. Quando a página carregar, o texto aparece subindo de leve. Não quero nada piscando nem cor neon. Segue o link de uma referência que eu curti: [link].

Percebe a diferença? O segundo pedido não é mágico. Ele só é claro, porque quem escreveu sabia o que queria e sabia o nome das coisas.

### Passo a passo

1. Pegue um caderno ou um arquivo no computador e chame de "Diário de referências".
2. Escreva no topo: "Não existe prompt milagroso. Tudo é questão de estudo."
3. Abra qualquer rede social ou site e encontre uma coisa visual que chamou sua atenção (uma animação, um layout, uma foto bem usada).
4. Anote o que você viu, com suas palavras.
5. Embaixo, escreva: "Isso viraria um produto para qual negócio?" e responda com um tipo de negócio real.
6. Repita esse olhar no dia a dia. É o hábito que sustenta todo o resto do curso.

### Exercício

**Tarefa:** encontre 3 coisas visuais (sites, vídeos, animações) e, para cada uma, escreva duas linhas: o que você viu e para que tipo de negócio aquilo viraria um produto que vende.

**O que entregar:** uma lista com as 3 referências (link ou print) e as duas linhas de cada uma.

**Como saber que fez certo:** cada item tem um negócio concreto (ex.: "pet shop", "estúdio de tatuagem"), e não só "fica bonito". Se você conseguiu imaginar o cliente, fez certo.

### Resumo

- Não existe prompt milagroso: o site sai de imaginação, estudo e prática.
- Os pedidos de exemplo do curso mostram como estruturar um pedido; não são fórmulas mágicas.
- Quando olhar algo, imagine aquilo virando um produto que vende.

## Aula 1.2 — O fluxo completo, do zero ao site no ar

*Duração estimada: 6 a 8 minutos.*

### Abertura

Agora que a gente tirou o prompt milagroso da frente, deixa eu te mostrar o mapa. Todo site que eu faço passa pelo mesmo caminho, sempre na mesma ordem. Se você decorar esse caminho, nunca mais vai ficar perdido sem saber "e agora, o que eu faço?". Bora ver.

### Explicação

O fluxo tem **6 etapas**, nesta ordem:

1. **Referências:** eu vejo várias referências no TikTok ou nos sites que reúnem os sites premiados como os melhores do mundo.
2. **Estudo da base:** pego as informações e tento extrair toda a base daquele site (estrutura e efeitos), para entregar algo no mesmo nível.
3. **Construção com o Claude:** converso com o Claude, ajustando detalhes visuais, travamentos e afins.
4. **GitHub:** o projeto vai para um repositório no GitHub, que é onde o código do site fica guardado.
5. **Vercel:** a Vercel pega o que está no GitHub, faz o deploy e hospeda o site, gerando um link para qualquer pessoa abrir.
6. **Domínio:** quando o cliente fecha e aprova o site, vem a compra do domínio (o endereço tipo "nomedaempresa.com.br"), que **fica por conta do cliente**.

Dentro da etapa 3, e de novo depois da etapa 5, vem a **revisão**: testar no celular de verdade (lag) e rodar o checklist (aulas 5.1 e 5.2). Ela não é uma etapa separada porque acontece o tempo todo, mas é a que mais faz perder cliente quando é pulada.

Repara numa coisa: o Claude só começa a **construir** na etapa 3. Nas etapas 1 e 2, quem estuda é você. Você pode usar o claude.ai como ajudante para listar seções e efeitos de uma referência (aula 1.3), mas quem escolhe a referência, confere com os próprios olhos e decide é você. É por isso que tanta gente se dá mal: pula direto para o Claude construir, sem referência e sem saber o que quer.

E repara em outra: o domínio é a última coisa, e só acontece **quando o cliente fecha**. Você não precisa gastar com domínio para mostrar o site. O link da Vercel já serve para apresentar.

#### Construir antes ou depois de fechar? Depende da abordagem

O momento de construir o site do cliente muda conforme o jeito que você chega nele (o módulo 6 detalha):

1. **Abordagem pessoal (você vai até o negócio):** você faz o site primeiro e depois vai lá abordar, mostrando o site pronto pelo link da Vercel. Se ele fechar, aí entram o briefing e o contrato (aula 6.4) e, por último, o domínio.
2. **Abordagem online (mensagem ou ligação):** o site vem depois. Primeiro o cliente escolhe a opção, preenche o briefing, assina o contrato e faz o pagamento combinado (aula 6.4). Só então você roda as etapas 1 a 5 para ele, mostra a versão pronta no link da Vercel e, quando ele aprovar, entra o domínio.

E existe um terceiro site, que não é de cliente nenhum: o **seu site de portfólio**, que você faz por conta própria para mostrar o seu nível na prospecção (é o que você vai construir neste curso).

Cada etapa tem um módulo do curso:

- Etapas 1 e 2: módulos 2 e 3 (efeitos e referências).
- Etapa 3: módulo 4 (construindo com o Claude).
- Etapas 4, 5 e 6: módulo 5 (revisão e site no ar).
- E depois tudo isso vira dinheiro no módulo 6 (vendendo o site).

### Exemplo

Imagina que você quer fazer um site de exemplo para uma doceria, para usar como portfólio.

- Etapa 1: você salva três sites premiados e dois vídeos do TikTok com efeitos que curtiu.
- Etapa 2: você anota que um deles tem um hero com foto grande e texto que aparece ao carregar, e seções que surgem quando você rola a página.
- Etapa 3: você manda a referência para o Claude e constrói o site seção por seção.
- Etapa 4: você sobe o projeto para um repositório no GitHub.
- Etapa 5: você conecta esse repositório na Vercel e ganha um link no ar.
- Etapa 6: como é portfólio, não tem domínio de cliente; o link da Vercel basta. Se um dia uma doceria de verdade fechar com você, ela compra o domínio e você liga ao site dela.

### Passo a passo

1. Escreva as 6 etapas numa folha, na ordem: referências, estudo da base, construção com o Claude, GitHub, Vercel, domínio.
2. Ao lado de cada etapa, escreva em uma frase o que acontece nela.
3. Marque com um círculo as etapas em que você ainda não tem conta ou ferramenta (provavelmente Claude, GitHub e Vercel; as contas a gente cria nas próximas aulas).
4. Cole essa folha perto do computador. Sempre que travar, olhe em qual etapa você está.

### Exercício

**Tarefa:** explique o fluxo completo em voz alta, sem olhar, como se estivesse contando para um amigo. Grave um áudio de até 1 minuto.

**O que entregar:** o áudio (ou um texto curto, se preferir) com as 6 etapas.

**Como saber que fez certo:** você falou as 6 etapas na ordem certa, disse que o Claude começa a construir na etapa 3, que o domínio só acontece quando o cliente fecha e é pago por ele, e explicou quando o site vem antes de fechar (abordagem pessoal) e quando vem depois (abordagem online).

### Resumo

- O fluxo tem 6 etapas: referências, estudo da base, construção com o Claude, GitHub, Vercel e domínio, com a revisão no celular acontecendo dentro delas.
- Nas duas primeiras etapas quem estuda é você; o Claude começa a construir na terceira.
- Abordagem pessoal: site pronto antes de abordar; abordagem online: briefing, contrato e pagamento antes de construir. O domínio vem por último, por conta do cliente.

## Aula 1.3 — claude.ai e Claude Code: quando usar cada um

*Duração estimada: 6 a 8 minutos.*

### Abertura

Muita gente acha que "Claude" é uma coisa só. Mas eu uso dois jeitos diferentes de trabalhar com ele: o claude.ai e o Claude Code. Os dois. E entender a diferença vai te poupar muita dor de cabeça. Olha só.

### Explicação

**claude.ai** é o Claude em formato de conversa: você abre no navegador (ou no aplicativo), escreve, ele responde. É o jeito que você provavelmente já conhece de usar o GPT. Você pode mandar texto, prints e arquivos, e ele te devolve resposta, ideia, explicação e até código para você copiar.

**Claude Code** é o Claude trabalhando direto nos arquivos do seu projeto. Em vez de te devolver código para você copiar e colar, ele lê a pasta do site, cria e edita os arquivos e pode rodar comandos no seu computador (como os comandos do Git, que a gente vai usar com o GitHub). Ele pede sua permissão para várias dessas ações. Ele roda no terminal e também em outros lugares, como no aplicativo do Claude e em editores de código; o jeito de instalar e quais planos dão acesso podem mudar, então confira sempre na página oficial do Claude.

Resumindo de um jeito simples:

- **claude.ai = conversar, pensar, planejar.** Ótimo para estudar uma referência, tirar dúvida, montar o briefing, organizar a ideia do site, escrever o pedido antes de mandar.
- **Claude Code = construir.** Ótimo para criar e mexer nos arquivos do site, corrigir erro dentro do projeto e subir para o GitHub.

Não existe regra fixa. Tem coisa que dá para fazer nos dois. Mas quando o trabalho é "mexer no código do site", o Claude Code costuma ser o caminho mais direto, porque ele já está dentro do projeto.

### Exemplo

Você achou uma referência e quer entender os efeitos dela. Abre o claude.ai, manda o print e o link e pergunta, de boa:

> E aí, Claude! Olha esse print. Me ajuda a listar as seções desse site, na ordem, e os efeitos que você acha que tem em cada uma? Quero os nomes certinhos dos efeitos, tipo parallax, hover, essas coisas.

Depois, com a estrutura anotada, você abre o Claude Code na pasta do seu projeto e pede:

> Bora começar o site. Cria a estrutura básica em HTML e CSS e monta só o hero por enquanto: foto de fundo, título grande no centro e um botão "Fale conosco". Ainda sem efeito nenhum.

No primeiro caso você estava pensando. No segundo, construindo. (E lembra: são ilustrações de como pedir, não fórmula.)

### Passo a passo

1. Entre no site do Claude (claude.ai) e crie sua conta, se ainda não tiver.
2. Faça uma conversa de teste: peça para ele explicar, com palavras simples, o que é um site em HTML e CSS.
3. Procure, na página oficial do Claude, as instruções atuais de instalação do Claude Code e veja quais planos incluem ele.
4. Se for usar o Claude Code agora, siga a instalação oficial e abra ele numa pasta vazia criada para o seu primeiro site.
5. Peça para ele criar um arquivo de teste (um "index.html" com um "Olá") e veja o arquivo aparecer na pasta.

**Se você ainda está só no claude.ai:** ele te devolve o código, e quem cria o arquivo é você. Crie uma pasta para o site. Abra um editor de texto simples (Bloco de Notas no Windows; no Mac, o TextEdit em modo "texto simples"), cole o código e salve com o nome exato que o Claude indicou (ex.: index.html), escolhendo "Todos os arquivos" e a codificação UTF-8. Dê dois cliques no arquivo para abrir no navegador. Quando o site tiver mais de um arquivo (ex.: style.css, script.js, pasta de imagens), peça ao Claude o nome de cada arquivo e em que pasta ele fica. Esse caminho serve para começar, mas o curso usa o Claude Code nas etapas seguintes (servidor local, imagens, GitHub). Planeje ter acesso a ele até o módulo 4.

### Exercício

**Tarefa:** faça duas tarefas, uma em cada ferramenta. No claude.ai, peça a lista de seções de um site que você gosta. No Claude Code (ou no claude.ai, se ainda não tiver o Claude Code), peça a criação de um "index.html" simples.

**O que entregar:** um print da conversa no claude.ai e um print do arquivo criado.

**Como saber que fez certo:** você consegue explicar, em uma frase, por que usou cada ferramenta naquela tarefa: uma para pensar, outra para construir.

### Resumo

- claude.ai é o Claude em conversa: ótimo para pensar, estudar referências e planejar.
- Claude Code trabalha direto nos arquivos do projeto: cria, edita e roda comandos, pedindo permissão.
- O autor usa os dois; para mexer no código do site, o Claude Code costuma ser o caminho mais direto.

## Aula 1.4 — GitHub e Vercel em uma frase

*Duração estimada: 5 a 7 minutos.*

### Abertura

Essas duas palavras assustam iniciante: GitHub e Vercel. Parece coisa de programador sênior. Relaxa, mano. Eu vou te explicar cada uma em uma frase, e no fim da aula você vai ter as duas contas criadas.

### Explicação

**GitHub guarda o repositório do site.** Repositório é a pasta do seu projeto guardada na internet, com o histórico de todas as mudanças. Se o seu computador pifar, o site está salvo lá.

**Vercel faz o deploy e a hospedagem.** Deploy é o ato de publicar o site, de colocar ele no ar. Hospedagem é manter ele no ar, num servidor, para qualquer pessoa abrir pelo link. A Vercel faz as duas coisas.

E as duas conversam entre si: você conecta o repositório do GitHub na Vercel. A partir daí, cada vez que você manda uma mudança para o GitHub, a Vercel publica de novo automaticamente. Você não precisa ficar mandando arquivo para lugar nenhum.

Ordem que você nunca esquece: **o código vai para o GitHub, e a Vercel pega do GitHub e coloca no ar.**

Os passos para subir o site de verdade ficam para o módulo 5. Hoje é só criar as contas.

Dois cuidados que evitam dor de cabeça na hora de criar as contas:

1. **Confirme o e-mail.** Conta sem e-mail confirmado costuma travar alguma função lá na frente.
2. **Entre na Vercel usando o GitHub.** Se você criar a Vercel com outro e-mail, sem ligar ao GitHub, depois vai ter que fazer essa ligação manualmente para a Vercel enxergar seus repositórios. Entrando direto com o GitHub, isso já fica resolvido.

E por que não mandar o site para o cliente num arquivo, pelo WhatsApp? Porque arquivo no celular dele não é site no ar. O cliente precisa de um link que qualquer pessoa abra, de qualquer lugar. É isso que a Vercel te dá.

### Exemplo

Pensa assim: o GitHub é a gaveta onde fica guardada a versão oficial do site. A Vercel é a vitrine da loja: ela pega o que está na gaveta e expõe para todo mundo ver. Mudou o que tem na gaveta? A vitrine atualiza sozinha.

### Passo a passo

1. Entre no site do GitHub (github.com) e procure a opção de criar conta (algo como "Sign up").
2. Use um e-mail que você acessa sempre e escolha um nome de usuário profissional, porque ele vai aparecer para cliente (evite apelido estranho).
3. Confirme o e-mail que o GitHub enviar.
4. Entre no site da Vercel (vercel.com) e procure a opção de criar conta ("Sign Up").
5. Quando ela oferecer formas de entrar, escolha continuar com o GitHub. Assim as duas contas já ficam ligadas.
6. Autorize a Vercel a acessar sua conta do GitHub quando ela pedir.
7. Se aparecer escolha de plano, para estudar e fazer os primeiros projetos use o plano gratuito para uso pessoal (hobby); antes de usar com cliente, leia os termos atuais da Vercel sobre uso comercial, porque as regras dos planos podem mudar.

### Exercício

**Tarefa:** crie sua conta no GitHub e na Vercel, com a Vercel ligada ao GitHub.

**O que entregar:** um print da tela inicial do GitHub logado e um print da tela inicial da Vercel logado.

**Como saber que fez certo:** você entrou na Vercel usando a conta do GitHub e consegue explicar em uma frase o que cada uma faz: GitHub guarda o repositório; Vercel faz o deploy e a hospedagem.

### Resumo

- GitHub guarda o repositório do site (a pasta do projeto, com histórico).
- Vercel faz o deploy (publicar) e a hospedagem (manter no ar com um link).
- O código vai para o GitHub e a Vercel pega de lá; cada mudança enviada é publicada de novo automaticamente.

## Aula 1.5 — O nível que a gente quer: pear.no

*Duração estimada: 6 a 8 minutos.*

### Abertura

Agora vou te mostrar onde a gente quer chegar. Tem um site que eu uso bastante de referência, o Pear, aquele da maçã: pear.no. Não fui eu que fiz, deixo isso bem claro. Mas é ele que eu uso como inspiração para um dia chegar naquele nível. Bora olhar com calma.

### Explicação

Por que ter uma referência de nível? Porque sem meta você se contenta com qualquer coisa. Com uma meta na frente, você sabe o quanto ainda falta e onde melhorar.

O que você precisa saber sobre o pear.no:

- O endereço é **pear.no**.
- Ele foi feito **todo em HTML e CSS**. Ou seja: dá para chegar num resultado muito alto sem ferramenta complicada; o que faz diferença é o capricho.
- Ele está **hospedado na Vercel**, a mesma ferramenta que você vai usar.
- **Não foi feito pelo autor do curso.** É uma referência de nível, não um trabalho meu.

E a frase que resume por que ele é a meta: **se eu comprasse um site e me entregassem algo naquele nível, eu ficaria muito feliz e recomendaria o serviço sempre.** Esse é o padrão. O site que você entrega tem que fazer o cliente sentir isso.

Importante: a gente usa ele para **estudar e se inspirar**, não para copiar. Na aula 3.3 você vai ver isso direitinho.

### Exemplo

Em vez de eu te contar o que tem no site, quero que você abra e observe. Olhar com os próprios olhos treina muito mais. Abre o pear.no no computador e repara: como é a primeira tela? O que acontece quando você rola? O que acontece quando passa o mouse em cima das coisas? Depois abre no celular e compara.

Enquanto observa, use estas perguntas como guia (elas servem para qualquer site de referência, não só para esse):

1. O que o meu olho vê primeiro quando a página abre?
2. Tem muita coisa na tela ou pouca coisa bem cuidada?
3. O que se mexe tem um motivo (guiar o olhar, mostrar algo) ou parece só enfeite?
4. No celular, a experiência continua boa ou fica pesada?
5. Eu confiaria num negócio que tivesse um site assim?

Você ainda não sabe o nome de todos os efeitos, e tudo bem. No módulo 2 você vai aprender esses nomes e vai voltar aqui com outros olhos.

### Passo a passo

1. Abra pear.no no navegador do computador.
2. Fique 30 segundos só olhando a primeira tela, sem rolar. Anote o que você vê.
3. Role a página devagar, do começo ao fim. Anote tudo que se mexe, aparece ou muda.
4. Passe o mouse por cima de botões, imagens e textos. Anote o que reage.
5. Abra o mesmo endereço no seu celular e role do começo ao fim. Anote o que ficou diferente.
6. Responda: "Se eu entregasse algo nesse nível para um cliente, o que ele sentiria?"
7. Guarde essas anotações. Você vai usar no módulo 2 e no módulo 3.

### Exercício

**Tarefa:** faça uma observação do pear.no seguindo o passo a passo.

**O que entregar:** uma lista com pelo menos 5 coisas que você notou (primeira tela, rolagem, mouse, celular) e uma frase sobre o que um cliente sentiria recebendo um site nesse nível.

**Como saber que fez certo:** sua lista tem observações das quatro situações (primeira tela, rolando, mouse e celular). Se faltou o celular, volta lá: revisar no celular é uma das coisas mais importantes do curso inteiro.

### Resumo

- pear.no é a referência de nível: feito todo em HTML e CSS, hospedado na Vercel, e não foi feito pelo autor.
- A meta é entregar algo que faça o cliente ficar feliz e recomendar o serviço sempre.
- A gente estuda a referência abrindo e observando (computador e celular), para se inspirar, nunca para copiar.

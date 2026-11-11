# Módulo 2 — Efeitos básicos: o nome de cada coisa

**Objetivo:** dar ao aluno o vocabulário dos efeitos para ele saber pedir ao Claude pelo nome certo, em vez de gastar token à toa descrevendo o que não sabe nomear.

**Resultado do módulo:** o aluno olha um site, identifica pelo nome o hero, o background e os efeitos de scroll e de mouse, e escreve um pedido ao Claude usando esses nomes.

## Aula 2.1 — Hero: a primeira dobra do site

*Duração estimada: 6 a 8 minutos.*

### Abertura

Um dos erros que eu mais vejo é não saber o nome dos efeitos antes de pedir. Aí você fica escrevendo um parágrafo inteiro para descrever "aquela parte de cima com a foto grandona" e você só vai gastar token à toa. Então este módulo inteiro é vocabulário. E a gente começa pelo topo: o hero.

### Explicação

**Hero** (também chamado de **hero section** ou "seção hero") é a primeira seção do site, aquela que aparece assim que a página abre, antes de você rolar.

Ela está ligada a outra expressão que você vai ouvir: **primeira dobra**, ou em inglês **above the fold** ("acima da dobra"). É tudo que cabe na tela sem rolar. O nome vem do jornal impresso: a parte de cima da primeira página, que aparece quando o jornal está dobrado na banca.

Por que o hero importa tanto? Porque **é onde a pessoa decide se continua olhando ou fecha o site**. São os primeiros segundos. Se o hero for confuso, lento ou feio, muita gente nem rola.

O que costuma ter num hero:

1. **Título principal (headline):** a frase grande que diz o que o negócio é ou oferece.
2. **Subtítulo:** uma frase menor que complementa o título.
3. **Botão de ação, o CTA** (de **call to action**, "chamada para ação"): o botão que leva a pessoa a fazer algo, como "Agendar horário", "Falar no WhatsApp", "Ver cardápio".
4. **Imagem, vídeo ou elemento visual:** foto do negócio, vídeo de fundo, ilustração ou um elemento 3D.
5. **Menu de navegação (navbar):** a barra com logo e links, normalmente no topo, por cima do hero.

Nem todo hero tem tudo isso. Mas título e CTA são quase sempre obrigatórios: a pessoa precisa entender o que é e saber o que fazer.

O hero também é o lugar onde os efeitos de entrada mais aparecem, por exemplo o texto surgindo quando a página carrega. Isso se chama animação de entrada (em inglês você vai ver "intro animation" ou "load animation").

### Exemplo

Um hero para uma barbearia poderia ter: navbar com o logo à esquerda e links à direita; uma foto escura da barbearia ocupando a tela inteira; o título "Corte e barba sem pressa" no centro; o subtítulo "No centro da cidade, de terça a sábado"; e o CTA "Agendar horário".

Pedido ao Claude (ilustração de como estruturar, não fórmula):

> Bora fazer o hero. Ocupando a tela inteira (100% da altura da tela), com foto escura de fundo. No centro: título "Corte e barba sem pressa", subtítulo menor embaixo e um botão CTA "Agendar horário". Navbar transparente por cima, logo à esquerda, links à direita. Animação de entrada simples: o título aparece subindo de leve quando carrega. Nada exagerado.

### Passo a passo

1. Abra três sites diferentes que você gosta (pode incluir o pear.no).
2. Em cada um, sem rolar, tire um print da primeira dobra.
3. Em cada print, marque: título, subtítulo, CTA, elemento visual e navbar.
4. Anote o que tem e o que não tem em cada hero.
5. Anote se tem animação de entrada (algo se mexe quando a página carrega).
6. Responda para cada um: em 3 segundos dá para entender o que o negócio faz?

### Exercício

**Tarefa:** analise o hero de 3 sites.

**O que entregar:** os 3 prints com as partes marcadas e, para cada um, uma linha dizendo se dá para entender o negócio em 3 segundos.

**Como saber que fez certo:** você usou os nomes certos (hero, headline, CTA, navbar, primeira dobra) e encontrou o CTA de cada site.

### Resumo

- Hero é a primeira seção do site, a primeira dobra (above the fold), o que aparece sem rolar.
- Costuma ter título (headline), subtítulo, botão CTA, elemento visual e navbar.
- É onde a pessoa decide se continua olhando; título e CTA precisam ser claros.

## Aula 2.2 — Background: o fundo que trabalha

*Duração estimada: 6 a 8 minutos.*

### Abertura

Fundo parece detalhe, né? Não é. O fundo, o background, é o que dá clima para o site inteiro. Um site premium com fundo errado vira site amador. Bora conhecer os tipos e, principalmente, como pedir cada um.

### Explicação

**Background** é o fundo de uma seção ou da página inteira. Cada seção pode ter o seu. Os tipos principais:

1. **Cor sólida:** uma cor só. Simples, leve e elegante quando bem escolhida. Exemplo de pedido: "fundo preto", "fundo bege claro".
2. **Gradiente (gradient):** uma cor passando suavemente para outra. Pode ser **linear** (em linha, de cima para baixo, da esquerda para a direita) ou **radial** (em círculo, do centro para fora).
3. **Imagem de fundo (background image):** uma foto atrás do conteúdo. Normalmente vem com uma **camada escura por cima**, chamada **overlay**, para o texto ficar legível.
4. **Vídeo de fundo (background video):** um vídeo rodando atrás do conteúdo, em geral sem som e em loop (repetindo). Bonito, mas pesado: precisa ser curto e comprimido.
5. **Fundo animado (animated background):** um fundo que se mexe sozinho, como um gradiente que muda de cor devagar, formas flutuando ou partículas.
6. **Elementos 3D:** um objeto ou cena em três dimensões no fundo, que pode girar ou reagir ao mouse e à rolagem. No navegador isso usa uma tecnologia chamada **WebGL**, e uma biblioteca muito usada para isso se chama **Three.js**. Você não precisa saber programar isso; precisa saber o nome para pedir.

> **De onde vem o objeto 3D?** O Claude escreve o código da cena 3D (por exemplo, com Three.js), mas ele não tem o produto do seu cliente. Para mostrar **aquele** tênis ou **aquela** garrafa em 3D, o modelo do produto precisa existir como arquivo, normalmente no formato **glTF/GLB**. Os caminhos: (1) o cliente ou o fabricante já tem o modelo; (2) você compra ou contrata um modelo, conferindo a licença de uso; (3) você usa formas que o próprio Claude cria por código (esferas, ondas, partículas, formas abstratas), que não precisam de arquivo e costumam ser mais leves. Sem arquivo, não peça "o produto do cliente em 3D": peça uma forma abstrata ou use foto.
>
> **Atenção:** site com 3D precisa ser aberto por um **servidor local** (peça ao Claude Code para subir um), e não com dois cliques no index.html. Aberto direto do disco, o navegador costuma bloquear o arquivo 3D e a cena fica em branco.

Uma regra que vale para todos: **quanto mais o fundo se mexe, mais pesado o site fica**, principalmente no celular. Vídeo e 3D são os mais pesados. Cor sólida e gradiente são os mais leves. Guarda isso, porque no módulo 5 a gente vai caçar lag.

E outra regra: **o fundo trabalha para o conteúdo, não contra ele.** Se o texto ficou difícil de ler, o fundo está errado.

### Exemplo

Para uma clínica de estética: fundo de cor sólida bem clara nas seções de texto, e no hero uma foto com overlay escuro para o título branco aparecer.

Para um estúdio de design que quer impressionar: no hero, um elemento 3D girando devagar; nas outras seções, fundo sólido, para não pesar.

Pedido ao Claude (ilustração de como estruturar):

> No hero quero uma imagem de fundo cobrindo a tela toda, com um overlay preto de uns 50% de opacidade pra o texto branco ficar legível. Nas outras seções, fundo de cor sólida bege claro. Sem vídeo, quero o site leve.

### Passo a passo

1. Escolha um site de referência.
2. Role do começo ao fim e, para cada seção, anote o tipo de background: cor sólida, gradiente, imagem, vídeo, animado ou 3D.
3. Quando for imagem, veja se tem overlay (o texto está sobre uma camada escura ou clara?).
4. Anote quais fundos se mexem.
5. Abra o mesmo site no celular e veja se os fundos que se mexem continuam iguais ou se o site troca por algo mais simples.

### Exercício

**Tarefa:** faça um "mapa de fundos" de um site.

**O que entregar:** uma lista com cada seção do site e o tipo de background dela, usando os nomes da aula.

**Como saber que fez certo:** toda seção tem um tipo nomeado, e você indicou quais fundos são pesados (vídeo, animado, 3D) e quais são leves (cor sólida, gradiente).

### Resumo

- Tipos de background: cor sólida, gradiente (linear ou radial), imagem (com overlay), vídeo, fundo animado e elementos 3D (WebGL/Three.js).
- Quanto mais o fundo se mexe, mais pesado o site fica; vídeo e 3D são os mais pesados, e o 3D de um produto precisa de um arquivo de modelo (glTF/GLB) e de servidor local para abrir.
- O fundo trabalha para o conteúdo: se o texto ficou difícil de ler, o fundo está errado.

## Aula 2.3 — Efeitos de scroll (rolagem)

*Duração estimada: 8 a 10 minutos.*

### Abertura

Agora vem a parte que deixa o site com cara de site premiado: os efeitos de scroll. Scroll é rolagem, é você descendo a página. E muita coisa legal acontece enquanto você rola. Essa aula é mais longa porque tem bastante nome para aprender. Pega o caderno e bora.

### Explicação

**Scroll** é o movimento de rolar a página. **Efeito de scroll** é qualquer coisa que acontece por causa da rolagem. Os quatro básicos:

#### 1. Elementos que aparecem ao rolar (scroll reveal)

O elemento está invisível ou fora do lugar e, quando chega na tela durante a rolagem, ele aparece com uma animação. Nomes que você pode usar: **scroll reveal**, **reveal on scroll**, **fade in on scroll** (aparece clareando) ou **fade up** (aparece subindo enquanto clareia). Quando vários itens aparecem um depois do outro, em sequência, isso se chama **stagger** (escalonado).

É o efeito de scroll mais comum, mais leve e mais seguro. Se você for usar um só, use esse.

#### 2. Parallax

**Parallax** é quando camadas diferentes se movem em **velocidades diferentes** durante a rolagem. Por exemplo: o texto sobe na velocidade normal e a imagem de fundo sobe mais devagar. Isso dá uma sensação de profundidade, como olhar pela janela do carro: o poste passa rápido e a montanha passa devagar.

Para pedir, diga quais camadas se movem e qual vai mais devagar ou mais rápido. Parallax exagerado enjoa e pode pesar no celular.

#### 3. Seção fixa enquanto o conteúdo muda (sticky e pin)

Aqui uma parte fica **presa na tela** enquanto você rola, e o conteúdo dentro dela ou ao lado dela vai mudando. Dois nomes:

- **Sticky** ("grudento"): um elemento rola normalmente até chegar num ponto e aí gruda na tela enquanto o resto da seção passa. Exemplo clássico: uma imagem à esquerda que fica parada enquanto os textos da direita rolam. No CSS isso existe com o nome **position: sticky**.
- **Pin** ou **pinned section** ("seção fixada"): a seção inteira fica travada na tela por um tempo, e a rolagem, em vez de descer a página, faz coisas acontecerem dentro dela (trocar imagens, avançar etapas). Depois de terminar, a página volta a rolar normalmente. Isso costuma ser feito com bibliotecas de animação, como o **GSAP**, com um recurso chamado **ScrollTrigger**.

Uma variação muito usada é o **scroll horizontal**: você rola para baixo e a seção, presa na tela, anda para o lado.

#### 4. Animação que acompanha a rolagem (scroll-driven, scrub)

Aqui a animação não só "dispara" quando o elemento aparece: ela **avança e volta junto com a rolagem**. Rolou um pouco, a animação anda um pouco. Rolou para cima, ela volta. O nome técnico mais usado é **scrub** ("atrelar a animação à rolagem"), e você também vai ver **scroll-driven animation** ou "animação vinculada ao scroll". Exemplos: um objeto 3D que gira conforme você rola, um texto que vai se preenchendo de cor, uma barra de progresso de leitura no topo.

Diferença que cai em prova: **scroll reveal dispara uma vez quando o elemento entra na tela; scrub acompanha a rolagem o tempo todo, para a frente e para trás.**

#### Um extra: rolagem suave (smooth scroll)

Alguns sites deixam a própria rolagem mais macia, com um leve "deslize". Isso se chama **smooth scroll**, e uma biblioteca conhecida para isso é a **Lenis**. É opcional; se ficar estranho no celular, tire.

### Exemplo

Site de uma doceria:

- Hero com o título aparecendo ao carregar.
- Seção "Nossos doces": cards dos produtos com **fade up** em **stagger**, um depois do outro.
- Seção "Como fazemos": imagem **sticky** à esquerda e três etapas rolando à direita.
- Seção "Sobre": foto de fundo com **parallax** leve.

Pedido ao Claude (ilustração de como estruturar):

> Na seção "Nossos doces", quero os cards aparecendo com fade up quando chegarem na tela, em stagger, um depois do outro, rapidinho. Só uma vez, não precisa repetir quando rolar pra cima. Na seção "Como fazemos", deixa a imagem da esquerda sticky enquanto os três passos da direita rolam. Nada de parallax nessa seção.

### Passo a passo

1. Abra um site de referência no computador.
2. Role bem devagar e, a cada coisa que se mexer, pare.
3. Pergunte: apareceu uma vez quando entrou na tela? É **scroll reveal**.
4. Camadas andando em velocidades diferentes? É **parallax**.
5. Algo ficou preso na tela enquanto o resto mudava? É **sticky** ou **pin**.
6. A animação vai e volta quando você rola para baixo e para cima? É **scrub** (animação que acompanha a rolagem). Cuidado: o parallax também anda junto com a rolagem, para baixo e para cima. A diferença: no parallax, **camadas andam em velocidades diferentes**; no scrub, **uma animação** (girar, preencher, avançar etapas, encher uma barra) é controlada pela rolagem.
7. Anote o nome do efeito e a seção onde ele aparece.

### Exercício

**Tarefa:** encontre em sites reais um exemplo de cada um dos quatro efeitos de scroll: scroll reveal, parallax, sticky/pin e scrub.

**O que entregar:** uma tabela simples com 4 linhas: nome do efeito, link do site, seção onde aparece e uma frase descrevendo o que acontece.

**Como saber que fez certo:** para o scrub, você testou rolar para cima e a animação voltou; para o parallax, você viu duas camadas em velocidades diferentes. Se não fez esse teste, ainda não tem certeza do nome.

### Resumo

- Scroll reveal (fade in, fade up, stagger): o elemento aparece quando entra na tela; é o mais leve e comum.
- Parallax: camadas em velocidades diferentes; sticky/pin: algo preso na tela enquanto o conteúdo muda.
- Scrub (animação que acompanha a rolagem) vai e volta com o scroll, diferente do reveal, que dispara uma vez.

## Aula 2.4 — Efeitos de mouse

*Duração estimada: 7 a 9 minutos.*

### Abertura

Agora é a vez do mouse. Efeito de mouse é aquele detalhe que faz a pessoa pensar "caramba, esse site é caprichado". Mas tem uma pegadinha enorme que muito iniciante esquece: no celular não existe mouse. Bora ver os efeitos e o que fazer com eles no celular.

### Explicação

#### 1. Hover

**Hover** é quando você passa o mouse por cima de um elemento, sem clicar, e ele reage. Exemplos: o botão muda de cor, a imagem dá um zoom leve, o card sobe um pouquinho, aparece uma legenda, o link ganha um sublinhado animado. É o efeito de mouse mais básico e mais útil, porque mostra para a pessoa "isso aqui é clicável".

#### 2. Cursor personalizado (custom cursor)

O site troca a setinha padrão por um cursor próprio: uma bolinha, um círculo, um ícone. Muitas vezes o cursor muda quando passa por cima de algo (cresce em cima de um link, mostra "ver" em cima de uma imagem). Nome para pedir: **custom cursor**.

#### 3. Elementos que seguem ou reagem ao mouse

- **Cursor follower:** um elemento que segue o mouse com um pequeno atraso, como uma bolinha correndo atrás da setinha.
- **Botão magnético (magnetic button):** quando o mouse chega perto, o botão é "puxado" levemente na direção dele.
- **Tilt:** um card ou imagem que inclina em 3D conforme a posição do mouse em cima dele.
- **Parallax de mouse (mouse parallax):** camadas que se movem um pouco conforme você mexe o mouse pela tela, dando profundidade. Em cenas 3D, é comum o objeto ou a "câmera" girar levemente acompanhando o mouse.

#### 4. E no celular?

No celular **não existe mouse**: não tem cursor e não tem hover de verdade. A pessoa toca na tela. Então todo efeito de mouse precisa de um plano para o celular:

1. **Cursor personalizado e cursor follower:** desligue no celular. Não faz sentido e pode atrapalhar.
2. **Hover:** nada importante pode depender só do hover. Se uma informação só aparece quando passa o mouse, no celular ela precisa estar visível sempre ou aparecer com um toque.
3. **Tilt, magnético e parallax de mouse:** desligue no celular, ou troque por um efeito de rolagem leve.

Para pedir isso ao Claude, você pode dizer simplesmente: "desativa esse efeito em telas de toque". Tecnicamente o CSS consegue detectar se o aparelho tem mouse com uma regra chamada **media query de hover** (`@media (hover: hover)`); você não precisa decorar, mas é bom saber que existe.

### Exemplo

Portfólio de um fotógrafo:

- Fotos da galeria com **hover** de zoom leve e o nome do ensaio aparecendo.
- **Custom cursor** em forma de círculo que cresce e mostra "ver" em cima das fotos.
- No celular: cursor desligado e o nome do ensaio sempre visível embaixo de cada foto.

Pedido ao Claude (ilustração de como estruturar):

> Nas fotos da galeria, coloca um hover com zoom leve na imagem e o nome do ensaio aparecendo embaixo. Quero também um custom cursor: um círculo pequeno que cresce e mostra "ver" quando passa por cima das fotos. No celular, desativa o cursor e deixa o nome do ensaio sempre visível. Nada de tilt.

### Passo a passo

1. Abra um site de referência no computador.
2. Passe o mouse devagar por botões, links, imagens e cards. Anote o que reage: é **hover**.
3. Veja se a setinha mudou de forma: é **custom cursor**.
4. Mexa o mouse pela tela parada e veja se algo acompanha: **cursor follower**, **tilt**, **botão magnético** ou **parallax de mouse**.
5. Abra o mesmo site no celular e veja o que aconteceu com cada efeito: sumiu, virou toque ou ficou quebrado?
6. Anote o que você faria diferente no celular.

### Exercício

**Tarefa:** faça a lista de efeitos de mouse de um site, com o plano para o celular.

**O que entregar:** para cada efeito encontrado, o nome dele e o que deve acontecer no celular (desligar, mostrar sempre ou trocar por toque).

**Como saber que fez certo:** todo efeito de mouse da sua lista tem um plano para o celular, e nenhuma informação importante ficou dependendo só do hover.

### Resumo

- Hover é a reação ao passar o mouse; custom cursor troca a setinha; cursor follower, botão magnético, tilt e parallax de mouse reagem ao movimento.
- No celular não existe mouse nem hover de verdade: desligue cursor e efeitos de movimento, e não esconda informação só no hover.
- Para pedir, diga ao Claude para desativar o efeito em telas de toque.

## Aula 2.5 — Do nome ao pedido

*Duração estimada: 6 a 8 minutos.*

### Abertura

Você agora sabe o nome das coisas: hero, background, scroll reveal, parallax, sticky, pin, scrub, hover, custom cursor. Mas saber o nome não adianta se você não souber transformar em pedido. É isso que a gente faz agora. E no fim tem um aviso importante sobre peso.

### Explicação

Um bom pedido de efeito tem quatro partes. Decora a ordem:

1. **Nome do efeito:** o nome certo, que você aprendeu neste módulo (ex.: "parallax", "fade up em stagger", "hover com zoom").
2. **Onde ele fica:** em qual seção e em qual elemento (ex.: "na foto de fundo da seção Sobre", "nos cards de produto").
3. **Referência:** o link ou o print de um site onde você viu o efeito, e de preferência o ponto exato (ex.: "igual à segunda seção desse link").
4. **O que você não quer:** o limite (ex.: "sem exagero", "sem cor neon", "desativa no celular", "só uma vez, não repete").

Estrutura para lembrar: **nome do efeito + onde fica + referência + o que não quer.** Isso não é prompt milagroso: é só organização. O resultado depende da sua referência e do seu estudo.

E o aviso: **aqui é o básico, e efeito demais pesa o site.** Cada efeito custa processamento. Vídeo de fundo, 3D, parallax em tudo e cursor seguindo o mouse, tudo junto, viram lag no celular. E lag no celular faz perder cliente. Regra prática:

1. Comece com poucos efeitos e bem feitos.
2. Use os efeitos para guiar o olhar, não para enfeitar tudo.
3. Prefira os leves (scroll reveal, hover) e use os pesados (vídeo, 3D, pin) com motivo.
4. Teste no celular sempre que adicionar um efeito.

Se você quiser ir além do básico em efeitos, tem o meu outro curso sobre o tema. Aqui a gente fica no essencial para você já entregar site de nível.

### Exemplo

Pedido ruim:

> Coloca uns efeitos maneiros no site.

Pedido organizado (ilustração das quatro partes):

> Bora pro efeito da seção "Sobre". Quero um parallax leve na foto de fundo (nome + onde), parecido com a segunda seção desse site: [link] (referência). A foto sobe mais devagar que o texto. Sem exagero, e no celular pode desativar o parallax e deixar a foto parada (o que não quero).

### Passo a passo

1. Escolha um efeito que você viu numa referência.
2. Escreva o nome dele.
3. Escreva onde ele vai ficar no seu site (seção e elemento).
4. Cole o link ou print da referência e diga em que parte dela o efeito está.
5. Escreva o que você não quer (exagero, cor, repetição, comportamento no celular).
6. Junte as quatro partes num pedido só, curto, no seu jeito de falar.
7. Releia e pergunte: alguém que nunca viu o site entenderia o que eu quero?

### Exercício

**Tarefa:** escreva três pedidos ao Claude, um de hero ou background, um de efeito de scroll e um de efeito de mouse, usando as quatro partes.

**O que entregar:** os três pedidos, com cada parte marcada (nome, onde, referência, o que não quer).

**Como saber que fez certo:** os três têm as quatro partes, usam os nomes certos dos efeitos e pelo menos um deles diz o que fazer no celular.

### Resumo

- Pedido de efeito = nome do efeito + onde fica + referência + o que não quer.
- Isso é organização, não prompt milagroso: o resultado vem da referência e do estudo.
- Aqui é o básico e efeito demais pesa o site; prefira poucos efeitos, leves, testados no celular.

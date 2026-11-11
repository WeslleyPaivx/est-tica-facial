# Módulo 5 — Revisão e site no ar

**Objetivo:** revisar o site como cliente exigente e publicá-lo, cobrindo os erros que fazem perder cliente.

**Resultado do módulo:** o aluno tem o site publicado na Vercel, a partir de um repositório no GitHub, testado no celular sem lag e sem imagens pesadas, com um link pronto para mostrar a um cliente.

## Aula 5.1 — Lag no celular: o erro que mais perde cliente

*Duração estimada: 8 a 10 minutos.*

### Abertura

Se você levar uma coisa só deste curso, leva esta: revise os lags do site no celular. É o erro principal que eu vejo. A pessoa testa só no computador, que é potente, fica tudo lindo, e quando o cliente abre no celular, trava. Isso faz perder cliente. Bora aprender a testar e corrigir.

### Explicação

**Lag** é travamento: a rolagem engasga, a animação pula, o site demora para responder ao toque. No computador muitas vezes não aparece, porque o computador é mais forte que o celular. Só que **a maioria das pessoas que vai abrir o site do seu cliente provavelmente vai abrir pelo celular**. Então o celular é o teste que importa.

São dois jeitos de testar, e você usa **os dois**:

1. **Modo de dispositivo do navegador (DevTools):** no navegador do computador (por exemplo, o Chrome), abra o DevTools com **F12** (ou Ctrl+Shift+I no Windows/Linux, Cmd+Option+I no Mac) e clique no ícone de celular e tablet, o **modo de dispositivo** (atalho Ctrl+Shift+M, ou Cmd+Shift+M no Mac). A tela vira do tamanho de um celular e você escolhe modelos de aparelho. **Serve para ver o layout** (se algo está cortado, apertado, fora do lugar). Mas atenção: ele **não mostra o desempenho real** do celular, porque quem está rodando continua sendo o computador.
2. **Celular de verdade:** abrir o link do site **no seu próprio celular** e usar como um cliente usaria. **Esse é o teste de lag.** O jeito mais fácil é com o link da Vercel, que você só vai ter nas aulas 5.3 e 5.4. Então, se ainda não tem o link da Vercel, faça o teste agora pelo servidor local na Wi-Fi: peça ao Claude Code para abrir o site num servidor local acessível pela sua rede e te passar o endereço para abrir no celular conectado na mesma rede. Depois, repita o teste com o link da Vercel na aula 5.4.

O que costuma causar lag no celular:

1. **Imagens e vídeos pesados** (próxima aula).
2. **Efeitos demais ao mesmo tempo:** parallax em tudo, vários fundos animados, cursor e 3D juntos.
3. **Elementos 3D pesados** rodando o tempo todo.
4. **Animações feitas de um jeito pesado:** animar posição, largura ou altura é mais pesado do que animar **transform** (mover, girar, mudar escala) e **opacity** (transparência). Você não precisa programar isso, só saber pedir.
5. **Efeitos de desfoque (blur)** em muitos elementos.

O que pedir ao Claude para corrigir:

1. Usar **transform e opacity** nas animações.
2. **Reduzir ou desativar efeitos pesados no celular** (parallax, 3D, vídeo de fundo).
3. Trocar um **3D ou vídeo de fundo por uma imagem** leve no celular, se precisar.
4. Respeitar a configuração **"reduzir movimento"** do aparelho (em inglês, **prefers-reduced-motion**), para quem prefere menos animação.

### Exemplo

Você abre o site no celular e a seção com parallax e o fundo animado engasgam na rolagem.

Pedido ao Claude (ilustração):

> Testei no celular e tá travando na rolagem, principalmente na seção "Sobre", que tem o parallax, e no hero, com o fundo animado. Segue a gravação de tela. No computador tá liso. Ajusta pra rodar leve no celular: usa transform e opacity nas animações, desativa o parallax em telas pequenas e troca o fundo animado do hero por uma imagem estática no celular. Respeita também o prefers-reduced-motion. No computador pode manter como está.

### Passo a passo

1. Abra o site no computador, abra o DevTools (F12) e ative o modo de dispositivo.
2. Escolha um modelo de celular e role o site inteiro, procurando layout quebrado, texto cortado ou botão pequeno demais.
3. Anote os problemas de layout por seção.
4. Abra o site no seu celular de verdade (link da Vercel, ou servidor local na mesma Wi-Fi).
5. Role do começo ao fim, devagar e depois rápido. Toque nos botões. Anote onde trava.
6. Se possível, teste também num celular mais simples ou mais antigo (de alguém da família, por exemplo).
7. Grave a tela do celular mostrando o lag.
8. Mande para o Claude: onde trava, a gravação e o que pedir (transform/opacity, desativar efeitos pesados no celular, trocar por imagem, prefers-reduced-motion).
9. Teste de novo no celular depois de cada correção.

### Exercício

**Tarefa:** faça o teste completo no celular (modo de dispositivo e celular de verdade) e corrija pelo menos um problema.

**O que entregar:** a lista de problemas encontrados (layout e lag), o pedido de correção que você mandou e uma frase dizendo como ficou depois.

**Como saber que fez certo:** você usou os dois testes, sabendo que o modo de dispositivo mostra o layout e o celular de verdade mostra o lag; e, no celular de verdade, a rolagem ficou lisa do começo ao fim.

### Resumo

- Não revisar lag no celular é o erro principal e faz perder cliente.
- Teste com o modo de dispositivo do DevTools (layout) e no celular de verdade (lag).
- Para corrigir, peça transform e opacity, menos efeitos pesados no celular, troca por imagem e respeito ao prefers-reduced-motion.

## Aula 5.2 — Imagem pesada e outros detalhes

*Duração estimada: 7 a 9 minutos.*

### Abertura

Outro erro que eu vejo muito: não revisar cada detalhe. E o campeão dos detalhes é imagem grande demais. A foto vem direto do celular do cliente, enorme, e o site demora uma eternidade para carregar. Hoje a gente resolve isso e monta o checklist que você roda antes de mostrar qualquer site para cliente.

### Explicação

**Imagem pesada** é uma imagem com tamanho de arquivo maior do que precisa. Ela deixa o site lento para abrir, principalmente no celular e na internet móvel. Três coisas resolvem:

1. **Tamanho adequado (dimensão):** a imagem não precisa ser muito maior do que o espaço onde aparece. Uma foto de milhares de pixels de largura para um espaço pequeno na tela é desperdício. Redimensione para o tamanho de uso.
2. **Compressão:** reduzir o peso do arquivo mantendo a qualidade visual. Existem ferramentas gratuitas de compressão online, como o **Squoosh** (squoosh.app), e o próprio Claude Code pode fazer isso nos arquivos do projeto se você pedir.
3. **Formato:** formatos modernos como **WebP** (e também **AVIF**) costumam deixar a imagem bem mais leve que JPG e PNG com qualidade parecida.

Duas técnicas extras que você pode pedir ao Claude:

- **Lazy loading (carregamento preguiçoso):** as imagens de baixo da página só carregam quando a pessoa chega perto delas.
- **Imagens diferentes para celular e computador:** uma versão menor para telas pequenas.

E **vídeo de fundo** segue a mesma lógica: curto, comprimido e, se pesar, trocado por imagem no celular.

Além das imagens, tem os "afins": os detalhes que o cliente percebe. Para não esquecer nada, use o **checklist de revisão** antes de mostrar ao cliente:

1. **Imagens:** redimensionadas, comprimidas, em formato leve (como WebP).
2. **Celular:** testado no celular de verdade, sem lag, sem nada cortado.
3. **Textos:** sem erro de digitação, com as informações corretas do cliente (nome, endereço, telefone, horário).
4. **Botões e links:** todos funcionando (WhatsApp, telefone, e-mail, redes sociais, menu).
5. **Legibilidade:** texto com bom contraste sobre o fundo, tamanho confortável no celular.
6. **Efeitos:** nenhum exagerado, nenhum quebrado, nenhum dependendo só de hover no celular.
7. **Carregamento:** o site abre rápido no celular, na internet móvel.
8. **Console:** sem erros em vermelho no DevTools.
9. **Nada copiado:** nenhum texto, imagem, logo ou código de outro site.
10. **Detalhes finais:** título da aba do navegador com o nome do negócio e ícone da aba (favicon), se o cliente tiver logo.

### Exemplo

O cliente mandou 12 fotos tiradas no celular, cada uma com vários megabytes. Você colocou na galeria e o site ficou lento.

Pedido ao Claude Code (ilustração):

> As fotos da galeria tão muito pesadas, o site tá demorando pra abrir no celular. Converte todas as imagens da pasta de imagens pra WebP, redimensiona pro tamanho que elas aparecem no site (com uma versão menor pro celular), comprime mantendo boa qualidade e coloca lazy loading nas que ficam abaixo da primeira dobra. Me fala o peso antes e depois.

### Passo a passo

1. Veja o peso das imagens do projeto (na pasta do site, nas propriedades do arquivo) ou peça ao Claude Code para listar as imagens e o peso de cada uma.
2. Identifique as maiores.
3. Peça ao Claude para redimensionar, comprimir e converter para WebP, ou faça numa ferramenta como o Squoosh.
4. Peça lazy loading nas imagens abaixo da primeira dobra.
5. Confira se as imagens continuam bonitas (sem borrão, sem cor estranha).
6. Rode o checklist de revisão de 10 itens, um por um.
7. Corrija cada item que falhou e rode o checklist de novo.

### Exercício

**Tarefa:** otimize as imagens do seu site e rode o checklist de revisão completo.

**O que entregar:** o peso total das imagens antes e depois, e o checklist com os 10 itens marcados.

**Como saber que fez certo:** o peso das imagens caiu, elas continuam bonitas, e os 10 itens do checklist estão marcados como ok.

### Resumo

- Imagem pesada deixa o site lento: redimensione, comprima e use formatos leves como WebP.
- Peça ao Claude lazy loading e versões menores para o celular.
- Rode o checklist de revisão de 10 itens antes de mostrar qualquer site ao cliente.

## Aula 5.3 — GitHub: subindo o site para o repositório

*Duração estimada: 7 a 9 minutos.*

### Abertura

Site revisado, agora é hora de colocar ele no mundo. O primeiro passo é o GitHub, a gaveta onde fica guardado o código. Vou te mostrar dois caminhos: um pelo site do GitHub, arrastando os arquivos, e outro pedindo ao Claude Code para fazer. Escolhe o que for mais confortável.

### Explicação

**Repositório** é a pasta do projeto guardada no GitHub, com o histórico das mudanças. Cada vez que você salva uma versão no repositório, isso se chama **commit**. Enviar os commits do seu computador para o GitHub se chama **push**.

Antes de subir, uma regra de segurança: **nunca suba senhas, chaves ou dados privados para o repositório.** Num site simples em HTML e CSS isso dificilmente existe, mas fique atento a qualquer arquivo com senha ou chave.

**Público ou privado?** Um repositório **público** pode ser visto por qualquer pessoa; um **privado**, só por você e por quem você convidar. Para site de cliente, prefira **privado**. A Vercel consegue publicar a partir de repositório privado.

#### Caminho A: pelo site do GitHub

Bom para sites simples, em HTML e CSS, com poucos arquivos. O upload pelo site tem limite de tamanho e de quantidade de arquivos; se travar, use o caminho B.

#### Caminho B: pelo Claude Code

O Claude Code pode rodar os comandos do **Git** (a ferramenta que faz os commits e os pushes) para você. Para isso, o seu computador precisa estar conectado à sua conta do GitHub. Se não estiver, peça para o Claude Code te guiar nessa conexão (por exemplo, usando o GitHub CLI, a ferramenta oficial do GitHub para o terminal). A vantagem desse caminho: depois de configurado, cada mudança nova vai para o GitHub com um pedido simples.

### Exemplo

Pedido ao Claude Code para o caminho B (ilustração):

> Bora subir o site pro GitHub. Já criei um repositório privado vazio chamado "site-estudio-tatuagem" na minha conta. Inicializa o Git na pasta do projeto, faz o primeiro commit com todos os arquivos do site e envia pro repositório. Se meu computador não estiver conectado no GitHub, me guia passo a passo. Antes, confere se não tem nenhum arquivo com senha ou chave.

### Passo a passo

**Caminho A (pelo site):**

1. Entre no GitHub com a sua conta.
2. Procure o botão **New repository** (ou o sinal de "+" no topo, opção de novo repositório).
3. Dê um nome simples, sem espaço, por exemplo "site-estudio-tatuagem".
4. Escolha **Private** (privado).
5. Clique para criar o repositório (algo como **Create repository**).
6. Na página do repositório vazio, procure a opção de enviar arquivos existentes (algo como **uploading an existing file**, ou **Add file** e depois **Upload files**).
7. Arraste para lá os arquivos do site: o "index.html" precisa ficar na raiz (no primeiro nível), junto com as pastas de CSS, JavaScript e imagens.
8. Escreva uma mensagem curta para essa versão (ex.: "primeira versão do site") e confirme (algo como **Commit changes**).
9. Confira se os arquivos e pastas aparecem no repositório e se o "index.html" está no primeiro nível.

**Para mandar uma mudança depois (caminho A):** abra o repositório, vá em **Add file** → **Upload files** e envie de novo o arquivo alterado, com o mesmo nome e na mesma pasta. O GitHub substitui o antigo e cria uma nova versão (commit), e a Vercel publica sozinha. Se a mudança mexer em muitos arquivos, prefira o caminho B.

**Caminho B (pelo Claude Code):**

1. Crie o repositório vazio no GitHub (passos 1 a 5 do caminho A).
2. Abra o Claude Code na pasta do projeto.
3. Peça para ele inicializar o Git, fazer o primeiro commit e enviar (push) para o repositório, conferindo antes se não há senha ou chave nos arquivos.
4. Se pedir, siga as instruções dele para conectar o computador à sua conta do GitHub.
5. Abra o repositório no GitHub e confira se os arquivos estão lá.

### Exercício

**Tarefa:** suba o seu site para um repositório privado no GitHub, pelo caminho A ou B.

**O que entregar:** um print do repositório no GitHub mostrando os arquivos do site.

**Como saber que fez certo:** o repositório é privado, o "index.html" está no primeiro nível e todas as pastas (CSS, JavaScript, imagens) aparecem lá.

### Resumo

- Repositório é a pasta do projeto no GitHub; commit é salvar uma versão; push é enviar para o GitHub.
- Para site de cliente, prefira repositório privado e nunca suba senhas ou chaves.
- Dá para subir pelo site do GitHub (New repository e upload) ou pedindo ao Claude Code para rodar o Git.

## Aula 5.4 — Vercel: deploy e hospedagem

*Duração estimada: 6 a 8 minutos.*

### Abertura

Agora vem o momento mais gostoso: ver o seu site no ar, com um link que você manda para qualquer pessoa. A Vercel faz o deploy e a hospedagem. E como as contas já estão ligadas desde o módulo 1, é coisa de poucos cliques. Bora.

### Explicação

**Deploy** é publicar o site. **Hospedagem** é manter ele no ar. A Vercel faz as duas coisas pegando o código direto do seu repositório no GitHub.

Depois que você conecta o repositório:

- A Vercel gera um **link** do site, normalmente terminando em **.vercel.app**. Esse é o link que você mostra para o cliente.
- **Cada vez que você manda uma mudança para o GitHub** (um novo commit e push), **a Vercel publica de novo automaticamente.** Você não precisa repetir nada.

**Site de cliente pagante e o plano da Vercel.** O plano gratuito (Hobby) serve para estudar e para o seu portfólio, mas os termos da Vercel o limitam a uso pessoal e não comercial (confira os termos atuais da Vercel, porque isso pode mudar). Para o site de um cliente que te pagou, use um caminho que permita uso comercial: publicar na **conta da Vercel do próprio cliente** (você configura com acesso dado por ele) ou num **plano pago** seu que permita isso. Esse custo, se houver, entra no preço (aula 6.3) e no briefing (aula 6.4).

Para um site em HTML e CSS puro, a Vercel não precisa de configuração especial: ela publica os arquivos como estão. Se ela perguntar qual é o "framework", a opção para site sem framework costuma se chamar **Other** (outro).

Mas atenção: se a pasta do projeto tiver um arquivo **package.json**, o site usa ferramenta de build. Aí não escolha "Other": deixe a Vercel detectar o framework e, se o deploy der erro, mande o log ao Claude (aula 4.4). É por isso que, na aula 4.1, a gente pede ao Claude "sem ferramenta de build".

Se der erro no deploy, a Vercel mostra os registros (logs) do build. Lembra da aula 4.4: copie a mensagem de erro, tire print e mande ao Claude junto com o link.

E, no final, o teste que não pode faltar: **abrir o link da Vercel no próprio celular.** É o teste de lag da aula 5.1, agora com o site de verdade no ar.

### Exemplo

Você publica o site do estúdio de tatuagem e recebe um link como "site-estudio-tatuagem.vercel.app" (o nome exato depende do seu projeto). Abre no computador, abre no celular, roda o checklist. Depois pede ao Claude um ajuste no hero, ele faz o commit e o push, e em instantes o link já mostra a versão nova.

Pedido ao Claude Code depois de um ajuste (ilustração):

> Fechou o ajuste do hero. Faz o commit com a mensagem "ajuste no hero" e manda pro GitHub, que a Vercel publica sozinha.

### Passo a passo

1. Entre na Vercel com a sua conta (ligada ao GitHub).
2. Procure a opção de criar um novo projeto (algo como **Add New…** e depois **Project**).
3. Na lista de repositórios do GitHub, encontre o do seu site e clique para importar (algo como **Import**).
4. Se o repositório não aparecer, procure a opção para ajustar as permissões do GitHub e dar acesso da Vercel a esse repositório.
5. Na tela de configuração, mantenha o padrão; se ela perguntar o framework, escolha **Other** para site em HTML e CSS (sem package.json). Se tiver package.json, deixe a Vercel detectar.
6. Clique em **Deploy** e espere terminar.
7. Abra o link gerado (terminado em .vercel.app) no computador.
8. Abra o mesmo link no seu celular e role o site inteiro.
9. Rode o checklist da aula 5.2 de novo, agora no site publicado.
10. Faça uma pequena mudança, envie para o GitHub (caminho A: **Upload files** de novo com o arquivo alterado; caminho B: peça ao Claude Code o commit e o push) e confira se a Vercel publicou sozinha.

### Exercício

**Tarefa:** publique o seu site na Vercel a partir do repositório do GitHub.

**O que entregar:** o link do site no ar e um print dele aberto no seu celular.

**Como saber que fez certo:** o link abre no computador e no celular, a rolagem no celular está sem lag, e uma mudança enviada ao GitHub apareceu no link sem você fazer nada na Vercel. Esse link, pronto para mostrar ao cliente, é o resultado do módulo 5.

### Resumo

- A Vercel importa o repositório do GitHub, faz o deploy e gera um link terminado em .vercel.app; site de cliente pagante vai na conta da Vercel do cliente ou num plano pago que permita uso comercial.
- Cada mudança enviada ao GitHub é publicada de novo automaticamente.
- Sempre abra o link da Vercel no próprio celular para conferir o site no ar.

## Aula 5.5 — Domínio: só quando o cliente fecha

*Duração estimada: 6 a 8 minutos.*

### Abertura

Última etapa do fluxo: o domínio. Lembra do módulo 1? O domínio só entra quando o cliente fecha e aprova o site, e ele fica por conta do cliente. Para mostrar o site, o link da Vercel já basta. Mas quando chegar essa hora, você precisa saber ligar o domínio dele ao site. Bora ver.

### Explicação

**Domínio** é o endereço do site, tipo "nomedaempresa.com.br". Ele é comprado (na verdade, registrado e renovado periodicamente) num **registrador**, que é a empresa que vende domínios. Para domínios terminados em **.com.br**, o registro oficial no Brasil é feito pelo **Registro.br**; para ".com" e outros, existem vários registradores.

Duas regras do meu fluxo:

1. **O domínio só entra quando o cliente fecha e aprova o site.** Antes disso, você mostra o site pelo link da Vercel. Na abordagem pessoal, o site já estava pronto quando você foi até o negócio: o cliente fecha, você formaliza (briefing e contrato, aula 6.4) e aí entra o domínio. Na abordagem online, briefing, contrato e pagamento vieram antes de você construir: você mostra a versão pronta no link da Vercel, o cliente aprova e aí entra o domínio.
2. **A compra do domínio fica por conta do cliente.** É uma boa prática o domínio ficar no nome do próprio cliente, porque o endereço é dele. Isso vai no briefing (aula 6.4).

Para ligar o domínio ao site, você mexe em dois lugares:

1. **Na Vercel:** você adiciona o domínio nas configurações do projeto (na conta onde o site ficou hospedado; veja a aula 5.4). A Vercel então mostra **quais registros de DNS** precisam ser configurados. **DNS** é o sistema que faz o endereço digitado apontar para o servidor certo. Os registros mais comuns nesse caso são do tipo **A** e **CNAME**; a Vercel também pode oferecer a opção de trocar os **nameservers** (servidores de nome) do domínio para os dela.
2. **No registrador do domínio:** no painel de DNS do domínio, você (ou o cliente) cria exatamente os registros que a Vercel mostrou.

Depois disso, é preciso esperar a **propagação**: a mudança pode levar de alguns minutos a algumas horas (às vezes mais) para valer. Quando estiver tudo certo, a Vercel mostra o domínio como configurado e ativa o **HTTPS** (o cadeadinho) automaticamente.

Importante: **copie os valores dos registros direto da tela da Vercel.** Não use valores de tutorial antigo, porque eles podem mudar.

Sobre o acesso: o painel do domínio é do cliente. O melhor é ele mesmo criar os registros com a sua orientação, ou te dar acesso pelo próprio sistema do registrador. Não peça senha por mensagem.

### Exemplo

O estúdio de tatuagem fechou e aprovou o site no link da Vercel. O dono registra "estudioexemplo.com.br" no Registro.br, no CNPJ dele. Você adiciona o domínio no projeto na Vercel, a Vercel mostra os registros de DNS, você manda para o cliente, com tom sério, as instruções; ele cria os registros no painel do Registro.br. Algumas horas depois a Vercel mostra o domínio configurado, com HTTPS.

Mensagem para o cliente (tom sério):

> Olá, [nome]. Para colocar o site no endereço estudioexemplo.com.br, é preciso configurar o domínio no painel do Registro.br. Vou te enviar a seguir, por escrito, os registros exatos que devem ser criados e posso acompanhar você nesse passo por chamada, se preferir. Após a configuração, a ativação pode levar algumas horas. Assim que estiver no ar, te aviso.

### Passo a passo

1. Confirme que o cliente fechou, aprovou o site no link da Vercel e registrou o domínio (de preferência no nome dele).
2. Na Vercel, abra o projeto do site e vá nas configurações (**Settings**), na parte de domínios (**Domains**).
3. Adicione o domínio do cliente (ex.: "nomedaempresa.com.br"). A Vercel pode sugerir adicionar também a versão com "www"; siga a recomendação dela.
4. Copie os registros de DNS que a Vercel mostrar (tipo, nome e valor).
5. No painel do registrador, na área de DNS do domínio, crie exatamente esses registros (o cliente faz, com sua orientação, ou você faz com acesso dado pelo próprio registrador).
6. Volte na Vercel e acompanhe o status do domínio.
7. Espere a propagação.
8. Quando a Vercel mostrar o domínio como configurado, abra o endereço no computador e no celular e confira o cadeado do HTTPS.

### Exercício

**Tarefa:** simule a ligação de um domínio. Se você não tiver um cliente ainda, não precisa comprar domínio nenhum: abra a área de domínios do seu projeto na Vercel e escreva o roteiro do que faria, ou, se já tiver um domínio seu, ligue ele ao site.

**O que entregar:** um roteiro com os passos na ordem (domínio do cliente, adicionar na Vercel, copiar registros de DNS, criar no registrador, esperar propagação, conferir HTTPS) e a mensagem séria que você mandaria ao cliente pedindo a configuração.

**Como saber que fez certo:** seu roteiro deixa claro que o domínio só entra quando o cliente fecha e aprova o site, fica por conta dele, e que os registros vêm da tela da Vercel.

### Resumo

- O domínio só entra quando o cliente fecha e aprova o site (no link da Vercel), e a compra fica por conta do cliente (de preferência no nome dele).
- Adicione o domínio na Vercel e crie no registrador os registros de DNS (A, CNAME ou nameservers) que a Vercel mostrar.
- Espere a propagação e confira o domínio com HTTPS no computador e no celular.

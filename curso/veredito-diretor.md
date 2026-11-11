# Veredito do Diretor — "Como criar seu site usando IA"

**Data:** 2026-11-11
**O que eu li e conferi:** `entrevista.md`, `grade.md`, os 6 roteiros (29 aulas: 5 + 5 + 4 + 5 + 5 + 5), os 6 Word, os 6 slides (174 slides), as 6 provas e `provas/auditoria.md`.

**Como conferi:**
- **Word:** converti com pandoc e comparei palavra por palavra com os roteiros. Os 6 arquivos batem 100% com os roteiros atuais. A única diferença são as aspas tipográficas.
- **Slides:** extraí o texto e as notas com markitdown e python-pptx, e transformei os slides dos módulos 2 e 6 em imagem para olhar.
  - Letra mínima de 20 pt e no máximo cerca de 60 palavras por slide.
  - Um único quadro de exemplo por slide, sem texto vazando.
  - Nome novo do curso na capa de cada módulo.
- **Provas:** confirmei que os itens 3, 16, 17 e 18 da auditoria continuam abertos nos roteiros.
- **Limite:** não consegui abrir a documentação da Vercel nesta sessão, porque a rede bloqueou vercel.com. O que digo sobre os termos da Vercel vem da versão das "Fair use guidelines" que eu conheço. Ver o item B2.

---

## VEREDITO: AINDA NÃO ESTÁ PRONTO

O texto é bom. Ele é fiel ao autor na maior parte, e roteiros, Word, slides e provas estão coerentes entre si. Mas ainda não é um produto que se possa vender:

- **Falta o produto principal:** os vídeos.
- **Falta o material que o aluno recebe:** o briefing como arquivo próprio, as provas sem gabarito e as planilhas.
- **Falta a página de vendas.**
- **Há quatro buracos que fazem o aluno travar, perder dinheiro ou se expor juridicamente justo na hora de vender:**
  - onde hospedar o site de quem pagou;
  - com que fotos fazer o site de demonstração;
  - quando receber o pagamento na abordagem pessoal;
  - um serviço que o curso manda vender mas não ensina (o Google Meu Negócio).

---

## O que já está bom (não mexer)

- **A mensagem central é do autor e está em todo lugar:** "não existe prompt milagroso", o fluxo de 6 etapas, os 4 erros comuns, "print, erro e link", outra IA reescrevendo o prompt, Google Maps, o combo, R$ 500 e R$ 2 mil como pisos, prazo de uma semana, briefing com contrato, sério com o cliente e descontraído com a IA.
- **As respostas complementares do autor foram aplicadas:** o nome novo do curso, os dois caminhos de venda (pessoal e online) e o pear.no descrito como feito com HTML, CSS e JavaScript.
- **O módulo 2 e o modelo de briefing**, que o autor pediu explicitamente, estão completos e bem didáticos.
- **Riscos tratados com honestidade:**
  - o curso não promete ganho;
  - a aula 3.3 diz claramente o que nunca copiar;
  - aparece o aviso de que o briefing não substitui o contrato;
  - aparece o aviso sobre o plano Hobby da Vercel;
  - a aula 5.5 orienta a não pedir senha por mensagem.
- **Coerência:** a grade, os roteiros, o Word, os slides e as provas contam a mesma história. As 30 perguntas das provas estão sustentadas pelos roteiros.
- **Nome antigo "sites 3D":** não sobrou em nenhum material que vai para o aluno.
  - Aparece só no título de `entrevista.md`, que é o registro interno da entrevista e pode ficar como está.
  - Aparece também como termo de busca no TikTok ("site 3D") na aula 3.1: no roteiro, no Word e no slide 3 do módulo 3. Ali o uso é legítimo e deve ficar.

---

## BLOQUEIA A VENDA (do mais importante para o menos)

### B1. Os vídeos não existem
- **O quê:** o curso hoje é só roteiro, Word e slides. Nenhuma aula foi gravada.
  - As aulas técnicas dependem de mostrar a tela atual, porque os roteiros dizem de propósito "procure o botão (algo como...)". Isso vale para: 1.3 (instalar o Claude Code), 1.4 (contas), 4.2 (servidor local), 4.4 (DevTools/Console), 5.1 (modo de dispositivo), 5.3 (GitHub), 5.4 (Vercel) e 5.5 (DNS).
- **Onde:** todas as 29 aulas.
- **Por que importa:** o comprador paga por aula em vídeo. O iniciante que não programa só passa do GitHub e da Vercel vendo alguém fazer na tela, com os botões de hoje.
- **Quem:** **AUTOR**, gravando com captura de tela nas aulas técnicas. O **Designer** cuida da edição e da sincronia com os slides.

### B2. Hospedagem: o curso não ensina onde publicar o site de quem pagou, e o plano gratuito pode não cobrir nem o portfólio
- **O quê:**
  - **(a) Item 3 da auditoria, ainda aberto:**
    - nenhum passo ensina a publicar na conta da Vercel do cliente, nem a passar o repositório e o projeto para ela;
    - na abordagem pessoal, o site de demonstração continua na conta gratuita do aluno depois que o cliente fecha;
    - o bloco 10, item 7, do briefing ("quem fica com o acesso após a entrega") não tem orientação.
  - **(b) Achado novo:** as aulas 1.4 e 5.4 dizem que o plano Hobby "serve para estudar e para o seu portfólio".
    - Na versão das regras de uso justo da Vercel que eu conheço, o Hobby é só para uso pessoal e não comercial.
    - Ali, "anunciar a venda de um produto ou serviço" conta como uso comercial.
    - Um portfólio feito para conseguir clientes, e um site de demonstração feito para vender a um negócio, podem cair nessa definição.
    - **Não confirmei na documentação atual** (vercel.com bloqueado nesta sessão).
- **Onde:**
  - `modulo-5.md`, aula 5.4 (parágrafo "Site de cliente pagante e o plano da Vercel" e Passo a passo) e aula 5.5 (Passo a passo, item 2);
  - `modulo-1.md`, aula 1.4, passo 7;
  - `modulo-6.md`, aula 6.4, bloco 10, item 7;
  - slides do módulo 5 ("Site de cliente que te pagou" e resumo: "Hobby: estudo e portfólio").
- **Por que importa:** é o primeiro ato depois de vender. Seguindo o curso, o aluno entrega o site pago numa conta que viola os termos, ou trava sem saber o que fazer. E o curso chama esse risco de "termos da Vercel".
- **Quem:**
  - **Roteirista:** confere os termos atuais da Vercel, aplica o texto sugerido no item 3 da auditoria e reescreve o que a 1.4 e a 5.4 dizem sobre o portfólio.
  - **AUTOR:** decide e conta qual é o modelo dele, para virar a recomendação do curso:
    - em qual conta ele hospeda;
    - se paga o plano Pro;
    - quem fica com o acesso depois da entrega.

### B3. Abordagem pessoal: com que conteúdo fazer o site de quem ainda não é cliente
- **O quê:** item 16 da auditoria, ainda aberto.
  - A decisão do autor ("faz o site primeiro e depois aborda") deixa o aluno sem textos, fotos e logo do negócio.
  - O caminho óbvio para ele é baixar fotos e logo do perfil do Google Maps ou do Instagram, sem autorização, e publicar num link aberto.
  - O curso também não diz o que fazer com o link se o negócio não fechar.
- **Onde:**
  - `modulo-6.md`, aula 6.1 (Explicação, "Abordagem pessoal", e passo 7);
  - `modulo-1.md`, aula 1.2 ("Construir antes ou depois de fechar?", item 1);
  - conflita com `modulo-3.md`, aula 3.3 ("O que você nunca copia", item 3).
- **Por que importa:** é risco jurídico real (uso de imagem e de marca sem autorização) para o aluno e, por tabela, para o autor que ensinou o método.
- **Quem:**
  - **Roteirista:** aplica o texto sugerido na auditoria (site de demonstração, conteúdo provisório, fotos com licença, link só para o dono, tirar do ar se não fechar).
  - **AUTOR:** confirma que é assim que ele faz, ou conta como faz.

### B4. Claude Code: a ferramenta principal do curso não tem instalação ensinada, e o custo não é dito
- **O quê:**
  - A aula 1.3 só diz "siga a instalação oficial". O aluno-alvo nunca abriu um terminal.
  - O curso não diz em lugar nenhum que o Claude Code exige plano pago do Claude, nem que é preciso um computador (não dá para fazer só pelo celular).
  - O caminho B do GitHub (5.3) e o servidor local (2.2, 4.2, 5.1) dependem do Claude Code e de ferramentas que podem não estar instaladas. O curso não diz o que fazer se o Claude pedir para instalar algo (Git, Python, Node).
- **Onde:**
  - `modulo-1.md`, aula 1.3 (Passo a passo, itens 3 e 4);
  - `modulo-4.md`, aula 4.2;
  - `modulo-5.md`, aulas 5.1 e 5.3;
  - a página de vendas, que ainda não existe.
- **Por que importa:** é o passo que mais trava o iniciante, e trava logo no módulo 1. Comprador que descobre depois da compra que precisa assinar um plano pede reembolso.
- **Quem:**
  - **AUTOR:** grava a instalação passo a passo no Windows e no Mac, com a tela de hoje.
  - **Roteirista:** acrescenta na 1.3 um bloco de pré-requisitos (computador, plano pago do Claude, contas gratuitas) e um "se o Claude pedir para instalar algo".

### B5. Quem segue pelo claude.ai trava na aula 4.2 sem aviso
- **O quê:** item 18 da auditoria, ainda aberto.
  - A aula 1.3 diz para ter o Claude Code "até o módulo 4".
  - A aula 4.1, passo 4, ainda aceita o claude.ai.
  - A aula 4.2 exige o servidor local, que o curso só ensina a subir pelo Claude Code.
- **Onde:** `modulo-4.md`, aula 4.1, Passo a passo, item 4, e o slide 18 do módulo 1 ("Tenha o Claude Code até o módulo 4").
- **Por que importa:** o aluno trava no meio da construção do site, que é o coração do curso.
- **Quem:** **Roteirista** (texto sugerido na auditoria). Depois, o **Designer** atualiza os slides.

### B6. O pagamento some da abordagem pessoal
- **O quê:** item 17 da auditoria, ainda aberto. Três frases dos roteiros e três slides dizem "briefing e contrato" sem o "pagamento combinado". Seguindo essas frases ao pé da letra, o aluno liga o domínio sem ter recebido.
- **Onde:**
  - **Roteiros:**
    - `modulo-1.md`, aula 1.2 ("Construir antes ou depois de fechar?", item 1);
    - `modulo-5.md`, aula 5.5 (Explicação, regra 1);
    - `modulo-6.md`, aula 6.4 (Passo a passo, item 7).
  - **Slides:**
    - módulo 1, slide 12 (notas);
    - módulo 5, slide 26 (notas);
    - módulo 6, slide 21 (texto visível: "Pessoal: site pronto, depois briefing e contrato");
    - módulo 6, slide 24 (notas).
- **Por que importa:** num curso sobre vender sites, a ordem do pagamento não pode ter contradição. A correção leva cinco minutos.
- **Quem:**
  - **Roteirista** corrige os roteiros e gera o Word de novo.
  - **Designer** corrige os slides.
  - **Professor** reconfere M1-P2, M5-P5 e M6-P4.

### B7. O combo manda vender o "alinhamento do Google Meu Negócio", mas o curso não ensina a fazer
- **O quê:**
  - A aula 6.2 só define o que é alinhar o perfil.
  - O exercício e o passo 4 da 6.2 obrigam a ter o Google Meu Negócio em pelo menos uma opção do combo.
  - A mesma aula diz "só coloque no combo o que você sabe fazer". As duas regras se contradizem.
  - Faltam pelo menos três coisas:
    - como o dono dá acesso de administrador ao aluno;
    - o que preencher;
    - o que não fazer (avaliação falsa, nome com palavra-chave).
- **Onde:** `modulo-6.md`, aula 6.2 (Explicação, passo 4, exercício e resumo) e prova M6-P2.
- **Por que importa:** é a opção 2 do modelo de venda do autor. O aluno vende um serviço que não sabe entregar.
- **Quem:**
  - **AUTOR:** conta como ele faz o alinhamento.
  - **Roteirista:** escreve um bloco ou uma aula curta.
  - **Alternativa:** tornar o Google Meu Negócio opcional no exercício enquanto o bloco não existe.

### B8. O aluno não recebe o material: só existe o roteiro de gravação
- **O quê:**
  - Os Word são cópia exata dos roteiros, com "Abertura", "Explicação" e a fala do autor. São roteiro de gravação, não apostila.
  - Não há arquivos separados e editáveis de:
    - **modelo de briefing**, que é pedido explícito do autor ("o curso deve trazer um MODELO DE BRIEFING");
    - ficha de referência (8 itens);
    - checklist de revisão (10 itens);
    - planilha de prospecção (7 colunas);
    - modelo de combo e de preço.
  - O slide 22 do módulo 6 diz "O modelo completo está no roteiro da aula 6.4", e o aluno não tem o roteiro.
  - As provas estão no mesmo arquivo que o gabarito e as notas internas ("**Auditoria:** OK..."). Não existe versão para o aluno.
- **Onde:** `word/`, `slides/modulo-6.pptx` (slide 22), `provas/prova-modulo-*.md`.
- **Por que importa:** o briefing é a única peça que o autor pediu por nome. E prova com gabarito colado não pode ser entregue.
- **Quem:**
  - **Designer:** briefing em .docx editável, ficha, checklist e planilha.
  - **Professor:** versão das provas para o aluno, sem gabarito e sem notas de auditoria, e gabarito separado para quem corrige.
  - **Designer:** corrige a frase do slide 22.

### B9. Não existe página de vendas nem oferta definida
- **O quê:** não há página de vendas nem definição do que o comprador recebe. Faltam:
  - preço do curso;
  - o que inclui;
  - pré-requisitos e custos de ferramentas (ver B4);
  - política de reembolso (o direito de arrependimento de 7 dias do CDC, art. 49, vale para compra online);
  - suporte, certificado e comunidade: o que existe e o que não existe.
- **Atenção à promessa de renda:**
  - A promessa da grade ("renda extra ou até renda principal") é fala do autor e está no curso com ressalva.
  - Na página de vendas, sem a mesma ressalva ("não existe ganho garantido"), vira promessa de renda e risco de propaganda enganosa.
  - Também não usar o pear.no nem sites premiados como se fossem trabalho do autor.
- **Onde:** não existe arquivo.
- **Por que importa:** sem isso não há o que vender. E a promessa de renda é o maior risco legal do produto.
- **Quem:** **AUTOR** decide a oferta. O time escreve depois. Fica só apontado, não criei nada.

### B10. O autor precisa aprovar o que está na boca dele
- **O quê:** os roteiros são falados em primeira pessoa pelo autor. Quatro pontos aparecem como fala dele sem que ele tenha dito:
  - **(a) Aula 3.1:** "hoje eu vou te mostrar os dois lugares onde eu caço referência... O mais conhecido é o Awwwards". O autor disse "o site onde ficam os sites premiados", sem nome. Confirmar se é o Awwwards ou outro.
  - **(b) Aula 4.4:** o autor disse "peço a referência em detalhes". O time trocou por "descrevo a referência em detalhes" (item 15 da auditoria) sem confirmar com ele. Pode ser que ele peça ao Claude para analisar a referência, o que muda a técnica.
  - **(c) Aula 1.5 e slide 25 do módulo 1:** "o Pear, aquele da maçã". "Pear" é pera, e o aluno vai estranhar. Confirmar o que o autor quis dizer.
  - **(d) Bordões e ganchos criados pelo time:** "mano", "relaxa, mano", "o prompt que cria um site de 10 mil reais em 5 minutos" (1.1), "Fala, bora começar!". O tom informal vem da observação do entrevistador, mas as frases são do time.
- **Onde:** `modulo-3.md` (3.1), `modulo-4.md` (4.4), `modulo-1.md` (1.1 e 1.5), slides correspondentes e `grade.md` (descrição da 4.4).
- **Por que importa:** a regra é não inventar nada como se fosse do autor. E ele vai ler isso diante da câmera.
- **Quem:** **AUTOR** lê os 6 roteiros e aprova ou ajusta. O **Roteirista** aplica o que ele decidir.

---

## MELHORIAS (não bloqueiam, mas o comprador vai sentir falta)

### M1. Um site de exemplo completo, do zero ao ar
- **O quê:** o estúdio de tatuagem aparece em pedaços nas aulas 3.4, 4.1 a 4.5 e 5.3 a 5.5. Não há gravação de ponta a ponta nem o resultado final (link e repositório) para o aluno comparar.
- **Por que importa:** é a prova de que o método funciona e a referência que o iniciante mais quer.
- **Quem:** **AUTOR** grava. O **Designer** publica o exemplo.

### M2. Telas reais nos slides técnicos
- **O quê:** os slides de GitHub, Vercel, DevTools e DNS são só texto.
- **Onde:** módulo 1 (slides 21 a 23), módulo 4 (slide 20) e módulo 5 (slides das aulas 5.1 e 5.3 a 5.5).
- **Por que importa:** um print de onde clicar vale mais que "algo como New repository".
- **Quem:** **Designer**, com prints de hoje, e de novo se as telas mudarem.

### M3. O "outro curso" do autor
- **O quê:** o outro curso do autor é citado em 2.5, 6.5 e nos slides, mas sem nome nem link.
- **Por que importa:** é venda cruzada perdida e deixa o aluno sem saber onde procurar.
- **Quem:** **AUTOR** informa nome e link. O **Roteirista** insere.

### M4. Modelo de contrato
- **O quê:** o autor fecha "briefing + contrato", mas o curso só diz "procure um modelo" (aula 6.4).
- **Por que importa:** o comprador vai esperar um modelo. Se entrar, precisa de revisão jurídica.
- **Quem:** **AUTOR** decide se inclui um modelo revisado por advogado. Não inventar.

### M5. Formalização e recebimento
- **O quê:** o curso não fala de MEI ou nota fiscal, de como cobrar sinal na prática, nem de LGPD.
  - A lista de prospecção guarda telefones.
  - O briefing pede CPF e guarda dados do cliente.
- **Por que importa:** quem "vai ter renda com isso" pergunta isso na primeira venda.
- **Quem:** **AUTOR** decide se entra. Se entrar, o **Roteirista** escreve só um aviso básico, sem prometer conformidade legal.

### M6. Segurança básica no Claude Code
- **O quê:** a aula 1.3 diz que o Claude Code "pede sua permissão", mas não orienta o que fazer.
- **O que acrescentar:**
  - ler o que ele pede antes de aprovar;
  - trabalhar só na pasta do projeto;
  - não aprovar comando que apague arquivos fora dela.
- **Quem:** **Roteirista**.

### M7. Teste no celular pela Wi-Fi (aula 5.1)
- **O quê:** a aula não avisa dois pontos práticos:
  - o firewall do Windows costuma pedir permissão;
  - não se deve fazer isso em Wi-Fi pública.
- **Quem:** **Roteirista**.

### M8. Correção das perguntas abertas e certificado
- **O quê:** cada prova tem perguntas abertas que precisam de correção humana. Não está definido:
  - quem corrige;
  - se haverá certificado;
  - qual nota aprova.
- **Quem:**
  - **AUTOR** decide.
  - **Professor** transforma os critérios em autoavaliação para o aluno, caso não haja corretor.

### M9. Material de terceiros nos vídeos
- **O quê:** a gravação vai mostrar pear.no, sites premiados e vídeos do TikTok.
  - O certo é mostrar o link e comentar, sem reproduzir vídeos de outros criadores dentro do curso pago.
  - O pear.no é de terceiros e pode sair do ar. A aula 1.5 inteira depende dele.
- **Quem:**
  - **AUTOR:** tem uma referência reserva e grava a observação comentada do site.
  - **Designer:** confere a edição.

### M10. Acabamento do Word
- **O quê:** os Word não têm capa nem o nome do curso. Hoje são roteiro de gravação.
- **Quem:**
  - **AUTOR** decide se o Word vai para o aluno. Se for, o **Designer** faz uma versão de apostila, sem as falas de gravação.
  - Se a grade for mostrada ao aluno, trocar em "Origem do conteúdo" "pedir a referência em detalhes" pela forma que o autor confirmar em B10(b).

### M11. Regra de manutenção para as próximas correções
- **O quê:** toda correção de roteiro (B2 a B7 e B10) precisa ser seguida de quatro passos:
  1. gerar o Word de novo;
  2. atualizar os slides;
  3. o **Professor** reconferir as perguntas listadas no fim de `auditoria.md`;
  4. fazer uma nova leitura do Diretor antes da venda.
- **Quem:** **Roteirista**, **Designer** e **Professor**, nessa ordem.

---

## Resumo para o autor

O conteúdo escrito está a umas três rodadas de correção do ponto de venda. As quatro correções de texto mais urgentes são:
- hospedagem (B2);
- site de demonstração (B3);
- pagamento (B6);
- Google Meu Negócio (B7).

O que depende de você:
- **Decisões:** o modelo de hospedagem e de acesso, como você faz o Google Meu Negócio, os pontos de B10, a oferta e a página de vendas.
- **Gravação:** todas as aulas, com tela nas aulas técnicas, começando pela instalação do Claude Code.

Sem os vídeos, o material do aluno e a página de vendas, não há o que vender.

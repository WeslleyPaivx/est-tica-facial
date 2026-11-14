# Zaniva — Sua empresa no caminho certo

Landing page de apresentação da Zaniva. Vite, JavaScript, GSAP e Lenis. A página não implementa autenticação: o SaaS existente é responsável pelo login, pela sessão e pelos dados.

## Rodar

Node 22.12+ recomendado. Execute `npm ci`, depois `npm run dev`. Para publicar: `npm run build`; diretório de saída `dist`.

## Conectar o SaaS

Em `src/config.js`, `saasUrl` aponta para o login do CRM publicado (https://zaniva-crm.vercel.app/login) e `instagram` para @zaniva.digital (balão flutuante e envio do resumo do projeto). Todos os botões de acesso passam a redirecionar para esse endereço na mesma aba. A URL não contém nem recebe senhas. Sem URL, os botões abrem um aviso de acesso em breve.

Opcionalmente, preencha `whatsapp` com DDI, DDD e número (somente dígitos). O botão do projeto abrirá uma conversa com o resumo; o visitante ainda precisa enviar a mensagem. Sem número, o botão copia o resumo para a área de transferência.

## Conteúdo

- `index.html`: conteúdo, serviços e estrutura das seções.
- `src/interactions.js`: detalhes dos serviços, prévia dos seis módulos e montagem do resumo.
- `src/sections/zaniva.css`: identidade visual e componentes da Zaniva.
- `src/styles/tokens.css`: tokens básicos.
- `src/motion/`: cenário contínuo, trilha vetorial, seleção, entradas e navegação.
- `public/zaniva-logo.png`: imagem original enviada; wordmark exibida por enquadramento CSS.

## Escopo e conteúdo real

A plataforma é apresentada como em desenvolvimento. As abas são uma prévia ilustrativa sem dados reais ou integração. A implementação e disponibilidade dos recursos devem ser alinhadas ao SaaS feito no Claude.

O catálogo cobre os domínios do material fornecido: CRM/vendas (Frappe CRM), atendimento (Zammad), RH (Frappe HR), gestão/estoque (Tryton), ativos/chamados (GLPI) e assinaturas (OpenSign). Não há alegação de integração com esses projetos: as seis áreas são apresentadas sob a marca Zaniva.

Da referência visual permanecem apenas a montanha, céu, vegetação, texturas, fonte e mecanismos de movimento. Textos, planos, portfólios, nomes, vagas e depoimentos fictícios foram removidos. Os cartões visuais são representações em HTML/CSS, não portfólios reais.

WhatsApp comercial configurado em `src/config.js` (balão flutuante e envio do resumo do projeto). Preços, clientes, depoimentos e indicadores não foram inventados.

## Publicação na Vercel

Importe esta pasta como projeto Vite. Comando de build: `npm run build`. Output: `dist`. Não há variáveis secretas ou backend nesta landing page. `vercel.json` aplica cabeçalhos de segurança (CSP só com arquivos do próprio site, sem envio de dados para fora, sem iframe). A pasta `.openai` pertence à prévia hospedada e não é necessária na Vercel.

## Verificação

Build de produção validado. Jornada visual, cartões, navegação, abas, modal e cópia do resumo conferidos em navegador. Layout móvel conferido em viewport de 390 × 844 por iframe de teste. A execução headless foi bloqueada pelo ambiente; não foram certificados 60 fps nem captura a cada 33 ms. O modo de movimento reduzido remove Lenis, as animações de entrada e os cursores flutuantes.

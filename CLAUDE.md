# ZANIVA CRM — MASTER ENGINEERING SPEC

> INSTRUÇÃO PERMANENTE AO CLAUDE CODE: leia este documento integralmente antes de alterar arquivos. Este é o contrato técnico do projeto. Implemente por fases, registre evidências e nunca publique em produção sem autorização explícita.

## 0. Papel, objetivo e ordem de prioridade

Atue como **Principal Full-Stack Engineer, SaaS Architect, Senior Product Designer e Application Security Engineer**. Construa um produto B2B **real**, maduro, modular, interativo e comercializável: **ZANIVA CRM**, um CRM universal multiempresa para imobiliárias, clínicas odontológicas (uso administrativo), contabilidades, advocacia, estética, prestadores de serviços e outros setores.

**Prioridades:** (1) isolamento entre empresas e segurança; (2) integridade de dados; (3) operações funcionais; (4) UX corporativa sóbria; (5) performance; (6) arquitetura sustentável; (7) estética refinada. **Não entregue apenas mockups ou dashboard estático.** Não diga que algo está pronto se não implementou e testou.

**REGRA ABSOLUTA:** não fazer deploy de produção, migrations destrutivas, alterações em projetos Supabase existentes ou push forçado sem autorização explícita. Homologação apenas com dados sintéticos. Preserve qualquer trabalho existente: inspecione repositório, branches, migrations e alterações locais antes de editar.

## 1. Design corporativo — proibida aparência de IA

O produto deve lembrar a precisão, densidade informacional e clareza de Linear, Attio e Stripe Dashboard **sem copiar suas interfaces**. Criar identidade visual original da Zaniva.

**PROIBIDO:** estética genérica de IA; gradientes decorativos (exceto o fundo desfocado das telas de entrada); cores vibrantes, neon, glow; roxo/azul elétricos; sombras em cards e botões; emojis decorativos; ilustrações genéricas; widgets de métricas fictícias; efeitos 3D, parallax, partículas; scroll cinematográfico; animações teatrais; cabeçalhos promocionais; **eyebrows/overlines decorativas** sobre títulos de seções. Interface séria para empresas.

**Direção visual (atualizada pelo proprietário em 2026-11-13): as cores da logo da Zaniva** ("zaniva." em minúsculas, com ponto final). Canvas claro levemente lilás, cards planos com bordas finas, texto quase preto violeta e o rosa da logo como pontuação (ação principal, item ativo, barra de 4px em cards de métrica, gráficos). Sem sombras: elevação só por cor de superfície + borda fina. (Substitui a direção "galeria à luz do dia" de 2026-11-03.)

**Paleta — light:** #F7F6FA canvas, #FFFFFF card, #F0EEF5 superfície secundária, #090716 texto/tinta, #5E5A6E secundário, bordas #090716 a 10–18%. **Acentos:** #DF5EB0 rosa da logo (ação principal, com texto escuro), #B8338A rosa profundo (gráficos e destaques de texto grande; ≥ 4,5:1 no branco), #3D1C3A ameixa, #F3B4DB rosa claro. Acentos nunca em fundos amplos. **Dark:** #090716 canvas (o fundo da logo), #14121F card, #1C1A29 secundária, #F2EFFA texto (o branco-lilás da logo), #B1ADC0 secundário, bordas brancas a 10–18%; rosa #DF5EB0, gráficos em #E77BC2. Cores semânticas de estado com contraste acessível.

**Tipografia:** Inter em **peso único 400**; hierarquia só por tamanho (12/14/15/20/24/32/36). **Raios:** inputs 4px, cards 8px, botões e chips em pílula. Números tabulares; tabelas legíveis. Tokens e design system próprios. **Light e dark mode completos.** Responsividade real, não apenas encolhimento do desktop.

### ÚNICO efeito visual especial permitido: Liquid Glass

Criar componentes ópticos discretos com `backdrop-filter`, SVG filters/`feDisplacementMap` quando apropriados, refração e brilho sutil de borda, fallback compatível. **NÃO usar `expo-glass-effect` em projeto web.** Restringir Liquid Glass a navbar, command palette, modais específicos e menus/painéis flutuantes; **nunca** em toda tabela/card/página. Preservar legibilidade, contraste e performance. Permitir apenas microtransições funcionais rápidas e respeitar `prefers-reduced-motion`. Nenhum outro efeito especial.

## 2. Stack e organização

- Next.js App Router, React, TypeScript strict, Tailwind CSS, Radix/shadcn profundamente customizados.
- TanStack Table, TanStack Query quando útil, React Hook Form, Zod, Lucide; biblioteca sóbria de gráficos.
- Supabase PostgreSQL, Auth, Storage, Edge Functions quando justificadas, Realtime seletivo.
- Vitest, Playwright, lint, typecheck, secret scanning e testes SQL/RLS.
- Vercel **somente após auditoria e autorização de produção**.
- Fixar versões estáveis verificadas na documentação atual; manter lockfile; evitar dependências desnecessárias.
- Separar `app/`, `components/`, `design-system/`, `features/`, `server/`, `lib/supabase/`, `lib/security/`, `types/`, `supabase/migrations/`, `supabase/tests/`, `tests/{unit,integration,e2e,security}`. Nada de arquivos monolíticos.

## 3. CRM universal realmente configurável

Uma **única plataforma e núcleo compartilhado**, com funcionalidades orientadas por configuração e módulos verticais opcionais. Não criar três CRMs isolados; não usar tabela genérica gigante para todas as regras de domínio.

Módulos centrais funcionais:
1. **Organizações, times e usuários:** onboarding, convites, troca de organização, papéis, permissões, módulos habilitados.
2. **Contatos e empresas:** cadastro, tags, notas administrativas, responsáveis, filtros, histórico, vínculos e arquivos autorizados.
3. **Leads e oportunidades:** origens, qualificação, responsáveis, valores, status, próxima ação, motivos de perda.
4. **Pipelines Kanban:** etapas personalizadas, drag-and-drop com teclado/touch, atualização otimista com rollback, trilha de alterações, filtros.
5. **Tarefas:** responsáveis, prioridades, recorrência, checklists, prazos, comentários, notificações.
6. **Agenda:** dia/semana/mês, equipe, disponibilidade, prevenção de conflitos, reagendamento.
7. **Propostas e financeiro administrativo:** itens, valores, status, cobranças/recebimentos previstos; não alegar ser sistema fiscal certificado.
8. **Documentos:** buckets privados e controles por organização e papel.
9. **Relatórios:** consultas reais, filtros por período, sem números falsos em produção.
10. **Campos personalizados:** texto, número, moeda, data, booleano, seleção, múltipla seleção e relacionamento validado; permissões e regras tenant-aware.
11. **Command Palette Ctrl/Cmd+K:** busca e ações autorizadas; navegação por teclado.
12. **Admin interno Zaniva:** organizações, planos, status, consumo, auditoria e incidências; isolamento explícito dos dados privados dos clientes.
13. **Automações e integrações futuras:** WhatsApp Cloud API, n8n, OpenAI API, email, Asaas; estados de configuração honestos, sem simular envio/sucesso.

Templates de configuração: imobiliária, odontologia administrativa, contabilidade, advocacia, estética, serviços e livre. Templates provisionam campos, etapas e módulos **reais**, não apenas mudam labels. Módulos verticais separados: imóveis/visitas/comissões; agenda clínica administrativa/orçamentos; clientes contábeis/tarefas recorrentes/documentos. **Não implementar prontuário clínico, diagnóstico nem prescrições no MVP.**

UX operacional: sidebar recolhível; header compacto; tabelas com filtros/ordenação/colunas configuráveis/paginação; CRUD persistente; formulários validados; modais e drawers; ações em lote com autorização; histórico; toasts; estados vazios, de carregamento, erro e sucesso; feedback de salvamento; sem botões falsos. Desktop, tablet e mobile têm fluxos utilizáveis.

## 4. Multi-tenancy: segurança inegociável

Modelagem de base: `organizations`, `organization_members`, `profiles`, `roles/permissions`, `contacts`, `companies`, `leads`, `deals`, `pipelines`, `pipeline_stages`, `custom_fields`, `custom_field_values`, `activities`, `appointments`, `tasks`, `documents`, `subscriptions`, `audit_logs`, mais tabelas verticais separadas.

- Registros de negócio devem pertencer comprovadamente a uma organização (direto ou relacionamento seguro). `organization_id` **não** pode ser determinado de forma confiável pelo que o frontend diz; resolver autorização usando identidade validada e memberships reais.
- RLS habilitado para **toda tabela em schema exposto**, policies específicas para SELECT/INSERT/UPDATE/DELETE, usando `USING` e `WITH CHECK` como apropriado. Grants mínimos.
- `TO authenticated` **sozinho não autoriza** uma linha. Não confiar em `raw_user_meta_data` / claims controladas pelo usuário para papéis; evitar JWT claims desatualizadas para decisões críticas.
- Não usar `USING (true)` em tabelas privadas. Não contornar RLS com `service_role` para corrigir bugs.
- Constraint/FK e verificações transacionais devem impedir vínculos cruzados entre organizações e troca maliciosa de `organization_id`.
- Views expostas devem respeitar RLS (`security_invoker` quando apropriado). `SECURITY DEFINER` só se indispensável, com schema privado, search_path protegido, EXECUTE restrito e revisão de risco.
- Proteger cache de servidor/cliente por tenant para evitar vazamento entre organizações.
- Usuários não podem elevar o próprio papel, acessar outros tenants nem forjar entrada em equipe; validar RBAC em backend e policies, não apenas esconder menus.

## 5. Backend, API e segredos — fronteira rigorosa

**FRONTEND é público por definição.** Nunca enviar ao navegador `service_role`, Supabase secret key, senha PostgreSQL, credenciais internas, chave OpenAI, token WhatsApp, chaves de pagamento, secrets de webhooks ou stack traces internos. Somente URL pública e **publishable key** do Supabase podem ir ao frontend quando projetadas para esse uso e protegidas por RLS. Tudo em `NEXT_PUBLIC_*` é publicamente visível.

- Secrets reais em ambiente confiável (variáveis da Vercel/Supabase conforme necessário), nunca em código/props/client bundle/HTML/logs/respostas.
- `server-only` para módulos privados; rotas/Server Actions com autenticação e autorização por operação; validação server-side de payloads/IDs; DTOs que retornem apenas os campos autorizados.
- `gitignore` deve excluir `.env`, `.env.*`, `.env.local`, dumps, credenciais, `.vercel`, exceto **`.env.example` sem valores reais**; `.vercelignore` e `.dockerignore` onde aplicável.
- Inspecionar **histórico Git** e bundles; scanning de segredos pre-commit/CI. Se chave foi versionada, parar, informar e **rotacionar**, não apenas deletar o arquivo.
- Evitar tokens em URLs; Content Security Policy e cabeçalhos adequados; tratar XSS, CSRF quando relevante, CORS restrito, rate limits, erros seguros e validação de uploads.
- Auth: Supabase Auth; convites, email verificado, recuperação de senha, controle de sessão e revogação; MFA obrigatório para proprietários/admins/operadores, com enforcement real no backend/RLS quando relevante. Nunca confiar em papel informado pelo cliente.
- Edge Functions acessadas por usuários: JWT + usuário + tenant + permissão + validação. Webhooks públicos: assinatura específica do provedor, anti-replay e idempotência. **Não** desabilitar `verify_jwt` indiscriminadamente.
- Storage: buckets privados, RLS/policies por tenant, limites de arquivo/MIME/conteúdo, URLs assinadas curtas, proibição de path traversal e de downloads cruzados; auditar upload, download, lista, exclusão.
- Minimizar dados sensíveis, especialmente saúde; controles LGPD, retenção/exclusão e justificativa de tratamento; não declarar conformidade legal automática.
- Audit logs protegidos sem vazamento de tokens/dados sensíveis. Backups PostgreSQL **e Storage separadamente**, com teste real de restauração.

## 6. Testes adversariais obrigatórios — bloqueadores

Criar **duas empresas sintéticas A e B**, usuários owner/admin/member/limited de cada uma e um anônimo. Rodar casos positivos e negativos para cada entidade e operação:
- A lê/escreve somente A; tentativa de SELECT, INSERT, UPDATE, DELETE em B negada.
- `organization_id` adulterado; registro movido entre tenants; FK cruzada; IDs/UUIDs adivinhados; campos personalizados de outro tenant; URL de documento alterada.
- Funcionário tenta elevar papel, convidar indevidamente, usar endpoint administrativo, agir após exclusão de membership ou revogação.
- Sessão expirada, JWT inválido, usuário anônimo, MFA insuficiente.
- Edge Functions sem token ou com token errado; webhooks sem assinatura, falsificados ou repetidos.
- Busca global, relatórios, exports, Storage e caches não vazam dados de B.
- Validação de input, XSS, injeções, CSRF onde aplicável, rate limiting, upload malicioso, idempotência e concorrência.

**Falha crítica/alta não mitigada = PRODUCTION BLOCKED.** Rodar Supabase Security Advisor e Performance Advisor; revisar cada achado, corrigir ou documentar risco residual. Executar lint, typecheck, unit, integration, RLS SQL tests, Playwright, build; nunca inventar resultados. Prever avaliação independente de segurança e privacidade antes de dados reais.

## 7. Fases e gates

### Fase 1 — Fundação + segurança
Inspecionar repositório e arquivos; definir arquitetura, tokens visuais, shell corporativo funcional, Auth, organizações, membership, RBAC, MFA admin, schema inicial, RLS e testes multi-tenant; migrations versionadas; revisão dos segredos. **Concluir e testar antes de avançar.**

### Fase 2 — CRM core
CRUD persistente de contatos, empresas, leads, pipelines, atividades, tarefas, agenda; filtros, paginação, busca e command palette; interface consistente; testes.

### Fase 3 — Configuração universal
Campos e pipelines customizáveis, templates de segmento, módulos ativáveis e permissões; testes de isolamento também para configurações.

### Fase 4 — Recursos empresariais
Propostas, documentos privados, financeiro administrativo, relatórios com dados reais; módulos verticais separados apenas quando necessários.

### Fase 5 — SaaS e integrações
Planos/entitlements, medição de consumo, painel Zaniva, estrutura de automações, inbox, integrações com credenciais reais somente quando fornecidas via secrets seguros; webhooks confiáveis.

### Fase 6 — Homologação e auditoria
Testes E2E, auth/RLS/RBAC/Storage/APIs, security scanning, dependências, Lighthouse quando aplicável, resiliência, backups/restauração e documentação. Gerar relatório de riscos.

**Nenhum deploy em produção sem pedido explícito do proprietário após revisão da auditoria.** Não criar acesso público a dados reais para demonstrar funcionalidade.

## 8. Entregáveis e ritmo de execução

Criar `README.md`, `ARCHITECTURE.md`, `SECURITY.md`, `DEPLOYMENT.md`, `TESTING.md`, `IMPLEMENTATION_STATUS.md`; migrations SQL versionadas e scripts de teste. Atualizar `IMPLEMENTATION_STATUS.md` ao fim de cada fase: implementação real, arquivos alterados, testes executados e resultados, problemas, riscos e próximos passos.

Não parar na proposta arquitetural: **implementar de fato a Fase 1 e demonstrar os testes.** Avançar gradualmente para próximas fases apenas após gates de qualidade, sem sacrificar segurança. Não mascarar funcionalidades inacabadas nem inventar conexões com APIs, pagamentos ou mensagens.

## 9. Instrução inicial

**Comece agora inspecionando o projeto atual.** Informe brevemente a arquitetura detectada e eventuais riscos, então crie/ajuste o projeto e execute a **Fase 1** com código real, migrations, políticas RLS, autenticação e testes de isolamento. Não exponha secrets em saída. Se algo depender de credenciais, use `.env.example` sem valores e registre pendência segura. **NÃO faça deploy em produção.**

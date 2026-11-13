# Status de implementação

## Fase 2 — CRM core · **em andamento**

### Publicação para testes (2026-11-13, a pedido do proprietário)

- CRM em https://zaniva-crm.vercel.app (região gru1) e landing em https://zaniva-crm-site.vercel.app; ambos respondem 200, cabeçalhos de segurança e CSP presentes, sem erros de execução registrados. Detalhes em DEPLOYMENT.md.
- Modelos de e-mail com a marca em `supabase/templates/` (confirmação, senha, troca de e-mail, link de acesso), com link `token_hash` direto (abre em qualquer aparelho).
- Gate de auditoria continua aberto (PRODUCTION BLOCKED para dados reais): só dados sintéticos.

### Entrega 2.4 — Cores e logo da Zaniva no CRM; mostrar senha (2026-11-13)

- Tokens do design system trocados pelas cores da logo (decisão do proprietário, registrada no CLAUDE.md): fundo #090716 / #F7F6FA, texto #F2EFFA / #090716, rosa #DF5EB0 como ação principal, `brand` (#B8338A claro / #E77BC2 escuro) para gráficos e destaques, ameixa como segundo acento. Tokens renomeados: `forest` → `brand`, `butter` → `plum`.
- Logo "zaniva." (monograma "z." com o menu recolhido) no lugar do "Z" verde; fundo das telas de entrada com o brilho rosa/ameixa da logo.
- Botão de mostrar/ocultar senha em login, cadastro e redefinição (`PasswordInput`); só troca o tipo do campo.
- Testes: Playwright 24/24 (+2: mostrar senha; tema escuro com o novo fundo), Vitest 57/57, lint, typecheck, build e scan:bundle. Conferência visual do login e do painel, claro e escuro.

### Entrega 2.3 — Painel inicial em bento (2026-11-13)

- Visão geral refeita como bento de 9 blocos (4 colunas a partir de 1024 px de largura do painel, 2 a partir de 640 px, 1 abaixo; container queries), nas cores e tipografia do design system, claro e escuro: saudação com total de contatos e cadastros por dia (30 dias), equipe por papel e convites, progresso de configuração (meia-lua), crescimento acumulado (contatos ou empresas; 7D/30D/12M, cursor), contatos por responsável, qualidade do cadastro, módulos, cadastros recentes e auditoria.
- **Só números reais**: `public.dashboard_summary(p_org)` (migration `20261113000200`, SECURITY INVOKER, RLS valendo; aplicada na homologação, advisors sem achado novo). Áreas que ainda não existem (atendimento, RH, estoque, equipamentos, assinaturas) aparecem como "Em breve", sem números.
- Gráficos com uma série cada, em floresta (validação de paleta: os acentos da marca não se distinguem como série categórica; floresta passa contraste ≥ 3:1 nos dois temas). Movimento curto (≤ 800 ms) e desligado com "reduzir movimento".
- `components/dashboard/dashboard-view.tsx` só apresenta (props); `server/dashboard.ts` busca e monta o DTO; `app/(app)/page.tsx` liga os dois.
- Testes: SQL 153/153 (+8: tenant alheio recebe zero, anônimo bloqueado, série soma o total), Vitest 57/57, Playwright 22/22, lint, typecheck, build, scan:bundle. Conferência visual com dados sintéticos em 1456/900/390 px, claro e escuro, sem rolagem lateral nem erros no console.

### Entrega 2.2 — Anti-duplicação, cliques repetidos e vazamento (2026-11-13)

- Migration `20261113000100_anti_abuse_dedup.sql` (não destrutiva; falha de propósito se já houver duplicados; **aplicada na homologação em 2026-11-13** com autorização do proprietário, após checar 0 duplicados): e-mail de contato único por organização (sem diferenciar maiúsculas); nome de empresa único por organização (ignorando espaços nas pontas); `request_id` único por organização em contatos e empresas (o mesmo formulário reenviado não cria segundo registro); limite de 120 comandos de escrita por minuto por usuário em contatos/empresas, contado no banco por `auth.uid()` (`private.rate_limit_hits`, sem acesso do app).
- App: telas de criação recebem `request_id` gerado no servidor; reenvio repetido vira sucesso silencioso; mensagens claras para duplicado e para limite. `SubmitButton` (useFormStatus) trava os botões que ainda não travavam (revogar/aceitar convite, encerrar sessões, sair); os demais já travavam via `useActionState`.
- `scripts/scan-bundle.mjs` + `pnpm scan:bundle` (na CI após o build): nenhum segredo nem valor de variável de servidor no código enviado ao navegador. Verificado com vazamento plantado de propósito (detectado, exit 1).
- Testes: SQL 145/145 (+17), Vitest 57/57 (+6), Playwright 22/22, lint, typecheck, build, scan:secrets e scan:bundle ok.
- Advisors após aplicar: Security = WARN `auth_leaked_password_protection` (já conhecido, R10) + INFO `rls_enabled_no_policy` em `private.rate_limit_hits` (intencional: schema não exposto, sem acesso do app); Performance = só `unused_index` INFO (banco vazio).
- Pendente: E2E autenticado (R2), limite para leituras (R4).

### Entrega 2.1 — Contatos e empresas (2026-11-04)

- Migration `20261104000100_crm_contacts_companies.sql` (não destrutiva): empresas ganham e-mail, telefone, site (só http/https) e notas; contatos ganham responsável (`owner_id`) e notas. Trigger garante que o responsável é membro da **mesma** organização. Grants só nas colunas novas. Aplicada na homologação.
- Telas `/contacts` e `/companies`: lista com busca (nome/e-mail/telefone), paginação de 25, estados vazio/erro, criação, edição, exclusão com confirmação. Botões e formulários conforme permissão (limited vê em modo leitura; só owner/admin excluem). UUID de outro tenant → 404.
- Server Actions `server/actions/crm.ts`: `organization_id` sempre da membership ativa; update/delete filtram por id **e** organização e exigem linha afetada; Zod em todos os campos; termo de busca sanitizado antes do filtro PostgREST.
- Testes: SQL 128/128 (+8: responsável cross-tenant, sem membership, site `javascript:`, notas isoladas, limited sem edição); Vitest 51/51 (+5); Playwright 22/22 (+2 rotas do CRM exigem login). Lint, typecheck e build ok.
- Advisors após a migration: Security 1 × WARN `auth_leaked_password_protection` (configuração de Auth, ver SECURITY R10); Performance só `unused_index` INFO.
- Pendente na Fase 2: tags, histórico por registro, leads/oportunidades, pipelines Kanban, atividades, tarefas, agenda, command palette Ctrl+K.


## Fase 1 — Fundação + segurança · **concluída localmente** (2026-11-03)

Gate de produção: **PRODUCTION BLOCKED** — E2E autenticado, configurações de Auth e backups pendentes (SECURITY.md R2, R7, R9). Advisors executados sem achados de segurança.

### Inspeção inicial

Repositório `est-tica-facial` estava vazio (sem commits, sem branches remotas, sem migrations, sem segredos no histórico). Projeto criado do zero. Nenhum projeto Supabase existente foi alterado; nenhum deploy realizado.

### Implementado

- **Arquitetura** Next.js 16 App Router + Supabase, pastas conforme contrato (ARCHITECTURE.md).
- **Design system**: tokens light/dark da paleta Zaniva, tema por cookie (light/dark/sistema), Geist, primitivas (Button, Field/Input/Select, Alert/Badge/EmptyState, Table, PageHeader/Section), Liquid Glass restrito a barra superior e menus, com fallbacks e `prefers-reduced-motion`/`-transparency`/`-contrast`.
- **Shell corporativo**: sidebar recolhível (preferência persistida), drawer no mobile com Escape, barra superior em vidro, troca de organização (Radix, teclado), menu de conta com tema e saída. Somente rotas implementadas aparecem no menu; itens filtrados por permissão.
- **Auth**: cadastro com confirmação de e-mail, login, recuperação e redefinição de senha, confirmação via `token_hash`/PKCE, saída local e global, revalidação da sessão no servidor.
- **MFA TOTP**: cadastro com QR/chave, verificação, obrigatório para owner/admin (banco + app).
- **Organizações e membership**: onboarding (criar org ou aceitar convite), troca de org, renomear org, convites (criar/revogar/aceitar), mudança de papel, remoção/saída, regra de último owner.
- **RBAC**: papéis owner/admin/member/limited, matriz privada de permissões, `my_permissions` para a UI.
- **Auditoria**: registros imutáveis pelo app para eventos de org/convite/membro; página e resumo na visão geral.
- **Schema inicial + RLS**: profiles, organizations, organization_members, organization_invitations, audit_logs, companies, contacts (FK compostas, `organization_id` imutável).
- **Segurança da aplicação**: CSP com nonce, cabeçalhos, `server-only`, Zod em todas as actions, mensagens de erro seguras, redirect seguro, varredura de segredos (pre-commit + CI com histórico).
- **CI** GitHub Actions: secret scan (histórico), lint, typecheck, unit, RLS (Postgres 17), build, E2E.

### Arquivos principais

`supabase/migrations/20261103000100_foundation.sql`, `supabase/migrations/20261103000200_core_tenant_tables.sql`, `supabase/tests/*`, `supabase/config.toml`, `proxy.ts`, `lib/**`, `server/**`, `features/**`, `components/**`, `design-system/**`, `app/**`, `tests/**`, `scripts/test-rls.sh`, `scripts/scan-secrets.mjs`, `.github/workflows/ci.yml`, `.githooks/pre-commit`, documentação `*.md`.

### Testes executados (local, 2026-11-03)

| Suíte | Resultado |
| --- | --- |
| `pnpm lint` | 0 erros, 0 avisos |
| `pnpm typecheck` | ok |
| `pnpm test` (Vitest) | 46/46 |
| `pnpm test:rls` (PostgreSQL 16.15 local) | 120/120 asserções (110 adversariais + 10 de catálogo) |
| `pnpm build` | ok (todas as rotas dinâmicas) |
| `pnpm test:e2e` (Chromium desktop + Pixel 7) | 20/20 |
| `pnpm scan:secrets` | nenhum segredo |

### Não executado / limitações

- E2E autenticado contra Supabase Auth real (e-mail, MFA, expiração/revogação de sessão).
- Testes RLS adversariais completos (fixtures A/B) rodaram em PG 16 com shim do `auth`; no Supabase real foram verificados catálogo e privilégios, não a suíte completa com usuários reais.
- Configurações de Auth do projeto de homologação (senha mínima, URLs, templates) ainda não ajustadas no painel.
- React Hook Form/TanStack ainda não usados (formulários da Fase 1 são simples e validados no servidor com Zod); entram na Fase 2 com tabelas e formulários complexos.

### Homologação Supabase (2026-11-03, autorizada pelo proprietário)

- Projeto **novo** `zaniva-crm-homolog` (ref `aztsuhsupuhvvgjekcdq`, sa-east-1, PostgreSQL 17.11), org Orbyn Tech. Projetos existentes não foram alterados. Sem dados.
- Migrations aplicadas via conector: `foundation`, `core_tenant_tables` (mesmo SQL de `supabase/migrations/`). Antes, foram removidas 2 tabelas vazias e o enum criados por uma tentativa manual parcial.
- **Security Advisor: 0 achados.**
- **Performance Advisor: 12 × INFO `unused_index`** — esperado em banco vazio; índices de FK/tenant mantidos.
- Verificação de catálogo no Supabase real: 7 tabelas em `public`, todas com RLS; 15 policies, nenhuma `true` nem para anon; anon sem grants em tabelas nem EXECUTE em funções, sem USAGE em `private`; `authenticated` sem INSERT/UPDATE de tabela inteira (só por coluna), sem UPDATE em `organization_id`/`status`; `SECURITY DEFINER` só em `private`; todas as funções com `search_path`; trigger `on_auth_user_created` ativo; 33 permissões na matriz.

### Validação manual com Auth real (2026-11-03)

Proprietário rodou o app localmente contra a homologação e concluiu: cadastro → e-mail de confirmação do Supabase → confirmação (PKCE em `/auth/confirm`) → onboarding → criação de organização → MFA TOTP obrigatório para owner → visão geral com contagens reais e evento de auditoria. Conta usada: a do próprio proprietário (não sintética).

### Próximos passos

1. Automatizar o E2E autenticado (Playwright) com usuários sintéticos (R2); validar convite/aceite, troca de organização e revogação.
2. Fase 2: CRUD de contatos/empresas (tabelas já com RLS), leads, pipelines, atividades, tarefas, agenda, command palette, com testes de isolamento por entidade.

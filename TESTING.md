# Testes

Todos os testes usam **dados sintéticos**.

## SQL / RLS — `pnpm test:rls`

`scripts/test-rls.sh` cria um banco descartável (`TEST_DATABASE_URL`, padrão `postgres://postgres:postgres@localhost:5432/postgres`), aplica:

1. `supabase/tests/00_supabase_shim.sql` — emula `auth.users`, `auth.uid()`, `auth.jwt()`, papéis `anon/authenticated/service_role` e os *default privileges* amplos do Supabase (para provar que as migrations os revogam);
2. todas as migrations de `supabase/migrations/`;
3. `01_test_helpers.sql`, `10_fixtures.sql`, `20_rls_isolation.sql`, `30_security_lint.sql`.

Fixtures: organizações **A (Alpha)** e **B (Beta)** criadas pela RPC real; owner/admin/member/limited em cada uma (convidados e aceitos pela RPC real); um usuário externo; um não verificado; anônimo. Cada teste troca `role` e `request.jwt.claims` como o PostgREST faz.

`25_crm_contacts_companies.sql`: responsável de outra organização ou sem membership, site com `javascript:`, notas isoladas por tenant, limited sem edição.

Cobertura (118 asserções + 10 de catálogo): SELECT/INSERT/UPDATE/DELETE de A em B; `organization_id` adulterado; mover registro entre tenants; FK cruzada; UUID adivinhado; id escolhido pelo cliente; elevação do próprio papel; convite indevido; admin vs owner; último owner; replay/expiração/revogação de convite; e-mail não verificado; membership removida; org suspensa; JWT sem `sub`; claims/metadata forjadas; MFA insuficiente (aal1) para owner/admin; busca textual; auditoria isolada; validação de slug/nome; HTML armazenado como texto; rate limit de criação. Qualquer falha encerra com código ≠ 0.

## Unit + fronteira de segurança — `pnpm test`

`tests/unit`: redirect seguro, RBAC da UI, schemas Zod, env pública, mensagens de erro, CSP.
`tests/security`: ausência de `service_role`/secret no código, componentes cliente sem imports de servidor, `server-only`, todas as Server Actions revalidam sessão, sem `NEXT_PUBLIC_` sensível, sem cache compartilhado, regras do `.gitignore`, `.env.example` vazio, detector de segredos.

## E2E — `pnpm build && pnpm test:e2e`

Playwright (Chromium desktop e Pixel 7) contra `next start` com env placeholder (sem backend): redirecionamento de anônimo, `next` seguro contra open redirect, cabeçalhos/CSP, HTML sem segredos, erro genérico de login, validação server-side de senha, link de confirmação inválido, tema escuro, ausência de rolagem horizontal no mobile.

**Pendente (requer homologação Supabase autorizada):** E2E autenticado (cadastro → confirmação → MFA → criar org → convidar → aceitar → trocar org), sessão expirada/revogada contra GoTrue real, Security/Performance Advisor.

## Segredos — `pnpm scan:secrets [-- --history]`

Também roda no pre-commit (`.githooks/pre-commit`) e na CI com `--history`.

## Bundle do navegador — `pnpm scan:bundle` (depois de `pnpm build`)

Varre `.next/static` (tudo que o navegador baixa): padrões de chaves conhecidas (JWT só passa se for `anon`) e o **valor** de toda variável de ambiente do servidor presente no build. Roda na CI logo após o build. Testes da própria varredura em `tests/security/bundle-scan.test.ts`.

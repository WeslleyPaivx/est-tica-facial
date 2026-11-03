# Arquitetura

## Visão geral

Monólito modular Next.js + Supabase. O navegador só conversa com o servidor Next (Server Components e Server Actions). O servidor usa o cliente Supabase **com a sessão do usuário** (publishable key + JWT em cookie httpOnly), portanto **toda leitura e escrita passa por RLS**. Não há uso de `service_role` no app.

```
Browser ──► proxy.ts (renova sessão, CSP nonce, redireciona anônimo)
        ──► Server Components / Server Actions (validação Zod, server/session.ts)
              └─► Supabase (PostgREST + Auth) ──► Postgres: RLS + funções privadas
```

## Pastas

| Pasta | Conteúdo |
| --- | --- |
| `app/` | Rotas. `(auth)` login/cadastro/recuperação; `(app)` shell autenticado; `mfa`, `onboarding`, `auth/confirm` |
| `components/` | Componentes de feature (auth, mfa, organizations, shell) |
| `design-system/` | Tokens (`tokens.css`), Liquid Glass (`glass.css`), primitivas (`components/`) |
| `features/` | Schemas Zod e regras de domínio por feature |
| `server/` | `session.ts` (contexto autenticado por requisição) e `actions/` (Server Actions) |
| `lib/supabase/` | Cliente de servidor (`server-only`) e renovação de sessão no proxy |
| `lib/security/` | RBAC espelhado para UI, CSP, redirect seguro, mensagens de erro seguras |
| `types/` | Tipos de domínio |
| `supabase/migrations/` | Migrations SQL versionadas |
| `supabase/tests/` | Shim Supabase + testes SQL/RLS |
| `tests/{unit,security,e2e,integration}` | Vitest e Playwright |

## Modelo multi-tenant

- `organizations` (tenant), `organization_members` (user × org × papel), `organization_invitations`, `profiles`, `audit_logs`.
- Papéis: `owner > admin > member > limited`. Matriz papel→permissão em `private.role_permissions` (não exposta).
- Tabelas de negócio têm `organization_id NOT NULL`, `UNIQUE (id, organization_id)` e FKs compostas `(fk_id, organization_id)` — vínculo entre tenants é impossível por constraint. Trigger impede alterar `organization_id`.
- Iniciais da Fase 1: `companies`, `contacts` (CRUD de UI vem na Fase 2).

### Autorização

`private.has_permission(org, perm)` = membership real **e** org ativa **e** papel concede a permissão **e** (papel não é owner/admin **ou** sessão `aal2`). Usada por todas as policies. Papel nunca vem de JWT/metadata.

Operações que mudam membership (criar org, convidar, aceitar, revogar, mudar papel, remover) são RPCs `public.*` *SECURITY INVOKER* que delegam para `private.*` *SECURITY DEFINER* com `search_path = ''`, checagens explícitas e `FOR UPDATE` contra corridas. Não há policy de INSERT/UPDATE/DELETE em `organization_members`.

### Organização ativa

Cookie httpOnly `zaniva_org` é só preferência: `server/session.ts` só o aceita se corresponder a uma membership real retornada sob RLS; caso contrário usa a primeira membership.

### Cache

`React.cache` (escopo de requisição) apenas. Proibido `unstable_cache`/`"use cache"` para dados de tenant (teste em `tests/security`). Respostas recebem `Cache-Control: private, no-store`.

## Design system

Tokens light/dark conforme paleta do contrato; tema por cookie (`light`/`dark`/`system`), sem script inline. Liquid Glass (`.z-glass`, refração SVG `feDisplacementMap` só em Chromium) restrito à barra superior e menus flutuantes, com fallback sólido para `prefers-reduced-transparency`, `prefers-contrast` e navegadores sem `backdrop-filter`. `prefers-reduced-motion` respeitado globalmente.

# Zaniva CRM

CRM B2B multiempresa (multi-tenant) para imobiliárias, clínicas (uso administrativo), contabilidades, advocacia, estética e serviços. O contrato técnico do projeto está em [`CLAUDE.md`](CLAUDE.md).

**Estado atual:** Fase 1 (fundação + segurança) implementada e testada localmente. Nada foi publicado em produção. Veja [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md).

## Stack

Next.js 16 (App Router, `proxy.ts`) · React 19 · TypeScript strict · Tailwind CSS 4 · Radix · Zod · Supabase (Postgres, Auth, RLS) · Vitest · Playwright · pnpm.

## Começando

```bash
pnpm install
cp .env.example .env.local   # preencha URL pública e publishable key do Supabase
pnpm dev
```

Aplicar as migrations (`supabase/migrations/`) em um projeto **de homologação** com dados sintéticos — nunca em produção sem autorização (ver [`DEPLOYMENT.md`](DEPLOYMENT.md)).

## Scripts

| Comando | O que faz |
| --- | --- |
| `pnpm lint` / `pnpm typecheck` | ESLint e TypeScript |
| `pnpm test` | Vitest (unit + fronteira de segurança) |
| `pnpm test:rls` | Migrations + testes SQL/RLS adversariais em Postgres descartável |
| `pnpm test:e2e` | Playwright (desktop e mobile) contra `next start` |
| `pnpm scan:secrets` | Varredura de segredos (`-- --history` inclui o histórico Git) |
| `pnpm build` | Build de produção |

Documentação: [ARCHITECTURE](ARCHITECTURE.md) · [SECURITY](SECURITY.md) · [TESTING](TESTING.md) · [DEPLOYMENT](DEPLOYMENT.md).

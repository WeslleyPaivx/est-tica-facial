# Segurança

> Este documento descreve controles implementados e riscos conhecidos. Não constitui certificação nem declaração de conformidade legal (LGPD etc.). Antes de dados reais é obrigatória avaliação independente de segurança e privacidade.

## Controles implementados (Fase 1)

**Isolamento multi-tenant (banco)**
- RLS habilitado em todas as tabelas de `public` (verificado por teste de catálogo).
- Policies por operação, `TO authenticated`, sempre condicionadas a `private.has_permission(...)`; nenhuma policy `USING (true)`; nenhuma policy para `anon`.
- Grants mínimos: `anon` sem privilégio algum; `authenticated` só `SELECT` + colunas específicas de `INSERT/UPDATE` (ex.: `organization_id` não é atualizável; `id` não é inserível; `organizations.status` não é alterável).
- FK compostas `(id, organization_id)` impedem vínculo cruzado; trigger impede mover registros entre tenants.
- `SECURITY DEFINER` apenas no schema `private` (não exposto na Data API), com `search_path = ''`; `EXECUTE` revogado de `PUBLIC`/`anon`.
- Papéis vêm exclusivamente de `organization_members`. `raw_user_meta_data`/`app_metadata`/claims customizadas são ignorados (testado).

**RBAC e MFA**
- Ninguém altera o próprio papel; admin só gerencia/concede papéis abaixo do seu; convites nunca concedem `owner`; organização sempre mantém ≥ 1 owner (com lock).
- **MFA obrigatório para owner/admin com enforcement no banco**: sem `aal2` essas pessoas não têm nenhuma permissão efetiva (só enxergam a própria membership/org para serem redirecionadas ao MFA). O app também redireciona para `/mfa`.
- Remoção de membership revoga o acesso imediatamente (RLS consulta a tabela a cada query).

**Auth**
- Supabase Auth com confirmação de e-mail; criação de org e aceite de convite exigem e-mail verificado (checado em `auth.users`, não no JWT).
- Convites não usam token em URL: a pessoa entra com o e-mail convidado e aceita. Resposta idêntica para convite inexistente/alheio/expirado/revogado/usado.
- Login com mensagem genérica (sem enumeração); senha ≥ 12 com letras e números; troca de senha encerra outras sessões; botão "Encerrar todas as sessões".
- `getUser()` no servidor valida a sessão contra o Auth a cada requisição autenticada.
- Links de confirmação/recuperação: `token_hash`/`code` de uso único, trocados no servidor e removidos da URL por redirect; `next` validado contra open redirect.

**Aplicação**
- Nenhuma chave secreta no código ou no bundle; apenas `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `NEXT_PUBLIC_SITE_URL`. `lib/env.ts` recusa secret key configurada como pública.
- Módulos de servidor marcados `server-only`; teste garante que componentes cliente não os importam.
- Server Actions revalidam sessão e membership; IDs e payloads validados com Zod; organização ativa resolvida no servidor.
- Erros do banco convertidos em mensagens seguras (`lib/security/errors.ts`); sem stack traces ao cliente.
- CSP com nonce por requisição + `strict-dynamic`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'none'`, `form-action 'self'`; HSTS, `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, COOP; `X-Powered-By` removido; `Cache-Control: private, no-store`.
- Server Actions do Next verificam `Origin` (proteção CSRF); cookies `SameSite=Lax`, `httpOnly` para organização ativa.
- Anti-abuso: máximo de 5 organizações criadas por usuário em 24 h (no banco).

**Segredos**
- `.gitignore`/`.vercelignore` excluem `.env*` (exceto `.env.example` vazio), chaves, dumps, `.vercel`.
- `scripts/scan-secrets.mjs` em pre-commit (`.githooks`) e na CI com `--history`. Histórico Git inspecionado: repositório não tinha commits anteriores; nenhum segredo encontrado.
- Se uma chave for versionada: parar, informar, **rotacionar** no provedor e só então limpar o histórico.

## Riscos residuais e pendências (Fase 1)

| # | Risco | Severidade | Situação |
| --- | --- | --- | --- |
| R1 | Supabase Security/Performance Advisor não executado (sem projeto de homologação autorizado). Substituído por lint de catálogo local (`supabase/tests/30_security_lint.sql`). | Alta até rodar | **PRODUCTION BLOCKED** até rodar Advisors e revisar achados |
| R2 | Fluxos Auth reais (e-mail, MFA TOTP, expiração de JWT, refresh) não testados E2E contra GoTrue; testados apenas por unidade/RLS com JWT simulado. | Média | Pendente: Playwright autenticado em homologação |
| R3 | Envio de e-mail de convite não implementado (estado honesto na UI). | Baixa | Fase 5 |
| R4 | Rate limit de aplicação (Server Actions) depende dos limites do Supabase Auth; sem limitador próprio além do limite de criação de org. | Média | Avaliar WAF/Vercel Firewall ou limitador antes de produção |
| R5 | `aal` vem do JWT assinado pelo Supabase; um JWT aal2 continua válido até expirar (≤ `jwt_expiry`, 1 h) mesmo após desativar o fator. | Baixa | Aceito; reduzir `jwt_expiry` se necessário |
| R6 | `style-src 'unsafe-inline'` necessário para estilos inline do React/Radix. | Baixa | Aceito |
| R7 | Backups (Postgres e Storage separados) e teste de restauração não configurados. | Alta para produção | Fase 6 |
| R8 | Exclusão de organização/retenção LGPD não implementadas. | Média | Fases 5–6 |

## Reportar vulnerabilidade

Envie para o proprietário do repositório por canal privado. Não abra issue pública com detalhes exploráveis.

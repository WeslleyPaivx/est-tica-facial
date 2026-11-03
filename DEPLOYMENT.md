# Deploy

> **Nenhum deploy de produção sem pedido explícito do proprietário após revisão da auditoria (Fase 6).** Status atual: PRODUCTION BLOCKED (ver SECURITY.md, R1/R7).

## Homologação (quando autorizado)

1. Criar projeto Supabase **novo** de homologação (não reutilizar projetos existentes).
2. Auth: confirmação de e-mail ligada, MFA TOTP habilitado, senha mínima 12, Site URL e Redirect URLs apontando para `…/auth/confirm` (espelhar `supabase/config.toml`).
3. Templates de e-mail: links para `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=<tipo>&next=<rota>` (ou fluxo PKCE padrão).
4. Data API: expor apenas o schema `public` (nunca `private`).
5. Aplicar migrations em ordem (`supabase db push` ou SQL editor) e rodar **Security Advisor** e **Performance Advisor**; registrar cada achado.
6. Vercel (projeto de preview): definir somente `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`. Nenhum secret é necessário na Fase 1.
7. Rodar a suíte E2E autenticada com usuários sintéticos.

## Produção

Somente após Fase 6: auditoria, backups Postgres + Storage com restauração testada, Advisors sem achados críticos/altos, e autorização explícita.

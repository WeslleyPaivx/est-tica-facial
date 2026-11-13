# Deploy

> **Nenhum deploy de produção sem pedido explícito do proprietário após revisão da auditoria (Fase 6).** Status atual: PRODUCTION BLOCKED (ver SECURITY.md, R1/R7).

## Publicação atual (2026-11-13, a pedido explícito do proprietário, para testes com dados sintéticos)

O proprietário pediu a publicação mesmo com as pendências da auditoria abertas (SECURITY.md R2, R4 leitura, R7 backups, R8 LGPD, R10). **Somente dados sintéticos** até a auditoria fechar.

| Projeto Vercel (time Zaniva) | Endereço | O que é |
| --- | --- | --- |
| `zaniva-crm` | https://zaniva-crm.vercel.app | CRM (Next.js, raiz do repositório), funções em `gru1` (São Paulo, junto do Supabase `sa-east-1`), Node 22 |
| `zaniva-crm-site` | https://zaniva-crm-site.vercel.app | Landing (Vite, pasta `landing/`), "Entrar" e "Começar grátis" levam ao CRM |

- Banco: Supabase `zaniva-crm-homolog` (migrations até `20261113000300` aplicadas).
- Variáveis na Vercel: só as três públicas (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL=https://zaniva-crm.vercel.app`). Nenhum segredo.
- Proteção da Vercel (login Vercel) só nas URLs de preview; produção aberta.
- Publicado da branch `claude/ecstatic-heisenberg-gh50i5`; novos pushes geram previews protegidos. Para atualizar produção: novo deploy de produção do commit desejado (ou mesclar na branch padrão do repositório).
- Supabase Auth (aplicado via API de gestão em 2026-11-13): Site URL `https://zaniva-crm.vercel.app`, Redirect URLs `https://zaniva-crm.vercel.app/**` e `http://localhost:3000/**`, senha mínima 8, os quatro modelos de `supabase/templates/` (confirmação, senha, troca de e-mail, link de acesso). SMTP próprio configurado pelo proprietário no painel (Gmail com senha de app, remetente "ZANIVA", 60 e-mails/hora); a senha nunca passou pelo repositório nem pelo chat. Trocar por um provedor com domínio próprio antes de uso real.

## Homologação (quando autorizado)

1. Criar projeto Supabase **novo** de homologação (não reutilizar projetos existentes).
2. Auth: confirmação de e-mail ligada, MFA TOTP habilitado, senha mínima 8, Site URL e Redirect URLs apontando para `…/auth/confirm` (espelhar `supabase/config.toml`).
3. Templates de e-mail: links para `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=<tipo>&next=<rota>` (ou fluxo PKCE padrão).
4. Data API: expor apenas o schema `public` (nunca `private`).
5. Aplicar migrations em ordem (`supabase db push` ou SQL editor) e rodar **Security Advisor** e **Performance Advisor**; registrar cada achado.
6. Vercel (projeto de preview): definir somente `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`. Nenhum secret é necessário na Fase 1.
7. Rodar a suíte E2E autenticada com usuários sintéticos.

## Produção

Somente após Fase 6: auditoria, backups Postgres + Storage com restauração testada, Advisors sem achados críticos/altos, e autorização explícita.

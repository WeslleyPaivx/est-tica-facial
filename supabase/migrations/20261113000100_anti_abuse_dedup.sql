-- ZANIVA CRM — anti-duplicação e limite de escrita (não destrutiva: só adiciona colunas, índices, tabela e triggers).
-- Tudo é imposto no banco, então vale também para quem chamar a API (PostgREST) direto, sem passar pelo site.
-- Se houver duplicados já gravados, a criação dos índices únicos falha e nada é aplicado: limpe à mão antes.

-- 1. Duplicados de negócio: mesmo e-mail de contato ou mesmo nome de empresa na mesma organização.
create unique index contacts_org_email_uniq on public.contacts (organization_id, lower(email)) where email is not null;
create unique index companies_org_name_uniq on public.companies (organization_id, lower(btrim(name)));

-- 2. Idempotência de criação: cada formulário manda um request_id aleatório; o mesmo envio repetido (duplo clique,
--    reenvio da rede, botão voltar) bate no índice e não cria um segundo registro.
alter table public.contacts add column request_id uuid;
alter table public.companies add column request_id uuid;
create unique index contacts_org_request_uniq on public.contacts (organization_id, request_id) where request_id is not null;
create unique index companies_org_request_uniq on public.companies (organization_id, request_id) where request_id is not null;
grant insert (request_id) on public.contacts, public.companies to authenticated;

-- 3. Limite de escrita por usuário: janelas fixas contadas no banco. A contagem é do usuário autenticado
--    (auth.uid()), nunca de um valor enviado pelo cliente, então ninguém esgota o limite de outra pessoa.
create table private.rate_limit_hits (
  user_id uuid not null,
  action text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (user_id, action, window_start)
);
alter table private.rate_limit_hits enable row level security;
revoke all on private.rate_limit_hits from public, anon, authenticated;

create function private.enforce_rate_limit(p_action text, p_max integer, p_window interval) returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  bucket timestamptz := date_bin(p_window, now(), timestamptz '2000-01-01');
  n integer;
begin
  if uid is null then return; end if; -- rotinas internas sem usuário (migrations, manutenção)
  insert into private.rate_limit_hits as r (user_id, action, window_start, hits)
  values (uid, p_action, bucket, 1)
  on conflict (user_id, action, window_start) do update set hits = r.hits + 1
  returning hits into n;
  if n > p_max then
    -- a exceção desfaz o incremento junto com a escrita, e o usuário segue bloqueado até a janela virar
    raise exception 'too many requests' using errcode = 'P0001';
  end if;
  delete from private.rate_limit_hits where user_id = uid and action = p_action and window_start < bucket - interval '1 day';
end $$;
revoke all on function private.enforce_rate_limit(text, integer, interval) from public, anon, authenticated;

-- por comando (não por linha): uma exclusão em lote conta como uma ação
create function private.crm_write_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.enforce_rate_limit('crm.write', 120, interval '1 minute');
  return null;
end $$;
revoke all on function private.crm_write_limit() from public, anon, authenticated;

create trigger companies_write_limit before insert or update or delete on public.companies
  for each statement execute function private.crm_write_limit();
create trigger contacts_write_limit before insert or update or delete on public.contacts
  for each statement execute function private.crm_write_limit();

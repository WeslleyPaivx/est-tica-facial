-- ZANIVA CRM — Fase 2: leads e oportunidades num funil Kanban (não destrutiva: só cria e adiciona).
-- Lead = oportunidade nas primeiras etapas; status open/won/lost; origem, valor, responsável, próxima ação e motivo de
-- perda. FKs compostas (id, organization_id) impedem vínculo entre tenants; organization_id é imutável.

-- contatos ganham a chave composta que as oportunidades referenciam (id já é PK, então nada existente viola)
alter table public.contacts add constraint contacts_id_org_key unique (id, organization_id);

create table public.pipelines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id, organization_id)
);
create unique index pipelines_one_default on public.pipelines (organization_id) where is_default;

create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  pipeline_id uuid not null,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  position integer not null check (position between 0 and 99),
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  unique (id, pipeline_id),
  unique (pipeline_id, position),
  foreign key (pipeline_id, organization_id) references public.pipelines (id, organization_id) on delete cascade
);

create type public.deal_status as enum ('open', 'won', 'lost');

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  pipeline_id uuid not null,
  stage_id uuid not null,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  value_cents bigint check (value_cents is null or value_cents between 0 and 100000000000),
  source text check (source is null or char_length(source) <= 60),
  status public.deal_status not null default 'open',
  lost_reason text check (lost_reason is null or char_length(lost_reason) <= 500),
  next_action text check (next_action is null or char_length(next_action) <= 200),
  next_action_at date,
  owner_id uuid references auth.users (id) on delete set null,
  contact_id uuid,
  company_id uuid,
  request_id uuid,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  check (status <> 'lost' or lost_reason is not null),
  foreign key (pipeline_id, organization_id) references public.pipelines (id, organization_id) on delete cascade,
  foreign key (stage_id, organization_id) references public.pipeline_stages (id, organization_id),
  -- a etapa precisa ser do mesmo funil da oportunidade
  foreign key (stage_id, pipeline_id) references public.pipeline_stages (id, pipeline_id),
  foreign key (contact_id, organization_id) references public.contacts (id, organization_id) on delete set null (contact_id),
  foreign key (company_id, organization_id) references public.companies (id, organization_id) on delete set null (company_id)
);
create index deals_org_stage_idx on public.deals (organization_id, stage_id) where status = 'open';
create index deals_org_status_idx on public.deals (organization_id, status, updated_at desc);
create index deals_owner_idx on public.deals (owner_id);
create index deals_contact_idx on public.deals (contact_id, organization_id);
create index deals_company_idx on public.deals (company_id, organization_id);
create index deals_created_by_idx on public.deals (created_by);
create index deals_pipeline_idx on public.deals (pipeline_id, organization_id);
create index deals_stage_pipeline_idx on public.deals (stage_id, pipeline_id);
create unique index deals_org_request_uniq on public.deals (organization_id, request_id) where request_id is not null;
create index pipeline_stages_pipeline_org_idx on public.pipeline_stages (pipeline_id, organization_id);
create index pipeline_stages_org_idx on public.pipeline_stages (organization_id);

-- trilha de alterações de cada oportunidade: só o banco escreve, ninguém altera nem apaga pelo app
create table public.deal_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null,
  deal_id uuid not null,
  actor_id uuid references auth.users (id) on delete set null,
  kind text not null check (kind in ('created', 'stage_changed', 'status_changed')),
  from_stage uuid,
  to_stage uuid,
  from_status public.deal_status,
  to_status public.deal_status,
  created_at timestamptz not null default now(),
  foreign key (deal_id) references public.deals (id) on delete cascade,
  foreign key (organization_id) references public.organizations (id) on delete cascade
);
create index deal_events_deal_idx on public.deal_events (deal_id, created_at desc);
create index deal_events_org_idx on public.deal_events (organization_id);
create index deal_events_actor_idx on public.deal_events (actor_id);

-- ---------------------------------------------------------------------------
-- Regras no banco
-- ---------------------------------------------------------------------------
create trigger deals_touch before update on public.deals for each row execute function private.touch_updated_at();
create trigger deals_org_immutable before update on public.deals for each row execute function private.forbid_org_change();
create trigger pipelines_org_immutable before update on public.pipelines for each row execute function private.forbid_org_change();
create trigger pipeline_stages_org_immutable before update on public.pipeline_stages for each row execute function private.forbid_org_change();
-- responsável precisa ser membro da mesma organização (mesma regra dos contatos)
create trigger deals_owner_same_org before insert or update of owner_id, organization_id on public.deals
  for each row execute function private.check_contact_owner();
create trigger deals_write_limit before insert or update or delete on public.deals
  for each statement execute function private.crm_write_limit();

-- fechar/reabrir: closed_at acompanha o status; reabrir limpa o motivo de perda
create function private.deal_status_dates() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status = 'open' then
    new.closed_at := null;
    new.lost_reason := null;
  elsif tg_op = 'INSERT' or new.status is distinct from old.status then
    new.closed_at := now();
  end if;
  if new.status = 'won' then new.lost_reason := null; end if;
  return new;
end $$;
revoke all on function private.deal_status_dates() from public, anon, authenticated;
create trigger deals_status_dates before insert or update of status on public.deals
  for each row execute function private.deal_status_dates();

create function private.log_deal_event() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.deal_events (organization_id, deal_id, actor_id, kind, to_stage, to_status)
    values (new.organization_id, new.id, (select auth.uid()), 'created', new.stage_id, new.status);
  else
    if new.stage_id is distinct from old.stage_id then
      insert into public.deal_events (organization_id, deal_id, actor_id, kind, from_stage, to_stage)
      values (new.organization_id, new.id, (select auth.uid()), 'stage_changed', old.stage_id, new.stage_id);
    end if;
    if new.status is distinct from old.status then
      insert into public.deal_events (organization_id, deal_id, actor_id, kind, from_status, to_status)
      values (new.organization_id, new.id, (select auth.uid()), 'status_changed', old.status, new.status);
    end if;
  end if;
  return null;
end $$;
revoke all on function private.log_deal_event() from public, anon, authenticated;
create trigger deals_log_event after insert or update of stage_id, status on public.deals
  for each row execute function private.log_deal_event();

-- funil padrão: toda organização nasce com um (e as existentes recebem agora)
create function private.provision_default_pipeline(p_org uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare pid uuid;
begin
  if exists (select 1 from public.pipelines where organization_id = p_org and is_default) then return; end if;
  insert into public.pipelines (organization_id, name, is_default) values (p_org, 'Vendas', true) returning id into pid;
  insert into public.pipeline_stages (organization_id, pipeline_id, name, position)
  select p_org, pid, s.name, s.pos
  from (values ('Novo lead', 0), ('Qualificado', 1), ('Proposta enviada', 2), ('Negociação', 3)) as s(name, pos);
end $$;
revoke all on function private.provision_default_pipeline(uuid) from public, anon, authenticated;

create function private.on_organization_created() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.provision_default_pipeline(new.id);
  return null;
end $$;
revoke all on function private.on_organization_created() from public, anon, authenticated;
create trigger organizations_default_pipeline after insert on public.organizations
  for each row execute function private.on_organization_created();

select private.provision_default_pipeline(id) from public.organizations;

-- ---------------------------------------------------------------------------
-- Permissões por papel
-- ---------------------------------------------------------------------------
insert into private.role_permissions (role, permission)
select r.role::public.member_role, p.permission
from (values
  ('owner',   array['deals.read', 'deals.write', 'deals.delete']),
  ('admin',   array['deals.read', 'deals.write', 'deals.delete']),
  ('member',  array['deals.read', 'deals.write']),
  ('limited', array['deals.read'])
) as r(role, perms)
cross join lateral unnest(r.perms) as p(permission)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- RLS e grants mínimos
-- ---------------------------------------------------------------------------
alter table public.pipelines enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.deals enable row level security;
alter table public.deal_events enable row level security;

revoke all on public.pipelines, public.pipeline_stages, public.deals, public.deal_events from public, anon, authenticated;
-- funis e etapas: só leitura pelo app nesta entrega (edição de etapas vem na Fase 3, com testes próprios)
grant select on public.pipelines, public.pipeline_stages, public.deal_events to authenticated;
grant select, delete on public.deals to authenticated;
grant insert (organization_id, pipeline_id, stage_id, title, value_cents, source, status, lost_reason, next_action,
              next_action_at, owner_id, contact_id, company_id, request_id),
      update (stage_id, title, value_cents, source, status, lost_reason, next_action, next_action_at, owner_id,
              contact_id, company_id)
  on public.deals to authenticated;

create policy pipelines_select on public.pipelines for select to authenticated
  using (private.has_permission(organization_id, 'deals.read'));
create policy pipeline_stages_select on public.pipeline_stages for select to authenticated
  using (private.has_permission(organization_id, 'deals.read'));
create policy deal_events_select on public.deal_events for select to authenticated
  using (private.has_permission(organization_id, 'deals.read'));

create policy deals_select on public.deals for select to authenticated
  using (private.has_permission(organization_id, 'deals.read'));
create policy deals_insert on public.deals for insert to authenticated
  with check (private.has_permission(organization_id, 'deals.write'));
create policy deals_update on public.deals for update to authenticated
  using (private.has_permission(organization_id, 'deals.write'))
  with check (private.has_permission(organization_id, 'deals.write'));
create policy deals_delete on public.deals for delete to authenticated
  using (private.has_permission(organization_id, 'deals.delete'));

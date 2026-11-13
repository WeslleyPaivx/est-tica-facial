-- ZANIVA CRM — Fase 2: tarefas com responsável, prioridade, prazo, checklist, comentários e recorrência
-- (não destrutiva: só cria e adiciona). Vínculos opcionais com contato, empresa e oportunidade da MESMA organização.

-- oportunidades ganham a chave composta que as tarefas referenciam (id já é PK, então nada existente viola)
alter table public.deals add constraint deals_id_org_key unique (id, organization_id);

create type public.task_priority as enum ('low', 'normal', 'high', 'urgent');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  description text check (description is null or char_length(description) <= 5000),
  due_date date,
  priority public.task_priority not null default 'normal',
  -- responsável (mesmo nome de coluna dos contatos e oportunidades, para a mesma regra de membership)
  owner_id uuid references auth.users (id) on delete set null,
  contact_id uuid,
  company_id uuid,
  deal_id uuid,
  recurrence text check (recurrence is null or recurrence in ('daily', 'weekly', 'monthly')),
  completed_at timestamptz,
  completed_by uuid references auth.users (id) on delete set null,
  -- a próxima ocorrência já foi criada (concluir de novo depois de reabrir não duplica)
  spawned_next boolean not null default false,
  request_id uuid,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (contact_id, organization_id) references public.contacts (id, organization_id) on delete set null (contact_id),
  foreign key (company_id, organization_id) references public.companies (id, organization_id) on delete set null (company_id),
  foreign key (deal_id, organization_id) references public.deals (id, organization_id) on delete set null (deal_id)
);
create index tasks_org_open_due_idx on public.tasks (organization_id, due_date) where completed_at is null;
create index tasks_org_done_idx on public.tasks (organization_id, completed_at desc) where completed_at is not null;
create index tasks_owner_open_idx on public.tasks (owner_id, due_date) where completed_at is null;
create index tasks_contact_idx on public.tasks (contact_id, organization_id);
create index tasks_company_idx on public.tasks (company_id, organization_id);
create index tasks_deal_idx on public.tasks (deal_id, organization_id);
create index tasks_created_by_idx on public.tasks (created_by);
create index tasks_completed_by_idx on public.tasks (completed_by);
create unique index tasks_org_request_uniq on public.tasks (organization_id, request_id) where request_id is not null;

create table public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  task_id uuid not null,
  label text not null check (char_length(btrim(label)) between 1 and 200),
  done boolean not null default false,
  position integer not null default 0 check (position between 0 and 999),
  created_at timestamptz not null default now(),
  foreign key (task_id, organization_id) references public.tasks (id, organization_id) on delete cascade
);
create index task_checklist_task_idx on public.task_checklist_items (task_id, organization_id, position);
create index task_checklist_org_idx on public.task_checklist_items (organization_id);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  task_id uuid not null,
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  foreign key (task_id, organization_id) references public.tasks (id, organization_id) on delete cascade
);
create index task_comments_task_idx on public.task_comments (task_id, organization_id, created_at);
create index task_comments_org_idx on public.task_comments (organization_id);
create index task_comments_author_idx on public.task_comments (author_id);

-- ---------------------------------------------------------------------------
-- Regras no banco
-- ---------------------------------------------------------------------------
create trigger tasks_touch before update on public.tasks for each row execute function private.touch_updated_at();
create trigger tasks_org_immutable before update on public.tasks for each row execute function private.forbid_org_change();
create trigger task_checklist_org_immutable before update on public.task_checklist_items for each row execute function private.forbid_org_change();
create trigger tasks_owner_same_org before insert or update of owner_id, organization_id on public.tasks
  for each row execute function private.check_contact_owner();
create trigger tasks_write_limit before insert or update or delete on public.tasks
  for each statement execute function private.crm_write_limit();
create trigger task_checklist_write_limit before insert or update or delete on public.task_checklist_items
  for each statement execute function private.crm_write_limit();
create trigger task_comments_write_limit before insert or delete on public.task_comments
  for each statement execute function private.crm_write_limit();

-- quem concluiu e quando: definido pelo banco, nunca pelo cliente
create function private.task_completion() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.completed_at is not null and (tg_op = 'INSERT' or old.completed_at is null) then
    new.completed_at := now();
    new.completed_by := (select auth.uid());
  elsif new.completed_at is null then
    new.completed_by := null;
  elsif tg_op = 'UPDATE' then
    new.completed_at := old.completed_at;
    new.completed_by := old.completed_by;
  end if;
  return new;
end $$;
revoke all on function private.task_completion() from public, anon, authenticated;
create trigger tasks_completion before insert or update on public.tasks
  for each row execute function private.task_completion();

-- recorrência: ao concluir pela primeira vez, nasce a próxima ocorrência com o checklist desmarcado
create function private.task_spawn_next() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  base date := coalesce(new.due_date, (now() at time zone 'America/Sao_Paulo')::date);
  next_due date;
  next_id uuid;
begin
  if new.recurrence is null or new.completed_at is null or old.completed_at is not null or old.spawned_next then
    return null;
  end if;
  next_due := case new.recurrence
    when 'daily' then base + 1
    when 'weekly' then base + 7
    else (base + interval '1 month')::date
  end;
  insert into public.tasks (organization_id, title, description, due_date, priority, owner_id, contact_id, company_id,
                            deal_id, recurrence, created_by)
  values (new.organization_id, new.title, new.description, next_due, new.priority,
          -- responsável que saiu da organização não passa para a próxima ocorrência
          (select m.user_id from public.organization_members m where m.organization_id = new.organization_id and m.user_id = new.owner_id),
          new.contact_id,
          new.company_id, new.deal_id, new.recurrence, (select auth.uid()))
  returning id into next_id;
  insert into public.task_checklist_items (organization_id, task_id, label, position)
  select organization_id, next_id, label, position from public.task_checklist_items where task_id = new.id;
  update public.tasks set spawned_next = true where id = new.id;
  return null;
end $$;
revoke all on function private.task_spawn_next() from public, anon, authenticated;
create trigger tasks_spawn_next after update of completed_at on public.tasks
  for each row execute function private.task_spawn_next();

-- ---------------------------------------------------------------------------
-- Permissões por papel
-- ---------------------------------------------------------------------------
insert into private.role_permissions (role, permission)
select r.role::public.member_role, p.permission
from (values
  ('owner',   array['tasks.read', 'tasks.write', 'tasks.delete']),
  ('admin',   array['tasks.read', 'tasks.write', 'tasks.delete']),
  ('member',  array['tasks.read', 'tasks.write']),
  ('limited', array['tasks.read'])
) as r(role, perms)
cross join lateral unnest(r.perms) as p(permission)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- RLS e grants mínimos
-- ---------------------------------------------------------------------------
alter table public.tasks enable row level security;
alter table public.task_checklist_items enable row level security;
alter table public.task_comments enable row level security;

revoke all on public.tasks, public.task_checklist_items, public.task_comments from public, anon, authenticated;
grant select, delete on public.tasks, public.task_checklist_items to authenticated;
grant insert (organization_id, title, description, due_date, priority, owner_id, contact_id, company_id, deal_id,
              recurrence, completed_at, request_id),
      update (title, description, due_date, priority, owner_id, contact_id, company_id, deal_id, recurrence, completed_at)
  on public.tasks to authenticated;
grant insert (organization_id, task_id, label, done, position), update (label, done, position)
  on public.task_checklist_items to authenticated;
-- comentários: só criar e apagar o próprio; ninguém edita o que escreveu
grant select, delete on public.task_comments to authenticated;
grant insert (organization_id, task_id, body) on public.task_comments to authenticated;

create policy tasks_select on public.tasks for select to authenticated
  using (private.has_permission(organization_id, 'tasks.read'));
create policy tasks_insert on public.tasks for insert to authenticated
  with check (private.has_permission(organization_id, 'tasks.write'));
create policy tasks_update on public.tasks for update to authenticated
  using (private.has_permission(organization_id, 'tasks.write'))
  with check (private.has_permission(organization_id, 'tasks.write'));
create policy tasks_delete on public.tasks for delete to authenticated
  using (private.has_permission(organization_id, 'tasks.delete'));

create policy task_checklist_select on public.task_checklist_items for select to authenticated
  using (private.has_permission(organization_id, 'tasks.read'));
create policy task_checklist_insert on public.task_checklist_items for insert to authenticated
  with check (private.has_permission(organization_id, 'tasks.write'));
create policy task_checklist_update on public.task_checklist_items for update to authenticated
  using (private.has_permission(organization_id, 'tasks.write'))
  with check (private.has_permission(organization_id, 'tasks.write'));
create policy task_checklist_delete on public.task_checklist_items for delete to authenticated
  using (private.has_permission(organization_id, 'tasks.write'));

create policy task_comments_select on public.task_comments for select to authenticated
  using (private.has_permission(organization_id, 'tasks.read'));
create policy task_comments_insert on public.task_comments for insert to authenticated
  with check (private.has_permission(organization_id, 'tasks.write') and author_id = (select auth.uid()));
create policy task_comments_delete on public.task_comments for delete to authenticated
  using (private.has_permission(organization_id, 'tasks.write') and author_id = (select auth.uid()));

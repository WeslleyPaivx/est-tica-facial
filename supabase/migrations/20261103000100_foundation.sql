-- ZANIVA CRM — Fase 1: fundação multi-tenant (organizações, membership, RBAC, auditoria).
-- Princípios: RLS em toda tabela exposta, grants mínimos, papéis vindos SOMENTE de
-- public.organization_members (nunca de JWT/metadata), MFA (aal2) exigido para owner/admin,
-- SECURITY DEFINER apenas no schema private, com search_path vazio.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Schema privado (não exposto pela Data API)
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated; -- policies chamam helpers daqui

create type public.member_role as enum ('owner', 'admin', 'member', 'limited');

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$'),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);
create index organization_members_user_idx on public.organization_members (user_id);

create table public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null check (email = lower(btrim(email)) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  role public.member_role not null check (role <> 'owner'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  invited_by uuid not null references auth.users (id),
  accepted_by uuid references auth.users (id),
  expires_at timestamptz not null default now() + interval '7 days',
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);
create unique index organization_invitations_pending_uniq
  on public.organization_invitations (organization_id, email) where status = 'pending';
create index organization_invitations_email_idx
  on public.organization_invitations (email) where status = 'pending';
create index organization_invitations_invited_by_idx on public.organization_invitations (invited_by);
create index organization_invitations_accepted_by_idx on public.organization_invitations (accepted_by);
create index organizations_created_by_idx on public.organizations (created_by);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_org_created_idx on public.audit_logs (organization_id, created_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_id);

-- Matriz de permissões por papel: privada, consultada só pelos helpers.
create table private.role_permissions (
  role public.member_role not null,
  permission text not null,
  primary key (role, permission)
);
revoke all on private.role_permissions from public;

insert into private.role_permissions (role, permission)
select r.role::public.member_role, p.permission
from (values
  ('owner',   array['org.read','org.update','members.read','members.invite','members.manage','audit.read',
                    'companies.read','companies.write','companies.delete','contacts.read','contacts.write','contacts.delete']),
  ('admin',   array['org.read','org.update','members.read','members.invite','members.manage','audit.read',
                    'companies.read','companies.write','companies.delete','contacts.read','contacts.write','contacts.delete']),
  ('member',  array['org.read','members.read','companies.read','companies.write','contacts.read','contacts.write']),
  ('limited', array['org.read','companies.read','contacts.read'])
) as r(role, perms)
cross join lateral unnest(r.perms) as p(permission);

-- ---------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER, schema privado, search_path vazio)
-- ---------------------------------------------------------------------------
create function private.role_rank(r public.member_role) returns int
language sql immutable set search_path = '' as $$
  select case r when 'owner' then 4 when 'admin' then 3 when 'member' then 2 else 1 end
$$;

create function private.current_aal() returns text
language sql stable set search_path = '' as $$
  select coalesce((select auth.jwt()) ->> 'aal', 'aal1')
$$;

create function private.is_member(org uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org and m.user_id = (select auth.uid())
  )
$$;

create function private.member_role(org uuid) returns public.member_role
language sql stable security definer set search_path = '' as $$
  select m.role from public.organization_members m
  where m.organization_id = org and m.user_id = (select auth.uid())
$$;

-- Permissão efetiva: membership real + org ativa + papel concede + MFA (aal2) para owner/admin.
create function private.has_permission(org uuid, perm text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.organization_members m
    join public.organizations o on o.id = m.organization_id and o.status = 'active'
    join private.role_permissions rp on rp.role = m.role and rp.permission = perm
    where m.organization_id = org
      and m.user_id = (select auth.uid())
      and (m.role not in ('owner', 'admin') or private.current_aal() = 'aal2')
  )
$$;

create function private.shares_org(other uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.organization_members me
    join public.organization_members them on them.organization_id = me.organization_id
    where me.user_id = (select auth.uid()) and them.user_id = other
  )
$$;

create function private.current_verified_email() returns text
language sql stable security definer set search_path = '' as $$
  select lower(u.email) from auth.users u
  where u.id = (select auth.uid()) and u.email_confirmed_at is not null
$$;

create function private.audit(org uuid, act text, ent text, ent_id uuid, meta jsonb default '{}'::jsonb)
returns void language sql security definer set search_path = '' as $$
  insert into public.audit_logs (organization_id, actor_id, action, entity, entity_id, metadata)
  values (org, (select auth.uid()), act, ent, ent_id, coalesce(meta, '{}'::jsonb))
$$;

create function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- organization_id é imutável: impede mover registro entre tenants.
create function private.forbid_org_change() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.organization_id is distinct from old.organization_id then
    raise exception 'organization_id is immutable' using errcode = '42501';
  end if;
  return new;
end $$;

create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- full_name é só exibição; nenhum papel/permissão é lido de metadata.
  insert into public.profiles (id, full_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create trigger profiles_touch before update on public.profiles
  for each row execute function private.touch_updated_at();
create trigger organizations_touch before update on public.organizations
  for each row execute function private.touch_updated_at();
create trigger organization_members_touch before update on public.organization_members
  for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Operações privilegiadas (implementação privada + wrapper público INVOKER)
-- ---------------------------------------------------------------------------
create function private.create_organization(p_name text, p_slug text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  org_id uuid;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if private.current_verified_email() is null then
    raise exception 'email not verified' using errcode = '42501';
  end if;
  -- anti-abuso simples: no máximo 5 organizações criadas por usuário em 24h
  if (select count(*) from public.organizations
      where created_by = uid and created_at > now() - interval '24 hours') >= 5 then
    raise exception 'organization creation rate limit exceeded' using errcode = 'P0001';
  end if;

  insert into public.organizations (name, slug, created_by)
  values (btrim(p_name), lower(btrim(p_slug)), uid)
  returning id into org_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (org_id, uid, 'owner');

  perform private.audit(org_id, 'organization.created', 'organization', org_id);
  return org_id;
end $$;

create function private.invite_member(p_org uuid, p_email text, p_role public.member_role) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  caller_role public.member_role := private.member_role(p_org);
  norm_email text := lower(btrim(p_email));
  inv_id uuid;
begin
  if not private.has_permission(p_org, 'members.invite') then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  if p_role = 'owner' or (caller_role <> 'owner' and private.role_rank(p_role) >= private.role_rank(caller_role)) then
    raise exception 'cannot grant this role' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.organization_members m join auth.users u on u.id = m.user_id
    where m.organization_id = p_org and lower(u.email) = norm_email
  ) then
    raise exception 'user is already a member' using errcode = '23505';
  end if;

  insert into public.organization_invitations (organization_id, email, role, invited_by)
  values (p_org, norm_email, p_role, (select auth.uid()))
  returning id into inv_id;

  perform private.audit(p_org, 'invitation.created', 'invitation', inv_id, jsonb_build_object('role', p_role));
  return inv_id;
end $$;

create function private.revoke_invitation(p_invitation uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  inv public.organization_invitations;
begin
  select * into inv from public.organization_invitations where id = p_invitation for update;
  if inv.id is null or not private.has_permission(inv.organization_id, 'members.invite') then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  if inv.status <> 'pending' then
    raise exception 'invitation is not pending' using errcode = 'P0001';
  end if;
  update public.organization_invitations set status = 'revoked' where id = inv.id;
  perform private.audit(inv.organization_id, 'invitation.revoked', 'invitation', inv.id);
end $$;

create function private.accept_invitation(p_invitation uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  my_email text := private.current_verified_email();
  inv public.organization_invitations;
begin
  if uid is null or my_email is null then
    raise exception 'verified session required' using errcode = '42501';
  end if;
  select * into inv from public.organization_invitations where id = p_invitation for update;
  -- mesma resposta para "não existe" e "não é seu": não revela convites alheios
  if inv.id is null or inv.email <> my_email or inv.status <> 'pending' or inv.expires_at <= now() then
    raise exception 'invitation not available' using errcode = '42501';
  end if;

  insert into public.organization_members (organization_id, user_id, role)
  values (inv.organization_id, uid, inv.role)
  on conflict (organization_id, user_id) do nothing;

  update public.organization_invitations
  set status = 'accepted', accepted_by = uid, accepted_at = now()
  where id = inv.id;

  perform private.audit(inv.organization_id, 'invitation.accepted', 'invitation', inv.id);
  return inv.organization_id;
end $$;

create function private.update_member_role(p_member uuid, p_role public.member_role) returns void
language plpgsql security definer set search_path = '' as $$
declare
  target public.organization_members;
  caller_role public.member_role;
begin
  select * into target from public.organization_members where id = p_member for update;
  if target.id is null or not private.has_permission(target.organization_id, 'members.manage') then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  if target.user_id = (select auth.uid()) then
    raise exception 'cannot change own role' using errcode = '42501';
  end if;
  caller_role := private.member_role(target.organization_id);
  -- apenas owner gerencia papéis iguais/superiores ao seu; nunca elevar acima do próprio nível
  if caller_role <> 'owner' and (
       private.role_rank(target.role) >= private.role_rank(caller_role)
    or private.role_rank(p_role) >= private.role_rank(caller_role)) then
    raise exception 'cannot manage this member' using errcode = '42501';
  end if;

  update public.organization_members set role = p_role where id = target.id;
  perform private.audit(target.organization_id, 'member.role_changed', 'member', target.id,
    jsonb_build_object('from', target.role, 'to', p_role));
end $$;

create function private.remove_member(p_member uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  target public.organization_members;
  caller_role public.member_role;
  is_self boolean;
begin
  select * into target from public.organization_members where id = p_member for update;
  if target.id is null then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  is_self := target.user_id = (select auth.uid());
  if not is_self then
    if not private.has_permission(target.organization_id, 'members.manage') then
      raise exception 'permission denied' using errcode = '42501';
    end if;
    caller_role := private.member_role(target.organization_id);
    if caller_role <> 'owner' and private.role_rank(target.role) >= private.role_rank(caller_role) then
      raise exception 'cannot manage this member' using errcode = '42501';
    end if;
  end if;
  if target.role = 'owner' then
    -- trava os owners da org para evitar corrida que zere os proprietários
    perform 1 from public.organization_members
    where organization_id = target.organization_id and role = 'owner' for update;
    if (select count(*) from public.organization_members
        where organization_id = target.organization_id and role = 'owner') <= 1 then
      raise exception 'organization must keep at least one owner' using errcode = 'P0001';
    end if;
  end if;

  delete from public.organization_members where id = target.id;
  perform private.audit(target.organization_id, case when is_self then 'member.left' else 'member.removed' end,
    'member', target.id, jsonb_build_object('user_id', target.user_id));
end $$;

create function private.my_permissions(p_org uuid) returns text[]
language sql stable security definer set search_path = '' as $$
  select coalesce(array_agg(rp.permission order by rp.permission), '{}')
  from private.role_permissions rp
  where private.has_permission(p_org, rp.permission)
    and rp.role = private.member_role(p_org)
$$;

-- Wrappers expostos (SECURITY INVOKER): a autorização acontece na implementação privada.
create function public.create_organization(p_name text, p_slug text) returns uuid
language sql set search_path = '' as $$ select private.create_organization(p_name, p_slug) $$;
create function public.invite_member(p_org uuid, p_email text, p_role public.member_role) returns uuid
language sql set search_path = '' as $$ select private.invite_member(p_org, p_email, p_role) $$;
create function public.revoke_invitation(p_invitation uuid) returns void
language sql set search_path = '' as $$ select private.revoke_invitation(p_invitation) $$;
create function public.accept_invitation(p_invitation uuid) returns uuid
language sql set search_path = '' as $$ select private.accept_invitation(p_invitation) $$;
create function public.update_member_role(p_member uuid, p_role public.member_role) returns void
language sql set search_path = '' as $$ select private.update_member_role(p_member, p_role) $$;
create function public.remove_member(p_member uuid) returns void
language sql set search_path = '' as $$ select private.remove_member(p_member) $$;
create function public.my_permissions(p_org uuid) returns text[]
language sql stable set search_path = '' as $$ select private.my_permissions(p_org) $$;

-- ---------------------------------------------------------------------------
-- EXECUTE mínimo: nada para anon/public; authenticated só no necessário
-- ---------------------------------------------------------------------------
revoke execute on all functions in schema private from public, anon, authenticated;
revoke execute on function
  public.create_organization(text, text), public.invite_member(uuid, text, public.member_role),
  public.revoke_invitation(uuid), public.accept_invitation(uuid),
  public.update_member_role(uuid, public.member_role), public.remove_member(uuid),
  public.my_permissions(uuid)
from public, anon;

grant execute on function
  private.role_rank(public.member_role), private.current_aal(), private.is_member(uuid),
  private.member_role(uuid), private.has_permission(uuid, text), private.shares_org(uuid),
  private.current_verified_email(),
  private.create_organization(text, text), private.invite_member(uuid, text, public.member_role),
  private.revoke_invitation(uuid), private.accept_invitation(uuid),
  private.update_member_role(uuid, public.member_role), private.remove_member(uuid),
  private.my_permissions(uuid)
to authenticated;

grant execute on function
  public.create_organization(text, text), public.invite_member(uuid, text, public.member_role),
  public.revoke_invitation(uuid), public.accept_invitation(uuid),
  public.update_member_role(uuid, public.member_role), public.remove_member(uuid),
  public.my_permissions(uuid)
to authenticated;

-- ---------------------------------------------------------------------------
-- RLS + grants por tabela
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_invitations enable row level security;
alter table public.audit_logs enable row level security;

revoke all on public.profiles, public.organizations, public.organization_members,
  public.organization_invitations, public.audit_logs from public, anon, authenticated;

grant select on public.profiles, public.organizations, public.organization_members,
  public.organization_invitations, public.audit_logs to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant update (name) on public.organizations to authenticated;

create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or private.shares_org(id));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy organizations_select on public.organizations for select to authenticated
  using (private.is_member(id));
create policy organizations_update on public.organizations for update to authenticated
  using (private.has_permission(id, 'org.update'))
  with check (private.has_permission(id, 'org.update'));

create policy organization_members_select on public.organization_members for select to authenticated
  using (user_id = (select auth.uid()) or private.has_permission(organization_id, 'members.read'));

create policy organization_invitations_select on public.organization_invitations for select to authenticated
  using (
    private.has_permission(organization_id, 'members.invite')
    or (status = 'pending' and expires_at > now() and email = private.current_verified_email())
  );

create policy audit_logs_select on public.audit_logs for select to authenticated
  using (private.has_permission(organization_id, 'audit.read'));

-- ZANIVA CRM — Fase 1: primeiras tabelas de negócio tenant-scoped (empresas e contatos).
-- Servem de base para a Fase 2 e para provar isolamento: FK composta (id, organization_id)
-- impede vínculo entre tenants; organization_id é imutável.

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id)
);
create index companies_org_idx on public.companies (organization_id);
create index companies_created_by_idx on public.companies (created_by);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  company_id uuid,
  full_name text not null check (char_length(btrim(full_name)) between 1 and 200),
  email text check (email is null or (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  phone text check (phone is null or phone ~ '^[0-9+() -]{6,30}$'),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (company_id, organization_id)
    references public.companies (id, organization_id) on delete set null (company_id)
);
create index contacts_org_idx on public.contacts (organization_id);
create index contacts_company_idx on public.contacts (company_id, organization_id);
create index contacts_created_by_idx on public.contacts (created_by);

create trigger companies_touch before update on public.companies
  for each row execute function private.touch_updated_at();
create trigger contacts_touch before update on public.contacts
  for each row execute function private.touch_updated_at();
create trigger companies_org_immutable before update on public.companies
  for each row execute function private.forbid_org_change();
create trigger contacts_org_immutable before update on public.contacts
  for each row execute function private.forbid_org_change();

alter table public.companies enable row level security;
alter table public.contacts enable row level security;

revoke all on public.companies, public.contacts from public, anon, authenticated;
grant select, delete on public.companies, public.contacts to authenticated;
grant insert (organization_id, name) , update (name) on public.companies to authenticated;
grant insert (organization_id, company_id, full_name, email, phone),
      update (company_id, full_name, email, phone) on public.contacts to authenticated;

create policy companies_select on public.companies for select to authenticated
  using (private.has_permission(organization_id, 'companies.read'));
create policy companies_insert on public.companies for insert to authenticated
  with check (private.has_permission(organization_id, 'companies.write'));
create policy companies_update on public.companies for update to authenticated
  using (private.has_permission(organization_id, 'companies.write'))
  with check (private.has_permission(organization_id, 'companies.write'));
create policy companies_delete on public.companies for delete to authenticated
  using (private.has_permission(organization_id, 'companies.delete'));

create policy contacts_select on public.contacts for select to authenticated
  using (private.has_permission(organization_id, 'contacts.read'));
create policy contacts_insert on public.contacts for insert to authenticated
  with check (private.has_permission(organization_id, 'contacts.write'));
create policy contacts_update on public.contacts for update to authenticated
  using (private.has_permission(organization_id, 'contacts.write'))
  with check (private.has_permission(organization_id, 'contacts.write'));
create policy contacts_delete on public.contacts for delete to authenticated
  using (private.has_permission(organization_id, 'contacts.delete'));

-- Convites pendentes do próprio usuário com o nome da organização (que ele ainda não pode ler).
create function private.my_pending_invitations()
returns table (id uuid, organization_name text, role public.member_role, expires_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select i.id, o.name, i.role, i.expires_at
  from public.organization_invitations i
  join public.organizations o on o.id = i.organization_id
  where i.status = 'pending' and i.expires_at > now()
    and i.email = private.current_verified_email()
  order by i.created_at desc
$$;
create function public.my_pending_invitations()
returns table (id uuid, organization_name text, role public.member_role, expires_at timestamptz)
language sql stable set search_path = '' as $$ select * from private.my_pending_invitations() $$;

revoke execute on function private.my_pending_invitations(), public.my_pending_invitations() from public, anon;
grant execute on function private.my_pending_invitations(), public.my_pending_invitations() to authenticated;

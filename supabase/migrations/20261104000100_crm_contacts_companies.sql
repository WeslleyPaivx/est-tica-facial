-- ZANIVA CRM — Fase 2: campos de CRM em empresas e contatos (não destrutiva).
-- Responsável (owner_id) precisa ser membro da MESMA organização: validado por trigger.

alter table public.companies
  add column email text check (email is null or (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  add column phone text check (phone is null or phone ~ '^[0-9+() -]{6,30}$'),
  add column website text check (website is null or (char_length(website) <= 200 and website ~* '^https?://[^\s]+$')),
  add column notes text check (notes is null or char_length(notes) <= 5000);

alter table public.contacts
  add column owner_id uuid references auth.users (id) on delete set null,
  add column notes text check (notes is null or char_length(notes) <= 5000);
create index contacts_owner_idx on public.contacts (owner_id);

create function private.check_contact_owner() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.owner_id is not null and not exists (
    select 1 from public.organization_members m
    where m.organization_id = new.organization_id and m.user_id = new.owner_id
  ) then
    raise exception 'owner must be a member of the organization' using errcode = '23503';
  end if;
  return new;
end $$;
revoke execute on function private.check_contact_owner() from public, anon, authenticated;

create trigger contacts_owner_same_org before insert or update of owner_id, organization_id on public.contacts
  for each row execute function private.check_contact_owner();

-- Grants só nas colunas novas editáveis
grant insert (email, phone, website, notes), update (email, phone, website, notes) on public.companies to authenticated;
grant insert (owner_id, notes), update (owner_id, notes) on public.contacts to authenticated;

-- Dados 100% sintéticos: empresas A (Alpha) e B (Beta), usuários de cada papel, um externo e um não verificado.
insert into tests.users (alias, id, email) values
  ('a_owner',   '00000000-0000-4000-a000-000000000001', 'owner@alpha.test'),
  ('a_admin',   '00000000-0000-4000-a000-000000000002', 'admin@alpha.test'),
  ('a_member',  '00000000-0000-4000-a000-000000000003', 'member@alpha.test'),
  ('a_limited', '00000000-0000-4000-a000-000000000004', 'limited@alpha.test'),
  ('b_owner',   '00000000-0000-4000-b000-000000000001', 'owner@beta.test'),
  ('b_admin',   '00000000-0000-4000-b000-000000000002', 'admin@beta.test'),
  ('b_member',  '00000000-0000-4000-b000-000000000003', 'member@beta.test'),
  ('b_limited', '00000000-0000-4000-b000-000000000004', 'limited@beta.test'),
  ('outsider',  '00000000-0000-4000-c000-000000000001', 'outsider@gamma.test'),
  ('unverified','00000000-0000-4000-c000-000000000002', 'unverified@gamma.test');

insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data)
select id, email, case when alias = 'unverified' then null else now() end,
       jsonb_build_object('full_name', initcap(replace(alias, '_', ' ')))
from tests.users;

-- Organizações criadas pelo fluxo real (RPC), não por INSERT privilegiado.
select tests.login('a_owner');
insert into tests.ids select 'org_a', public.create_organization('Alpha Imóveis', 'alpha');
select tests.login('b_owner');
insert into tests.ids select 'org_b', public.create_organization('Beta Contabilidade', 'beta');

-- Convites (owners com MFA) e aceite por cada convidado.
select tests.login('a_owner', 'aal2');
insert into tests.ids select 'inv_a_admin',   public.invite_member(tests.id('org_a'), 'admin@alpha.test', 'admin');
insert into tests.ids select 'inv_a_member',  public.invite_member(tests.id('org_a'), 'member@alpha.test', 'member');
insert into tests.ids select 'inv_a_limited', public.invite_member(tests.id('org_a'), 'LIMITED@alpha.test', 'limited');
select tests.login('b_owner', 'aal2');
insert into tests.ids select 'inv_b_admin',   public.invite_member(tests.id('org_b'), 'admin@beta.test', 'admin');
insert into tests.ids select 'inv_b_member',  public.invite_member(tests.id('org_b'), 'member@beta.test', 'member');
insert into tests.ids select 'inv_b_limited', public.invite_member(tests.id('org_b'), 'limited@beta.test', 'limited');

select tests.login('a_admin');   select public.accept_invitation(tests.id('inv_a_admin'));
select tests.login('a_member');  select public.accept_invitation(tests.id('inv_a_member'));
select tests.login('a_limited'); select public.accept_invitation(tests.id('inv_a_limited'));
select tests.login('b_admin');   select public.accept_invitation(tests.id('inv_b_admin'));
select tests.login('b_member');  select public.accept_invitation(tests.id('inv_b_member'));
select tests.login('b_limited'); select public.accept_invitation(tests.id('inv_b_limited'));

-- Dados de negócio criados por members via RLS.
select tests.login('a_member');
with x as (
  insert into public.companies (organization_id, name) values (tests.id('org_a'), 'Alpha Cliente Ltda') returning id)
insert into tests.ids select 'company_a', id from x;
with x as (
  insert into public.contacts (organization_id, company_id, full_name, email)
  values (tests.id('org_a'), tests.id('company_a'), 'Ana Alpha', 'ana@cliente-alpha.test') returning id)
insert into tests.ids select 'contact_a', id from x;

select tests.login('b_member');
with x as (
  insert into public.companies (organization_id, name) values (tests.id('org_b'), 'Beta Cliente SA') returning id)
insert into tests.ids select 'company_b', id from x;
with x as (
  insert into public.contacts (organization_id, company_id, full_name, email)
  values (tests.id('org_b'), tests.id('company_b'), 'Bruno Beta', 'bruno@cliente-beta.test') returning id)
insert into tests.ids select 'contact_b', id from x;

reset role;

-- ids de memberships (lidos como superusuário) para testes de UUID adivinhado
insert into tests.ids select 'mem_' || u.alias, m.id
from public.organization_members m join tests.users u on u.id = m.user_id;

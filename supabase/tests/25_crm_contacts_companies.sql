-- Fase 2: campos de CRM em contatos/empresas.
select tests.login('b_member');
with x as (insert into public.contacts (organization_id, full_name) values (tests.id('org_b'), 'Carlos Beta') returning id)
insert into tests.ids select 'contact_b2', id from x;
select tests.ok(tests.affected(format($$update public.contacts set notes = 'Cliente desde 2024', owner_id = %L where id = %L$$,
  (select id from tests.users where alias = 'b_member'), tests.id('contact_b2'))) = 1, 'B.member define a si mesmo como responsável');
select tests.throws(format($$update public.contacts set owner_id = %L where id = %L$$,
  (select id from tests.users where alias = 'a_admin'), tests.id('contact_b2')), 'responsável de outra organização é rejeitado', '23503');
select tests.throws(format($$insert into public.contacts (organization_id, full_name, owner_id) values (%L, 'X', %L)$$,
  tests.id('org_b'), (select id from tests.users where alias = 'outsider')), 'responsável sem membership é rejeitado', '23503');
select tests.ok(tests.affected(format($$update public.companies set website = 'https://beta.test', email = 'contato@beta.test', notes = 'ok' where id = %L$$,
  tests.id('company_b'))) = 1, 'B.member atualiza dados da empresa');
select tests.throws(format($$update public.companies set website = 'javascript:alert(1)' where id = %L$$,
  tests.id('company_b')), 'website precisa ser http(s)', '23514');
select tests.ok(tests.rows($$select * from public.contacts where notes ilike '%cliente%'$$) = 1, 'busca em notas vê só o próprio tenant');

select tests.login('b_limited');
select tests.ok(tests.affected(format($$update public.contacts set notes = 'hack' where id = %L$$, tests.id('contact_b2'))) = 0,
  'limited não edita notas');
select tests.login('a_admin', 'aal2');
select tests.ok(tests.rows($$select * from public.contacts where notes ilike '%cliente%'$$) = 0, 'A não vê notas de B');
reset role;

-- Anti-duplicação e limite de escrita (migration 20261113000100), com chamadas diretas à tabela, como faria um script.

-- duplicados por organização (e-mail sem diferenciar maiúsculas; nome de empresa sem espaços nas pontas)
select tests.login('b_member');
select tests.lives($$insert into public.contacts (organization_id, full_name, email) values (tests.id('org_b'), 'Dup Um', 'dup@beta.test')$$,
  'B cria contato com e-mail novo');
select tests.throws($$insert into public.contacts (organization_id, full_name, email) values (tests.id('org_b'), 'Dup Dois', 'DUP@beta.test')$$,
  'mesmo e-mail (outra caixa) na mesma organização é recusado', '23505');
select tests.lives($$insert into public.companies (organization_id, name) values (tests.id('org_b'), 'Gamma Serviços')$$, 'B cria empresa');
select tests.throws($$insert into public.companies (organization_id, name) values (tests.id('org_b'), '  gamma serviços ')$$,
  'mesmo nome de empresa na mesma organização é recusado', '23505');
select tests.throws(format($$update public.companies set name = 'GAMMA SERVIÇOS' where id = %L$$, tests.id('company_b')),
  'renomear para um nome já usado é recusado', '23505');

-- a regra é por organização: A pode ter o mesmo e-mail e o mesmo nome, e o erro de B não revela nada de A
select tests.login('a_member');
select tests.lives($$insert into public.contacts (organization_id, full_name, email) values (tests.id('org_a'), 'Dup A', 'dup@beta.test')$$,
  'A usa o mesmo e-mail que B sem conflito');
select tests.lives($$insert into public.companies (organization_id, name) values (tests.id('org_a'), 'Gamma Serviços')$$,
  'A usa o mesmo nome de empresa que B sem conflito');

-- idempotência: o mesmo request_id não cria dois registros
select tests.lives($$insert into public.contacts (organization_id, full_name, request_id)
  values (tests.id('org_a'), 'Sem E-mail', '6b1f6a52-2f0e-4c1c-9d8e-6f0a9b1c2d3e')$$, 'A cria contato com request_id');
select tests.throws($$insert into public.contacts (organization_id, full_name, request_id)
  values (tests.id('org_a'), 'Sem E-mail', '6b1f6a52-2f0e-4c1c-9d8e-6f0a9b1c2d3e')$$, 'o mesmo envio repetido é recusado', '23505');
select tests.ok(tests.rows($$select * from public.contacts where full_name = 'Sem E-mail'$$) = 1, 'só um registro do envio repetido');

-- limite de escrita: a tabela de contagem é inacessível pelo app
select tests.throws($$select * from private.rate_limit_hits$$, 'usuário não lê a contagem de limites', '42501');
select tests.throws($$select private.enforce_rate_limit('crm.write', 1000000, interval '1 second')$$,
  'usuário não chama a função de limite diretamente', '42501');

-- com o limite de b_member esgotado (minuto atual e o próximo, para não depender do relógio), a escrita é recusada
reset role;
insert into private.rate_limit_hits (user_id, action, window_start, hits)
select (select id from tests.users where alias = 'b_member'), 'crm.write', date_bin(interval '1 minute', now(), timestamptz '2000-01-01') + d, 120
from unnest(array[interval '0', interval '1 minute']) as d
on conflict (user_id, action, window_start) do update set hits = 120;

select tests.login('b_member');
select tests.throws($$insert into public.contacts (organization_id, full_name) values (tests.id('org_b'), 'Flood')$$,
  'acima de 120 escritas por minuto: inserção recusada', 'P0001');
select tests.throws(format($$update public.contacts set notes = 'x' where id = %L$$, tests.id('contact_b2')),
  'acima do limite: atualização recusada', 'P0001');
select tests.ok(tests.rows($$select * from public.contacts where full_name = 'Flood'$$) = 0, 'nada foi gravado acima do limite');

-- o limite é por usuário: colegas e outras organizações seguem normais
select tests.login('b_admin', 'aal2');
select tests.lives($$insert into public.contacts (organization_id, full_name) values (tests.id('org_b'), 'Colega Normal')$$,
  'outro usuário da mesma organização não é afetado');
select tests.login('a_member');
select tests.lives($$insert into public.contacts (organization_id, full_name) values (tests.id('org_a'), 'Outro Tenant')$$,
  'usuário de outra organização não é afetado');
reset role;
-- limpa o limite esgotado para os próximos arquivos de teste
delete from private.rate_limit_hits where user_id = (select id from tests.users where alias = 'b_member');

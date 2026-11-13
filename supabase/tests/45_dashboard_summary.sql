-- Painel inicial (dashboard_summary): números reais do próprio tenant, zeros para o tenant alheio.
select tests.login('a_member');
select tests.ok(
  (public.dashboard_summary(tests.id('org_a')) -> 'quality' ->> 'total')::int
    = (select count(*) from public.contacts where organization_id = tests.id('org_a')),
  'A vê o total real de contatos de A');
select tests.ok(
  (select sum((x ->> 1)::int) from jsonb_array_elements(public.dashboard_summary(tests.id('org_a')) -> 'daily') x)
    = (select count(*) from public.contacts where organization_id = tests.id('org_a')),
  'a série diária soma os contatos criados no ano');
select tests.ok(jsonb_array_length(public.dashboard_summary(tests.id('org_a')) -> 'daily') = 365, 'série com 365 dias');

-- org de outro tenant: o RLS zera tudo, sem erro que confirme a existência dos dados
select tests.ok((public.dashboard_summary(tests.id('org_b')) -> 'quality' ->> 'total')::int = 0, 'A pede o painel de B e recebe zero');
select tests.ok((public.dashboard_summary(tests.id('org_b')) -> 'owners') = '[]'::jsonb, 'A não vê responsáveis de B');
select tests.ok(
  (select coalesce(sum((x ->> 1)::int + (x ->> 2)::int), 0) from jsonb_array_elements(public.dashboard_summary(tests.id('org_b')) -> 'daily') x) = 0,
  'A não vê a série diária de B');

select tests.login('b_member');
select tests.ok((public.dashboard_summary(tests.id('org_b')) -> 'quality' ->> 'total')::int > 0, 'B vê os próprios números');

select tests.anon();
select tests.throws($$select public.dashboard_summary(tests.id('org_a'))$$, 'anônimo não chama o painel', '42501');
reset role;

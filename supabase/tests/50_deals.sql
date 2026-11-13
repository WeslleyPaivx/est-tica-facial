-- Fase 2: leads e oportunidades no funil (deals, pipelines, pipeline_stages, deal_events).
reset role;
-- o funil padrão nasce com a organização (trigger), com 4 etapas
select tests.ok((select count(*) from public.pipelines where organization_id = tests.id('org_a') and is_default) = 1, 'org A nasceu com o funil padrão');
select tests.ok((select count(*) from public.pipeline_stages where organization_id = tests.id('org_a')) = 4, 'funil padrão com 4 etapas');
insert into tests.ids select 'pipe_' || o.k, p.id from public.pipelines p join (values ('a', tests.id('org_a')), ('b', tests.id('org_b'))) o(k, id) on p.organization_id = o.id;
insert into tests.ids select 'stage_' || o.k || s.position, s.id from public.pipeline_stages s
  join (values ('a', tests.id('org_a')), ('b', tests.id('org_b'))) o(k, id) on s.organization_id = o.id;
-- um segundo funil em A, para testar etapa de outro funil
insert into public.pipelines (organization_id, name) values (tests.id('org_a'), 'Pós-venda');
insert into tests.ids select 'pipe_a2', id from public.pipelines where organization_id = tests.id('org_a') and name = 'Pós-venda';
insert into public.pipeline_stages (organization_id, pipeline_id, name, position) values (tests.id('org_a'), tests.id('pipe_a2'), 'Onboarding', 0);
insert into tests.ids select 'stage_a2_0', id from public.pipeline_stages where pipeline_id = tests.id('pipe_a2');

-- positivos: member de A cria e move uma oportunidade de A
select tests.login('a_member');
with x as (
  insert into public.deals (organization_id, pipeline_id, stage_id, title, value_cents, source, contact_id, company_id, owner_id)
  values (tests.id('org_a'), tests.id('pipe_a'), tests.id('stage_a0'), 'Venda apto 302', 45000000, 'Indicação',
          tests.id('contact_a'), tests.id('company_a'), (select id from tests.users where alias = 'a_member'))
  returning id)
insert into tests.ids select 'deal_a', id from x;
select tests.ok(tests.affected(format($$update public.deals set stage_id = %L where id = %L$$, tests.id('stage_a1'), tests.id('deal_a'))) = 1,
  'A.member move a oportunidade de etapa');
select tests.ok(tests.rows(format($$select * from public.deal_events where deal_id = %L$$, tests.id('deal_a'))) = 2,
  'histórico registra criação e mudança de etapa');

-- isolamento: B não vê, não altera, não move, não apaga A
select tests.login('b_member');
select tests.ok(tests.rows($$select * from public.deals$$) = 0, 'B não vê oportunidades de A');
select tests.ok(tests.rows($$select * from public.pipeline_stages$$) = 4, 'B vê só as próprias 4 etapas');
select tests.ok(tests.rows(format($$select * from public.deal_events where deal_id = %L$$, tests.id('deal_a'))) = 0, 'B não vê o histórico de A');
select tests.ok(tests.affected(format($$update public.deals set title = 'hack' where id = %L$$, tests.id('deal_a'))) = 0, 'B não altera oportunidade de A');
select tests.throws(format($$insert into public.deals (organization_id, pipeline_id, stage_id, title) values (%L, %L, %L, 'X')$$,
  tests.id('org_a'), tests.id('pipe_a'), tests.id('stage_a0')), 'B não cria oportunidade em A', '42501');
-- vínculos cruzados: etapa, contato e empresa de outra organização
select tests.throws(format($$insert into public.deals (organization_id, pipeline_id, stage_id, title) values (%L, %L, %L, 'X')$$,
  tests.id('org_b'), tests.id('pipe_b'), tests.id('stage_a0')), 'etapa de outra organização é rejeitada', '23503');
select tests.throws(format($$insert into public.deals (organization_id, pipeline_id, stage_id, title, contact_id) values (%L, %L, %L, 'X', %L)$$,
  tests.id('org_b'), tests.id('pipe_b'), tests.id('stage_b0'), tests.id('contact_a')), 'contato de outra organização é rejeitado', '23503');
select tests.throws(format($$insert into public.deals (organization_id, pipeline_id, stage_id, title, company_id) values (%L, %L, %L, 'X', %L)$$,
  tests.id('org_b'), tests.id('pipe_b'), tests.id('stage_b0'), tests.id('company_a')), 'empresa de outra organização é rejeitada', '23503');
select tests.throws(format($$insert into public.deals (organization_id, pipeline_id, stage_id, title, owner_id) values (%L, %L, %L, 'X', %L)$$,
  tests.id('org_b'), tests.id('pipe_b'), tests.id('stage_b0'), (select id from tests.users where alias = 'a_member')),
  'responsável de outra organização é rejeitado', '23503');
with x as (insert into public.deals (organization_id, pipeline_id, stage_id, title) values (tests.id('org_b'), tests.id('pipe_b'), tests.id('stage_b0'), 'Contrato Beta') returning id)
insert into tests.ids select 'deal_b', id from x;
select tests.throws(format($$update public.deals set stage_id = %L where id = %L$$, tests.id('stage_a1'), tests.id('deal_b')),
  'mover para etapa de outra organização é rejeitado', '23503');
select tests.throws(format($$update public.deals set organization_id = %L where id = %L$$, tests.id('org_a'), tests.id('deal_b')),
  'organization_id não pode ser trocado', '42501');

-- etapa de outro funil da mesma organização
select tests.login('a_member');
select tests.throws(format($$update public.deals set stage_id = %L where id = %L$$, tests.id('stage_a2_0'), tests.id('deal_a')),
  'etapa de outro funil é rejeitada', '23503');

-- ganhar e perder: perda exige motivo; fechar registra data e evento
select tests.throws(format($$update public.deals set status = 'lost' where id = %L$$, tests.id('deal_a')), 'perder sem motivo é recusado', '23514');
select tests.ok(tests.affected(format($$update public.deals set status = 'lost', lost_reason = 'Preço' where id = %L$$, tests.id('deal_a'))) = 1, 'perde com motivo');
select tests.ok((select closed_at is not null from public.deals where id = tests.id('deal_a')), 'fechamento registra a data');
select tests.ok(tests.affected(format($$update public.deals set status = 'open' where id = %L$$, tests.id('deal_a'))) = 1, 'reabre');
select tests.ok((select closed_at is null and lost_reason is null from public.deals where id = tests.id('deal_a')), 'reabrir limpa data e motivo');

-- histórico é imutável e só o banco escreve
select tests.throws(format($$insert into public.deal_events (organization_id, deal_id, kind) values (%L, %L, 'created')$$,
  tests.id('org_a'), tests.id('deal_a')), 'usuário não forja evento de histórico', '42501');
select tests.throws($$update public.deal_events set kind = 'created'$$, 'usuário não altera histórico', '42501');
select tests.throws($$delete from public.deal_events$$, 'usuário não apaga histórico', '42501');
-- funis e etapas: só leitura pelo app
select tests.throws(format($$update public.pipeline_stages set name = 'x' where id = %L$$, tests.id('stage_a0')), 'member não edita etapas', '42501');
select tests.throws(format($$insert into public.pipelines (organization_id, name) values (%L, 'x')$$, tests.id('org_a')), 'member não cria funil', '42501');

-- papéis: limited só lê; member não apaga; admin (com MFA) apaga
-- (a_limited é removido de A no arquivo 20; o papel limitado é testado em B)
select tests.login('b_limited');
select tests.ok(tests.rows($$select * from public.deals$$) = 1, 'limited lê as oportunidades da própria organização');
select tests.ok(tests.affected(format($$update public.deals set title = 'x' where id = %L$$, tests.id('deal_b'))) = 0, 'limited não edita');
select tests.throws(format($$insert into public.deals (organization_id, pipeline_id, stage_id, title) values (%L, %L, %L, 'X')$$,
  tests.id('org_b'), tests.id('pipe_b'), tests.id('stage_b0')), 'limited não cria', '42501');
select tests.login('a_member');
select tests.ok(tests.affected(format($$delete from public.deals where id = %L$$, tests.id('deal_a'))) = 0, 'member não apaga');
select tests.login('a_admin');
select tests.ok(tests.rows($$select * from public.deals$$) = 0, 'admin sem MFA (aal1) não vê nada');
select tests.login('a_admin', 'aal2');
select tests.ok(tests.affected(format($$delete from public.deals where id = %L$$, tests.id('deal_a'))) = 1, 'admin com MFA apaga');

select tests.anon();
select tests.throws($$select * from public.deals$$, 'anônimo não lê oportunidades', '42501');
reset role;

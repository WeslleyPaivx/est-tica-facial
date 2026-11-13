-- Fase 2: tarefas, checklist, comentários e recorrência.
-- oportunidade em A para os vínculos (a do arquivo 50 foi apagada no fim dele)
select tests.login('a_member');
with x as (
  insert into public.deals (organization_id, pipeline_id, stage_id, title)
  values (tests.id('org_a'), tests.id('pipe_a'), tests.id('stage_a0'), 'Venda para tarefas') returning id)
insert into tests.ids select 'deal_a2', id from x;

-- positivos: member de A cria tarefa vinculada ao contato, à empresa e à oportunidade de A
with x as (
  insert into public.tasks (organization_id, title, due_date, priority, owner_id, contact_id, company_id, deal_id)
  values (tests.id('org_a'), 'Ligar para Ana', '2026-11-20', 'high', (select id from tests.users where alias = 'a_member'),
          tests.id('contact_a'), tests.id('company_a'), tests.id('deal_a2')) returning id)
insert into tests.ids select 'task_a', id from x;
select tests.ok(tests.rows($$select * from public.tasks$$) = 1, 'A.member vê a própria tarefa');

-- conclusão: data e autor vêm do banco, não do cliente
select tests.ok(tests.affected(format($$update public.tasks set completed_at = '2000-01-01' where id = %L$$, tests.id('task_a'))) = 1, 'conclui');
select tests.ok((select completed_at > now() - interval '1 minute' and completed_by = (select id from tests.users where alias = 'a_member')
  from public.tasks where id = tests.id('task_a')), 'data de conclusão e autor definidos pelo banco');
select tests.throws(format($$update public.tasks set completed_by = %L where id = %L$$, (select id from tests.users where alias = 'a_admin'), tests.id('task_a')),
  'usuário não forja quem concluiu', '42501');
select tests.throws(format($$update public.tasks set spawned_next = true where id = %L$$, tests.id('task_a')), 'usuário não mexe no controle de recorrência', '42501');
select tests.ok(tests.affected(format($$update public.tasks set completed_at = null where id = %L$$, tests.id('task_a'))) = 1, 'reabre');
select tests.ok((select completed_by is null from public.tasks where id = tests.id('task_a')), 'reabrir limpa quem concluiu');

-- recorrência semanal com checklist: concluir cria a próxima (+7 dias) com o checklist desmarcado, uma vez só
with x as (insert into public.tasks (organization_id, title, due_date, recurrence) values (tests.id('org_a'), 'Relatório semanal', '2026-11-20', 'weekly') returning id)
insert into tests.ids select 'task_rec', id from x;
insert into public.task_checklist_items (organization_id, task_id, label, done, position)
values (tests.id('org_a'), tests.id('task_rec'), 'Coletar números', true, 0), (tests.id('org_a'), tests.id('task_rec'), 'Enviar ao cliente', false, 1);
select tests.ok(tests.affected(format($$update public.tasks set completed_at = now() where id = %L$$, tests.id('task_rec'))) = 1, 'conclui a recorrente');
select tests.ok(tests.rows($$select * from public.tasks where title = 'Relatório semanal' and completed_at is null and due_date = '2026-11-27'$$) = 1,
  'próxima ocorrência criada para 7 dias depois');
select tests.ok(tests.rows($$select * from public.task_checklist_items i join public.tasks t on t.id = i.task_id
  where t.title = 'Relatório semanal' and t.completed_at is null and not i.done$$) = 2, 'checklist copiado e desmarcado');
select tests.ok(tests.affected(format($$update public.tasks set completed_at = null where id = %L$$, tests.id('task_rec'))) = 1, 'reabre a recorrente');
select tests.ok(tests.affected(format($$update public.tasks set completed_at = now() where id = %L$$, tests.id('task_rec'))) = 1, 'conclui de novo');
select tests.ok(tests.rows($$select * from public.tasks where title = 'Relatório semanal'$$) = 2, 'concluir de novo não duplica a próxima');

-- comentários
with x as (insert into public.task_comments (organization_id, task_id, body) values (tests.id('org_a'), tests.id('task_a'), 'Cliente pediu retorno à tarde') returning id)
insert into tests.ids select 'comment_a', id from x;
select tests.throws(format($$insert into public.task_comments (organization_id, task_id, body, author_id) values (%L, %L, 'falso', %L)$$,
  tests.id('org_a'), tests.id('task_a'), (select id from tests.users where alias = 'a_admin')), 'não comenta em nome de outra pessoa', '42501');
select tests.throws(format($$update public.task_comments set body = 'editado' where id = %L$$, tests.id('comment_a')), 'comentário não é editável', '42501');

-- isolamento: B não vê, não altera, não apaga, não vincula nada de A
select tests.login('b_member');
select tests.ok(tests.rows($$select * from public.tasks$$) = 0, 'B não vê tarefas de A');
select tests.ok(tests.rows($$select * from public.task_checklist_items$$) = 0, 'B não vê checklist de A');
select tests.ok(tests.rows($$select * from public.task_comments$$) = 0, 'B não vê comentários de A');
select tests.ok(tests.affected(format($$update public.tasks set title = 'hack' where id = %L$$, tests.id('task_a'))) = 0, 'B não altera tarefa de A');
select tests.ok(tests.affected(format($$delete from public.task_comments where id = %L$$, tests.id('comment_a'))) = 0, 'B não apaga comentário de A');
select tests.throws(format($$insert into public.tasks (organization_id, title) values (%L, 'X')$$, tests.id('org_a')), 'B não cria tarefa em A', '42501');
select tests.throws(format($$insert into public.tasks (organization_id, title, contact_id) values (%L, 'X', %L)$$, tests.id('org_b'), tests.id('contact_a')),
  'contato de outra organização é rejeitado', '23503');
select tests.throws(format($$insert into public.tasks (organization_id, title, deal_id) values (%L, 'X', %L)$$, tests.id('org_b'), tests.id('deal_a2')),
  'oportunidade de outra organização é rejeitada', '23503');
select tests.throws(format($$insert into public.tasks (organization_id, title, owner_id) values (%L, 'X', %L)$$, tests.id('org_b'), (select id from tests.users where alias = 'a_member')),
  'responsável de outra organização é rejeitado', '23503');
select tests.throws(format($$insert into public.task_checklist_items (organization_id, task_id, label) values (%L, %L, 'x')$$, tests.id('org_b'), tests.id('task_a')),
  'item de checklist em tarefa de outra organização é rejeitado', '23503');
select tests.throws(format($$insert into public.task_comments (organization_id, task_id, body) values (%L, %L, 'x')$$, tests.id('org_a'), tests.id('task_a')),
  'B não comenta em tarefa de A', '42501');
with x as (insert into public.tasks (organization_id, title) values (tests.id('org_b'), 'Tarefa Beta') returning id)
insert into tests.ids select 'task_b', id from x;
select tests.throws(format($$update public.tasks set organization_id = %L where id = %L$$, tests.id('org_a'), tests.id('task_b')), 'organization_id não pode ser trocado', '42501');

-- papéis
select tests.login('b_limited');
select tests.ok(tests.rows($$select * from public.tasks$$) = 1, 'limited lê as tarefas da própria organização');
select tests.ok(tests.affected(format($$update public.tasks set title = 'x' where id = %L$$, tests.id('task_b'))) = 0, 'limited não edita');
select tests.throws(format($$insert into public.task_comments (organization_id, task_id, body) values (%L, %L, 'x')$$, tests.id('org_b'), tests.id('task_b')),
  'limited não comenta', '42501');
select tests.login('a_member');
select tests.ok(tests.affected(format($$delete from public.tasks where id = %L$$, tests.id('task_a'))) = 0, 'member não apaga tarefa');
select tests.login('a_admin', 'aal2');
select tests.ok(tests.affected(format($$delete from public.task_comments where id = %L$$, tests.id('comment_a'))) = 0, 'admin não apaga comentário de outra pessoa');
select tests.ok(tests.affected(format($$delete from public.tasks where id = %L$$, tests.id('task_a'))) = 1, 'admin com MFA apaga tarefa (e checklist/comentários em cascata)');

select tests.anon();
select tests.throws($$select * from public.tasks$$, 'anônimo não lê tarefas', '42501');
reset role;

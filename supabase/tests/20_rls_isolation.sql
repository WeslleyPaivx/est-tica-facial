-- Testes adversariais de isolamento multi-tenant, RBAC e MFA. Qualquer FAIL aborta (ON_ERROR_STOP).

-- ===================== Anônimo =====================
select tests.anon();
select tests.throws('select * from public.organizations', 'anon: SELECT organizations negado', '42501');
select tests.throws('select * from public.organization_members', 'anon: SELECT members negado', '42501');
select tests.throws('select * from public.profiles', 'anon: SELECT profiles negado', '42501');
select tests.throws('select * from public.contacts', 'anon: SELECT contacts negado', '42501');
select tests.throws('select * from public.companies', 'anon: SELECT companies negado', '42501');
select tests.throws('select * from public.audit_logs', 'anon: SELECT audit_logs negado', '42501');
select tests.throws('select * from public.organization_invitations', 'anon: SELECT invitations negado', '42501');
select tests.throws($$select public.create_organization('Anon', 'anon-org')$$, 'anon: RPC create_organization negado', '42501');
select tests.throws($$select public.my_permissions('00000000-0000-0000-0000-000000000000')$$, 'anon: RPC my_permissions negado', '42501');
select tests.throws('select private.has_permission(null, null)', 'anon: schema private inacessível', '42501');
select tests.throws($$insert into public.contacts (organization_id, full_name) values ('00000000-0000-0000-0000-000000000000', 'x')$$,
  'anon: INSERT contacts negado', '42501');

-- ===================== JWT sem usuário / claims forjadas =====================
select tests.login_with_claims('{"role":"authenticated"}');
select tests.ok(tests.rows('select * from public.organizations') = 0, 'JWT sem sub: nenhuma organização');
select tests.throws($$select public.create_organization('Sem Sub', 'sem-sub')$$, 'JWT sem sub: criar org negado', '42501');
-- usuário inexistente com aal2 e "role: owner" em claims customizadas
select tests.login_with_claims('{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","aal":"aal2","user_role":"owner","app_metadata":{"role":"owner"}}');
select tests.ok(tests.rows('select * from public.contacts') = 0, 'UUID adivinhado/claims forjadas: nenhum contato');
select tests.ok(tests.rows('select * from public.organization_members') = 0, 'claims forjadas: nenhuma membership');

-- metadata controlada pelo usuário não concede papel
reset role;
update auth.users set raw_user_meta_data = raw_user_meta_data || '{"role":"owner"}',
                      raw_app_meta_data = '{"role":"owner"}'
where id = (select id from tests.users where alias = 'a_limited');
select tests.login('a_limited', 'aal2');
select tests.ok(not ('members.manage' = any (public.my_permissions(tests.id('org_a')))), 'metadata role=owner não eleva limited');
select tests.throws(format($$insert into public.contacts (organization_id, full_name) values (%L, 'x')$$, tests.id('org_a')),
  'limited (com metadata owner) não insere contato', '42501');

-- ===================== Isolamento A x B (member de A) =====================
select tests.login('a_member');
select tests.ok(tests.rows('select * from public.organizations') = 1, 'A.member vê apenas 1 organização');
select tests.ok(tests.rows(format('select * from public.organizations where id = %L', tests.id('org_b'))) = 0, 'A.member não vê org B');
select tests.ok(tests.rows('select * from public.contacts') = 1, 'A.member vê apenas contatos de A');
select tests.ok(tests.rows(format('select * from public.contacts where id = %L', tests.id('contact_b'))) = 0, 'A.member: UUID de contato B retorna vazio');
select tests.ok(tests.rows(format('select * from public.companies where organization_id = %L', tests.id('org_b'))) = 0, 'A.member não vê empresas de B');
select tests.ok(tests.rows(format('select * from public.organization_members where organization_id = %L', tests.id('org_b'))) = 0, 'A.member não vê membros de B');
select tests.ok(tests.rows($$select * from public.profiles where id in (select id from tests.users where alias like 'b\_%')$$) = 0, 'A.member não vê perfis de B');
select tests.ok(tests.rows('select * from public.profiles') = 4, 'A.member vê perfis apenas dos colegas de A');
select tests.ok(tests.rows('select * from public.audit_logs') = 0, 'member não lê auditoria');
select tests.ok(cardinality(public.my_permissions(tests.id('org_b'))) = 0, 'A.member não tem permissões em B');
select tests.ok(tests.rows($$select * from public.contacts where full_name ilike '%beta%'$$) = 0, 'busca textual não vaza dados de B');

select tests.throws(format($$insert into public.contacts (organization_id, full_name) values (%L, 'Intruso')$$, tests.id('org_b')),
  'INSERT em B negado (organization_id adulterado)', '42501');
select tests.throws(format($$insert into public.companies (organization_id, name) values (%L, 'Intrusa')$$, tests.id('org_b')),
  'INSERT empresa em B negado', '42501');
select tests.throws(format($$insert into public.contacts (organization_id, company_id, full_name) values (%L, %L, 'FK cruzada')$$,
  tests.id('org_a'), tests.id('company_b')), 'FK cruzada contato A -> empresa B bloqueada', '23503');
select tests.throws(format($$update public.contacts set company_id = %L where id = %L$$, tests.id('company_b'), tests.id('contact_a')),
  'UPDATE vinculando contato A a empresa B bloqueado', '23503');
select tests.ok(tests.affected(format($$update public.contacts set full_name = 'Hack' where id = %L$$, tests.id('contact_b'))) = 0,
  'UPDATE em contato de B afeta 0 linhas');
select tests.ok(tests.affected(format($$delete from public.contacts where id = %L$$, tests.id('contact_b'))) = 0,
  'DELETE em contato de B afeta 0 linhas');
select tests.ok(tests.affected(format($$update public.companies set name = 'Hack' where id = %L$$, tests.id('company_b'))) = 0,
  'UPDATE em empresa de B afeta 0 linhas');
select tests.throws(format($$update public.contacts set organization_id = %L where id = %L$$, tests.id('org_b'), tests.id('contact_a')),
  'mover contato A -> B negado (sem privilégio de coluna)', '42501');
select tests.throws(format($$insert into public.contacts (id, organization_id, full_name) values (%L, %L, 'id forjado')$$,
  tests.id('contact_b'), tests.id('org_a')), 'INSERT com id escolhido pelo cliente negado', '42501');
select tests.ok(tests.affected(format($$update public.organizations set name = 'Hack' where id = %L$$, tests.id('org_b'))) = 0,
  'UPDATE nome da org B afeta 0 linhas');

-- Mesmo o dono da tabela não move linhas entre tenants (trigger)
reset role;
select tests.throws(format($$update public.contacts set organization_id = %L where id = %L$$, tests.id('org_b'), tests.id('contact_a')),
  'trigger impede troca de organization_id mesmo com privilégio total', '42501');

-- ===================== RBAC dentro de A =====================
select tests.login('a_limited');
select tests.ok(tests.rows('select * from public.contacts') = 1, 'limited lê contatos de A');
select tests.ok(tests.rows('select * from public.organization_members') = 1, 'limited vê só a própria membership');
select tests.ok(tests.affected(format($$update public.contacts set full_name = 'x' where id = %L$$, tests.id('contact_a'))) = 0,
  'limited não altera contato');
select tests.throws(format($$insert into public.contacts (organization_id, full_name) values (%L, 'x')$$, tests.id('org_a')),
  'limited não cria contato', '42501');
select tests.ok(tests.affected(format($$delete from public.contacts where id = %L$$, tests.id('contact_a'))) = 0,
  'limited não exclui contato');

select tests.login('a_member');
select tests.ok(tests.affected(format($$update public.contacts set full_name = 'Ana Alpha Silva' where id = %L$$, tests.id('contact_a'))) = 1,
  'member altera contato de A');
select tests.ok(tests.affected(format($$delete from public.contacts where id = %L$$, tests.id('contact_a'))) = 0,
  'member não exclui contato (sem contacts.delete)');
select tests.ok(tests.rows('select * from public.organization_members') = 4, 'member lista membros de A');
select tests.throws(format($$select public.invite_member(%L, 'novo@alpha.test', 'limited')$$, tests.id('org_a')),
  'member não convida', '42501');
select tests.throws(format($$select public.update_member_role(m.id, 'owner') from public.organization_members m where m.user_id = %L$$,
  (select id from tests.users where alias = 'a_member')), 'member não eleva o próprio papel', '42501');
select tests.throws(format($$select public.update_member_role(m.id, 'member') from public.organization_members m where m.user_id = %L$$,
  (select id from tests.users where alias = 'a_limited')), 'member não altera papel de outros', '42501');
select tests.throws(format($$insert into public.organization_members (organization_id, user_id, role) values (%L, %L, 'owner')$$,
  tests.id('org_a'), (select id from tests.users where alias = 'outsider')), 'INSERT direto em memberships negado', '42501');
select tests.throws($$update public.organization_members set role = 'owner'$$, 'UPDATE direto de papel negado', '42501');
select tests.throws(format($$select public.accept_invitation(%L)$$, tests.id('inv_a_admin')), 'reutilizar convite de outro usuário negado', '42501');
select tests.ok(tests.affected($$update public.profiles set full_name = 'Membro Alpha' where id = auth.uid()$$) = 1, 'atualiza o próprio perfil');
select tests.ok(tests.affected(format($$update public.profiles set full_name = 'Hack' where id = %L$$,
  (select id from tests.users where alias = 'a_owner'))) = 0, 'não altera perfil de colega');
select tests.throws($$update public.profiles set id = gen_random_uuid() where id = auth.uid()$$, 'não altera id do perfil', '42501');

-- ===================== MFA obrigatório para owner/admin =====================
select tests.login('a_admin', 'aal1');
select tests.ok(tests.rows('select * from public.contacts') = 0, 'admin sem MFA (aal1) não lê dados');
select tests.ok(tests.rows('select * from public.organizations') = 1, 'admin sem MFA ainda vê a org (para redirecionar ao MFA)');
select tests.throws(format($$select public.invite_member(%L, 'x@alpha.test', 'limited')$$, tests.id('org_a')), 'admin aal1 não convida', '42501');
select tests.login('a_owner', 'aal1');
select tests.ok(tests.rows('select * from public.audit_logs') = 0, 'owner aal1 não lê auditoria');
select tests.ok(cardinality(public.my_permissions(tests.id('org_a'))) = 0, 'owner aal1 sem permissões efetivas');

-- ===================== Admin com MFA =====================
select tests.login('a_admin', 'aal2');
select tests.ok(tests.rows('select * from public.contacts') = 1, 'admin aal2 lê contatos de A');
select tests.ok(tests.rows('select * from public.audit_logs') > 0, 'admin aal2 lê auditoria de A');
select tests.ok(tests.rows(format('select * from public.audit_logs where organization_id = %L', tests.id('org_b'))) = 0, 'auditoria de B invisível para A');
select tests.ok(tests.rows(format('select * from public.organization_invitations where organization_id = %L', tests.id('org_b'))) = 0,
  'convites de B invisíveis para admin A');
select tests.throws(format($$select public.invite_member(%L, 'x@alpha.test', 'admin')$$, tests.id('org_a')), 'admin não concede admin', '42501');
select tests.throws(format($$select public.invite_member(%L, 'x@alpha.test', 'owner')$$, tests.id('org_a')), 'admin não concede owner', '42501');
select tests.throws(format($$select public.invite_member(%L, 'x@beta.test', 'member')$$, tests.id('org_b')), 'admin A não convida para B', '42501');
select tests.throws(format($$select public.invite_member(%L, 'member@alpha.test', 'limited')$$, tests.id('org_a')), 'convite para quem já é membro rejeitado', '23505');
select tests.throws(format($$select public.update_member_role(m.id, 'member') from public.organization_members m where m.user_id = %L$$,
  (select id from tests.users where alias = 'a_owner')), 'admin não rebaixa owner', '42501');
select tests.throws(format($$select public.update_member_role(m.id, 'owner') from public.organization_members m where m.user_id = %L$$,
  (select id from tests.users where alias = 'a_admin')), 'admin não altera o próprio papel', '42501');
select tests.throws(format($$select public.update_member_role(m.id, 'admin') from public.organization_members m where m.user_id = %L$$,
  (select id from tests.users where alias = 'a_limited')), 'admin não promove ninguém a admin', '42501');
select tests.throws(format($$select public.remove_member(m.id) from public.organization_members m where m.user_id = %L$$,
  (select id from tests.users where alias = 'a_owner')), 'admin não remove owner', '42501');
select tests.lives(format($$select public.update_member_role(m.id, 'member') from public.organization_members m where m.user_id = %L$$,
  (select id from tests.users where alias = 'a_limited')), 'admin promove limited -> member');
select tests.lives(format($$select public.update_member_role(m.id, 'limited') from public.organization_members m where m.user_id = %L$$,
  (select id from tests.users where alias = 'a_limited')), 'admin rebaixa member -> limited');
select tests.throws(format($$select public.update_member_role(%L, 'member')$$, tests.id('mem_b_limited')),
  'admin A não altera membro de B (UUID adivinhado)', '42501');
select tests.throws(format($$select public.remove_member(%L)$$, tests.id('mem_b_member')),
  'admin A não remove membro de B (UUID adivinhado)', '42501');
select tests.throws(format($$select public.update_member_role(%L, 'member')$$,
  (select m.id from public.organization_members m limit 0)), 'update_member_role com id nulo negado', '42501');
select tests.throws($$update public.organizations set status = 'active'$$, 'status da org não é alterável pelo cliente', '42501');

-- ===================== Owner com MFA =====================
select tests.login('a_owner', 'aal2');
select tests.ok(tests.affected(format($$update public.organizations set name = 'Alpha Imóveis Ltda' where id = %L$$, tests.id('org_a'))) = 1,
  'owner renomeia a própria org');
select tests.throws(format($$select public.remove_member(m.id) from public.organization_members m where m.user_id = %L$$,
  (select id from tests.users where alias = 'a_owner')), 'único owner não sai da organização', 'P0001');
select tests.throws(format($$select public.revoke_invitation(%L)$$, tests.id('inv_b_member')), 'owner A não revoga convite de B', '42501');

-- convite revogado, expirado e replay
insert into tests.ids select 'inv_revoked', public.invite_member(tests.id('org_a'), 'outsider@gamma.test', 'member');
select public.revoke_invitation(tests.id('inv_revoked'));
insert into tests.ids select 'inv_unverified', public.invite_member(tests.id('org_a'), 'unverified@gamma.test', 'member');
reset role;
insert into public.organization_invitations (organization_id, email, role, invited_by, expires_at)
values (tests.id('org_a'), 'outsider@gamma.test', 'limited', (select id from tests.users where alias = 'a_owner'), now() - interval '1 minute');
insert into tests.ids select 'inv_expired', id from public.organization_invitations where expires_at < now();

select tests.login('outsider');
select tests.ok(tests.rows('select * from public.my_pending_invitations()') = 0, 'outsider não lista convites revogados/expirados');
select tests.throws(format($$select public.accept_invitation(%L)$$, tests.id('inv_revoked')), 'convite revogado não é aceito', '42501');
select tests.throws(format($$select public.accept_invitation(%L)$$, tests.id('inv_expired')), 'convite expirado não é aceito', '42501');
select tests.ok(tests.rows('select * from public.organizations') = 0, 'outsider não vê nenhuma organização');
select tests.ok(tests.rows('select * from public.organization_invitations') = 0, 'outsider não vê convites alheios');
select tests.login('unverified');
select tests.throws(format($$select public.accept_invitation(%L)$$, tests.id('inv_unverified')), 'email não verificado não aceita convite', '42501');
select tests.throws($$select public.create_organization('Não Verificado', 'nao-verificado')$$, 'email não verificado não cria org', '42501');
select tests.login('a_admin');
select tests.throws(format($$select public.accept_invitation(%L)$$, tests.id('inv_a_admin')), 'replay de convite aceito negado', '42501');

-- ===================== Revogação de membership =====================
select tests.login('a_owner', 'aal2');
select tests.lives(format($$select public.remove_member(m.id) from public.organization_members m where m.user_id = %L$$,
  (select id from tests.users where alias = 'a_limited')), 'owner remove limited');
select tests.login('a_limited');
select tests.ok(tests.rows('select * from public.contacts') = 0, 'ex-membro perde acesso a contatos imediatamente');
select tests.ok(tests.rows('select * from public.organizations') = 0, 'ex-membro não vê mais a organização');
select tests.ok(cardinality(public.my_permissions(tests.id('org_a'))) = 0, 'ex-membro sem permissões');

-- owner transfere propriedade e pode então sair
select tests.login('a_owner', 'aal2');
select tests.lives(format($$select public.update_member_role(m.id, 'owner') from public.organization_members m where m.user_id = %L$$,
  (select id from tests.users where alias = 'a_admin')), 'owner promove admin a owner');
select tests.lives(format($$select public.remove_member(m.id) from public.organization_members m where m.user_id = %L$$,
  (select id from tests.users where alias = 'a_owner')), 'owner sai após existir outro owner');
select tests.ok(tests.rows('select * from public.contacts') = 0, 'ex-owner perde acesso');
select tests.login('a_admin', 'aal2');
select tests.ok('members.manage' = any (public.my_permissions(tests.id('org_a'))), 'novo owner tem members.manage');

-- ===================== Organização suspensa =====================
reset role;
update public.organizations set status = 'suspended' where id = tests.id('org_b');
select tests.login('b_member');
select tests.ok(tests.rows('select * from public.contacts') = 0, 'org suspensa: dados inacessíveis');
select tests.throws(format($$insert into public.contacts (organization_id, full_name) values (%L, 'x')$$, tests.id('org_b')),
  'org suspensa: escrita negada', '42501');
reset role;
update public.organizations set status = 'active' where id = tests.id('org_b');

-- ===================== B não vê A (simetria) =====================
select tests.login('b_owner', 'aal2');
select tests.ok(tests.rows('select * from public.contacts') = 1, 'B.owner vê só seu contato');
select tests.ok(tests.rows(format('select * from public.contacts where organization_id = %L', tests.id('org_a'))) = 0, 'B.owner não vê contatos de A');
select tests.ok(tests.rows(format('select * from public.audit_logs where organization_id = %L', tests.id('org_a'))) = 0, 'B.owner não vê auditoria de A');
select tests.ok(tests.affected(format($$delete from public.companies where id = %L$$, tests.id('company_a'))) = 0, 'B.owner não exclui empresa de A');
select tests.ok(tests.affected(format($$delete from public.contacts where id = %L$$, tests.id('contact_b'))) = 1, 'B.owner exclui contato de B');

-- ===================== Validação de entrada e rate limit =====================
select tests.login('outsider');
select tests.throws($$select public.create_organization('X', 'valid-slug')$$, 'nome curto demais rejeitado', '23514');
select tests.throws($$select public.create_organization('Path Traversal', '../evil')$$, 'slug inválido rejeitado', '23514');
select tests.throws($$select public.create_organization('Duplicada', 'alpha')$$, 'slug duplicado rejeitado', '23505');
select tests.lives($$select public.create_organization('<script>alert(1)</script>', 'gamma-1')$$, 'HTML armazenado como texto (escape na UI)');
select public.create_organization('Gamma ' || n, 'gamma-' || n) from generate_series(2, 5) n;
select tests.throws($$select public.create_organization('Gamma 6', 'gamma-6')$$, 'limite de 5 organizações/24h', 'P0001');

reset role;
select 'ALL RLS TESTS PASSED' as result;

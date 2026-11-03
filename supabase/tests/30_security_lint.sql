-- "Advisor" local: invariantes de segurança verificadas no catálogo. Complementa o Supabase Security Advisor.
select tests.ok(not exists (
  select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity
), 'toda tabela em public tem RLS habilitado');

select tests.ok(not exists (
  select 1 from pg_policies where schemaname = 'public'
  and (coalesce(qual, '') ~* '^\(?true\)?$' or coalesce(with_check, '') ~* '^\(?true\)?$')
), 'nenhuma policy USING (true) / WITH CHECK (true)');

select tests.ok(not exists (
  select 1 from pg_policies where schemaname = 'public' and roles && array['anon', 'public']::name[]
), 'nenhuma policy para anon/public');

select tests.ok(not exists (
  select 1 from information_schema.role_table_grants
  where table_schema in ('public', 'private') and grantee in ('anon', 'PUBLIC')
), 'anon/PUBLIC sem privilégios em tabelas');

select tests.ok(not exists (
  select 1 from information_schema.role_table_grants
  where table_schema = 'public' and grantee = 'authenticated'
    and privilege_type in ('TRUNCATE', 'REFERENCES', 'TRIGGER')
), 'authenticated sem TRUNCATE/REFERENCES/TRIGGER');

select tests.ok(not exists (
  select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where p.prosecdef and n.nspname not in ('private')
    and n.nspname not in ('auth', 'extensions', 'pg_catalog', 'information_schema')
), 'SECURITY DEFINER apenas no schema private');

select tests.ok(not exists (
  select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'private')
    and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) cfg where cfg like 'search_path=%')
), 'todas as funções de public/private fixam search_path');

select tests.ok(not exists (
  select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'private') and has_function_privilege('anon', p.oid, 'EXECUTE')
), 'anon não executa nenhuma função de public/private');

select tests.ok(not has_schema_privilege('anon', 'private', 'USAGE'), 'anon sem USAGE no schema private');

select tests.ok(not exists (
  select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'v'
    and not coalesce('security_invoker=true' = any (c.reloptions), false)
), 'views em public usam security_invoker');

-- Helpers de teste (somente banco de teste). Funções INVOKER: executam com o papel corrente.
create schema tests;
grant usage on schema tests to anon, authenticated;

create table tests.users (alias text primary key, id uuid not null, email text not null);
create table tests.ids (key text primary key, id uuid not null);
grant select on tests.users to anon, authenticated;
grant select, insert on tests.ids to anon, authenticated;

create function tests.id(k text) returns uuid language sql stable as $$
  select id from tests.ids where key = k
$$;

create function tests.login(p_alias text, p_aal text default 'aal1') returns void
language plpgsql as $$
declare u tests.users;
begin
  select * into strict u from tests.users where alias = p_alias;
  perform set_config('request.jwt.claims',
    json_build_object('sub', u.id, 'role', 'authenticated', 'aal', p_aal, 'email', u.email)::text, false);
  perform set_config('role', 'authenticated', false);
end $$;

create function tests.login_with_claims(p_claims jsonb) returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claims', p_claims::text, false);
  perform set_config('role', 'authenticated', false);
end $$;

create function tests.anon() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', '{"role":"anon"}', false);
  perform set_config('role', 'anon', false);
end $$;

create function tests.ok(cond boolean, msg text) returns void language plpgsql as $$
begin
  if coalesce(cond, false) then
    raise notice 'ok - %', msg;
  else
    raise exception 'FAIL - %', msg;
  end if;
end $$;

create function tests.rows(q text) returns bigint language plpgsql as $$
declare n bigint;
begin
  execute format('select count(*) from (%s) t', q) into n;
  return n;
end $$;

create function tests.affected(q text) returns bigint language plpgsql as $$
declare n bigint;
begin
  execute q;
  get diagnostics n = row_count;
  return n;
end $$;

-- Espera erro; opcionalmente com SQLSTATE específico.
create function tests.throws(q text, msg text, expected_state text default null) returns void
language plpgsql as $$
begin
  begin
    execute q;
  exception when others then
    if expected_state is not null and sqlstate <> expected_state then
      raise exception 'FAIL - % (esperado %, obtido %: %)', msg, expected_state, sqlstate, sqlerrm;
    end if;
    raise notice 'ok - % [%]', msg, sqlstate;
    return;
  end;
  raise exception 'FAIL - % (nenhum erro lançado)', msg;
end $$;

create function tests.lives(q text, msg text) returns void language plpgsql as $$
begin
  execute q;
  raise notice 'ok - %', msg;
end $$;

grant execute on all functions in schema tests to anon, authenticated;

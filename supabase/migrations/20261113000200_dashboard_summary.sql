-- ZANIVA CRM — números do painel inicial, calculados no banco (não destrutiva: só cria uma função).
-- SECURITY INVOKER: roda com as permissões de quem chama, então o RLS de contatos e empresas vale como em qualquer
-- consulta. Pedir outra organização devolve zeros, não os dados dela. Dias contados no fuso de São Paulo.
create function public.dashboard_summary(p_org uuid) returns jsonb
language sql stable security invoker set search_path = '' as $$
  with hoje as (select (now() at time zone 'America/Sao_Paulo')::date as d),
  dias as (
    select generate_series((select d from hoje) - 364, (select d from hoje), interval '1 day')::date as d
  ),
  c as (
    select (created_at at time zone 'America/Sao_Paulo')::date as d, count(*) as n
    from public.contacts where organization_id = p_org group by 1
  ),
  e as (
    select (created_at at time zone 'America/Sao_Paulo')::date as d, count(*) as n
    from public.companies where organization_id = p_org group by 1
  )
  select jsonb_build_object(
    -- [dia, contatos criados, empresas criadas], um por dia nos últimos 365
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_array(dias.d, coalesce(c.n, 0), coalesce(e.n, 0)) order by dias.d), '[]'::jsonb)
      from dias left join c on c.d = dias.d left join e on e.d = dias.d
    ),
    -- o que já existia antes da janela, para as linhas acumuladas começarem no valor certo
    'before', jsonb_build_object(
      'contacts', (select coalesce(sum(n), 0) from c where d < (select d from hoje) - 364),
      'companies', (select coalesce(sum(n), 0) from e where d < (select d from hoje) - 364)
    ),
    'quality', (
      select jsonb_build_object('total', count(*), 'email', count(email), 'phone', count(phone),
                                'company', count(company_id), 'owner', count(owner_id))
      from public.contacts where organization_id = p_org
    ),
    'owners', (
      select coalesce(jsonb_agg(jsonb_build_object('id', owner_id, 'n', n) order by n desc), '[]'::jsonb)
      from (select owner_id, count(*) as n from public.contacts where organization_id = p_org group by owner_id) o
    )
  );
$$;
revoke all on function public.dashboard_summary(uuid) from public, anon;
grant execute on function public.dashboard_summary(uuid) to authenticated;

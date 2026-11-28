-- Test SQL (Temps 1) : prouve que le contrôle de génération n'est plus fail-open,
-- que l'horodatage maj est imposé côté serveur et que les jetons triviaux sont refusés.
-- Exécuter sur une base PostgreSQL jetable après `supabase/schema.sql`.

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
end $$;

grant usage on schema public to anon;
grant select, insert, update, delete on public.eleves to anon;

set role anon;

-- 1) Jeton trivial répété (aaaa...) refusé par RLS restrictive
select set_config('request.headers', '{"x-kunz-jeton":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}', false);
do $$ begin
  begin
    insert into public.eleves(email, jeton, charge_utile)
      values ('trivial@example.com', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '{}'::jsonb);
    raise exception 'jeton trivial accepté';
  exception when insufficient_privilege then null;
  end;
end $$;

-- 2) Insertion valide avec jeton haute entropie : generation = 1 et maj serveur forcé
select set_config('request.headers', '{"x-kunz-jeton":"12345678-1234-4abc-8def-1234567890ab"}', false);
insert into public.eleves(email, jeton, maj, generation, charge_utile)
  values ('  Eleve@Example.com ', '12345678-1234-4abc-8def-1234567890ab', '2000-01-01T00:00:00Z', 99, '{"minutes_totales":10}'::jsonb);

do $$
declare r record;
begin
  select email, generation, maj into r from public.eleves where email = 'eleve@example.com';
  if r.generation is distinct from 1 then raise exception 'generation initiale non forcée à 1'; end if;
  if r.maj < now() - interval '5 minutes' then raise exception 'maj client non écrasé par le serveur'; end if;
end $$;

-- 3) UPDATE sans temoin_generation refusé (fermeture fail-open)
do $$ begin
  begin
    update public.eleves set charge_utile = '{"minutes_totales":12}'::jsonb where email = 'eleve@example.com';
    raise exception 'UPDATE sans temoin_generation accepté';
  exception when serialization_failure then null;
  end;
end $$;

-- 4) UPDATE avec bon temoin_generation = 1 accepté et incrémenté à 2
update public.eleves
  set maj = '2000-01-01T00:00:00Z',
      charge_utile = '{"minutes_totales":15,"temoin_generation":1}'::jsonb
  where email = 'eleve@example.com';

do $$
declare r record;
begin
  select generation, maj into r from public.eleves where email = 'eleve@example.com';
  if r.generation is distinct from 2 then raise exception 'generation non incrémentée à 2'; end if;
  if r.maj < now() - interval '5 minutes' then raise exception 'maj serveur non imposé en UPDATE'; end if;
end $$;

-- 5) UPDATE périmé (temoin_generation = 1 alors que la base est à 2) refusé
do $$ begin
  begin
    update public.eleves
      set charge_utile = '{"minutes_totales":99,"temoin_generation":1}'::jsonb
      where email = 'eleve@example.com';
    raise exception 'UPDATE périmé accepté';
  exception when serialization_failure then null;
  end;
end $$;

reset role;

-- ──────────────────────────────────────────────────────────────────────────────
-- Migration 0005 : Optimisation RLS, indexation ciblée et purge par date
-- Idempotente et transactionnelle — sûre sur une base Temps 1 ou Temps 1 + Temps 2.
-- ──────────────────────────────────────────────────────────────────────────────

begin;

-- 1) Indexer `jeton` (utilisé par la policy restrictive RLS) et retirer l'index
--    redondant `eleves_generation_idx` qui amplifiait le coût de chaque UPDATE.
create index if not exists eleves_jeton_idx on public.eleves (jeton);
drop index if exists public.eleves_generation_idx;

-- 2) Court-circuiter la comparaison `jeton = header` avant les regex et regexp_split_to_table.
create or replace function public.eleves_jeton_autorise(jeton text)
returns boolean language sql stable security invoker set search_path = pg_catalog
as $$
  select coalesce(
    jeton is not null
    and jeton = (nullif(current_setting('request.headers', true), '')::json ->> 'x-kunz-jeton')
    and char_length(jeton) >= 32
    and jeton ~ '^([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$'
    and replace(jeton, '-', '') !~ '^([0-9a-f])\1+$'
    and (
      select count(distinct ch)
      from regexp_split_to_table(replace(jeton, '-', ''), '') as ch
    ) >= 4,
    false
  );
$$;

-- 3) Indexer `kunz_sync_prive.profils(maj)` pour la purge d'inactivité (si Temps 2 installé).
do $$ begin
  if to_regclass('kunz_sync_prive.profils') is not null then
    execute 'create index if not exists kunz_sync_profils_maj_idx on kunz_sync_prive.profils (maj)';
  end if;
end $$;

commit;

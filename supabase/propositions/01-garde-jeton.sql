-- PROPOSITION NON DÉPLOYÉE : lire le plan de validation avant toute application.
begin;
-- Pas d'exception pour les anciennes lignes : récupération hors de l'API anonyme.
-- Format compatible avec nouveauJeton() ; le format ne prouve ni l'entropie ni l'identité.
create or replace function public.eleves_jeton_autorise(jeton text)
returns boolean language sql stable security invoker set search_path = pg_catalog
as $$
  select coalesce(
    jeton <> repeat('0', 32)
    and jeton ~ '^([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$'
    and jeton = (nullif(current_setting('request.headers', true), '')::json ->> 'x-kunz-jeton'),
    false
  );
$$;

alter table public.eleves enable row level security;
alter table public.eleves add column if not exists jeton text;

-- Restrictive : une autre policy permissive ne peut pas contourner ce garde-fou pour anon.
drop policy if exists eleves_jeton_obligatoire on public.eleves;
create policy eleves_jeton_obligatoire on public.eleves as restrictive
  for all to anon using (public.eleves_jeton_autorise(jeton))
  with check (public.eleves_jeton_autorise(jeton));
commit;

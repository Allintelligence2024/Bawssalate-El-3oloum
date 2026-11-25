-- 2026-11-21 0001 — État de référence de la table `eleves` (J1/7.3 du Plan V2).
--
-- Cette migration ne crée rien de nouveau : elle **fige l'état déjà déployé** en production
-- (table, index, RLS, fonctions, politiques), tel que vérifié le 22/11/2026 sur le projet
-- `kpjcgiwysmqysanqtfkj` :
--   5 politiques (dont `eleves_jeton_obligatoire` RESTRICTIVE) + 1 fonction
--   `eleves_jeton_autorise(text)` SECURITY INVOKER.
--
-- Le contenu est identique à `supabase/schema.sql`. La différence est la traçabilité :
-- `schema.sql` est la documentation, `migrations/` est l'historique rejouable.
--
-- Règle de gouvernance (7.3.2) : aucune modification manuelle dans le SQL Editor de Supabase
-- sans un fichier correspondant ici. Un changement non versionné est un changement qui n'existe
-- pas — il sera perdu au premier rétablissement.
--
-- ⚠️ À NE PAS REJOUER sur une base à jour : chaque instruction est idempotente prise seule
-- (`if not exists`, `drop policy if exists`), mais l'ensemble réécrit l'état de référence et
-- pourrait écraser une évolution ultérieure. Sur une base existante, ne rejouer que les
-- migrations suivantes.

create table if not exists public.eleves (
  email             text primary key,
  jeton             text not null check (char_length(jeton) >= 32),
  wilaya            text,
  daira             text,
  cree_le           timestamptz,
  nom               text,
  date_bac          date,
  xp                integer default 0,
  niveau            text,
  lecons_terminees  integer default 0,
  lecons_en_cours   integer default 0,
  lecons_fragiles   integer default 0,
  jalons_faits      integer default 0,
  ateliers_faits    integer default 0,
  drills_faits      integer default 0,
  minutes_totales   integer default 0,
  revisions         integer default 0,
  seances_comptees  integer default 0,
  jours_activite    integer default 0,
  reponses_justes   integer default 0,
  reponses_fausses  integer default 0,
  notes_nombre      integer default 0,
  app_version       text,
  maj               timestamptz default now(),
  charge_utile      jsonb
);

create index if not exists eleves_maj_idx on public.eleves (maj desc);
create index if not exists eleves_xp_idx  on public.eleves (xp desc);
create index if not exists eleves_wilaya_idx on public.eleves (wilaya);

create or replace function public.eleves_jeton_autorise(jeton text)
returns boolean language sql stable security invoker set search_path = pg_catalog
as $$
  select coalesce(
    jeton is not null
    and char_length(jeton) >= 32
    and jeton <> repeat('0', 32)
    and jeton ~ '^([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$'
    and jeton = (nullif(current_setting('request.headers', true), '')::json ->> 'x-kunz-jeton'),
    false
  );
$$;

alter table public.eleves enable row level security;

drop policy if exists eleves_jeton_obligatoire on public.eleves;
create policy eleves_jeton_obligatoire on public.eleves as restrictive
  for all to anon using (public.eleves_jeton_autorise(jeton))
  with check (public.eleves_jeton_autorise(jeton));

drop policy if exists ecriture_app on public.eleves;
create policy ecriture_app on public.eleves
  for insert to anon
  with check (
    email ~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'
    and (charge_utile is null or octet_length(charge_utile::text) <= 262144)
  );

drop policy if exists maj_app on public.eleves;
create policy maj_app on public.eleves
  for update to anon
  using (true)
  with check (
    charge_utile is null or octet_length(charge_utile::text) <= 262144
  );

drop policy if exists suppression_app on public.eleves;
create policy suppression_app on public.eleves
  for delete to anon
  using (true);

drop policy if exists lecture_proprietaire on public.eleves;
create policy lecture_proprietaire on public.eleves
  for select to anon
  using (true);

-- ──────────────────────────────────────────────────────────────────────────────
-- بوصلة العلوم Lite — مخطّط المزامنة الاختيارية (RLS durci — P0 remédiation)
-- يُنسخ مرّة واحدة في Supabase Studio (SQL Editor → New query → Run)
-- ──────────────────────────────────────────────────────────────────────────────

-- Les politiques `to anon` plus bas exigent le rôle `anon`. Supabase le possède
-- déjà ; une PostgreSQL vierge (CI postgres:16-alpine) non — création idempotente
-- avant la première policy, sinon `create policy … to anon` échoue (42704).
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
end $$;

create table if not exists public.eleves (
  email             text primary key,
  jeton             text not null check (char_length(jeton) >= 32), -- رمز كتابة عشوائي (≥ 32 حرفًا)
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
  maj               timestamptz not null default now(),
  generation        bigint not null default 1,
  charge_utile      jsonb          -- الملخّص الكامل (بحدّ أقصى 256 ك.ب)
);

-- فهارس للاستعلامات
create index if not exists eleves_maj_idx on public.eleves (maj desc);
create index if not exists eleves_xp_idx  on public.eleves (xp desc);
create index if not exists eleves_wilaya_idx on public.eleves (wilaya);
create index if not exists eleves_generation_idx on public.eleves (generation desc);

-- ───────────── Génération monotone & horodatage serveur (BUG-002 / P0) ─────────────
alter table public.eleves add column if not exists generation bigint not null default 1;
alter table public.eleves drop constraint if exists eleves_generation_positive;
alter table public.eleves add constraint eleves_generation_positive check (generation >= 1);

create or replace function public.eleves_generation_a_jour(generation_actuelle bigint, charge_utile jsonb)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog
as $$
  select coalesce(
    generation_actuelle is not null
    and generation_actuelle >= 1
    and charge_utile is not null
    and (charge_utile ->> 'temoin_generation') ~ '^[1-9][0-9]*$'
    and (charge_utile ->> 'temoin_generation')::bigint = generation_actuelle,
    false
  );
$$;

create or replace function public.eleves_avant_insertion_fn()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  -- L'horodatage et la génération initiale sont toujours fixés côté serveur.
  new.generation := 1;
  new.maj := now();
  new.email := lower(btrim(new.email));
  return new;
end;
$$;

create or replace function public.eleves_generation_suivante()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'UPDATE' then
    -- Refuse toute mise à jour sans témoin ou sur une génération périmée (fermeture fail-open).
    if not public.eleves_generation_a_jour(old.generation, new.charge_utile) then
      raise exception using errcode = '40001', message = 'Génération périmée ou témoin absent';
    end if;
    -- Génération strictement monotone + horodatage imposé côté serveur.
    new.generation := old.generation + 1;
    new.maj := now();
    new.email := old.email;
  end if;
  return new;
end;
$$;

drop trigger if exists eleves_avant_insertion on public.eleves;
create trigger eleves_avant_insertion
  before insert on public.eleves
  for each row execute function public.eleves_avant_insertion_fn();

drop trigger if exists eleves_generation_avant_maj on public.eleves;
create trigger eleves_generation_avant_maj
  before update on public.eleves
  for each row execute function public.eleves_generation_suivante();

-- ───────────── أمان الصفوف (RLS) ─────────────
-- Pas d'exception pour les anciennes lignes : récupération hors de l'API anonyme.
-- Format compatible avec nouveauJeton() + rejet des motifs triviaux/répétés.
create or replace function public.eleves_jeton_autorise(jeton text)
returns boolean language sql stable security invoker set search_path = pg_catalog
as $$
  select coalesce(
    jeton is not null
    and char_length(jeton) >= 32
    and jeton ~ '^([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$'
    and replace(jeton, '-', '') !~ '^([0-9a-f])\1+$'
    and (
      select count(distinct ch)
      from regexp_split_to_table(replace(jeton, '-', ''), '') as ch
    ) >= 4
    and jeton = (nullif(current_setting('request.headers', true), '')::json ->> 'x-kunz-jeton'),
    false
  );
$$;

alter table public.eleves enable row level security;
alter table public.eleves add column if not exists jeton text;
update public.eleves
  set jeton = encode(gen_random_bytes(32), 'hex')
  where jeton is null or char_length(jeton) < 32;
alter table public.eleves alter column jeton set not null;
alter table public.eleves drop constraint if exists eleves_jeton_len;
alter table public.eleves add constraint eleves_jeton_len check (char_length(jeton) >= 32);

-- Restrictive : une autre policy permissive ne peut pas contourner ce garde-fou pour anon.
drop policy if exists eleves_jeton_obligatoire on public.eleves;
create policy eleves_jeton_obligatoire on public.eleves as restrictive
  for all to anon using (public.eleves_jeton_autorise(jeton))
  with check (public.eleves_jeton_autorise(jeton));

-- Les accès anonymes sont autorisés uniquement sous le garde-fou restrictif ci-dessus,
-- avec validation d'adresse e-mail et plafond 256 Ko (262144 octets) sur charge_utile.
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
    (charge_utile is null or octet_length(charge_utile::text) <= 262144)
    and public.eleves_generation_a_jour(generation - 1, charge_utile)
  );

drop policy if exists suppression_app on public.eleves;
create policy suppression_app on public.eleves
  for delete to anon
  using (true);

drop policy if exists lecture_proprietaire on public.eleves;
create policy lecture_proprietaire on public.eleves
  for select to anon
  using (true);

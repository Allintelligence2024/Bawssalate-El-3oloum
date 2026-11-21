-- ──────────────────────────────────────────────────────────────────────────────
-- بوصلة العلوم Lite — مخطّط المزامنة الاختيارية (RLS durci — Phase 2 P0 + PR #5)
-- يُنسخ مرّة واحدة في Supabase Studio (SQL Editor → New query → Run)
-- ──────────────────────────────────────────────────────────────────────────────

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
  maj               timestamptz default now(),
  charge_utile      jsonb          -- الملخّص الكامل (بحدّ أقصى 256 ك.ب)
);

-- فهارس للاستعلامات
create index if not exists eleves_maj_idx on public.eleves (maj desc);
create index if not exists eleves_xp_idx  on public.eleves (xp desc);
create index if not exists eleves_wilaya_idx on public.eleves (wilaya);

-- ───────────── أمان الصفوف (RLS) ─────────────
-- Pas d'exception pour les anciennes lignes : récupération hors de l'API anonyme.
-- Format compatible avec nouveauJeton() ; le format ne prouve ni l'entropie ni l'identité.
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

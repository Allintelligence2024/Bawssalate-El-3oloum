-- ──────────────────────────────────────────────────────────────────────────────
-- كنز العلوم Lite — مخطّط المزامنة الاختيارية
-- يُنسخ مرّة واحدة في Supabase Studio (SQL Editor → New query → Run)
-- ──────────────────────────────────────────────────────────────────────────────

create table if not exists public.eleves (
  email             text primary key,
  jeton             text,          -- jeton d'écriture (généré côté élève) — exigé par la policy UPDATE
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
  charge_utile      jsonb          -- الملخّص الكامل (للتحليل العميق)
);

-- فهارس للاستعلامات
create index if not exists eleves_maj_idx on public.eleves (maj desc);
create index if not exists eleves_xp_idx  on public.eleves (xp desc);
create index if not exists eleves_wilaya_idx on public.eleves (wilaya);

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

-- Les accès anonymes sont autorisés uniquement sous le garde-fou restrictif ci-dessus.
-- L'INSERT ne vérifie toujours pas la possession de l'adresse : pas de diffusion en l'état.
drop policy if exists ecriture_app on public.eleves;
create policy ecriture_app on public.eleves for insert to anon with check (true);
drop policy if exists maj_app on public.eleves;
create policy maj_app on public.eleves for update to anon using (true) with check (true);
drop policy if exists suppression_app on public.eleves;
create policy suppression_app on public.eleves for delete to anon using (true);
drop policy if exists lecture_proprietaire on public.eleves;
create policy lecture_proprietaire on public.eleves for select to anon using (true);

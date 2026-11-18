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

-- ───────────── أمان الصفوف (RLS) ─────────────
-- التطبيق (المفتاح anon العام) يستطيع الكتابة فقط، ولا يرى أي تلميذ آخر.
-- المالك وحده (service_role عبر Studio) يقرأ كل شيء.
--
-- Jeton d'écriture : chaque élève génère un jeton aléatoire à la création du compte.
-- Il est stocké dans la colonne `jeton` de SA ligne et envoyé en en-tête `x-kunz-jeton`.
-- La policy UPDATE l'exige : quiconque possède l'URL + la clé publique peut insérer
-- ses propres lignes, mais ne peut plus ÉCRASER la fiche d'un élève déjà connu — il
-- faudrait connaître son jeton. Les lignes anciennes sans jeton restent modifiables
-- (compatibilité avec les installations existantes) : elles se verrouillent au
-- prochain snapshot qui remplit la colonne.

alter table public.eleves enable row level security;

-- Migration : la colonne jeton peut être ajoutée à une table existante
alter table public.eleves add column if not exists jeton text;

drop policy if exists "ecriture_app" on public.eleves;
create policy "ecriture_app" on public.eleves
  for insert to anon with check (true);

drop policy if exists "maj_app" on public.eleves;
create policy "maj_app" on public.eleves
  for update to anon
  using (
    jeton is null
    or jeton = coalesce(current_setting('request.headers', true)::json ->> 'x-kunz-jeton', '')
  )
  with check (
    jeton is null
    or jeton = coalesce(current_setting('request.headers', true)::json ->> 'x-kunz-jeton', '')
  );

-- Suppression à la demande (P0.8) : l'élève peut effacer SA ligne depuis l'écran « الخصوصية »
-- de l'application. Exige le jeton en en-tête ; une ligne sans jeton (ancienne installation)
-- ne peut pas être supprimée par l'application — elle se verrouille au prochain snapshot.
drop policy if exists "suppression_app" on public.eleves;
create policy "suppression_app" on public.eleves
  for delete to anon
  using (
    jeton is not null
    and jeton = coalesce(current_setting('request.headers', true)::json ->> 'x-kunz-jeton', '')
  );

-- Lecture restreinte (correctif P-1.7, preuve : plans/preuves/confidentialite-serveur.md) :
-- avec RLS, la policy DELETE ne voit que les lignes VISIBLES pour anon ; sans aucune policy
-- SELECT, anon ne voit rien et le DELETE de l'application (sync.ts:195) ne matche jamais
-- (testé en direct : 0 ligne supprimée au bon jeton). Cette lecture est verrouillée par le
-- jeton : l'élève ne lit QUE sa propre ligne, et seulement en envoyant son jeton.
drop policy if exists "lecture_proprietaire" on public.eleves;
create policy "lecture_proprietaire" on public.eleves
  for select to anon
  using (
    jeton is not null
    and jeton = coalesce(current_setting('request.headers', true)::json ->> 'x-kunz-jeton', '')
  );

-- ملاحظة: بدون الجيتون لا تُقرأ ولا تُعدَّل ولا تُحذف أي سطر — القراءة مرفوضة تلقائيًّا.

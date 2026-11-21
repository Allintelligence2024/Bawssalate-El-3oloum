-- ──────────────────────────────────────────────────────────────────────────────
-- بوصلة العلوم Lite — مخطّط المزامنة الاختيارية (RLS durci — Phase 2 P0)
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
-- سياسات صارمة:
--   - لا يُقبل أي سطر بلا jeton عشوائي (≥ 32 حرفًا) مطابق لترويسة x-kunz-jeton.
--   - لا استثناء jeton IS NULL، ولا jeton فارغ (يغلق ثغرة e4).
--   - سقف حجم charge_utile محدد بـ 256 Ko (262144 octets) لمنع إغراق القاعدة.
--   - القراءة والتعديل والحذف مقفولة تمامًا بصاحب الرمز وحده.

alter table public.eleves enable row level security;

-- هجرة آمنة لجداول قديمة
alter table public.eleves add column if not exists jeton text;
update public.eleves
  set jeton = encode(gen_random_bytes(32), 'hex')
  where jeton is null or char_length(jeton) < 32;
alter table public.eleves alter column jeton set not null;
alter table public.eleves drop constraint if exists eleves_jeton_len;
alter table public.eleves add constraint eleves_jeton_len check (char_length(jeton) >= 32);

drop policy if exists "ecriture_app" on public.eleves;
create policy "ecriture_app" on public.eleves
  for insert to anon
  with check (
    jeton is not null
    and char_length(jeton) >= 32
    and jeton = coalesce(current_setting('request.headers', true)::json ->> 'x-kunz-jeton', '')
    and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'
    and (charge_utile is null or octet_length(charge_utile::text) <= 262144)
  );

drop policy if exists "maj_app" on public.eleves;
create policy "maj_app" on public.eleves
  for update to anon
  using (
    jeton is not null
    and char_length(jeton) >= 32
    and jeton = coalesce(current_setting('request.headers', true)::json ->> 'x-kunz-jeton', '')
  )
  with check (
    jeton is not null
    and char_length(jeton) >= 32
    and jeton = coalesce(current_setting('request.headers', true)::json ->> 'x-kunz-jeton', '')
    and (charge_utile is null or octet_length(charge_utile::text) <= 262144)
  );

drop policy if exists "suppression_app" on public.eleves;
create policy "suppression_app" on public.eleves
  for delete to anon
  using (
    jeton is not null
    and char_length(jeton) >= 32
    and jeton = coalesce(current_setting('request.headers', true)::json ->> 'x-kunz-jeton', '')
  );

drop policy if exists "lecture_proprietaire" on public.eleves;
create policy "lecture_proprietaire" on public.eleves
  for select to anon
  using (
    jeton is not null
    and char_length(jeton) >= 32
    and jeton = coalesce(current_setting('request.headers', true)::json ->> 'x-kunz-jeton', '')
  );

-- ملاحظة: بدون رمز صالح (≥ 32 حرفًا) في x-kunz-jeton لا يمكن الإدخال ولا القراءة ولا التعديل ولا الحذف.
